#!/usr/bin/env bash
set -euo pipefail

SKIES_KEY="${1:?ssh public key required}"

apt-get update
apt-get upgrade -y
apt-get install -y postgresql postgresql-client build-essential git curl unattended-upgrades

# skies user, passwordless sudo, own ssh key
id -u skies &>/dev/null || useradd -m -s /bin/bash skies
echo "skies ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/skies
chmod 440 /etc/sudoers.d/skies
install -d -m 700 -o skies -g skies /home/skies/.ssh
echo "$SKIES_KEY" > /home/skies/.ssh/authorized_keys
chmod 600 /home/skies/.ssh/authorized_keys
chown skies:skies /home/skies/.ssh/authorized_keys

cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF

# Role, database, schemas. Peer auth over the unix socket.
su - postgres -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='skies'\"" | grep -q 1 || \
  su - postgres -c "createuser --createdb --createrole skies"
su - postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='dying_skies'\"" | grep -q 1 || \
  su - postgres -c "createdb -O skies dying_skies"
su - skies -c "psql -d dying_skies -c 'CREATE SCHEMA IF NOT EXISTS dagster; CREATE SCHEMA IF NOT EXISTS analytics;'"

# Node 24 and wrangler for the Observable build and deploy.
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt-get install -y nodejs
npm install -g wrangler

# uv installs to /home/skies/.local/bin.
su - skies -c "curl -LsSf https://astral.sh/uv/install.sh | sh"

# cloudflared: outbound tunnels for the API and Dagster UI.
mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg > /usr/share/keyrings/cloudflare-main.gpg
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' > /etc/apt/sources.list.d/cloudflared.list
apt-get update
apt-get install -y cloudflared

mkdir -p /files/skies /code/skies
chown -R skies:skies /files/skies /code/skies

# Repo checkout, idempotent, always main.
if [ ! -d /code/skies/.git ]; then
  su - skies -c "git clone https://github.com/sandervw/dying-skies.git /code/skies"
fi

# Backend venv from requirements.txt; analytics via uv sync.
su - skies -c "cd /code/skies/backend && ~/.local/bin/uv venv && ~/.local/bin/uv pip install -r requirements.txt" || true
su - skies -c "cd /code/skies/analytics && ~/.local/bin/uv sync" || true

# Observable site deps; without these `npm run deploy` exits 127.
su - skies -c "cd /code/skies/analytics/observable && npm ci" || true

# Runtime secrets; fill by hand, services read this file.
install -d -m 755 /etc/skies
if [ ! -f /etc/skies/.env ]; then
  cat > /etc/skies/.env <<'EOF'
DATABASE_URL=postgresql://skies@/dying_skies?host=/var/run/postgresql
SEED_HMAC_SECRET=
FRONTEND_ORIGIN=https://dyingskies.com
COOKIE_SECURE=true
TRUSTED_PROXY_HOPS=1
ANALYTICS_READER_PASSWORD=
ANALYTICS_DB_HOST=127.0.0.1
ANALYTICS_DB_PORT=5432
ANALYTICS_DB_NAME=dying_skies
ANALYTICS_DB_USER=analytics_reader
ANALYTICS_DB_PASSWORD=
ANALYTICS_DB_SCHEMA=analytics
CLOUDFLARE_ACCOUNT_ID=954c30f428e0a61f4c66e6a679f51ec0
CLOUDFLARE_API_TOKEN=
ALERT_FROM=alerts@dyingskies.com
ALERT_TO=samvanwilligen@gmail.com
EOF
  chmod 640 /etc/skies/.env
  chown root:skies /etc/skies/.env
fi

# Build the dbt manifest the Dagster code location loads.
su - skies -c "set -a; . /etc/skies/.env; set +a; cd /code/skies/analytics && ~/.local/bin/uv run dbt parse --project-dir dbt --profiles-dir dbt" || true

# 4 GB swap: the Observable build is memory-hungry.
if [ ! -f /swapfile ]; then
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

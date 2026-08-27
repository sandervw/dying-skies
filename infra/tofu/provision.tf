locals {
  ssh_private_key = file("~/.ssh/dying-skies_rsa")
  ssh_public_key  = trimspace(file("~/.ssh/dying-skies_rsa.pub"))
}

# Static IP of the hand-ordered box; drop once ovh_vps is imported.
variable "vps_ip" {
  type        = string
  description = "Public IPv4 of the box; provisioning targets this."
  default     = "40.160.136.98"
}

# Runs after the box exists; classic OVH images ignore cloud-init.
resource "terraform_data" "provision" {
  triggers_replace = {
    script_sha = filesha256("${path.module}/scripts/provision.sh")
  }

  connection {
    type        = "ssh"
    host        = var.vps_ip
    user        = "ubuntu"
    private_key = local.ssh_private_key
  }

  provisioner "file" {
    source      = "${path.module}/scripts/provision.sh"
    destination = "/tmp/provision.sh"
  }

  provisioner "remote-exec" {
    inline = [
      "chmod +x /tmp/provision.sh",
      "sudo /tmp/provision.sh '${local.ssh_public_key}'",
    ]
  }
}

# API and Dagster: three systemd services, Postgres-backed storage.
resource "terraform_data" "services" {
  depends_on = [terraform_data.provision]

  triggers_replace = {
    api_sha       = filesha256("${path.module}/systemd/skies-api.service")
    webserver_sha = filesha256("${path.module}/systemd/dagster-webserver.service")
    daemon_sha    = filesha256("${path.module}/systemd/dagster-daemon.service")
    instance_sha  = filesha256("${path.module}/../dagster/dagster.yaml")
  }

  connection {
    type        = "ssh"
    host        = var.vps_ip
    user        = "ubuntu"
    private_key = local.ssh_private_key
  }

  provisioner "file" {
    source      = "${path.module}/systemd/skies-api.service"
    destination = "/tmp/skies-api.service"
  }

  provisioner "file" {
    source      = "${path.module}/systemd/dagster-webserver.service"
    destination = "/tmp/dagster-webserver.service"
  }

  provisioner "file" {
    source      = "${path.module}/systemd/dagster-daemon.service"
    destination = "/tmp/dagster-daemon.service"
  }

  provisioner "file" {
    source      = "${path.module}/../dagster/dagster.yaml"
    destination = "/tmp/dagster.yaml"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo install -d -o skies -g skies /files/skies/dagster",
      "sudo install -o skies -g skies -m 0644 /tmp/dagster.yaml /files/skies/dagster/dagster.yaml",
      "sudo install -m 0644 /tmp/skies-api.service /etc/systemd/system/skies-api.service",
      "sudo install -m 0644 /tmp/dagster-webserver.service /etc/systemd/system/dagster-webserver.service",
      "sudo install -m 0644 /tmp/dagster-daemon.service /etc/systemd/system/dagster-daemon.service",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable --now skies-api.service dagster-webserver.service dagster-daemon.service",
    ]
  }
}

# Cloudflare Tunnel token; empty skips the tunnel.
variable "cloudflare_tunnel_token" {
  type      = string
  sensitive = true
  default   = ""
}

# Registers cloudflared as a service fronting the API and Dagster UI.
resource "terraform_data" "tunnel" {
  count      = var.cloudflare_tunnel_token == "" ? 0 : 1
  depends_on = [terraform_data.services]

  triggers_replace = {
    token = var.cloudflare_tunnel_token
  }

  connection {
    type        = "ssh"
    host        = var.vps_ip
    user        = "ubuntu"
    private_key = local.ssh_private_key
  }

  provisioner "remote-exec" {
    inline = [
      "sudo cloudflared service uninstall || true",
      "sudo cloudflared service install ${var.cloudflare_tunnel_token}",
    ]
  }
}

data "google_project" "current" {}

locals {
  runtime_service_account = "${data.google_project.current.number}-compute@developer.gserviceaccount.com"
  database_url            = "postgresql://postgres:${var.db_password}@/dying_skies?host=/cloudsql/${google_sql_database_instance.db.connection_name}"
}

# Postgres instance, database, and login role.
resource "google_sql_database_instance" "db" {
  name                = var.db_instance_name
  region              = var.region
  database_version    = "POSTGRES_18"
  deletion_protection = false

  settings {
    tier = "db-f1-micro"
  }
}

resource "google_sql_database" "dying_skies" {
  name     = "dying_skies"
  instance = google_sql_database_instance.db.name
}

resource "google_sql_user" "api" {
  name     = "postgres"
  instance = google_sql_database_instance.db.name
  password = var.db_password
}

# Secrets: connection string and both server secrets.
resource "google_secret_manager_secret" "database_url" {
  secret_id = "database-url"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "database_url" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = local.database_url
}

resource "google_secret_manager_secret" "seed_hmac_secret" {
  secret_id = "seed-hmac-secret"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "seed_hmac_secret" {
  secret      = google_secret_manager_secret.seed_hmac_secret.id
  secret_data = var.seed_hmac_secret
}

resource "google_secret_manager_secret" "analytics_reader_password" {
  secret_id = "analytics-reader-password"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "analytics_reader_password" {
  secret      = google_secret_manager_secret.analytics_reader_password.id
  secret_data = var.analytics_reader_password
}

# Runtime service account reads secrets and dials Cloud SQL.
resource "google_secret_manager_secret_iam_member" "run_reads_secrets" {
  for_each = {
    database_url              = google_secret_manager_secret.database_url.id
    seed_hmac_secret          = google_secret_manager_secret.seed_hmac_secret.id
    analytics_reader_password = google_secret_manager_secret.analytics_reader_password.id
  }
  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${local.runtime_service_account}"
}

resource "google_project_iam_member" "run_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${local.runtime_service_account}"
}

# The FastAPI container on Cloud Run.
resource "google_cloud_run_v2_service" "api" {
  name     = var.service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    scaling {
      max_instance_count = 2
    }

    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [google_sql_database_instance.db.connection_name]
      }
    }

    containers {
      image = var.image

      ports {
        container_port = 8000
      }

      env {
        name  = "FRONTEND_ORIGIN"
        value = var.frontend_origin
      }
      env {
        name  = "COOKIE_SECURE"
        value = "true"
      }
      env {
        name  = "TRUSTED_PROXY_HOPS"
        value = "1"
      }
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "SEED_HMAC_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.seed_hmac_secret.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "ANALYTICS_READER_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.analytics_reader_password.secret_id
            version = "latest"
          }
        }
      }

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }
    }
  }

  depends_on = [
    google_secret_manager_secret_version.database_url,
    google_secret_manager_secret_version.seed_hmac_secret,
    google_secret_manager_secret_version.analytics_reader_password,
    google_secret_manager_secret_iam_member.run_reads_secrets,
  ]
}

# Public, unauthenticated access to the API.
resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.api.name
  location = google_cloud_run_v2_service.api.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

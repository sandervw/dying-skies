# Cloudflare token for the analytics site deploy and failure-alert emails.
resource "google_secret_manager_secret" "cloudflare_api_token" {
  secret_id = "cloudflare-api-token"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "cloudflare_api_token" {
  secret      = google_secret_manager_secret.cloudflare_api_token.id
  secret_data = var.cloudflare_api_token
}

# The VM service account reads the Cloudflare token.
resource "google_secret_manager_secret_iam_member" "vm_reads_cloudflare_token" {
  secret_id = google_secret_manager_secret.cloudflare_api_token.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${local.runtime_service_account}"
}

# Compute Engine API, required for the Dagster VM.
resource "google_project_service" "compute" {
  service            = "compute.googleapis.com"
  disable_on_destroy = false
}

# Always-on VM hosting the Dagster daemon and webserver.
resource "google_compute_instance" "dagster" {
  name         = var.dagster_instance_name
  machine_type = var.dagster_machine_type
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
      size  = 20
    }
  }

  network_interface {
    network = "default"
    access_config {}
  }

  service_account {
    email  = local.runtime_service_account
    scopes = ["cloud-platform"]
  }

  metadata_startup_script = templatefile("${path.module}/dagster-startup.sh.tftpl", {
    project_id              = var.project_id
    connection_name         = google_sql_database_instance.db.connection_name
    repo_url                = var.repo_url
    analytics_reader_secret = google_secret_manager_secret.analytics_reader_password.secret_id
    cloudflare_token_secret = google_secret_manager_secret.cloudflare_api_token.secret_id
    cloudflare_account_id   = var.cloudflare_account_id
    alert_from              = var.alert_from
    alert_to                = var.alert_to
  })

  depends_on = [
    google_project_service.compute,
    google_secret_manager_secret_version.analytics_reader_password,
    google_secret_manager_secret_version.cloudflare_api_token,
    google_secret_manager_secret_iam_member.vm_reads_cloudflare_token,
  ]
}

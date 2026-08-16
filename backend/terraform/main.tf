resource "google_cloud_run_v2_service" "api" {
  name     = var.service_name
  location = var.region

  template {
    containers {
      image = "gcr.io/${var.project_id}/${var.service_name}"
    }
  }
}

resource "google_sql_database_instance" "db" {
  name             = var.db_instance_name
  region           = var.region
  database_version = "POSTGRES_18"

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

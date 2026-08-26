output "cloud_run_url" {
  value = google_cloud_run_v2_service.api.uri
}

output "db_connection_name" {
  value = google_sql_database_instance.db.connection_name
}

# DNS records to add in Cloudflare for the custom domain.
output "api_domain_dns_records" {
  value = google_cloud_run_domain_mapping.api.status[0].resource_records
}

output "dagster_instance" {
  value = "${google_compute_instance.dagster.name} (${google_compute_instance.dagster.zone})"
}

# SSH tunnel to reach the localhost-only Dagster webserver.
output "dagster_tunnel_command" {
  value = "gcloud compute ssh ${google_compute_instance.dagster.name} --zone ${google_compute_instance.dagster.zone} --tunnel-through-iap -- -L 3000:localhost:3000"
}

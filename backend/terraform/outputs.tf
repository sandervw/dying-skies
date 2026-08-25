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

variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "service_name" {
  type    = string
  default = "dying-skies-api"
}

variable "db_instance_name" {
  type    = string
  default = "dying-skies-db"
}

variable "image" {
  type        = string
  description = "Full Artifact Registry image ref the service runs."
}

variable "frontend_origin" {
  type        = string
  description = "Allowed CORS origin for the frontend."
  default     = "https://dyingskies.com"
}

variable "api_domain" {
  type        = string
  description = "Custom domain mapped to the Cloud Run API."
  default     = "api.dyingskies.com"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "seed_hmac_secret" {
  type      = string
  sensitive = true
}

variable "analytics_reader_password" {
  type      = string
  sensitive = true
}

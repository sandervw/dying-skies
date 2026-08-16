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

variable "db_password" {
  type      = string
  sensitive = true
}

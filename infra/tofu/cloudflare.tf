provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

# Empty account id skips the bucket entirely.
variable "cloudflare_account_id" {
  type    = string
  default = ""
}

# pg_dump backup target.
resource "cloudflare_r2_bucket" "backup" {
  count = var.cloudflare_account_id == "" ? 0 : 1

  account_id = var.cloudflare_account_id
  name       = "dying-skies-backup"
  location   = "ENAM"
}

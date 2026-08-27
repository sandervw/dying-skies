# Cost guardrail: email alerts as monthly spend crosses thresholds.

resource "google_monitoring_notification_channel" "budget_email" {
  display_name = "Dying Skies budget email"
  type         = "email"
  labels = {
    email_address = var.alert_to
  }
}

resource "google_billing_budget" "monthly" {
  billing_account = var.billing_account
  display_name    = "dying-skies-monthly"

  budget_filter {
    projects = ["projects/${data.google_project.current.number}"]
  }

  amount {
    specified_amount {
      currency_code = "USD"
      units         = var.monthly_budget_amount
    }
  }

  # Alert at 50%, 90%, 100% actual, and forecast overrun.
  threshold_rules {
    threshold_percent = 0.5
  }
  threshold_rules {
    threshold_percent = 0.9
  }
  threshold_rules {
    threshold_percent = 1.0
  }
  threshold_rules {
    threshold_percent = 1.0
    spend_basis       = "FORECASTED_SPEND"
  }

  all_updates_rule {
    monitoring_notification_channels = [google_monitoring_notification_channel.budget_email.id]
    disable_default_iam_recipients   = false
  }
}

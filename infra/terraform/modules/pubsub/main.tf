resource "google_pubsub_topic" "topic" {
  name    = var.topic_name
  project = var.project_id

  labels = {
    environment = var.environment
    service     = var.service_label
  }

  message_retention_duration = "86400s"
}


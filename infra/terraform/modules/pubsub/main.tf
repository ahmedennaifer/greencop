resource "google_pubsub_topic" "sensor_data_topic" {
  name    = var.topic_name
  project = var.project_id

  labels = {
    environment = var.environment
    service     = "sensor-data"
  }

  message_retention_duration = "86400s" # 24 hours
}

# IAM bindings commented out - use gcloud for local testing
# resource "google_pubsub_topic_iam_binding" "publisher_binding" {
#   topic   = google_pubsub_topic.sensor_data_topic.name
#   role    = "roles/pubsub.publisher"
#   members = var.publisher_members
# }

# resource "google_pubsub_topic_iam_binding" "subscriber_binding" {
#   topic   = google_pubsub_topic.sensor_data_topic.name
#   role    = "roles/pubsub.subscriber"
#   members = var.subscriber_members
# }
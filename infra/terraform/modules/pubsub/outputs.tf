output "topic_name" {
  description = "The name of the created Pub/Sub topic"
  value       = google_pubsub_topic.sensor_data_topic.name
}

output "topic_id" {
  description = "The ID of the created Pub/Sub topic"
  value       = google_pubsub_topic.sensor_data_topic.id
}
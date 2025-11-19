output "function_name" {
  description = "Name of the deployed Cloud Function"
  value       = google_cloudfunctions2_function.pubsub_to_influxdb.name
}

output "function_uri" {
  description = "URI of the deployed Cloud Function"
  value       = google_cloudfunctions2_function.pubsub_to_influxdb.service_config[0].uri
}
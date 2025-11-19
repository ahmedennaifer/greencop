output "dataset_id" {
  description = "BigQuery dataset ID"
  value       = google_bigquery_dataset.sensor_data.dataset_id
}

output "table_id" {
  description = "BigQuery table ID"
  value       = google_bigquery_table.sensor_readings.table_id
}

output "dataset_location" {
  description = "BigQuery dataset location"
  value       = google_bigquery_dataset.sensor_data.location
}
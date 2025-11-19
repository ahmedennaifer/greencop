variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for BigQuery dataset"
  type        = string
  default     = "EU"
}

variable "dataset_id" {
  description = "BigQuery dataset ID"
  type        = string
  default     = "sensor_data"
}

variable "table_id" {
  description = "BigQuery table ID"
  type        = string
  default     = "readings"
}
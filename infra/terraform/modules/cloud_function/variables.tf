variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
}

variable "function_name" {
  description = "Name of the Cloud Function"
  type        = string
}

variable "entry_point" {
  description = "Entry point function name"
  type        = string
}

variable "source_archive_path" {
  description = "Path to the function source archive"
  type        = string
}

variable "pubsub_topic_id" {
  description = "Pub/Sub topic ID for trigger"
  type        = string
}

variable "environment_variables" {
  description = "Environment variables for the function"
  type        = map(string)
  default     = {}
}

variable "bucket_name" {
  type    = string
  default = ""
}
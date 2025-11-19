variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "topic_name" {
  description = "Name of the Pub/Sub topic"
  type        = string
  default     = "data"
}

variable "environment" {
  description = "Environment label"
  type        = string
  default     = "dev"
}

variable "publisher_members" {
  description = "List of members who can publish to the topic"
  type        = list(string)
  default     = []
}

variable "subscriber_members" {
  description = "List of members who can subscribe to the topic"
  type        = list(string)
  default     = []
}
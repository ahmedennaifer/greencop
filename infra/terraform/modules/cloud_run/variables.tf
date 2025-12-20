variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
}

variable "service_name" {
  description = "Name of the Cloud Run service"
  type        = string
}

variable "image_url" {
  description = "Container image URL"
  type        = string
}

variable "port" {
  description = "Container port"
  type        = number
  default     = 8080
}

variable "db_tier" {
  type    = string
  default = ""
}

variable "db_user_password" {
  type    = string
  default = ""
}

variable "db_user" {
  type    = string
  default = ""
}

variable "db_name" {
  type    = string
  default = ""
}

variable "environment_variables" {
  description = "Environment variables to set on the container"
  type        = map(string)
  default     = {}
}

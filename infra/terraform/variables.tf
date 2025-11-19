variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "credentials" {
  type = string
}

variable "service_name" {
  type = string
}

variable "image_url" {
  type = string
}

variable "port" {
  type = number
}

variable "db_name" {
  type = string
}

variable "db_tier" {
  type = string
}

variable "db_version" {
  type = string
}

variable "db_user" {
  type = string
}

variable "db_user_password" {
  type = string
}

variable "service_account_email" {
  description = "Service account email for Pub/Sub access"
  type        = string
  default     = "terraform@greencop-473112.iam.gserviceaccount.com"
}


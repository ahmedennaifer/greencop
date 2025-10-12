variable "db_name" {
  type        = string
  description = " The name of the customers db"
}

variable "region" {
  type = string
}

variable "db_tier" {
  type = string
}

variable "db_version" {
  type = string
}

variable "db_user_password" {
  type = string
}

variable "db_user" {
  type = string
}

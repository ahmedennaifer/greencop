output "instance_ip" {
  value = google_sql_database_instance.customers.public_ip_address
}

output "instance_name" {
  value = google_sql_database_instance.customers.name
}

output "connection_name" {
  value = google_sql_database_instance.customers.connection_name
}

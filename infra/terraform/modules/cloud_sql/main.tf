resource "google_sql_database_instance" "customers" {
  name             = "${var.db_name}-instance"
  database_version = var.db_version
  region           = var.region
  settings {
    tier = var.db_tier
  }
}

resource "google_sql_database" "customers_db" {
  name     = var.db_name
  instance = google_sql_database_instance.customers.name
}


resource "google_sql_user" "user" {
  name     = var.db_user
  instance = google_sql_database_instance.customers.name
  password = var.db_user_password
}

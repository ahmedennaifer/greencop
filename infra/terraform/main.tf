resource "google_project_service" "resource_manager_api" {
  service = "cloudresourcemanager.googleapis.com"
  project = var.project_id
}

resource "google_project_service" "cloud_sql_api" {
  service = "sqladmin.googleapis.com"
  project = var.project_id
}



module "customers_service" {
  source           = "./modules/cloud_run"
  project_id       = var.project_id
  region           = var.region
  service_name     = var.service_name
  db_tier          = var.db_tier
  db_user_password = var.db_user_password
  db_user          = var.db_user
  db_name          = var.db_name
  image_url        = var.image_url
  port             = var.port
  depends_on       = [module.customers_service_db]
}

module "customers_service_db" {
  source           = "./modules/cloud_sql"
  region           = var.region
  db_user          = var.db_user
  db_name          = var.db_name
  db_tier          = var.db_tier
  db_version       = var.db_version
  db_user_password = var.db_user_password
}

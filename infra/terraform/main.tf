resource "google_project_service" "resource_manager_api" {
  service = "cloudresourcemanager.googleapis.com"
  project = var.project_id
}

resource "google_project_service" "cloud_sql_api" {
  service = "sqladmin.googleapis.com"
  project = var.project_id
}

resource "google_project_service" "pubsub_api" {
  service = "pubsub.googleapis.com"
  project = var.project_id
}

resource "google_project_service" "cloudfunctions_api" {
  service = "cloudfunctions.googleapis.com"
  project = var.project_id
}

resource "google_project_service" "cloudbuild_api" {
  service = "cloudbuild.googleapis.com"
  project = var.project_id
}

resource "google_project_service" "bigquery_api" {
  service = "bigquery.googleapis.com"
  project = var.project_id
}

resource "google_project_service" "eventarc_api" {
  service = "eventarc.googleapis.com"
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

module "sensor_data_pubsub" {
  source        = "./modules/pubsub"
  project_id    = var.project_id
  topic_name    = "data"
  service_label = "sensor-data"

  publisher_members = [
    "serviceAccount:${var.service_account_email}"
  ]

  subscriber_members = [
    "serviceAccount:${var.service_account_email}"
  ]

  depends_on = [google_project_service.pubsub_api]
}

module "alerts_pubsub" {
  source        = "./modules/pubsub"
  project_id    = var.project_id
  topic_name    = "alerts"
  service_label = "alerts"

  publisher_members = [
    "serviceAccount:${var.service_account_email}"
  ]

  subscriber_members = [
    "serviceAccount:${var.service_account_email}"
  ]

  depends_on = [google_project_service.pubsub_api]
}

module "sensor_bigquery" {
  source     = "./modules/bigquery"
  project_id = var.project_id
  region     = "EU"

  depends_on = [google_project_service.bigquery_api]
}

resource "google_storage_bucket" "cloud_functions_bucket" {
  name     = "${var.project_id}-cloud-functions"
  location = var.region
  project  = var.project_id
}

module "data_ingestion_function" {
  source              = "./modules/cloud_function"
  project_id          = var.project_id
  region              = var.region
  function_name       = "pubsub-to-bigquery"
  entry_point         = "pubsub_to_bigquery"
  source_archive_path = "../../services/pubsub_bq_bridge/function_source.zip"
  pubsub_topic_id     = module.sensor_data_pubsub.topic_id
  bucket_name         = google_storage_bucket.cloud_functions_bucket.name

  environment_variables = {
    PROJECT_ID = var.project_id
    DATASET_ID = module.sensor_bigquery.dataset_id
    TABLE_ID   = module.sensor_bigquery.table_id
  }

  depends_on = [
    google_project_service.cloudfunctions_api,
    google_project_service.cloudbuild_api,
    google_project_service.eventarc_api,
    module.sensor_data_pubsub,
    module.sensor_bigquery,
    google_storage_bucket.cloud_functions_bucket
  ]
}

module "alert_detection_function" {
  source              = "./modules/cloud_function"
  project_id          = var.project_id
  region              = var.region
  function_name       = "alert-detection"
  entry_point         = "detect_excessive_metrics"
  source_archive_path = "../../services/alerts/function_source.zip"
  pubsub_topic_id     = module.sensor_data_pubsub.topic_id
  bucket_name         = google_storage_bucket.cloud_functions_bucket.name

  environment_variables = {
    PROJECT_ID           = var.project_id
    MAX_ALLOWED_TEMP     = "50.0"
    MAX_ALLOWED_HUMIDITY = "50.0"
    ALERT_TOPIC          = module.alerts_pubsub.topic_name
  }

  depends_on = [
    google_project_service.cloudfunctions_api,
    google_project_service.cloudbuild_api,
    google_project_service.eventarc_api,
    module.sensor_data_pubsub,
    module.alerts_pubsub,
    google_storage_bucket.cloud_functions_bucket
  ]
}


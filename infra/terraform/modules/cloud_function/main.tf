resource "google_storage_bucket" "function_bucket" {
  name     = "${var.project_id}-cloud-functions"
  location = var.region
}

resource "google_storage_bucket_object" "function_source" {
  name   = "function-source.zip"
  bucket = google_storage_bucket.function_bucket.name
  source = var.source_archive_path
}

resource "google_cloudfunctions2_function" "pubsub_to_influxdb" {
  name     = var.function_name
  location = var.region
  project  = var.project_id

  build_config {
    runtime     = "python311"
    entry_point = var.entry_point
    source {
      storage_source {
        bucket = google_storage_bucket.function_bucket.name
        object = google_storage_bucket_object.function_source.name
      }
    }
  }

  service_config {
    max_instance_count = 10
    available_memory   = "256M"
    timeout_seconds    = 60

    environment_variables = var.environment_variables
  }

  event_trigger {
    trigger_region = var.region
    event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic   = var.pubsub_topic_id
  }
}
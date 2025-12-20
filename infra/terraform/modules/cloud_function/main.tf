resource "google_storage_bucket" "function_bucket" {
  count    = var.bucket_name == "" ? 1 : 0
  name     = "${var.project_id}-cloud-functions"
  location = var.region
}

locals {
  bucket_name = var.bucket_name != "" ? var.bucket_name : google_storage_bucket.function_bucket[0].name
}

resource "google_storage_bucket_object" "function_source" {
  name   = "${var.function_name}-source.zip"
  bucket = local.bucket_name
  source = var.source_archive_path
}

resource "google_cloudfunctions2_function" "function" {
  name     = var.function_name
  location = var.region
  project  = var.project_id

  build_config {
    runtime     = "python311"
    entry_point = var.entry_point
    source {
      storage_source {
        bucket = local.bucket_name
        object = google_storage_bucket_object.function_source.name
      }
    }
  }

  service_config {
    max_instance_count = 10
    available_memory   = "512M"
    timeout_seconds    = 60

    environment_variables = var.environment_variables
  }

  event_trigger {
    trigger_region = var.region
    event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic   = var.pubsub_topic_id
  }
}


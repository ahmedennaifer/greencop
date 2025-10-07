resource "google_cloud_run_v2_service" "service" {
  name     = var.service_name
  location = var.region
  template {
    annotations = {
      "run.googleapis.com/cloudsql-instances" = "${var.project_id}:${var.region}:${var.db_name}-instance"
    }
    containers {
      env {
        name  = "DB_URL"
        value = "postgresql://${var.db_user}:${var.db_user_password}@/${var.db_name}?host=/cloudsql/${var.project_id}:${var.region}:${var.db_name}-instance"
      }
      image = var.image_url
      ports {
        container_port = var.port
      }
    }
  }
}

resource "google_cloud_run_service_iam_member" "invoker" {
  service  = google_cloud_run_v2_service.service.name
  location = google_cloud_run_v2_service.service.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

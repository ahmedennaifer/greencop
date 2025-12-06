resource "google_bigquery_dataset" "sensor_data" {
  dataset_id    = var.dataset_id
  friendly_name = "Sensor Data"
  description   = "IoT sensor readings from Pub/Sub"
  location      = var.region
  project       = var.project_id

  labels = {
    environment = "dev"
    service     = "sensor-data"
  }
}

resource "google_bigquery_table" "sensor_readings" {
  dataset_id = google_bigquery_dataset.sensor_data.dataset_id
  table_id   = var.table_id
  project    = var.project_id
  deletion_protection = false
  time_partitioning {
    type  = "DAY"
    field = "timestamp"
  }

  clustering = ["node_id", "message_id"]

  schema = jsonencode([
    {
      name = "node_id"
      type = "STRING"
      mode = "REQUIRED"
    },
    {
      name = "message_id"
      type = "STRING"
      mode = "REQUIRED"
    },
    {
      name = "timestamp"
      type = "TIMESTAMP"
      mode = "REQUIRED"
    },
    {
      name = "temperature"
      type = "FLOAT64"
      mode = "NULLABLE"
    },
    {
      name = "humidity"
      type = "FLOAT64"
      mode = "NULLABLE"
    },
  ])

}

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

  time_partitioning {
    type  = "DAY"
    field = "timestamp"
  }

  clustering = ["sensor_id", "room_id"]

  schema = jsonencode([
    {
      name = "sensor_id"
      type = "STRING"
      mode = "REQUIRED"
    },
    {
      name = "room_id"
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
    {
      name = "pressure"
      type = "FLOAT64"
      mode = "NULLABLE"
    },
    {
      name = "air_quality"
      type = "INTEGER"
      mode = "NULLABLE"
    }
  ])
}
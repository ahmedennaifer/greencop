package cmd

import (
	"log"
	"math/rand"
	"time"

	"github.com/spf13/cobra"
	"greencop.iot/sensors/internal/publisher"
)

var (
	projectID string
	topicName string
	sensorID  string
	roomID    string
	count     int
	interval  int
)

var simulateCmd = &cobra.Command{
	Use:   "simulate",
	Short: "Simulate sensor data and publish to Pub/Sub",
	Run:   runSimulate,
}

func init() {
	rootCmd.AddCommand(simulateCmd)
	simulateCmd.Flags().StringVarP(&projectID, "project", "p", "greencop-473112", "GCP Project ID")
	simulateCmd.Flags().StringVarP(&topicName, "topic", "t", "data", "Pub/Sub topic name")
	simulateCmd.Flags().StringVarP(&sensorID, "sensor-id", "s", "sensor-001", "Sensor ID")
	simulateCmd.Flags().StringVarP(&roomID, "room-id", "r", "room-001", "Room ID")
	simulateCmd.Flags().IntVarP(&count, "count", "c", 10, "Number of messages to publish")
	simulateCmd.Flags().IntVarP(&interval, "interval", "i", 5, "Interval between messages in seconds")
}

func runSimulate(cmd *cobra.Command, args []string) {
	log.Printf("Starting sensor simulation for sensor %s in room %s", sensorID, roomID)
	log.Printf("Publishing %d messages to topic %s in project %s", count, topicName, projectID)

	pub, err := publisher.NewPublisher(projectID, topicName)
	if err != nil {
		log.Fatalf("Failed to create publisher: %v", err)
	}
	defer func() {
		if err := pub.Close(); err != nil {
			log.Printf("Failed to close publisher: %v", err)
		}
	}()

	for i := 0; i < count; i++ {
		data := generateSensorData()

		if err := pub.PublishSensorData(data); err != nil {
			log.Printf("Failed to publish message %d: %v", i+1, err)
			continue
		}

		log.Printf("Published sensor data #%d: temp=%.1f°C, humidity=%.1f%%, pressure=%.1fhPa",
			i+1, data.Temperature, data.Humidity, data.Pressure)

		if i < count-1 {
			time.Sleep(time.Duration(interval) * time.Second)
		}
	}

	log.Printf("Simulation completed. Published %d messages.", count)
}

func generateSensorData() publisher.SensorData {
	baseTemp := 22.0
	baseHumidity := 45.0
	basePressure := 1013.25

	return publisher.SensorData{
		SensorID:    sensorID,
		RoomID:      roomID,
		Timestamp:   time.Now(),
		Temperature: baseTemp + (rand.Float64()-0.5)*10,
		Humidity:    baseHumidity + (rand.Float64()-0.5)*20,
		Pressure:    basePressure + (rand.Float64()-0.5)*20,
		AirQuality:  rand.Intn(500) + 50,
	}
}


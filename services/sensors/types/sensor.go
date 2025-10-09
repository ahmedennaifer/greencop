package types

import "time"

type Sensor struct {
	RoomId int    `yaml:"room_id"`
	Name   string `yaml:"name"`
	Type   string `yaml:"type"`
}

type SensorPayload struct {
	Id        int       `yaml:"id"`
	Reading   float64   `yaml:"reading"`
	Timestamp time.Time `yaml:"timestamp"`
}

func NewSensorPayload(id int, reading float64) SensorPayload {
	return SensorPayload{
		Id:        id,
		Reading:   reading,
		Timestamp: time.Now(),
	}
}

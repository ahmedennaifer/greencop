package main

import (
	"fmt"
)

type Cache struct {
	lastNminutes int
	DB           map[string]int32
}

func (c *Cache) Add(sensorId string) {
	c.DB[sensorId] += 1
	fmt.Printf("sensor %v alerts increased by one\n", sensorId)
}

func NewCache(minutes int) *Cache {
	return &Cache{
		lastNminutes: minutes,
		DB:           make(map[string]int32, 0),
	}
}

func main() {
	c := NewCache(2)
	c.Add("sensor1")
	c.Add("sensor1")
	c.Add("sensor1")
	c.Add("sensor2")
	c.Add("sensor1")
	fmt.Printf("map: %v", c.DB)
}

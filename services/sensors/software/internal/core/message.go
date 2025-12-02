package core

type Message struct {
	Id          string  `json:"id"`
	Temperature float32 `json:"temperature"`
	Humidity    float32 `json:"humidity"`
}

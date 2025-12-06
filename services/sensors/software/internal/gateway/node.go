package gateway

import (
	"time"

	"greencop.iot/sensors/internal/core"
)

func NewNode(id, ipAddr string, message core.Message) core.Node {
	return core.Node{
		Id:       id,
		IpAddr:   ipAddr,
		Messages: make([]core.Message, 0),
		LastSeen: time.Now(),
		IsAlive:  true,
	}
}

package core

import "time"

type Node struct {
	Id       string    `json:"node_id"`
	IpAddr   string    `json:"ip_addr"`
	Messages []Message `json:"messages,omitempty"`
	LastSeen time.Time `json:"last_seen"`
	IsAlive  bool      `json:"is_alive"`
}

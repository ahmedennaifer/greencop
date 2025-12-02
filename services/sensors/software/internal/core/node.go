package core

import "time"

type Node struct {
	Id       string    `json:"id"`
	IpAddr   string    `json:"ip_addr"`
	Message  Message   `json:"message,omitempty"`
	LastSeen time.Time `json:"last_seen"`
}

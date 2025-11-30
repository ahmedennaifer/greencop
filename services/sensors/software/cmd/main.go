package main

import (
	"fmt"

	"greencop.iot/sensors/internal/gateway"
)

func main() {
	addr := ":8008"
	server, err := gateway.NewGatewayServer(addr)
	if err != nil {
		fmt.Printf("error setting up manager: %v", err)
		return
	}
	server.SetupRoutes()
	if err := server.Start(); err != nil {
		panic(err)
	}
}

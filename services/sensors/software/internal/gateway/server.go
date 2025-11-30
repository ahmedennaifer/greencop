package gateway

import (
	"fmt"
	"log"
	"net/http"

	"greencop.iot/sensors/internal/core"
	"greencop.iot/sensors/internal/gateway/handlers"
)

type GatewayServer struct {
	addr    string
	router  *http.ServeMux
	Manager *core.Manager
}

func NewGatewayServer(addr string) (*GatewayServer, error) {
	mgr, err := NewManager()
	if err != nil {
		log.Fatalf("%v", err)
		return &GatewayServer{}, err
	}
	return &GatewayServer{
		addr:    addr,
		router:  http.NewServeMux(),
		Manager: mgr,
	}, nil
}

func (s *GatewayServer) SetupRoutes() {
	s.router.HandleFunc("POST /api/v1/register",
		handlers.HandleRegisterNode(s.Manager))

	s.router.HandleFunc("GET /api/v1/nodes",
		handlers.HandleListNodes(s.Manager))
}

func (s *GatewayServer) Start() error {
	fmt.Printf("Starting gateway server on: %v\n", s.addr)
	return http.ListenAndServe(s.addr, s.router)
}

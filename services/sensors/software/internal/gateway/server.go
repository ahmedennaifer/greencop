package gateway

import (
	"fmt"
	"net"
	"net/http"
	"strconv"
	"strings"

	"github.com/hashicorp/mdns"
	"go.uber.org/zap"
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
	parts := strings.Split(s.addr, ":")
	port, _ := strconv.Atoi(parts[len(parts)-1])

	ips := getLocalIPs()
	if len(ips) == 0 {
		s.Manager.Logger.Warn("No local IP addresses found for mDNS")
	}

	service, err := mdns.NewMDNSService(
		"greencop-gateway",
		"_http._tcp",
		"",
		"greencop-gateway.local.",
		port,
		ips,
		[]string{"version=1.0"},
	)
	if err != nil {
		s.Manager.Logger.Error("Failed to create mDNS service", zap.Error(err))
	} else {
		_, err := mdns.NewServer(&mdns.Config{Zone: service})
		if err != nil {
			s.Manager.Logger.Error("Failed to start mDNS server", zap.Error(err))
		} else {
			s.Manager.Logger.Info("mDNS broadcasting", zap.String("hostname", "greencop-gateway.local"))
		}
	}

	fmt.Printf("Starting gateway server on: %v\n", s.addr)
	return http.ListenAndServe(s.addr, s.router)
}

func getLocalIPs() []net.IP {
	var ips []net.IP
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return ips
	}

	for _, addr := range addrs {
		if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
			if ipnet.IP.To4() != nil {
				ips = append(ips, ipnet.IP)
			}
		}
	}
	return ips
}

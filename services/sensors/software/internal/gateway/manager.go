package gateway

import (
	"fmt"
	"log"
	"os"

	"go.uber.org/zap"
	"greencop.iot/sensors/internal/core"
	"greencop.iot/sensors/internal/publisher"
)

func NewManager() (*core.Manager, error) {
	log.Printf("Launching manager...")
	projectID := os.Getenv("PROJECT_ID")
	topicName := os.Getenv("TOPIC_NAME")
	pub, err := publisher.NewPublisher(projectID, topicName)
	if err != nil {
		return nil, fmt.Errorf("error: cannot instanciate manager, %v", err)
	}
	logger, err := zap.NewProduction()
	if err != nil {
		return nil, fmt.Errorf("error: cannot instanciate manager, %v", err)
	}
	return &core.Manager{
		Publisher: pub,
		Cache: &core.Cache{
			Db: make(map[string]core.Node, 0),
		},
		Logger: logger,
	}, nil
}

package publisher

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"cloud.google.com/go/pubsub"
)

type Payload struct {
	NodeId      string    `json:"node_id"`
	MessageId   string    `json:"message_id"`
	Timestamp   time.Time `json:"timestamp"`
	Temperature float64   `json:"temperature"`
	Humidity    float64   `json:"humidity"`
}

type Publisher struct {
	client    *pubsub.Client
	topic     *pubsub.Topic
	projectID string
	topicName string
}

func NewPublisher(projectID, topicName string) (*Publisher, error) {
	ctx := context.Background()

	client, err := pubsub.NewClient(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to create pubsub client: %w", err)
	}

	topic := client.Topic(topicName)
	exists, err := topic.Exists(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check topic existence: %w", err)
	}

	if !exists {
		return nil, fmt.Errorf("topic %s does not exist in project %s", topicName, projectID)
	}

	return &Publisher{
		client:    client,
		topic:     topic,
		projectID: projectID,
		topicName: topicName,
	}, nil
}

func (p *Publisher) Publish(data Payload) error {
	ctx := context.Background()

	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal sensor data: %w", err)
	}

	message := &pubsub.Message{
		Data: jsonData,
		Attributes: map[string]string{
			"sensor_id": data.NodeId,
			"timestamp": data.Timestamp.Format(time.RFC3339),
		},
	}

	result := p.topic.Publish(ctx, message)

	messageID, err := result.Get(ctx)
	if err != nil {
		return fmt.Errorf("failed to publish message: %w", err)
	}

	log.Printf("Published message with ID: %s", messageID)
	return nil
}

func (p *Publisher) Close() error {
	p.topic.Stop()
	return p.client.Close()
}

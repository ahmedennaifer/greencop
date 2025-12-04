package handlers

// TODO: re implement node auth check, now removed because no more cache

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"greencop.iot/sensors/internal/core"
	"greencop.iot/sensors/internal/publisher"
)

func HandlePublishMessage(manager *core.Manager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		msg, err := decodeMessage(r)
		if err != nil {
			fmt.Fprintf(w, "error decoding message id: %v")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		payload := publisher.Payload{
			NodeId:      msg.NodeId,
			MessageId:   msg.Id,
			Timestamp:   time.Now(),
			Temperature: float64(msg.Temperature),
			Humidity:    float64(msg.Humidity),
		}
		if err := manager.Publisher.Publish(payload); err != nil {
			fmt.Printf("error publishing message %v from node %v\n", payload.NodeId)
			w.WriteHeader(http.StatusBadRequest)
		}
		fmt.Printf("published message with id %v from node \n", payload.MessageId, payload.NodeId)
	}
}

func decodeMessage(r *http.Request) (core.Message, error) {
	var msg core.Message
	body := r.Body
	defer body.Close()
	err := json.NewDecoder(body).Decode(&msg)
	if err != nil {
		return core.Message{}, err
	}
	return msg, nil
}

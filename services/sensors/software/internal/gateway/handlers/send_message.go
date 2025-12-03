package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"greencop.iot/sensors/internal/core"
)

func HandleSendMessage(manager *core.Manager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		msg, err := decodeMessage(r)
		if err != nil {
			fmt.Fprintf(w, "error decoding message id: %v")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		node, exists := manager.Cache.Db[msg.NodeId]
		if !exists {
			fmt.Fprintf(w, "node with id %v is not registered, thus cannot publish messages\n", msg.NodeId)
			w.WriteHeader(http.StatusNotFound)
			return
		}

		node.Messages = append(node.Messages, msg)
		manager.Cache.Db[msg.NodeId] = node
		fmt.Fprintf(w, "message with id %v sent with success\n", msg.Id)
		w.WriteHeader(http.StatusCreated)
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

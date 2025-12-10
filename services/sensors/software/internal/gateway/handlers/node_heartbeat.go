package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"greencop.iot/sensors/internal/core"
)

type aliveRequest struct {
	NodeID string `json:"node_id"`
}

func HandleHeartbeat(manager *core.Manager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var alive aliveRequest
		err := json.NewDecoder(r.Body).Decode(&alive)
		if err != nil {
			fmt.Printf("error while reading node id for heartbeat: %v\n", err)
			fmt.Fprintf(w, "error while reading node id for heartbeat: %v\n", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		node, exists := manager.Cache.Db[alive.NodeID]

		if !exists {
			fmt.Printf("node with id %v is not registered, thus cannot be alive\n", alive.NodeID)
			w.WriteHeader(http.StatusNotFound)
			return
		} else {
			node.IsAlive = true
			node.LastSeen = time.Now()
			manager.Cache.Db[node.Id] = node
			fmt.Printf("node with id %v is alive\n", alive.NodeID)
			fmt.Fprintf(w, "node with id %v is alive: %v\n", err, alive.NodeID)
		}
	}
}

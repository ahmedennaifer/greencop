package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"greencop.iot/sensors/internal/core"
)

func HandleRegisterNode(manager *core.Manager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		nodeData, err := parseNodeFromRequest(r)
		if err != nil {
			fmt.Printf("cannot parse node with id: %v", nodeData.Id)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		manager.Cache.Db[nodeData.Id] = nodeData
		w.WriteHeader(http.StatusCreated)
		fmt.Fprintf(w, "node with id %v registered with success\n", nodeData.Id)
	}
}

func parseNodeFromRequest(r *http.Request) (core.Node, error) {
	var nodeData core.Node
	err := json.NewDecoder(r.Body).Decode(&nodeData)
	return nodeData, err
}

package handlers

import (
	"encoding/json"
	"net/http"

	"greencop.iot/sensors/internal/core"
)

func HandleRegisterNode(manager *core.Manager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		nodeData, err := parseNodeFromRequest(r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		manager.Cache.Db[nodeData.Id] = nodeData
		w.WriteHeader(http.StatusCreated)
	}
}

func parseNodeFromRequest(r *http.Request) (core.Node, error) {
	var nodeData core.Node
	err := json.NewDecoder(r.Body).Decode(&nodeData)
	return nodeData, err
}

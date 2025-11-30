package handlers

import (
	"encoding/json"
	"net/http"

	"greencop.iot/sensors/internal/core"
)

func HandleListNodes(manager *core.Manager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(manager.Cache.Db)
	}
}


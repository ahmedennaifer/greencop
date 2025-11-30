package core

import (
	"fmt"
	"sync"

	"go.uber.org/zap"
	"greencop.iot/sensors/internal/publisher"
)

type Cache struct {
	Db map[string]Node
	mu sync.Mutex
}

type Manager struct {
	Publisher *publisher.Publisher
	Cache     *Cache
	Logger    *zap.Logger
}

func (m *Manager) RegisterNode(node Node) error {
	// TODO: add mutex
	m.Logger.Debug("registering node", zap.String("id", node.Id))
	for _, registeredNode := range m.Cache.Db {
		if registeredNode.Id == node.Id {
			m.Logger.Debug("node already exists", zap.String("id", node.Id))
			return fmt.Errorf("node with id %v already exists", node.Id)
		} else {
			m.Logger.Debug("node not found, adding it", zap.String("id", node.Id))
			m.Cache.Db[node.Id] = node
			m.Logger.Info("node added with success", zap.String("id", node.Id))
		}
	}
	return nil
}

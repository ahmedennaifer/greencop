package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"greencop.iot/sensors/types"
	"greencop.iot/sensors/utils"
)

var logger = utils.Logger()

func (c *Client) AddSensor(sensor types.Sensor) error {
	// TODO: validate sensor room exists for user
	payload := map[string]any{"name": sensor.Name, "type": sensor.Type, "room_id": sensor.RoomId}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		logger.Error(err.Error())
		return err
	}
	resp, err := c.httpClient.Post(c.baseUrl, c.contentType, bytes.NewBuffer(jsonPayload))
	if err != nil {
		logger.Error(err.Error())
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusOK {
		logger.Info("Added sensor with success", "sensor", sensor.Name, "type", sensor.Type, "room", sensor.RoomId)
		return nil
	} else {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("HTTP request failed with status %d: %s", resp.StatusCode, string(body))
	}
}

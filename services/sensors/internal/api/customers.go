package api

import (
	"encoding/json"
	"fmt"
	"greencop.iot/sensors/types"
	"io"
	"net/http"
)

/*
curl -X 'GET' \
'http://localhost:8080/api/v1/server_rooms/list_rooms/1' \
-H 'accept: application/json'
*/

// TODO: add auth check

func (c *Client) GetCustomerRooms(customerId int) (error, []types.Room) {
	var rooms []types.Room
	logger.Debug("Getting rooms for customer", "customer_id", customerId)

	url := fmt.Sprintf("%s/%d", c.BaseUrl, customerId)
	resp, err := c.httpClient.Get(url)
	if err != nil {
		logger.Error("Error getting customer rooms", "customer_id", customerId, "url", url, "error", err)
		return err, []types.Room{}
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			logger.Error(err.Error())
			return err, []types.Room{}
		}
		err = json.Unmarshal(body, &rooms)
		logger.Info("Fetched customer successfully", "customer", customerId)
		return nil, rooms
	} else {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("HTTP request failed with status %d: %s", resp.StatusCode, string(body)), []types.Room{}
	}
}

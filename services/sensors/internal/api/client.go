package api

import "net/http"

type Client struct {
	httpClient  *http.Client
	baseUrl     string
	contentType string
}

func NewClient() *Client {
	return &Client{
		httpClient:  &http.Client{},
		baseUrl:     "http://localhost:8080/api/v1/sensors/new_sensor/",
		contentType: "application/json",
	}
}

package api

import (
	"net/http"
	"strings"
)

type Client struct {
	httpClient  *http.Client
	BaseUrl     string
	contentType string
}

func NewClient(endpoint Endpoint) *Client {
	baseUrl := BaseURL
	endpointStr := strings.TrimPrefix(endpoint.String(), "/")

	if endpointStr != "" {
		baseUrl += endpointStr
	}

	return &Client{
		httpClient:  &http.Client{},
		BaseUrl:     baseUrl,
		contentType: "application/json",
	}
}

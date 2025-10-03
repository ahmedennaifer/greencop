package api

import (
	"net/http"
	"strings"
)

type Client struct {
	httpClient  *http.Client
	baseUrl     string
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
		baseUrl:     baseUrl,
		contentType: "application/json",
	}
}

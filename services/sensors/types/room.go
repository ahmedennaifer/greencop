package types

type Room struct {
	Id         int    `json:"id"`
	Name       string `json:"name"`
	CustomerId int    `json:"customer_id"`
}
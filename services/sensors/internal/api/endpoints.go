package api

const (
	BaseURL = "http://localhost:8080/api/v1/"
)

type Endpoint string

const (
	CustomersEndpoint   Endpoint = "customers"
	ServerRoomsEndpoint Endpoint = "server_rooms"
	SensorsEndpoint     Endpoint = "sensors"
	HealthEndpoint      Endpoint = "health"
)

const (
	CustomerRegister Endpoint = "customers/register"
	CustomerLogin    Endpoint = "customers/login"
	CustomerInfo     Endpoint = "customers/info"
)

const (
	ServerRoomNew    Endpoint = "server_rooms/new_room"
	ServerRoomGet    Endpoint = "server_rooms"
	ServerRoomUpdate Endpoint = "server_rooms"
	ServerRoomDelete Endpoint = "server_rooms"
)

const (
	SensorNew    Endpoint = "sensors/new_sensor"
	SensorGet    Endpoint = "sensors/sensor"
	SensorList   Endpoint = "sensors/list_sensors"
	SensorUpdate Endpoint = "sensors/update_sensor"
	SensorDelete Endpoint = "sensors/delete_sensor"
	SensorByName Endpoint = "sensors/sensor_by_name"
)

func (e Endpoint) String() string {
	return string(e)
}

func (e Endpoint) IsValid() bool {
	switch e {
	case CustomersEndpoint, ServerRoomsEndpoint, SensorsEndpoint, HealthEndpoint,
		CustomerRegister, CustomerLogin, CustomerInfo,
		ServerRoomNew,
		SensorNew, SensorGet, SensorList, SensorUpdate, SensorDelete, SensorByName:
		return true
	default:
		return false
	}
}


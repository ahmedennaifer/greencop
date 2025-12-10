export type Customer = {
  id: number;
  email: string;
  username: string;
}

export type ServerRoom = {
  id: number;
  name: string;
  customer_id: number;
}

export type Sensor = {
  id: number;
  name: string;
  type: string | null;
  room_id: number;
}

export type SensorReading = {
  id: number;
  reading: number;
  timestamp: string;
  sensor_id: number;
}

export type SensorData = {
  node_id: string;
  message_id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
}

export type Alert = {
  id: number;
  sensor_id: number;
  alert_type: 'temperature' | 'humidity';
  value: number;
  threshold: number;
  timestamp: string;
  acknowledged: boolean;
}

export type AlertThreshold = {
  id: number;
  customer_id: number;
  max_temperature: number;
  max_humidity: number;
}

export type LoginRequest = {
  email: string;
  password: string;
}

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user_id: number;
}

export type RegisterRequest = {
  email: string;
  username: string;
  password: string;
}

export type ApiError = {
  detail: string;
}

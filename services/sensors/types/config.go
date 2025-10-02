package types

type Config struct {
	Customer CustomerExists `yaml:"customer"`
	Sensor   Sensor         `yaml:"sensor"`
	// TODO: add room parsing
}

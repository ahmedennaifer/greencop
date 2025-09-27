package types

type Config struct {
	Customer CustomerExists `yaml:"customer"`
	// TODO: add sensor parsing
}

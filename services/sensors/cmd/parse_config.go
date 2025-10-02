package cmd

import (
	"os"

	"gopkg.in/yaml.v3"
	"greencop.iot/sensors/types"
	"greencop.iot/sensors/utils"
)

var Config types.Config
var logger = utils.Logger()

func ParseConfigFile(configFile string) error {
	logger.Info("Started parsing config file", "file", configFile)
	fileContent, err := os.ReadFile(configFile)
	if err != nil {
		logger.Error("Error reading content of config file", "error", err, "file", configFile)
		return err
	}
	err = yaml.Unmarshal([]byte(fileContent), &Config)
	if err != nil {
		logger.Error("Error unmarshalling config file", "error", err, "file", configFile)
		return err
	}
	logger.Info("Parsed config files with success", "file", configFile, "customer", Config.Customer, "sensor", Config.Sensor)
	return nil
}

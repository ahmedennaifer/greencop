package cmd

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
	"greencop.iot/sensors/types"
	"greencop.iot/sensors/utils"
)

var logger = utils.Logger()

func ParseConfigFile(configFile string) error {
	logger.Info("Started parsing config file", "file", configFile)
	fileContent, err := os.ReadFile(configFile)
	if err != nil {
		logger.Error("Error reading content of config file", "error", err, "file", configFile)
		return err
	}
	config := types.Config{}
	err = yaml.Unmarshal([]byte(fileContent), &config)
	if err != nil {
		logger.Error("Error unmarshalling config file", "error", err, "file", configFile)
		return err
	}
	fmt.Print(config)
	return nil
}

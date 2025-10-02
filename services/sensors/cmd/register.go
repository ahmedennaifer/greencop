package cmd

import (
	"github.com/spf13/cobra"
	"greencop.iot/sensors/internal/api"
)

// registerCmd represents the register command
var registerCmd = &cobra.Command{
	Use:   "register",
	Short: "Register a sensor to a customer, based on a config file.",
	Run: func(cmd *cobra.Command, args []string) {
		if err := ParseConfigFile(cfgFile); err != nil {
			logger.Error(err.Error())
			return
		}
		client := api.NewClient()
		if err := client.AddSensor(Config.Sensor); err != nil {
			logger.Error(err.Error())
			return
		} else {
			logger.Info("Added customer")
		}

	},
}

func init() {
	rootCmd.AddCommand(registerCmd)
}

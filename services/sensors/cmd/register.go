package cmd

import (
	"github.com/spf13/cobra"
)

// registerCmd represents the register command
var registerCmd = &cobra.Command{
	Use:   "register",
	Short: "Register a sensor to a customer, based on a config file.",
	Run: func(cmd *cobra.Command, args []string) {
		ParseConfigFile(cfgFile)
	},
}

func init() {
	rootCmd.AddCommand(registerCmd)
}

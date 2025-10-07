package cmd

//lien agenda?

import (
	"fmt"
	"github.com/spf13/cobra"
	. "greencop.iot/sensors/internal"
	"greencop.iot/sensors/internal/api"
)

var logger = Logger()

var registerCmd = &cobra.Command{
	Use:   "register",
	Short: "Register a sensor to a customer, based on a config file.",
	Run: func(cmd *cobra.Command, args []string) {

		if err := ParseConfigFile(cfgFile); err != nil {
			logger.Error(err.Error())
			return
		}
		client := api.NewClient(api.ServerRoomListRooms)
		err, rooms := client.GetCustomerRooms(Config.Customer.Id)
		if err != nil {
			logger.Error(err.Error())
			return
		}
		found := false
		for _, room := range rooms {
			if room.Id != Config.Sensor.RoomId {
				continue
			} else {
				logger.Debug("Found room for customer", "room", room.Id, "customer", Config.Customer.Id)
				sensorClient := api.NewClient(api.SensorNew)
				if err := sensorClient.AddSensor(Config.Sensor); err != nil {
					logger.Error("error adding sensor when looping", "error", err.Error())
					return
				} else {
					logger.Info("Added customer")
					found = true
				}
			}

			if !found {
				logger.Warn("Customer room not found", "customer_id", Config.Customer.Id, "room_id", Config.Sensor.RoomId)
				fmt.Printf("Customer with id %v has no room with id %v!\n", Config.Customer.Id, Config.Sensor.RoomId)
			}
		}

		return
	},
}

func init() {
	rootCmd.AddCommand(registerCmd)
}

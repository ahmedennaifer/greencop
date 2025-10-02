package main

import (
	"greencop.iot/sensors/cmd"
)

func main() {
	cmd.Execute()
	conf := cmd.Config
	if conf.Customer.Id == 0 {
		return
	}
}

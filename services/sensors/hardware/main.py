import machine
import ubinascii

chip_id = ubinascii.hexlify(machine.unique_id()).decode()
print(chip_id)

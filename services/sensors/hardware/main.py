import machine
import ubinascii
import urandom
import requests
import network
import time
import usocket
import random
from config import WIFI_SSID, WIFI_PASSWORD


class CONFIG:
    SERVER_HOST_NAME = "greencop-gateway.local"
    SERVER_PORT = 8080


class Node:
    def __init__(self, config: CONFIG) -> None:
        self.host_name = config.SERVER_HOST_NAME
        self.port = config.SERVER_PORT
        self.max_wait = 8
        self.connected: bool = False
        self.node_id: str = ubinascii.hexlify(machine.unique_id()).decode()
        self.attemps: int = 5
        self.registered: bool = False

    def _connect_wifi(self):
        wlan = network.WLAN(network.STA_IF)
        wlan.active(True)
        if wlan.isconnected():
            self.connected = True
            return
        try:
            wlan.connect(WIFI_SSID, WIFI_PASSWORD)
            while self.max_wait > 0:
                if wlan.status() < 0 or wlan.status() >= 3:
                    break
                elif wlan.isconnected():
                    self.connected = True
                    break
                self.max_wait -= 1
                time.sleep(1)
        except Exception as e:
            raise ValueError(f"cannot connect to wifi: {e}") from e
        if not wlan.isconnected():
            raise RuntimeError(f"cannot connect to wifi {WIFI_SSID}")

    def resolve_host(self):
        addr_info = usocket.getaddrinfo(self.host_name, self.port)
        return addr_info[0][-1][0]

    def register_node(self):
        print(f"trying to register node: {self.node_id}")
        if self.registered:
            return
        while self.attemps > 0:
            if self.connected and not self.registered:
                wlan = network.WLAN(network.STA_IF)
                node_ip = wlan.ifconfig()[0] if wlan.isconnected() else "0.0.0.0"
                server_ip = self.resolve_host()
                payload = {
                    "node_id": self.node_id,
                    "ip_addr": node_ip,
                }

                res = requests.post(
                    f"http://{server_ip}:{self.port}/api/v1/register", json=payload
                )
                if res and res.status_code == 201:
                    print(f"node {self.node_id} registered")
                    self.registered = True
                    res.close()
                    break
                else:
                    print(
                        f"cannot register node: {res.status_code if res else 'No response'}"
                    )
                    self.attemps -= 1
            elif not self.connected:
                print("Node is not connected to network. trying to reconnect..")
                self._connect_wifi()
                self.attemps -= 1

    def send_message(self) -> None:
        server_ip = self.resolve_host()
        message = bytes([urandom.getrandbits(8) for _ in range(4)])
        msg_id = ubinascii.hexlify(message).decode()
        payload = {
            "id": msg_id,
            "node_id": self.node_id,
            "temperature": random.uniform(20, 60),
            "humidity": random.uniform(30, 60),
        }

        res = requests.post(
            f"http://{server_ip}:{self.port}/api/v1/message", json=payload
        )
        if res.status_code == 200:
            print(f"sent message {msg_id}: {payload} ")
        else:
            print(
                f"failed to send message {msg_id}. status code: {res.status_code}, body:{res.json}"
            )

    def heartbeat(self) -> None:
        if not self.connected and not self.registered:
            raise RuntimeError(
                "cannot send heartbeat while not connected or not registered"
            )

        max_retries = 0
        if max_retries <= 5:
            server_ip = self.resolve_host()
            payload = {
                "node_id": self.node_id,
            }
            res = requests.post(
                f"http://{server_ip}:{self.port}/api/v1/heartbeat", json=payload
            )
            if res and res.status_code == 200:
                print(f"node {self.node_id} alive")
                res.close()
                time.sleep(1)
            else:
                print(
                    f"error sending heartbeat. error code:{res.status_code} retry: {max_retries}"
                )
                max_retries += 1

    def run(self):
        try:
            self.register_node()
        except Exception as e:
            raise ValueError(f"Failed to register node: {e}") from e
        while True:
            self.heartbeat()
            self.send_message()


if __name__ == "__main__":
    c = CONFIG()
    n = Node(c)
    print(f"Starting node {n.node_id}")
    n.run()

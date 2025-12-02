import machine
import ubinascii
import requests
import network
import time
import usocket

from config import WIFI_SSID, WIFI_PASSWORD

SERVER_HOST_NAME = "greencop-gateway.local"
SERVER_PORT = 8080


def connect_wifi(ssid, password):
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if wlan.isconnected():
        return
    wlan.connect(ssid, password)
    max_wait = 8
    while max_wait > 0:
        if wlan.status() < 0 or wlan.status() >= 3:
            break
        max_wait -= 1
        time.sleep(1)
    if not wlan.isconnected():
        raise RuntimeError(f"cannot connect to wifi {WIFI_SSID}")


def resolve_host(hostname):
    addr_info = usocket.getaddrinfo(hostname, SERVER_PORT)
    return addr_info[0][-1][0]


def register_node(server_ip):
    node_id = ubinascii.hexlify(machine.unique_id()).decode()
    wlan = network.WLAN(network.STA_IF)
    node_ip = wlan.ifconfig()[0] if wlan.isconnected() else "0.0.0.0"

    payload = {
        "id": node_id,
        "ip_addr": node_ip,
    }

    res = requests.post(
        f"http://{server_ip}:{SERVER_PORT}/api/v1/register", json=payload
    )
    if res and res.status_code == 201:
        print(f"node {node_id} registered")
    else:
        print(f"cannot register node: {res.status_code if res else 'No response'}")
    if res:
        res.close()


try:
    connect_wifi(WIFI_SSID, WIFI_PASSWORD)
    server_ip = resolve_host(SERVER_HOST_NAME)
    register_node(server_ip)
except Exception as e:
    print(f"Error: {e}")

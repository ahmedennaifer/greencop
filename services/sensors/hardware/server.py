from flask import Flask, request, jsonify
from datetime import datetime

app = Flask(__name__)


@app.route("/data", methods=["POST"])
def receive_data():
    data = request.json
    data["server_time"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    print(f"Received: {data}")
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8085)

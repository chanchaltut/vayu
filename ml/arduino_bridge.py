"""
AirSentinel - Arduino Serial Bridge
=====================================
Reads MQ135 sensor data from Arduino via serial port
and pushes live readings to the Node.js backend every 30 seconds.

Hardware needed:
  - Arduino Uno / Nano
  - MQ135 gas sensor (AO pin → A0 on Arduino)
  - USB cable

Arduino code (upload this to Arduino first):
  void setup() { Serial.begin(9600); }
  void loop() {
    int raw = analogRead(A0);
    float voltage = raw * (5.0 / 1023.0);
    float ppm = 116.6020682 * pow((voltage / 3.3), -2.769034857);
    Serial.println(ppm);
    delay(30000);
  }

Run: python arduino_bridge.py --port COM3   (Windows)
     python arduino_bridge.py --port /dev/ttyUSB0  (Linux/Mac)
"""

import serial
import requests
import json
import time
import argparse
from datetime import datetime

# ─── Config ───────────────────────────────
BACKEND_URL = "http://localhost:5000/api/sensor"  # Node.js backend
BAUD_RATE   = 9600
SEND_INTERVAL = 30  # seconds


def parse_args():
    parser = argparse.ArgumentParser(description="AirSentinel Arduino Bridge")
    parser.add_argument("--port", default="/dev/ttyUSB0",
                        help="Serial port (e.g. COM3, /dev/ttyUSB0)")
    parser.add_argument("--location-id", default="arduino-node-1",
                        help="Sensor location ID (matches MongoDB location)")
    parser.add_argument("--lat", type=float, default=23.5204,
                        help="Latitude of sensor location")
    parser.add_argument("--lng", type=float, default=87.3119,
                        help="Longitude of sensor location")
    parser.add_argument("--simulate", action="store_true",
                        help="Run in simulation mode (no real Arduino needed)")
    return parser.parse_args()


def push_reading(ppm, lat, lng, location_id):
    """Send a sensor reading to the Node.js backend."""
    payload = {
        "locationId": location_id,
        "sensor_ppm": round(ppm, 2),
        "lat": lat,
        "lng": lng,
        "timestamp": datetime.now().isoformat(),
        "source": "arduino-mq135"
    }
    try:
        r = requests.post(BACKEND_URL, json=payload, timeout=5)
        if r.status_code == 200:
            print(f"  ✅ Pushed to backend: PPM={ppm:.1f}")
        else:
            print(f"  ⚠️  Backend responded {r.status_code}: {r.text[:100]}")
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Failed to push: {e}")


def simulate_mode(lat, lng, location_id):
    """Simulate Arduino readings for testing without hardware."""
    import random, math
    print("🔵 SIMULATION MODE — no real Arduino connected")
    print("   (Pass --port /dev/ttyUSBX when hardware is ready)\n")
    
    t = 0
    while True:
        # Simulate realistic PPM with daily cycle
        hour = datetime.now().hour
        base = 500 + 200 * math.sin(2 * math.pi * hour / 24 - math.pi)
        ppm = base + random.gauss(0, 30)
        ppm = max(300, ppm)
        
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Simulated PPM: {ppm:.1f}")
        push_reading(ppm, lat, lng, location_id)
        time.sleep(SEND_INTERVAL)
        t += 1


def run_serial(port, lat, lng, location_id):
    """Read real PPM from Arduino serial port."""
    print(f"🔌 Connecting to Arduino on {port}...")
    try:
        ser = serial.Serial(port, BAUD_RATE, timeout=10)
        print(f"✅ Connected! Reading MQ135 data...\n")
        
        while True:
            line = ser.readline().decode("utf-8").strip()
            if not line:
                continue
            try:
                ppm = float(line)
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Arduino PPM: {ppm:.1f}")
                push_reading(ppm, lat, lng, location_id)
            except ValueError:
                print(f"   Non-numeric serial data: {line}")
                
    except serial.SerialException as e:
        print(f"❌ Serial error: {e}")
        print("   Check port name and that Arduino is connected.")
        print("   Use --simulate to test without hardware.")


if __name__ == "__main__":
    args = parse_args()
    print("=" * 50)
    print("  AirSentinel — Arduino Bridge")
    print("=" * 50)
    
    if args.simulate:
        simulate_mode(args.lat, args.lng, args.location_id)
    else:
        run_serial(args.port, args.lat, args.lng, args.location_id)

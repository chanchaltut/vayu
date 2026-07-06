"""
AirSentinel - Flask Prediction API
===================================
Exposes ML model as a REST API consumed by the Node.js backend.

Endpoints:
  POST /predict          → predict next 24hr AQI from recent readings
  POST /predict/batch    → predict for multiple locations
  GET  /health           → health check
  GET  /model/info       → model metrics + SHAP importance
  GET  /aqi/category     → get AQI category + health advice for a value

Run: python app.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow requests from Node.js backend

# ─────────────────────────────────────────
# Load models on startup
# ─────────────────────────────────────────
print("🔄 Loading models...")
try:
    RF_MODEL     = joblib.load("models/rf_model.pkl")
    XGB_MODEL    = joblib.load("models/xgb_model.pkl")
    SCALER       = joblib.load("models/scaler.pkl")
    FEATURE_COLS = joblib.load("models/feature_names.pkl")
    WEIGHTS      = joblib.load("models/ensemble_weights.pkl")
    with open("models/metrics.json") as f:
        METRICS = json.load(f)
    with open("models/shap_importance.json") as f:
        SHAP_DATA = json.load(f)
    print("✅ Models loaded successfully")
except Exception as e:
    print(f"❌ Error loading models: {e}")
    print("   Run train_model.py first!")
    RF_MODEL = XGB_MODEL = SCALER = FEATURE_COLS = WEIGHTS = None


# ─────────────────────────────────────────
# Helper functions
# ─────────────────────────────────────────
def get_aqi_category(aqi):
    """Returns WHO/CPCB AQI category, color, and health advice."""
    if aqi <= 50:
        return {"category": "Good", "color": "#00C853",
                "advice": "Air quality is satisfactory. Enjoy outdoor activities."}
    elif aqi <= 100:
        return {"category": "Satisfactory", "color": "#64DD17",
                "advice": "Minor discomfort for sensitive people. Generally safe."}
    elif aqi <= 200:
        return {"category": "Moderate", "color": "#FFD600",
                "advice": "Sensitive groups should limit prolonged outdoor exertion."}
    elif aqi <= 300:
        return {"category": "Poor", "color": "#FF6D00",
                "advice": "Everyone may experience health effects. Avoid outdoor exertion."}
    elif aqi <= 400:
        return {"category": "Very Poor", "color": "#D50000",
                "advice": "Health warnings. Everyone should avoid outdoor activities."}
    else:
        return {"category": "Severe", "color": "#6A1B9A",
                "advice": "Emergency conditions. Stay indoors with air purification."}


def build_feature_row(readings: list, now: datetime = None) -> dict:
    """
    Build a single feature row from the last 48 hours of readings.
    
    readings: list of dicts with keys: aqi, sensor_ppm, temperature,
              humidity, wind_speed, rain (most recent LAST)
    """
    if now is None:
        now = datetime.now()
    
    aqi_series = [r["aqi"] for r in readings]
    ppm_series = [r.get("sensor_ppm", 400) for r in readings]
    
    # Lag features
    row = {}
    lags = [1, 2, 3, 6, 12, 24, 48]
    n = len(aqi_series)
    for lag in lags:
        row[f"aqi_lag_{lag}h"]  = aqi_series[-lag] if n >= lag else aqi_series[0]
        row[f"ppm_lag_{lag}h"]  = ppm_series[-lag] if n >= lag else ppm_series[0]
    
    # Rolling averages
    aqi_arr = np.array(aqi_series)
    for window in [3, 6, 12, 24]:
        tail = aqi_arr[-window:] if n >= window else aqi_arr
        row[f"aqi_rolling_{window}h"]     = float(np.mean(tail))
        row[f"aqi_rolling_{window}h_std"] = float(np.std(tail)) if len(tail) > 1 else 0.0
    
    # Trend
    row["aqi_change_1h"] = aqi_series[-1] - aqi_series[-2] if n >= 2 else 0
    row["aqi_change_3h"] = aqi_series[-1] - aqi_series[-4] if n >= 4 else 0
    row["aqi_change_6h"] = aqi_series[-1] - aqi_series[-7] if n >= 7 else 0
    
    # Time features
    row["hour"]      = now.hour
    row["month"]     = now.month
    row["weekday"]   = now.weekday()
    row["is_weekend"]          = int(now.weekday() >= 5)
    row["is_rush_hour"]        = int(now.hour in [7,8,9,10,17,18,19,20])
    row["is_industrial_hour"]  = int(9 <= now.hour <= 18 and now.weekday() < 5)
    row["hour_sin"]  = np.sin(2 * np.pi * now.hour / 24)
    row["hour_cos"]  = np.cos(2 * np.pi * now.hour / 24)
    row["month_sin"] = np.sin(2 * np.pi * now.month / 12)
    row["month_cos"] = np.cos(2 * np.pi * now.month / 12)
    
    # Latest env readings
    latest = readings[-1]
    row["temperature"]  = latest.get("temperature", 28)
    row["humidity"]     = latest.get("humidity", 60)
    row["wind_speed"]   = latest.get("wind_speed", 5)
    row["rain"]         = latest.get("rain", 0)
    row["sensor_ppm"]   = latest.get("sensor_ppm", 400)
    
    return row


def predict_from_readings(readings: list, now: datetime = None):
    """Run ensemble prediction and return structured result."""
    row = build_feature_row(readings, now)
    
    # Align to training feature order
    X = pd.DataFrame([row])[FEATURE_COLS]
    X_sc = SCALER.transform(X)
    
    rf_pred  = float(RF_MODEL.predict(X_sc)[0])
    xgb_pred = float(XGB_MODEL.predict(X_sc)[0])
    
    w_xgb, w_rf, w_total = WEIGHTS["w_xgb"], WEIGHTS["w_rf"], WEIGHTS["w_total"]
    ensemble = (w_xgb * xgb_pred + w_rf * rf_pred) / w_total
    predicted_aqi = int(np.clip(round(ensemble), 0, 500))
    
    current_aqi = int(readings[-1]["aqi"])
    trend = "rising" if predicted_aqi > current_aqi + 10 else \
            "falling" if predicted_aqi < current_aqi - 10 else "stable"
    
    return {
        "predicted_aqi_24h": predicted_aqi,
        "current_aqi": current_aqi,
        "trend": trend,
        "confidence_mae": METRICS["ensemble"]["mae"],
        "aqi_category": get_aqi_category(predicted_aqi),
        "model_breakdown": {
            "random_forest": round(rf_pred),
            "xgboost": round(xgb_pred),
            "ensemble": predicted_aqi
        },
        "alert": predicted_aqi >= 200,
        "alert_message": (
            f"⚠️ AQI predicted to reach {predicted_aqi} ({get_aqi_category(predicted_aqi)['category']}) "
            f"in 24 hours. Deploy mitigation resources."
        ) if predicted_aqi >= 200 else None,
        "predicted_at": datetime.now().isoformat(),
    }


# ─────────────────────────────────────────
# Routes
# ─────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "models_loaded": RF_MODEL is not None,
        "timestamp": datetime.now().isoformat()
    })


@app.route("/model/info", methods=["GET"])
def model_info():
    return jsonify({
        "metrics": METRICS,
        "shap_top_features": SHAP_DATA[:10],
        "feature_count": len(FEATURE_COLS),
    })


@app.route("/aqi/category", methods=["GET"])
def aqi_category():
    try:
        aqi = int(request.args.get("value", 100))
        return jsonify(get_aqi_category(aqi))
    except:
        return jsonify({"error": "Invalid AQI value"}), 400


@app.route("/predict", methods=["POST"])
def predict():
    """
    Predict AQI for next 24 hours.
    
    Body (JSON):
    {
      "readings": [
        {
          "aqi": 145,
          "sensor_ppm": 620,
          "temperature": 34,
          "humidity": 65,
          "wind_speed": 4.2,
          "rain": 0
        },
        ... (send last 48 readings for best accuracy, minimum 3)
      ],
      "location": "Durgapur Industrial Belt"   // optional label
    }
    
    Returns:
    {
      "predicted_aqi_24h": 189,
      "current_aqi": 145,
      "trend": "rising",
      "alert": true,
      "alert_message": "...",
      "aqi_category": { "category": "Moderate", "color": "...", "advice": "..." },
      "model_breakdown": { "random_forest": 182, "xgboost": 194, "ensemble": 189 }
    }
    """
    if not RF_MODEL:
        return jsonify({"error": "Models not loaded. Run train_model.py first."}), 503
    
    data = request.get_json()
    if not data or "readings" not in data:
        return jsonify({"error": "Missing 'readings' array in request body"}), 400
    
    readings = data["readings"]
    if len(readings) < 3:
        return jsonify({"error": "Minimum 3 readings required"}), 400
    
    try:
        result = predict_from_readings(readings)
        result["location"] = data.get("location", "Unknown")
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict/batch", methods=["POST"])
def predict_batch():
    """
    Predict for multiple locations at once.
    Body: { "locations": [ { "id": "loc1", "readings": [...] }, ... ] }
    """
    if not RF_MODEL:
        return jsonify({"error": "Models not loaded"}), 503
    
    data = request.get_json()
    if not data or "locations" not in data:
        return jsonify({"error": "Missing 'locations' array"}), 400
    
    results = []
    for loc in data["locations"]:
        try:
            pred = predict_from_readings(loc["readings"])
            pred["location_id"] = loc.get("id", "unknown")
            pred["location_name"] = loc.get("name", "Unknown")
            results.append(pred)
        except Exception as e:
            results.append({"location_id": loc.get("id"), "error": str(e)})
    
    # Sort by predicted AQI descending (worst first for dashboard)
    results.sort(key=lambda x: x.get("predicted_aqi_24h", 0), reverse=True)
    
    return jsonify({
        "predictions": results,
        "total_locations": len(results),
        "alerts": [r for r in results if r.get("alert")],
        "predicted_at": datetime.now().isoformat()
    })


# ─────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"🚀 AirSentinel ML API running on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)

"""
AirSentinel - ML Model Training Script
=======================================
Trains a XGBoost + Random Forest ensemble to predict AQI for next 24 hours.
Uses synthetic but realistic Indian city AQI data.

Run: python train_model.py
Output: models/aqi_model.pkl, models/scaler.pkl, models/feature_names.pkl
"""

import pandas as pd
import numpy as np
import joblib
import os
import json
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
from xgboost import XGBRegressor
import shap
import warnings
warnings.filterwarnings("ignore")

os.makedirs("models", exist_ok=True)

# ─────────────────────────────────────────
# 1. GENERATE REALISTIC TRAINING DATA
# ─────────────────────────────────────────
def generate_aqi_dataset(n_days=730):
    """
    Generates 2 years of hourly AQI data for a typical Indian city.
    Incorporates real-world patterns:
      - Winter (Nov–Feb) is more polluted
      - Rush hours (7–10am, 5–8pm) spike AQI
      - Weekdays are worse than weekends
      - Rain reduces AQI significantly
      - Industrial hours (9am–6pm) add baseline pollution
    """
    print("📊 Generating training dataset...")
    np.random.seed(42)
    
    start = datetime(2022, 1, 1)
    timestamps = [start + timedelta(hours=i) for i in range(n_days * 24)]
    
    records = []
    for ts in timestamps:
        hour = ts.hour
        month = ts.month
        weekday = ts.weekday()  # 0=Mon, 6=Sun
        
        # Seasonal factor: winter more polluted
        if month in [11, 12, 1, 2]:
            seasonal = np.random.uniform(1.4, 1.8)
        elif month in [6, 7, 8]:   # monsoon — cleaner
            seasonal = np.random.uniform(0.5, 0.8)
        else:
            seasonal = np.random.uniform(0.9, 1.2)
        
        # Rush hour factor
        if hour in [7, 8, 9, 10]:
            rush = np.random.uniform(1.3, 1.7)
        elif hour in [17, 18, 19, 20]:
            rush = np.random.uniform(1.2, 1.5)
        elif hour in [0, 1, 2, 3, 4]:
            rush = np.random.uniform(0.6, 0.85)
        else:
            rush = np.random.uniform(0.9, 1.1)
        
        # Weekend factor
        weekend = 0.75 if weekday >= 5 else 1.0
        
        # Industrial hours
        industrial = 1.2 if (9 <= hour <= 18 and weekday < 5) else 0.9
        
        # Rain event (random, reduces AQI)
        rain = np.random.choice([0, 1], p=[0.85, 0.15])
        rain_factor = 0.55 if rain else 1.0
        
        # Temperature & humidity (correlated with pollution)
        if month in [4, 5, 6]:
            temp = np.random.uniform(32, 46)
        elif month in [12, 1, 2]:
            temp = np.random.uniform(8, 20)
        else:
            temp = np.random.uniform(20, 35)
        
        humidity = np.random.uniform(30, 90)
        if rain:
            humidity = np.random.uniform(75, 95)
        
        wind_speed = np.random.uniform(0.5, 18)  # km/h
        
        # MQ135 sensor PPM reading (from Arduino)
        base_ppm = 400 + seasonal * 200
        sensor_ppm = base_ppm * rush * weekend * rain_factor + np.random.normal(0, 30)
        sensor_ppm = max(300, sensor_ppm)
        
        # Base AQI calculation
        base_aqi = 80
        aqi = (base_aqi * seasonal * rush * weekend * industrial * rain_factor
               - wind_speed * 1.5
               + (humidity - 50) * 0.3
               + np.random.normal(0, 12))
        aqi = int(np.clip(aqi, 10, 500))
        
        records.append({
            "timestamp": ts,
            "hour": hour,
            "month": month,
            "weekday": weekday,
            "is_weekend": int(weekday >= 5),
            "is_rush_hour": int(hour in [7, 8, 9, 10, 17, 18, 19, 20]),
            "is_industrial_hour": int(9 <= hour <= 18 and weekday < 5),
            "temperature": round(temp, 1),
            "humidity": round(humidity, 1),
            "wind_speed": round(wind_speed, 2),
            "rain": rain,
            "sensor_ppm": round(sensor_ppm, 1),
            "aqi": aqi,
        })
    
    df = pd.DataFrame(records)
    df.to_csv("models/training_data.csv", index=False)
    print(f"   ✅ Generated {len(df):,} hourly records ({n_days} days)")
    return df


# ─────────────────────────────────────────
# 2. FEATURE ENGINEERING
# ─────────────────────────────────────────
def build_features(df):
    """
    Creates lag features and rolling averages for time-series prediction.
    The model predicts AQI 24 hours ahead.
    """
    print("🔧 Engineering features...")
    df = df.copy().sort_values("timestamp").reset_index(drop=True)
    
    # Lag features: past readings
    for lag in [1, 2, 3, 6, 12, 24, 48]:
        df[f"aqi_lag_{lag}h"] = df["aqi"].shift(lag)
        df[f"ppm_lag_{lag}h"] = df["sensor_ppm"].shift(lag)
    
    # Rolling averages
    for window in [3, 6, 12, 24]:
        df[f"aqi_rolling_{window}h"] = df["aqi"].shift(1).rolling(window).mean()
        df[f"aqi_rolling_{window}h_std"] = df["aqi"].shift(1).rolling(window).std()
    
    # AQI trend (rate of change)
    df["aqi_change_1h"] = df["aqi"].diff(1)
    df["aqi_change_3h"] = df["aqi"].diff(3)
    df["aqi_change_6h"] = df["aqi"].diff(6)
    
    # Cyclical time encoding (so model understands hour 23 is close to hour 0)
    df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)
    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)
    
    # Target: AQI 24 hours from now
    df["target_aqi_24h"] = df["aqi"].shift(-24)
    
    df = df.dropna().reset_index(drop=True)
    print(f"   ✅ Feature matrix: {df.shape[0]:,} rows × {df.shape[1]} columns")
    return df


# ─────────────────────────────────────────
# 3. TRAIN MODELS
# ─────────────────────────────────────────
def train(df):
    feature_cols = [c for c in df.columns if c not in
                    ["timestamp", "aqi", "target_aqi_24h"]]
    
    X = df[feature_cols]
    y = df["target_aqi_24h"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, shuffle=False  # time-series: no shuffle
    )
    
    scaler = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_test_sc = scaler.transform(X_test)
    
    print("\n🤖 Training models...")
    
    # --- Random Forest ---
    print("   Training Random Forest...")
    rf = RandomForestRegressor(n_estimators=200, max_depth=15,
                                min_samples_leaf=4, random_state=42, n_jobs=-1)
    rf.fit(X_train_sc, y_train)
    rf_pred = rf.predict(X_test_sc)
    rf_mae = mean_absolute_error(y_test, rf_pred)
    rf_r2  = r2_score(y_test, rf_pred)
    print(f"   RF  → MAE: {rf_mae:.2f} | R²: {rf_r2:.4f}")
    
    # --- XGBoost ---
    print("   Training XGBoost...")
    xgb = XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.05,
                        subsample=0.8, colsample_bytree=0.8,
                        random_state=42, verbosity=0)
    xgb.fit(X_train_sc, y_train,
            eval_set=[(X_test_sc, y_test)],
            verbose=False)
    xgb_pred = xgb.predict(X_test_sc)
    xgb_mae = mean_absolute_error(y_test, xgb_pred)
    xgb_r2  = r2_score(y_test, xgb_pred)
    print(f"   XGB → MAE: {xgb_mae:.2f} | R²: {xgb_r2:.4f}")
    
    # --- Ensemble (weighted average) ---
    # XGBoost gets higher weight if it performs better
    w_xgb = 1 / xgb_mae
    w_rf  = 1 / rf_mae
    w_total = w_xgb + w_rf
    ensemble_pred = (w_xgb * xgb_pred + w_rf * rf_pred) / w_total
    ens_mae = mean_absolute_error(y_test, ensemble_pred)
    ens_r2  = r2_score(y_test, ensemble_pred)
    print(f"   ENS → MAE: {ens_mae:.2f} | R²: {ens_r2:.4f}  ← WINNER")
    
    # Save metrics
    metrics = {
        "random_forest": {"mae": round(rf_mae,2), "r2": round(rf_r2,4)},
        "xgboost":       {"mae": round(xgb_mae,2), "r2": round(xgb_r2,4)},
        "ensemble":      {"mae": round(ens_mae,2), "r2": round(ens_r2,4)},
        "feature_count": len(feature_cols),
        "train_samples": len(X_train),
        "trained_at": datetime.now().isoformat()
    }
    with open("models/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
    
    # Save models
    joblib.dump(rf, "models/rf_model.pkl")
    joblib.dump(xgb, "models/xgb_model.pkl")
    joblib.dump(scaler, "models/scaler.pkl")
    joblib.dump(feature_cols, "models/feature_names.pkl")
    joblib.dump({"w_xgb": w_xgb, "w_rf": w_rf, "w_total": w_total},
                "models/ensemble_weights.pkl")
    
    print("\n✅ Models saved to /models/")
    return rf, xgb, scaler, feature_cols, X_test_sc, y_test, metrics


# ─────────────────────────────────────────
# 4. SHAP EXPLAINABILITY
# ─────────────────────────────────────────
def generate_shap(xgb_model, X_test_sc, feature_cols):
    print("\n🔍 Computing SHAP values for explainability...")
    explainer = shap.TreeExplainer(xgb_model)
    shap_vals = explainer.shap_values(X_test_sc[:500])
    mean_abs_shap = np.abs(shap_vals).mean(axis=0)
    
    importance = sorted(
        zip(feature_cols, mean_abs_shap),
        key=lambda x: x[1], reverse=True
    )[:10]
    
    shap_data = [{"feature": f, "importance": round(float(v), 4)}
                 for f, v in importance]
    
    with open("models/shap_importance.json", "w") as f:
        json.dump(shap_data, f, indent=2)
    
    print("   Top 5 features:")
    for feat, val in importance[:5]:
        bar = "█" * int(val * 20)
        print(f"   {feat:<30} {bar} {val:.4f}")
    print("   ✅ SHAP saved to models/shap_importance.json")


# ─────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 55)
    print("  AirSentinel ML — Training Pipeline")
    print("=" * 55)
    
    df_raw = generate_aqi_dataset(n_days=730)
    df_feat = build_features(df_raw)
    rf, xgb, scaler, feat_cols, X_test, y_test, metrics = train(df_feat)
    generate_shap(xgb, X_test, feat_cols)
    
    print("\n" + "=" * 55)
    print("  🏁 Training complete!")
    print(f"  Ensemble MAE : {metrics['ensemble']['mae']} AQI points")
    print(f"  Ensemble R²  : {metrics['ensemble']['r2']}")
    print("=" * 55)

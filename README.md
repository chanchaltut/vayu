# 🌬️ VAYU — Hyper-Local Anomaly & Pollution Hotspot Detection
### **Google Cloud Hackathon Submission | Track 2: CleanAir & Clear Streets**

[![Production App](https://img.shields.io/badge/Production-vayuai.vercel.app-005AFF?style=for-the-badge&logo=vercel)](https://vayuai.vercel.app)
[![Google Cloud Stack](https://img.shields.io/badge/Google_Cloud-BigQuery%20%7C%20Gemini%20%7C%20Maps-4285F4?style=for-the-badge&logo=google-cloud)](https://cloud.google.com)

---

## 📖 VAYU in 30 Seconds (For Laymen & Judges)
Traditional weather apps monitor air quality on a **city-wide scale** using a few sparse stations. They completely miss hyper-local, dangerous events occurring on your street—such as a garbage dump fire, toxic industrial smog, or severe localized congestion.

**VAYU solves this.** It is a neighborhood-level pollution map that combines:
1. **Citizen Uploads**: Residents upload photos of localized fires or smog.
2. **IoT Sensors**: Small physical hardware nodes deployed in localities monitor real-time air quality.
3. **Satellite Data**: Live satellite telemetry monitors the overall atmospheric parameters of the region.

Our **Gemini AI Fusion Engine** combines these three inputs, clusters anomalies within a 500-meter grid, maps them as hotspots, and dispatches real-time alerts to municipal teams to send emergency resources (like water cannons or cleanup crews) exactly where they are needed.

---

## 🚀 The End-to-End System Flow

```
   [ Citizen Uploads Photo ] ──┐
                               │
   [ IoT Sensor Telemetry ] ───┼──► [ POST /api/sensors ] ──► [ Google Cloud BigQuery ]
                               │                                     │
   [ Satellite Telemetry ] ────┘                                     │
                                                                     ▼
                                                          [ Gemini Fusion Engine ]
                                                                     │
   [ Emergency Dispatches ] ◄── [ Live Act Section ] ◄── [ Google Maps Hotspots ]
```

---

## 🛠️ Google Cloud Technical Stack

*   **Generative AI & Vision (Gemini API & Vertex AI)**:
    *   **Gemini Vision**: Translates uploaded citizen photos (smoke/dust) into structured JSON metadata defining severity index, fuel types, and estimated AQI impact.
    *   **Gemini Fusion Engine**: Clusters geo-spatial grid cells (~500m) and analyzes telemetry spikes to output verified municipal dispatch guides and 24-hour predictions.
*   **Geospatial & Visual Mapping (Google Maps Platform)**:
    *   Integrates Google Maps Javascript SDK with Advanced Markers, rendering a pulsing location dot for the user's geolocated city and color-coded hotspot circles detailing severity on click.
*   **Data & Analytics (Google Cloud BigQuery)**:
    *   Organizes all incoming telemetry records inside two core tables: `sensor_readings` and `hotspots`.
*   **Storage & Hosting (Firebase & Vercel)**:
    *   **Firebase Storage**: Securely hosts citizen-uploaded imagery.
    *   **Vercel Serverless Architecture**: Next.js serverless API routes process telemetry inputs.
*   **Hardware / IoT Layer**:
    *   **Microcontroller**: Arduino Uno + ESP8266 Wi-Fi Module.
    *   **Sensors**: MQ135 (Gas/Air Quality) and TMP36 (Temperature).
    *   **Display**: 16x2 LCD screen for local alerts.

---

## 📁 Repository Structure

```
vayu/
├── my-app/                          # Frontend Dashboard & Serverless API Routes
│   ├── app/                         # Next.js App Router (Pages & API endpoints)
│   │   ├── api/
│   │   │   ├── detect-hotspots/     # Gemini Fusion Engine trigger
│   │   │   ├── hotspots/            # Serves active Google Map coordinates
│   │   │   └── sensors/             # Arduino telemetry ingestion & satellite sync
│   │   ├── globals.css              # Custom styling variable transitions
│   │   └── page.tsx                 # Unified Dashboard Page
│   ├── components/                  # Shared React Layouts (Hero, Detect, Act)
│   │   ├── cards/                   # AQI Overview Graph, Map, Forecasts
│   │   └── buttons/                 # Dropdown Language Selector
│   └── public/assets/               # Premium illustrations & vectors
│
└── hardware/                        # Embedded Systems
    └── arduino-firmware/            # Arduino .ino sketch files
```

---

## 👥 The Team & Roles

*   **Parth** (ECE / Hardware): Wrote the direct SSL sensor firmware and calibrated MQ135/TMP36 output readings to map with air quality indices.
*   **Chanchal** (Gen AI Full-Stack): Formed the Next.js API architecture, structured BigQuery schemas, and implemented the core Gemini Fusion spatial cluster analyzer.
*   **Ankit** (Gen AI Frontend): Designed the dashboard layout, integrated Google Maps SDK with custom SVG pins, styled responsive UI panels, and built the citizen upload interface.
*   **Sumit** (Core ML & Data Integration): Calibrated AQI scaling indices, mapped Twilio messaging templates, and engineered Gemini's forecasting prompts.

---

## 📡 Physical Hardware Node Setup

VAYU utilizes an Arduino Uno equipped with an ESP8266 serial transceiver to upload telemetry directly to the cloud. Because production Next.js servers on Vercel enforce SSL (HTTPS) routing, the ESP8266 uses direct SSL socket negotiation:

1.  **Configure Network Credentials**:
    Open [air.ino](file:///c:/Users/Dell/Desktop/vayu/hardware/arduino-firmware/air.ino) and update your local Wi-Fi parameters:
    ```cpp
    String ssid     = "YOUR_WIFI_SSID";
    String password = "YOUR_WIFI_PASSWORD";
    ```
2.  **Configure Upstream Endpoint**:
    The sketch directs payloads to the Vercel API over port 443:
    ```cpp
    String host     = "vayuai.vercel.app";
    const int httpsPort = 443;
    ```
3.  **Deploy Sketch**:
    Flash the configuration onto the micro-controller using the Arduino IDE. Open the Serial Monitor at `115200` baud to observe the Wi-Fi connection handshake and view incoming HTTP responses returned directly from the Vercel serverless database engine.

---

## 💻 Next.js Local Setup

1.  **Configure Environment Variables**:
    Create `my-app/.env.local` containing:
    ```env
    # Google Cloud & BigQuery Credentials
    GOOGLE_CLOUD_PROJECT=your-gcp-project-id
    GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}

    # Gemini AI
    GEMINI_API_KEY=your-gemini-api-key

    # Firebase (Admin & Client Storage)
    FIREBASE_PROJECT_ID=your-project-id
    FIREBASE_CLIENT_EMAIL=your-service-account-email
    FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com

    # Google Maps
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key

    # Twilio (Optional)
    TWILIO_ACCOUNT_SID=your-sid
    TWILIO_AUTH_TOKEN=your-token
    TWILIO_PHONE_NUMBER=your-phone
    ```
2.  **Run Development Server**:
    ```bash
    cd my-app
    npm install
    npm run dev
    ```
    Open `http://localhost:3000` to preview the system.

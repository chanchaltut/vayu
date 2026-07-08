# VAYU — Hyper-Local Pollution Hotspot Detection

VAYU is a hyper-local air quality monitoring and anomaly detection platform. While traditional city-level air quality applications rely on sparse public monitoring stations, VAYU pinpoints street-level pollution spikes (garbage fires, industrial leaks, localized congestion) by fusing citizen report photos, local hardware sensors, and generative AI using Google Cloud BigQuery and Gemini.

---

## 🚀 System Architecture

```
                  ┌────────────────────────────────────────┐
                  │          VAYU Next.js Frontend         │
                  │        (Live Dashboard & Map)          │
                  └──────────▲──────────────────▲──────────┘
                             │                  │
                      (GET /api/hotspots) (POST /api/photos)
                             │                  │
┌────────────────────────────┼──────────────────┼────────────────────────────┐
│ NEXT.JS MONOREPO BACKEND   │                  │ (Gemini Vision Image Anal.)│
│                            │                  ▼                            │
│                      ┌─────┴──────┐    ┌──────────────┐                    │
│                      │  BigQuery  ├────► Gemini Flash │                    │
│                      │  Datasets  │    │ Fusion Engine│                    │
│                      └─────▲──────┘    └──────┬───────┘                    │
│                            │                  │                            │
│                      (POST /api/sensors)      │ (Twilio SMS Integration)   │
│                            │                  ▼                            │
│                            │           ┌──────────────┐                    │
│                            │           │ Alert System │                    │
└────────────────────────────┼───────────└──────────────┘────────────────────┘
                             │
                      (HTTPS Port 443)
                             │
                  ┌──────────┴──────────┐
                  │ Physical Hardware   │
                  │ Node (ESP8266 WiFi) │
                  └─────────────────────┘
```

---

## 🛠️ The Tech Stack

*   **Frontend**: Next.js (App Router), React, TypeScript, TailwindCSS, HTML5, Vanilla CSS.
*   **Maps Engine**: Google Maps JavaScript API (via `@googlemaps/js-api-loader`) with Advanced Markers, Legend overlays, and dynamic InfoWindows.
*   **Backend & APIs**: Next.js Serverless API routes (Edge/Node runtimes).
*   **Database & Storage**: 
    *   **Google Cloud BigQuery** (3 core tables: `sensor_readings`, `hotspots`, `citizen_photos`).
    *   **Firebase Storage** for media uploads.
*   **AI Integration**: 
    *   **Gemini Flash/Pro** (via `@google/generative-ai`) for image analysis (identifying smoke/dust severity, estimating AQI impact).
    *   **Gemini Fusion Engine** for geo-spatial grid clustering (~500m) and 24-hour AQI spike prediction.
*   **Hardware Layer**: 
    *   Arduino Uno & ESP8266 Wi-Fi Module.
    *   MQ135 (Air Quality Sensor) & TMP36 (Temperature Sensor).
    *   16x2 LCD display.
*   **Alerting**: Twilio SMS client API for dispatching municipal cleanup alerts.

---

## 📁 Repository Structure

```
vayu/
├── my-app/                          # Unified Frontend + Backend Application
│   ├── app/                         # Next.js App Router (Pages & API routes)
│   │   ├── api/
│   │   │   ├── alerts/              # Twilio SMS trigger logic
│   │   │   ├── detect-hotspots/     # Gemini Fusion Engine trigger
│   │   │   ├── forecast/            # 24h Gemini AQI predictive model
│   │   │   ├── hotspots/            # Serves active Google Map coordinates
│   │   │   └── sensors/             # Arduino telemetry ingestion endpoint
│   │   ├── map/                     # Full-screen maps page
│   │   └── page.tsx                 # Main Dashboard page
│   ├── bigquery-gemini-fusion/      # Spatial clustering & Gemini reasoning
│   ├── components/                  # Shared React component layout system
│   ├── data-pipeline/               # BigQuery schema ingestion & writing scripts
│   └── public/assets/               # Static UI illustrations, icons, logos
│
└── hardware/                        # Embedded Systems
    └── arduino-firmware/            # Arduino `.ino` firmware configuration
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

1.  **Configure environment variables**:
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

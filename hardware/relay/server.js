/**
 * hardware/relay/server.js
 * 
 * Tiny HTTP relay for TinkerCAD simulation.
 * TinkerCAD's ESP8266 can't do SSL — this accepts plain HTTP on port 3001
 * and forwards every POST /api/sensors to your Vercel backend over HTTPS.
 * 
 * Usage:
 *   1. cd hardware/relay && npm install
 *   2. node server.js
 *   3. In a second terminal: npx ngrok http 3001
 *   4. Copy the ngrok URL (e.g. http://abc123.ngrok.io)
 *   5. Paste that URL into the Arduino as the host (without https://)
 */

const http  = require("http");
const https = require("https");

// ── Config ────────────────────────────────────────────────────────────────────
const RELAY_PORT    = 3001;
const VERCEL_HOST   = "vayuai.vercel.app";   // Your Vercel deployment
const VERCEL_PATH   = "/api/sensors";

// ── Simple HTTP server ────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {

  // CORS headers so browsers / Postman can also hit this
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health-check
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "relay running", upstream: VERCEL_HOST }));
    return;
  }

  // Only relay POST /api/sensors
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  // Collect request body
  let body = "";
  req.on("data", chunk => { body += chunk.toString(); });

  req.on("end", () => {
    console.log(`\n[RELAY] Received from TinkerCAD → ${body}`);

    // Forward to Vercel HTTPS
    const options = {
      hostname: VERCEL_HOST,
      port:     443,
      path:     VERCEL_PATH,
      method:   "POST",
      headers:  {
        "Content-Type":   "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const proxyReq = https.request(options, (proxyRes) => {
      let data = "";
      proxyRes.on("data", chunk => { data += chunk; });
      proxyRes.on("end", () => {
        console.log(`[RELAY] Vercel responded: ${proxyRes.statusCode} → ${data}`);

        // Echo Vercel's response back to Arduino
        res.writeHead(proxyRes.statusCode, { "Content-Type": "application/json" });
        res.end(data);
      });
    });

    proxyReq.on("error", (err) => {
      console.error("[RELAY] Error forwarding to Vercel:", err.message);
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Relay could not reach Vercel", detail: err.message }));
    });

    proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(RELAY_PORT, () => {
  console.log("===========================================");
  console.log(` VAYU Relay Server running on port ${RELAY_PORT}`);
  console.log(` Forwarding to → https://${VERCEL_HOST}${VERCEL_PATH}`);
  console.log("===========================================");
  console.log(" Steps:");
  console.log("   1. Open new terminal → npx ngrok http 3001");
  console.log("   2. Copy the Forwarding URL (e.g. abc123.ngrok-free.app)");
  console.log("   3. Paste it in Arduino: String host = \"abc123.ngrok-free.app\";");
  console.log("   4. Set httpsPort = 80 in Arduino (ngrok URL is HTTP-accessible)");
  console.log("===========================================\n");
});

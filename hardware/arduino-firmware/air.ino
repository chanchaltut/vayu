#include <LiquidCrystal.h>

//================== Vayu Backend Configuration ==================

String ssid     = "YOUR_WIFI_SSID";
String password = "YOUR_WIFI_PASSWORD";
String host     = "vayuai.vercel.app";
const int httpsPort = 443;          // Vercel requires HTTPS (SSL) over port 443

//================== MQ135 ==================

const int MQ135_Pin  = A0;
const int GoodAQI    = 300;
const int ModerateAQI = 500;

//================== TMP36 ==================

const int TMP36_Pin   = A1;
const int baseTemp1   = 20;
const int baseTemp2   = 30;
const int moderateTemp = 40;

//================== LCD ==================

const int rs = 13, en = 12, d4 = 11, d5 = 10, d6 = 9, d7 = 8;
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);

//================== Global Variables ==================

int   sensorVal = 0;
float celsius   = 0.0;

//================================================================
// sendATCommand — send a command, wait for expected response
// Returns true if expected string found within timeoutMs
//================================================================
bool sendATCommand(String cmd, String expected, int timeoutMs = 3000) {
  Serial.println(cmd);
  long start = millis();
  String response = "";
  while ((millis() - start) < timeoutMs) {
    while (Serial.available()) {
      char c = Serial.read();
      response += c;
    }
    if (response.indexOf(expected) != -1) return true;
  }
  return false;
}

//================================================================
// setupESP8266 — Connects physical ESP8266 directly to local WiFi
//================================================================
int setupESP8266() {
  Serial.begin(115200);
  delay(1000);

  // Test AT communication
  if (!sendATCommand("AT", "OK", 2000)) return 1;

  // Set single-connection mode
  sendATCommand("AT+CIPMUX=0", "OK", 2000);

  // Connect to the physical WiFi Access Point
  if (!sendATCommand("AT+CWJAP=\"" + ssid + "\",\"" + password + "\"", "OK", 10000)) return 2;

  return 0;
}

//================================================================
// sendToVayuBackend
// Establishes a secure SSL socket -> POSTs JSON data directly
// to Vercel API -> prints responses -> closes connection
//================================================================
void sendToVayuBackend() {

  // ── Build JSON ────────────────────────────────────────────────
  // Map raw MQ135 analog value (0-1023) to approximate AQI (0-500)
  int mappedAqi = map(sensorVal, 0, 1023, 0, 500);

  String jsonPayload =
      "{\"device_id\":\"arduino-001\","
      "\"lat\":22.5726,"
      "\"lon\":88.3639,"
      "\"temperature\":" + String(celsius, 1) + ","
      "\"aqi\":"         + String(mappedAqi)  + "}";

  String httpRequest =
      "POST /api/sensors HTTP/1.1\r\n"
      "Host: "           + host + "\r\n"
      "Content-Type: application/json\r\n"
      "Content-Length: " + String(jsonPayload.length()) + "\r\n"
      "Connection: close\r\n\r\n" +
      jsonPayload;

  int totalLen = httpRequest.length();

  Serial.print("[VAYU] Payload: ");
  Serial.println(jsonPayload);

  // ── Open direct SSL connection to Vercel ──────────────────────
  String cipStart = "AT+CIPSTART=\"SSL\",\"" + host + "\"," + String(httpsPort);
  if (!sendATCommand(cipStart, "OK", 8000)) {
    Serial.println("[VAYU] CIPSTART SSL connection failed");
    return;
  }
  Serial.println("[VAYU] SSL Socket opened");

  // ── Send byte count ──────────────────────────────────────────
  if (!sendATCommand("AT+CIPSEND=" + String(totalLen), ">", 5000)) {
    Serial.println("[VAYU] CIPSEND execution failed");
    sendATCommand("AT+CIPCLOSE", "OK", 2000);
    return;
  }

  // ── Send actual HTTP request payload ─────────────────────────
  Serial.print(httpRequest);
  delay(1000);

  // ── Read response from Vercel Server ─────────────────────────
  long start = millis();
  String resp = "";
  while ((millis() - start) < 5000) {
    while (Serial.available()) {
      char c = Serial.read();
      resp += c;
    }
    if (resp.indexOf("CLOSED") != -1) break;   // server closed connection
  }

  Serial.println("[VAYU] Vercel response:");
  Serial.println(resp);

  // Verify response code
  if      (resp.indexOf("201") != -1) Serial.println("[VAYU] ✅ 201 Created — Data saved to BigQuery!");
  else if (resp.indexOf("200") != -1) Serial.println("[VAYU] ✅ 200 OK");
  else if (resp.indexOf("400") != -1) Serial.println("[VAYU] ❌ 400 Bad Request");
  else if (resp.indexOf("500") != -1) Serial.println("[VAYU] ❌ 500 Server Error");
  else                                Serial.println("[VAYU] ⚠️  Unknown Response Status");

  // ── Close connection ─────────────────────────────────────────
  sendATCommand("AT+CIPCLOSE", "OK", 2000);
}

//================================================================
// setup
//================================================================
void setup() {
  pinMode(MQ135_Pin, INPUT);
  pinMode(TMP36_Pin, INPUT);

  lcd.begin(16, 2);
  lcd.print("Vayu Booting...");
  delay(1000);
  lcd.clear();

  lcd.print("Connecting WiFi");
  int result = setupESP8266();
  if (result != 0) {
    lcd.clear();
    lcd.print("WiFi Error: ");
    lcd.print(result);
    delay(3000);
  } else {
    lcd.clear();
    lcd.print("WiFi OK!");
    delay(1000);
  }
  lcd.clear();
}

//================================================================
// TMP36
//================================================================
void TMP36Sensor() {
  int   rawVal  = analogRead(TMP36_Pin);
  float voltage = rawVal * (5.0 / 1023.0);
  celsius = (voltage - 0.5) * 100.0;

  // Clamped bounds
  if (celsius < -10.0) celsius = -10.0;
  if (celsius > 80.0)  celsius = 80.0;

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Temp: ");
  lcd.print(celsius, 1);
  lcd.print((char)223);
  lcd.print("C");

  lcd.setCursor(0, 1);
  if      (celsius < baseTemp1)                              lcd.print("Cold");
  else if (celsius >= baseTemp1 && celsius < baseTemp2)      lcd.print("Comfortable");
  else if (celsius >= baseTemp2 && celsius < moderateTemp)   lcd.print("Warm");
  else                                                       lcd.print("Too Hot!");

  delay(2000);
}

//================================================================
// MQ135
//================================================================
void MQ135Sensor() {
  sensorVal = analogRead(MQ135_Pin);

  Serial.print("[MQ135] Raw: ");
  Serial.println(sensorVal);

  lcd.setCursor(0, 0);
  lcd.print("AQI Raw:      ");
  lcd.setCursor(9, 0);
  lcd.print(sensorVal);

  lcd.setCursor(0, 1);
  if      (sensorVal < GoodAQI)    lcd.print("Air: Good       ");
  else if (sensorVal < ModerateAQI) lcd.print("Air: Moderate   ");
  else                              lcd.print("Air: Poor       ");
}

//================================================================
// loop
//================================================================
void loop() {
  MQ135Sensor();
  delay(2000);

  TMP36Sensor();
  delay(2000);

  Serial.println("[VAYU] Connecting directly to Vercel...");
  sendToVayuBackend();

  delay(20000);
}

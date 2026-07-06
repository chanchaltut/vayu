#include <LiquidCrystal.h>

//================== ThingSpeak & ESP8266 ==================

String ssid = "Simulator Wifi";
String password = "";
String host = "api.thingspeak.com";
const int httpPort = 80;

// Replace with your Write API Key
String uri = "/update?api_key=YOUR_API_KEY";

//================== MQ135 ==================

const int MQ135_Pin = A0;
const int GoodAQI = 300;
const int ModerateAQI = 500;

//================== TMP36 ==================

const int TMP36_Pin = A1;

const int baseTemp1 = 20;
const int baseTemp2 = 30;
const int moderateTemp = 40;

//================== LCD ==================

const int rs = 13;
const int en = 12;
const int d4 = 11;
const int d5 = 10;
const int d6 = 9;
const int d7 = 8;

LiquidCrystal lcd(rs, en, d4, d5, d6, d7);

//================== Global Variables ==================

int sensorVal = 0;
float celsius = 0.0;

// ESP8266 Setup

int setupESP8266()
{
  Serial.begin(115200);

  Serial.println("AT");
  delay(1000);

  if (!Serial.find("OK"))
    return 1;

  Serial.println("AT+CWJAP=\"" + ssid + "\",\"" + password + "\"");
  delay(3000);

  if (!Serial.find("OK"))
    return 2;

  Serial.println("AT+CIPSTART=\"TCP\",\"" + host + "\"," + httpPort);
  delay(3000);

  if (!Serial.find("OK"))
    return 3;

  return 0;
}

// Send Data to ThingSpeak

void sendToThingSpeak()
{
  String httpPacket =
      "GET " + uri +
      "&field1=" + String(sensorVal) +
      "&field2=" + String(celsius, 1) +
      " HTTP/1.1\r\nHost: " +
      host +
      "\r\nConnection: close\r\n\r\n";

  int length = httpPacket.length();

  Serial.print("AT+CIPSEND=");
  Serial.println(length);

  delay(500);

  Serial.print(httpPacket);

  delay(1000);

  Serial.find("SEND OK");
}


void setup()
{
  pinMode(MQ135_Pin, INPUT);
  pinMode(TMP36_Pin, INPUT);
  
  lcd.begin(16, 2);
  //1st display print
  lcd.print("Hola :)");
  delay(1000);
  lcd.clear();
  
  //2nd display print
  lcd.print("Happy to see you");
  lcd.setCursor(0, 2);
  lcd.print("Myself Bob");
  delay(2000);
  lcd.clear();
  lcd.setCursor(0, 0);
  
  setupESP8266();
}

// TMP36

void TMP36Sensor(){
  int sensorValue = analogRead(TMP36_Pin);

  // Convert analog reading to voltage
  float voltage = sensorValue * (5.0 / 1023.0);

  // Convert voltage to temperature (TMP36)
  celsius = (voltage - 0.5) * 100;

  lcd.clear();

  lcd.setCursor(0, 0);
  lcd.print("Temp: ");
  lcd.print(celsius, 1);
  lcd.print((char)223);   // Degree symbol
  lcd.print("C");

  lcd.setCursor(0, 1);

  if (celsius < baseTemp1)
  {
    lcd.print("Cold");
  }
  else if (celsius >= baseTemp1 && celsius < baseTemp2)
  {
    lcd.print("Comfortable");
  }
  else if (celsius >= baseTemp2 && celsius < moderateTemp)
  {
    lcd.print("Warm");
  }
  else
  {
    lcd.print("Too Hot!");
  }

  delay(2000);
}

//========================================================
// MQ135
//========================================================

void MQ135Sensor()
{
  sensorVal = analogRead(MQ135_Pin);

  // Print value to Serial Monitor
  Serial.print("Sensor Value: ");
  Serial.println(sensorVal);

  // Display on LCD
  lcd.setCursor(0, 0);
  lcd.print("Sensor:      ");   // Clear previous text
  lcd.setCursor(8, 0);
  lcd.print(sensorVal);

  // Display air quality status
  lcd.setCursor(0, 1);

  if (sensorVal < GoodAQI)
  {
    lcd.print("Air: Good       ");
  }
  else if (sensorVal < ModerateAQI)
  {
    lcd.print("Air: Moderate   ");
  }
  else
  {
    lcd.print("Air: Poor       ");
  }
}

void loop()
{
  // Read MQ135
  MQ135Sensor();
  delay(2000);

  // Read TMP36
  TMP36Sensor();
  delay(2000);

  // Upload to ThingSpeak
  sendToThingSpeak();

  // ThingSpeak free account update interval
  delay(15000);
}

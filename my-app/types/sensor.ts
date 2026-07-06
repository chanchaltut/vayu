// types/sensor.ts
// Matches the sensor payload contract (Parth → backend)

export interface SensorReading {
  id?: string;
  deviceId: string;
  timestamp: string; // ISO string
  lat: number;
  lng: number;
  pm25: number;
  smokeLevel: number; // 0.0 – 1.0
  createdAt?: string;
}

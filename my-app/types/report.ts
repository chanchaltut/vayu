// types/report.ts
// Citizen photo report type

export type ReportStatus = "pending" | "verified" | "rejected";

export interface CitizenReport {
  id?: string;
  userId?: string;
  timestamp: string;   // ISO string
  lat: number;
  lng: number;
  imageUrl: string;    // Cloudinary / Firebase Storage URL
  description?: string;
  smokeDetected?: boolean;
  confidence?: number;
  severity?: "low" | "medium" | "high";
  status: ReportStatus;
  createdAt?: string;
}

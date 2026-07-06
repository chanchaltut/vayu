// types/alert.ts
// Municipal alert type

export type AlertStatus = "pending" | "sent" | "failed";

export interface MunicipalAlert {
  id?: string;
  hotspotId: string;
  message: string;
  recipients: string[]; // phone numbers e.g. ["+91XXXXXXXXXX"]
  status: AlertStatus;
  createdAt?: string;
}

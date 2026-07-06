// lib/apiError.ts
// Standardised API error helper — use in all Route Handlers.
// Usage:
//   return apiError("Not found", 404)
//   return apiError("Unauthorised", 401)

import { NextResponse } from "next/server";

export function apiError(message: string, status: number = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

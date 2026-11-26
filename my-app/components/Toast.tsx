"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  // Keep the latest onClose without restarting the timer on every parent render.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const id = setTimeout(() => closeRef.current(), 4500);
    return () => clearTimeout(id);
  }, [message]);

  const ok = type === "success";
  return createPortal(
    <div
      role={ok ? "status" : "alert"}
      className={`animate-toast fixed inset-x-4 top-[max(env(safe-area-inset-top),16px)] z-[9999] mx-auto flex max-w-md items-start gap-3 rounded-2xl border px-4 py-3.5 text-[14px] font-semibold tracking-tight shadow-[0_12px_40px_rgba(0,0,0,0.14)] sm:inset-x-auto sm:right-6 sm:top-6 sm:mx-0 ${
        ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      <svg
        className={`mt-px h-5 w-5 shrink-0 ${ok ? "text-green-600" : "text-red-600"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={ok ? 3 : 2.5}
        viewBox="0 0 24 24"
        aria-hidden
      >
        {ok ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        )}
      </svg>
      <span className="flex-1">{message}</span>
      <button type="button" onClick={() => closeRef.current()} className="-m-1 p-1 opacity-60 hover:opacity-100" aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>,
    document.body
  );
}

"use client";

import { useEffect } from "react";

type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationProps {
  type?: NotificationType;
  title: string;
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Notification({
  type = "success",
  title,
  message,
  onClose,
  duration = 5000,
}: NotificationProps) {
  useEffect(() => {
    if (duration <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      border: "border-green-200",
    },

    error: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      border: "border-red-200",
    },

    warning: {
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      border: "border-yellow-200",
    },

    info: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      border: "border-blue-200",
    },
  };

  const currentStyle = styles[type];

  return (
    <div className="fixed right-5 top-5 z-[9999] w-[calc(100%-2rem)] max-w-md">
      <div
        className={`
          rounded-xl border bg-white p-4 shadow-xl
          ${currentStyle.border}
        `}
      >
        <div className="flex items-start gap-3">

          {/* Icon */}
          <div
            className={`
              flex h-10 w-10 shrink-0 items-center justify-center
              rounded-full
              ${currentStyle.iconBg}
            `}
          >
            {type === "success" && (
              <svg
                className={`h-5 w-5 ${currentStyle.iconColor}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}

            {type === "error" && (
              <svg
                className={`h-5 w-5 ${currentStyle.iconColor}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}

            {type === "warning" && (
              <svg
                className={`h-5 w-5 ${currentStyle.iconColor}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m0 3h.008M10.29 3.86l-7.82 13.5A1.5 1.5 0 003.77 19.5h16.46a1.5 1.5 0 001.3-2.14l-7.82-13.5a1.5 1.5 0 00-2.6 0z"
                />
              </svg>
            )}

            {type === "info" && (
              <svg
                className={`h-5 w-5 ${currentStyle.iconColor}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8h.01M11 12h1v4h1m-1-9.5A9.5 9.5 0 1012 21.5 9.5 9.5 0 0012 2.5z"
                />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-800">
              {title}
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="
              shrink-0 rounded-md p-1
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-600
            "
            aria-label="Close notification"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}


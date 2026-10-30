"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";

interface LoadingOverlayProps {
  show: boolean;
  title?: string;
  message?: string;
  /** Shown if the request is still running after slowAfterMs. */
  slowMessage?: string;
  /** Covers the whole screen instead of the nearest `relative` parent. */
  fullScreen?: boolean;
  /** Wait this long before showing, so fast requests never flash an overlay. */
  delayMs?: number;
  slowAfterMs?: number;
  className?: string;
}

/**
 * Blurred overlay with a spinner card, for heavy backend calls.
 *
 * Usage: put it inside a `relative` container (or pass fullScreen):
 *   <LoadingOverlay show={loading} title="Loading invoice" message="Fetching details..." />
 */
export default function LoadingOverlay({
  show,
  title = "Loading",
  message,
  slowMessage = "Still working. This one is a large request, so it may take a little longer.",
  fullScreen = false,
  delayMs = 200,
  slowAfterMs = 8000,
  className,
}: LoadingOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      setSlow(false);
      return;
    }

    const showTimer = setTimeout(() => setVisible(true), delayMs);
    const slowTimer = setTimeout(() => setSlow(true), slowAfterMs);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(slowTimer);
    };
  }, [show, delayMs, slowAfterMs]);

  if (!show || !visible) return null;

  return (
    <div
      role="alert"
      aria-busy="true"
      className={cn(
        "inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-[2px]",
        fullScreen ? "fixed" : "absolute rounded-[inherit]",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 px-8 bg-white border shadow-xl w-72 rounded-2xl border-slate-200 py-7">
        <Spinner size="lg" />

        <div className="text-center">
          <p className="text-sm font-semibold text-navy">{title}</p>
          {message && <p className="mt-1 text-xs text-slate-500">{message}</p>}
        </div>

        {slow && (
          <p className="px-3 py-2 text-xs text-center rounded-md bg-slate-50 text-slate-500">
            {slowMessage}
          </p>
        )}
      </div>
    </div>
  );
}
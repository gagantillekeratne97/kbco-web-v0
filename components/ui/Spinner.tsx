import { cn } from "@/lib/utils";

const sizes = {
  xs: "h-4 w-4",
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-14 w-14",
} as const;

interface SpinnerProps {
  size?: keyof typeof sizes;
  className?: string;
  label?: string; // read by screen readers
}

/**
 * Ring spinner: a faint track with an orange arc that rotates.
 * Colours come from your theme (stroke-orange). Change them here once
 * and every loader in the app follows.
 */
export default function Spinner({
  size = "md",
  className,
  label = "Loading",
}: SpinnerProps) {
  return (
    <svg
      viewBox="0 0 50 50"
      role="status"
      aria-label={label}
      className={cn("animate-spin", sizes[size], className)}
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth="5"
        className="stroke-slate-200"
      />
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="80 200"
        className="stroke-orange"
      />
    </svg>
  );
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency: string = "LKR") {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency,
  }).format(value)
}
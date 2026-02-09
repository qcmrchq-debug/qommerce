import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency in ZAR (South African Rand) exclusively
 * Uses deterministic formatting to avoid hydration mismatches
 * @param amount - The amount to format
 * @param _currency - Ignored; ZAR is used for consistency
 * @returns Formatted currency string (e.g., "R 1,234.56")
 */
export function formatCurrency(amount: number, _currency?: string): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `R ${formatted}`
}

/**
 * Format a date string consistently across the app
 * @param date - ISO date string or Date
 * @returns Formatted date (e.g., "Jan 15, 2025")
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
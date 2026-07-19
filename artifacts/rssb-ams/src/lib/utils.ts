import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string | Date | any) {
  if (!dateStr) return '';
  const d = dateStr.toDate ? dateStr.toDate() : new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  
  const formatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return formatter.format(d);
}

export function formatSimpleDate(dateStr: string | Date | any) {
  if (!dateStr) return '';
  const d = dateStr.toDate ? dateStr.toDate() : new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  
  const formatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  return formatter.format(d);
}

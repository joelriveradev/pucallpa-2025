import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateCreated(date: string) {
  return new Date(date).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
}

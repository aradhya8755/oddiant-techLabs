import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const formatWebsiteUrl = (url: string): string => {
  if (!url) return ""
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "https://" + url
  }
  return url
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

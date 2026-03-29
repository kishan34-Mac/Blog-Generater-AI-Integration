import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getResponseError(response: Response): Promise<string> {
  try {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (typeof data === "string") return data;
      if (data?.error) return data.error;
      if (data?.message) return data.message;
      return JSON.stringify(data);
    } catch {
      return text.trim() || response.statusText || `HTTP ${response.status}`;
    }
  } catch {
    return response.statusText || `HTTP ${response.status}`;
  }
}

export function getApiBaseList(raw?: string): string[] {
  const source = raw ?? import.meta.env.VITE_API_BASE ?? "";
  return source
    .split("||")
    .flatMap((entry) => entry.split(/[;,]/))
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.replace(/\/+$|\s+$/g, ""));
}

export function getApiBase(raw?: string): string {
  return getApiBaseList(raw)[0] || "http://localhost:4000";
}

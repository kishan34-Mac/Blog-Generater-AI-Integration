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

const LOCALHOST_HOSTNAMES = ["localhost", "127.0.0.1"];

const normalizeApiEntry = (entry: string) =>
  entry
    .trim()
    .replace(/^['"]+|['"]+$/g, "")
    .replace(/\/+$|\s+$/g, "");

const isLocalhost = (value: string) => {
  try {
    const url = new URL(value);
    return LOCALHOST_HOSTNAMES.includes(url.hostname);
  } catch {
    return false;
  }
};

export function getApiBaseList(raw?: string): string[] {
  const source = raw ?? import.meta.env.VITE_API_BASE ?? "";
  const entries = source
    .split("||")
    .flatMap((entry) => entry.split(/[;,]/))
    .map(normalizeApiEntry)
    .filter(Boolean);

  if (typeof window === "undefined") {
    return entries;
  }

  const isBrowserLocalhost = LOCALHOST_HOSTNAMES.includes(
    window.location.hostname,
  );

  const localEntries = entries.filter(isLocalhost);
  const remoteEntries = entries.filter((entry) => !isLocalhost(entry));

  return isBrowserLocalhost
    ? [...localEntries, ...remoteEntries]
    : [...remoteEntries, ...localEntries];
}

export function getApiBase(raw?: string): string {
  const candidates = getApiBaseList(raw);
  return candidates[0] || "http://localhost:4000";
}

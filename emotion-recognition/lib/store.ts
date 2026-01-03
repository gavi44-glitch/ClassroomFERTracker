import type { SessionRecord, AppSettings } from "./types";

const SESSIONS_KEY = "classroom-monitor-sessions";
const SETTINGS_KEY = "classroom-monitor-settings";

export const defaultSettings: AppSettings = {
  confidenceThreshold: 0.5,
  alertsEnabled: true,
  sadnessThreshold: 70,
  anxietyThreshold: 60,
  frustrationThreshold: 70,
  frameRate: 10,
  saveHistory: true,
};

// Session History Functions
export function getSessions(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(SESSIONS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveSession(session: SessionRecord): void {
  if (typeof window === "undefined") return;
  const sessions = getSessions();
  sessions.unshift(session); // Add to beginning
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 50))); // Keep last 50
}

export function clearSessions(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSIONS_KEY);
}

// Settings Functions
export function getSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings;
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

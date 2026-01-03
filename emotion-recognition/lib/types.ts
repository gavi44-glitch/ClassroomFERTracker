export interface SessionRecord {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  students: number;
  avgEngagement: number;
  dominantEmotion: string;
  emotionBreakdown: Record<string, number>;
}

export interface AppSettings {
  confidenceThreshold: number;
  alertsEnabled: boolean;
  sadnessThreshold: number;
  anxietyThreshold: number;
  frustrationThreshold: number;
  frameRate: number;
  saveHistory: boolean;
}

export interface Prediction {
  box: number[];
  emotion_label: string;
  score: number;
}

export interface EmotionHistoryEntry {
  time: Date;
  engagement: number;
  students: number;
  emotions: Record<string, { count: number; totalScore: number }>;
}

export interface Alert {
  id: string;
  type: "warning" | "alert" | "info";
  message: string;
  time: Date;
}

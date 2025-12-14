"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import SessionHistory from "./components/SessionHistory";
import Settings from "./components/Settings";
import type {
  SessionRecord,
  AppSettings,
  EmotionHistoryEntry,
} from "../lib/types";
import {
  getSessions,
  saveSession,
  getSettings,
  saveSettings,
  defaultSettings,
} from "../lib/store";
import "./styles/components.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sessionActive, setSessionActive] = useState(false);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const [sessionData, setSessionData] = useState({
    startTime: null as Date | null,
    studentsDetected: 0,
    emotionHistory: [] as EmotionHistoryEntry[],
    engagementScores: [] as number[],
    peakStudents: 0,
    emotionCounts: {} as Record<string, number>,
  });

  useEffect(() => {
    setSessions(getSessions());
    setSettings(getSettings());
  }, []);

  const startSession = () => {
    setSessionActive(true);
    setSessionData({
      startTime: new Date(),
      studentsDetected: 0,
      emotionHistory: [],
      engagementScores: [],
      peakStudents: 0,
      emotionCounts: {},
    });
  };

  const endSession = useCallback(() => {
    if (sessionData.startTime && settings.saveHistory) {
      const endTime = new Date();
      const durationMs = endTime.getTime() - sessionData.startTime.getTime();
      const durationMins = Math.round(durationMs / 60000);

      const avgEngagement =
        sessionData.engagementScores.length > 0
          ? Math.round(
              sessionData.engagementScores.reduce((a, b) => a + b, 0) /
                sessionData.engagementScores.length
            )
          : 0;

      const emotionCounts = sessionData.emotionCounts;
      let dominantEmotion = "neutral";
      let maxCount = 0;
      Object.entries(emotionCounts).forEach(([emotion, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantEmotion = emotion;
        }
      });

      const newSession: SessionRecord = {
        id: `session-${Date.now()}`,
        date: sessionData.startTime.toISOString().split("T")[0],
        startTime: sessionData.startTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        endTime: endTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        duration: `${durationMins} min`,
        students: sessionData.peakStudents,
        avgEngagement,
        dominantEmotion,
        emotionBreakdown: emotionCounts,
      };

      saveSession(newSession);
      setSessions(getSessions());
    }

    setSessionActive(false);
  }, [sessionData, settings.saveHistory]);

  const updateSessionData = (data: Partial<typeof sessionData>) => {
    setSessionData((prev) => ({
      ...prev,
      ...data,
      peakStudents: Math.max(
        prev.peakStudents,
        data.studentsDetected || prev.studentsDetected
      ),
    }));
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const clearHistory = () => {
    setSessions([]);
    localStorage.removeItem("classroom-monitor-sessions");
  };

  return (
    <div className="app">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Header
          sessionActive={sessionActive}
          startSession={startSession}
          endSession={endSession}
          sessionData={sessionData}
        />
        <main className="content">
          {activeTab === "dashboard" && (
            <Dashboard
              sessionActive={sessionActive}
              sessionData={sessionData}
              updateSessionData={updateSessionData}
              settings={settings}
            />
          )}
          {activeTab === "history" && (
            <SessionHistory sessions={sessions} onClearHistory={clearHistory} />
          )}
          {activeTab === "settings" && (
            <Settings settings={settings} onUpdateSettings={updateSettings} />
          )}
        </main>
      </div>
    </div>
  );
}

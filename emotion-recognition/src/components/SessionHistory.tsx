"use client";

import React from "react";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Download,
  Trash2,
} from "lucide-react";
import type { SessionRecord } from "../../lib/types";
import "../styles/components.css";

const emotionColors: Record<string, string> = {
  happy: "happy",
  neutral: "neutral",
  sad: "sad",
  angry: "angry",
  fear: "fear",
  surprise: "surprise",
  disgust: "disgust",
};

interface SessionHistoryProps {
  sessions: SessionRecord[];
  onClearHistory: () => void;
}

export default function SessionHistory({
  sessions,
  onClearHistory,
}: SessionHistoryProps) {
  const exportData = () => {
    if (sessions.length === 0) return;

    const headers = [
      "Date",
      "Start Time",
      "End Time",
      "Duration",
      "Students",
      "Avg Engagement",
      "Dominant Emotion",
    ];
    const rows = sessions.map((s) => [
      s.date,
      s.startTime,
      s.endTime,
      s.duration,
      s.students.toString(),
      `${s.avgEngagement}%`,
      s.dominantEmotion,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `classroom-sessions-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="session-history">
      <div className="page-header">
        <div>
          <h2>Session History</h2>
          <p>
            {sessions.length > 0
              ? `${sessions.length} recorded session${
                  sessions.length !== 1 ? "s" : ""
                }`
              : "No sessions recorded yet. Start a session to begin tracking."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {sessions.length > 0 && (
            <>
              <button onClick={onClearHistory} className="btn btn-danger">
                <Trash2 size={18} />
                Clear History
              </button>
              <button onClick={exportData} className="btn btn-secondary">
                <Download size={18} />
                Export CSV
              </button>
            </>
          )}
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="card">
          <div
            className="card-body empty-state"
            style={{ padding: "48px 20px" }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 16px",
                borderRadius: "50%",
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calendar size={32} />
            </div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              No Sessions Yet
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--muted-foreground)",
                maxWidth: "450px",
                margin: "0 auto",
              }}
            >
              Start monitoring your classroom by clicking the "Start Session"
              button in the header. Your session data will be saved here
              automatically when you end the session.
            </p>
          </div>
        </div>
      ) : (
        <div className="history-grid">
          {sessions.map((session) => (
            <div key={session.id} className="card session-card">
              <div className="session-date">
                <Calendar size={16} />
                <span>{session.date}</span>
              </div>

              <div className="session-details">
                <div className="session-detail">
                  <Clock size={14} />
                  <span>
                    {session.startTime} - {session.endTime} ({session.duration})
                  </span>
                </div>
                <div className="session-detail">
                  <Users size={14} />
                  <span>{session.students} students detected</span>
                </div>
                <div className="session-detail">
                  <TrendingUp size={14} />
                  <span>{session.avgEngagement}% avg engagement</span>
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <span
                  className={`emotion-tag ${
                    emotionColors[session.dominantEmotion] || "neutral"
                  }`}
                >
                  {session.dominantEmotion}
                </span>
              </div>

              {session.emotionBreakdown &&
                Object.keys(session.emotionBreakdown).length > 0 && (
                  <div
                    style={{
                      paddingTop: "12px",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--muted-foreground)",
                        marginBottom: "8px",
                      }}
                    >
                      Emotion breakdown:
                    </p>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                    >
                      {Object.entries(session.emotionBreakdown)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 4)
                        .map(([emotion, count]) => (
                          <span
                            key={emotion}
                            style={{
                              fontSize: "12px",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              textTransform: "capitalize",
                              background: "var(--accent)",
                              color: "var(--muted-foreground)",
                            }}
                          >
                            {emotion}: {count}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

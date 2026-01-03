"use client";

import React, { useState, useEffect } from "react";
import { Play, Square, Clock, Users, Activity } from "lucide-react";
import "../styles/components.css";

interface HeaderProps {
  sessionActive: boolean;
  startSession: () => void;
  endSession: () => void;
  sessionData: {
    startTime: Date | null;
    studentsDetected: number;
    engagementScores: number[];
  };
}

export default function Header({
  sessionActive,
  startSession,
  endSession,
  sessionData,
}: HeaderProps) {
  const [elapsed, setElapsed] = useState("00:00:00");

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (sessionActive && sessionData.startTime) {
      interval = setInterval(() => {
        const diff =
          new Date().getTime() - new Date(sessionData.startTime!).getTime();
        const hours = Math.floor(diff / 3600000)
          .toString()
          .padStart(2, "0");
        const minutes = Math.floor((diff % 3600000) / 60000)
          .toString()
          .padStart(2, "0");
        const seconds = Math.floor((diff % 60000) / 1000)
          .toString()
          .padStart(2, "0");
        setElapsed(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive, sessionData.startTime]);

  const avgEngagement =
    sessionData.engagementScores.length > 0
      ? Math.round(
          sessionData.engagementScores.reduce((a, b) => a + b, 0) /
            sessionData.engagementScores.length
        )
      : 0;

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Classroom Emotion Monitor</h1>
        <span className="header-subtitle">
          Real-time student engagement tracking
        </span>
      </div>

      <div className="header-center">
        {sessionActive && (
          <div className="session-stats">
            <div className="session-stat">
              <Clock size={16} />
              <span>{elapsed}</span>
            </div>
            <div className="session-stat">
              <Users size={16} />
              <span>{sessionData.studentsDetected} detected</span>
            </div>
            <div className="session-stat">
              <Activity size={16} />
              <span className="engagement-value">{avgEngagement}% engaged</span>
            </div>
          </div>
        )}
      </div>

      <div>
        {!sessionActive ? (
          <button className="btn btn-primary" onClick={startSession}>
            <Play size={18} />
            Start Session
          </button>
        ) : (
          <button className="btn btn-danger" onClick={endSession}>
            <Square size={18} />
            End Session
          </button>
        )}
      </div>
    </header>
  );
}

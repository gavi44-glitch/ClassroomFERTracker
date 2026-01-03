"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { drawYOLOPredictions } from "../../lib/draw";
import EmotionPanel from "./EmotionPanel";
import StudentGrid from "./StudentGrid";
import EngagementChart from "./EngagementChart";
import AlertsPanel from "./AlertsPanel";
import { Camera, CameraOff, Maximize2, Wifi, WifiOff } from "lucide-react";
import type {
  Prediction,
  EmotionHistoryEntry,
  Alert,
  AppSettings,
} from "../../lib/types";
import "../styles/components.css";

const WEBSOCKET_URL = "ws://localhost:8000/ws";

interface DashboardProps {
  sessionActive: boolean;
  sessionData: {
    startTime: Date | null;
    studentsDetected: number;
    emotionHistory: EmotionHistoryEntry[];
    engagementScores: number[];
    peakStudents: number;
    emotionCounts: Record<string, number>;
  };
  updateSessionData: (data: any) => void;
  settings: AppSettings;
}

export default function Dashboard({
  sessionActive,
  sessionData,
  updateSessionData,
  settings,
}: DashboardProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [connected, setConnected] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [emotionStats, setEmotionStats] = useState<
    Record<string, { count: number; totalScore: number }>
  >({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [emotionHistory, setEmotionHistory] = useState<EmotionHistoryEntry[]>(
    []
  );

  const calculateEngagement = useCallback((preds: Prediction[]) => {
    if (!preds || preds.length === 0) return 0;
    const positiveEmotions = ["happy", "surprise", "neutral"];
    const positiveCount = preds.filter((p) =>
      positiveEmotions.includes(p.emotion_label)
    ).length;
    return Math.round((positiveCount / preds.length) * 100);
  }, []);

  const checkAlerts = useCallback(
    (preds: Prediction[]) => {
      if (!settings.alertsEnabled) return;

      const newAlerts: Alert[] = [];
      const now = new Date();

      preds.forEach((pred, index) => {
        const confidencePercent = pred.score * 100;

        if (
          pred.emotion_label === "sad" &&
          confidencePercent > settings.sadnessThreshold
        ) {
          newAlerts.push({
            id: `${now.getTime()}-sad-${index}`,
            type: "warning",
            message: `Student appears sad (${Math.round(
              confidencePercent
            )}% confidence)`,
            time: now,
          });
        }
        if (
          pred.emotion_label === "fear" &&
          confidencePercent > settings.anxietyThreshold
        ) {
          newAlerts.push({
            id: `${now.getTime()}-fear-${index}`,
            type: "alert",
            message: `Student may be anxious or stressed (${Math.round(
              confidencePercent
            )}%)`,
            time: now,
          });
        }
        if (
          pred.emotion_label === "angry" &&
          confidencePercent > settings.frustrationThreshold
        ) {
          newAlerts.push({
            id: `${now.getTime()}-angry-${index}`,
            type: "alert",
            message: `Student appears frustrated (${Math.round(
              confidencePercent
            )}%)`,
            time: now,
          });
        }
      });

      if (newAlerts.length > 0) {
        setAlerts((prev) => [...newAlerts, ...prev].slice(0, 10));
      }
    },
    [settings]
  );

  const connectWebSocket = useCallback(() => {
    if (!sessionActive) return;
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(WEBSOCKET_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);

      const frameInterval = Math.round(1000 / settings.frameRate);

      intervalRef.current = setInterval(() => {
        if (
          webcamRef.current &&
          webcamRef.current.video &&
          webcamRef.current.video.readyState === 4 &&
          socket.readyState === WebSocket.OPEN &&
          cameraEnabled
        ) {
          const screenshot = webcamRef.current.getScreenshot();
          if (screenshot) {
            socket.send(
              JSON.stringify({
                data: { image: screenshot },
                config: { confidence: settings.confidenceThreshold },
              })
            );
          }
        }
      }, frameInterval);
    };

    socket.onmessage = (event) => {
      try {
        const { predictions: preds } = JSON.parse(event.data);
        setPredictions(preds || []);

        if (preds && preds.length > 0) {
          const stats: Record<string, { count: number; totalScore: number }> =
            {};
          const emotionCountsUpdate: Record<string, number> = {
            ...sessionData.emotionCounts,
          };

          preds.forEach((pred: Prediction) => {
            const label = pred.emotion_label;
            if (!stats[label]) {
              stats[label] = { count: 0, totalScore: 0 };
            }
            stats[label].count++;
            stats[label].totalScore += pred.score;

            emotionCountsUpdate[label] = (emotionCountsUpdate[label] || 0) + 1;
          });
          setEmotionStats(stats);

          const engagement = calculateEngagement(preds);
          updateSessionData({
            studentsDetected: preds.length,
            engagementScores: [
              ...sessionData.engagementScores.slice(-59),
              engagement,
            ],
            emotionCounts: emotionCountsUpdate,
          });

          setEmotionHistory((prev) =>
            [
              ...prev,
              {
                time: new Date(),
                engagement,
                students: preds.length,
                emotions: stats,
              },
            ].slice(-60)
          );

          checkAlerts(preds);
        }

        if (webcamRef.current?.video && canvasRef.current) {
          const video = webcamRef.current.video;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            drawYOLOPredictions(preds || [], ctx);
          }
        }
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };

    socket.onerror = () => {
      setConnected(false);
    };

    socket.onclose = () => {
      setConnected(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (sessionActive) {
        setTimeout(connectWebSocket, 3000);
      }
    };
  }, [
    sessionActive,
    cameraEnabled,
    calculateEngagement,
    checkAlerts,
    updateSessionData,
    sessionData.engagementScores,
    sessionData.emotionCounts,
    settings,
  ]);

  useEffect(() => {
    if (sessionActive) {
      connectWebSocket();
    } else {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setConnected(false);
      setPredictions([]);
      setAlerts([]);
      setEmotionHistory([]);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [sessionActive, connectWebSocket]);

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        {/* Video Feed */}
        <div className="card video-card">
          <div className="card-header">
            <h3>Live Classroom Feed</h3>
            <div className="card-actions">
              <div
                className={`connection-status ${connected ? "connected" : ""}`}
              >
                {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
                <span>{connected ? "Connected" : "Disconnected"}</span>
              </div>
              <button
                className="icon-btn"
                onClick={() => setCameraEnabled(!cameraEnabled)}
                title={cameraEnabled ? "Disable camera" : "Enable camera"}
              >
                {cameraEnabled ? <Camera size={18} /> : <CameraOff size={18} />}
              </button>
              <button className="icon-btn" title="Fullscreen">
                <Maximize2 size={18} />
              </button>
            </div>
          </div>
          <div className="video-container">
            {sessionActive && cameraEnabled ? (
              <>
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.8}
                  className="webcam"
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: "user",
                  }}
                />
                <canvas ref={canvasRef} className="overlay-canvas" />
              </>
            ) : (
              <div className="video-placeholder">
                <CameraOff size={48} />
                <p>
                  {sessionActive
                    ? "Camera disabled"
                    : "Start a session to begin monitoring"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Emotion Panel */}
        <EmotionPanel emotionStats={emotionStats} predictions={predictions} />

        {/* Student Grid */}
        <StudentGrid predictions={predictions} />

        {/* Engagement Chart */}
        <EngagementChart emotionHistory={emotionHistory} />

        {/* Alerts Panel */}
        <AlertsPanel alerts={alerts} alertsEnabled={settings.alertsEnabled} />
      </div>
    </div>
  );
}

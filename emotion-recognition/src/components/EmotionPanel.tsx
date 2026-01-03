import React from "react";
import "../styles/components.css";

interface EmotionPanelProps {
  emotionStats: Record<string, { count: number; totalScore: number }>;
  predictions: { emotion_label: string; score: number }[];
}

const EMOTIONS = [
  { key: "happy", label: "Happy", color: "var(--emotion-happy)" },
  { key: "neutral", label: "Neutral", color: "var(--emotion-neutral)" },
  { key: "sad", label: "Sad", color: "var(--emotion-sad)" },
  { key: "surprise", label: "Surprise", color: "var(--emotion-surprise)" },
  { key: "angry", label: "Angry", color: "var(--emotion-angry)" },
  { key: "fear", label: "Fear", color: "var(--emotion-fear)" },
  { key: "disgust", label: "Disgust", color: "var(--emotion-disgust)" },
];

export default function EmotionPanel({
  emotionStats,
  predictions,
}: EmotionPanelProps) {
  const totalStudents = predictions.length || 1;

  const getEmotionPercentage = (key: string) => {
    if (!emotionStats[key]) return 0;
    return Math.round((emotionStats[key].count / totalStudents) * 100);
  };

  const getEmotionCount = (key: string) => {
    return emotionStats[key]?.count || 0;
  };

  let dominant = "neutral";
  let maxCount = 0;
  Object.entries(emotionStats).forEach(([key, value]) => {
    if (value.count > maxCount) {
      maxCount = value.count;
      dominant = key;
    }
  });

  return (
    <div className="card emotion-panel">
      <div className="card-header">
        <h3>Emotion Distribution</h3>
        <span className="badge">{predictions.length} students</span>
      </div>
      <div className="card-body">
        <div className="dominant-emotion-display">
          <span className="dominant-label">Dominant Mood</span>
          <div
            className="dominant-value"
            style={{ color: EMOTIONS.find((e) => e.key === dominant)?.color }}
          >
            {dominant}
          </div>
        </div>

        <div className="emotion-bars">
          {EMOTIONS.map((emotion) => (
            <div key={emotion.key} className="emotion-bar-row">
              <div className="emotion-info">
                <span
                  className="emotion-dot"
                  style={{ background: emotion.color }}
                />
                <span className="emotion-label">{emotion.label}</span>
              </div>
              <div className="emotion-bar-container">
                <div
                  className="emotion-bar-fill"
                  style={{
                    width: `${getEmotionPercentage(emotion.key)}%`,
                    background: emotion.color,
                  }}
                />
              </div>
              <div className="emotion-stats">
                <span className="emotion-count">
                  {getEmotionCount(emotion.key)}
                </span>
                <span className="emotion-percent">
                  {getEmotionPercentage(emotion.key)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

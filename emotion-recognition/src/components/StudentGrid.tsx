import React from "react";
import { User } from "lucide-react";
import "../styles/components.css";

interface StudentGridProps {
  predictions: { box: number[]; emotion_label: string; score: number }[];
}

const EMOTION_COLORS: Record<string, string> = {
  angry: "var(--emotion-angry)",
  disgust: "var(--emotion-disgust)",
  fear: "var(--emotion-fear)",
  happy: "var(--emotion-happy)",
  sad: "var(--emotion-sad)",
  surprise: "var(--emotion-surprise)",
  neutral: "var(--emotion-neutral)",
};

export default function StudentGrid({ predictions }: StudentGridProps) {
  if (!predictions || predictions.length === 0) {
    return (
      <div className="card student-grid">
        <div className="card-header">
          <h3>Detected Students</h3>
        </div>
        <div className="card-body empty-state">
          <User size={32} />
          <p>No students detected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card student-grid">
      <div className="card-header">
        <h3>Detected Students</h3>
        <span className="badge">{predictions.length} active</span>
      </div>
      <div className="card-body">
        <div className="students-list">
          {predictions.map((pred, index) => (
            <div key={index} className="student-item">
              <div
                className="student-avatar"
                style={{
                  borderColor: EMOTION_COLORS[pred.emotion_label],
                }}
              >
                <User size={20} />
              </div>
              <div className="student-info">
                <span className="student-name">Student {index + 1}</span>
                <span
                  className="student-emotion"
                  style={{ color: EMOTION_COLORS[pred.emotion_label] }}
                >
                  {pred.emotion_label}
                </span>
              </div>
              <div className="student-score">
                {Math.round(pred.score * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

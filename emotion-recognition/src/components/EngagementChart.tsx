import React from "react";
import { TrendingUp } from "lucide-react";
import "../styles/components.css";

interface EngagementChartProps {
  emotionHistory: { time: Date; engagement: number; students: number }[];
}

export default function EngagementChart({
  emotionHistory,
}: EngagementChartProps) {
  const data = emotionHistory.slice(-30);
  const maxEngagement = 100;

  const getPath = () => {
    if (data.length < 2) return "";
    const width = 100;
    const height = 100;
    const points = data.map((d, i) => ({
      x: (i / (data.length - 1)) * width,
      y: height - (d.engagement / maxEngagement) * height,
    }));

    return points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(" ");
  };

  const getAreaPath = () => {
    if (data.length < 2) return "";
    const width = 100;
    const height = 100;
    const points = data.map((d, i) => ({
      x: (i / (data.length - 1)) * width,
      y: height - (d.engagement / maxEngagement) * height,
    }));

    const linePath = points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(" ");
    return `${linePath} L ${points[points.length - 1].x} ${height} L ${
      points[0].x
    } ${height} Z`;
  };

  const currentEngagement =
    data.length > 0 ? data[data.length - 1].engagement : 0;
  const avgEngagement =
    data.length > 0
      ? Math.round(data.reduce((a, b) => a + b.engagement, 0) / data.length)
      : 0;
  const currentStudents =
    data.length > 0 ? data[data.length - 1]?.students || 0 : 0;

  return (
    <div className="card engagement-chart">
      <div className="card-header">
        <h3>Engagement Over Time</h3>
        <div className="chart-legend">
          <TrendingUp size={16} />
          <span>Last 30 readings</span>
        </div>
      </div>
      <div className="card-body">
        <div className="engagement-stats">
          <div className="engagement-stat">
            <span className="stat-value">{currentEngagement}%</span>
            <span className="stat-label">Current</span>
          </div>
          <div className="engagement-stat">
            <span className="stat-value">{avgEngagement}%</span>
            <span className="stat-label">Average</span>
          </div>
          <div className="engagement-stat">
            <span className="stat-value">{currentStudents}</span>
            <span className="stat-label">Students</span>
          </div>
        </div>

        <div className="chart-container">
          {data.length >= 2 ? (
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="chart-svg"
            >
              <defs>
                <linearGradient
                  id="engagementGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity="0.3"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              <path d={getAreaPath()} fill="url(#engagementGradient)" />
              <path
                d={getPath()}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          ) : (
            <div className="chart-placeholder">
              <p>Collecting data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

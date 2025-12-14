"use client";

import { AlertTriangle, AlertCircle, Bell, X, BellOff } from "lucide-react";
import React, { useState } from "react";
import type { Alert } from "../../lib/types";
import "../styles/components.css";

interface AlertsPanelProps {
  alerts: Alert[];
  alertsEnabled: boolean;
}

export default function AlertsPanel({
  alerts,
  alertsEnabled,
}: AlertsPanelProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visibleAlerts = alerts.filter((a) => !dismissed.includes(a.id));

  const dismissAlert = (id: string) => {
    setDismissed((prev) => [...prev, id]);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="card alerts-panel">
      <div className="card-header">
        <h3>Alerts</h3>
        {!alertsEnabled ? (
          <span className="badge">
            <BellOff size={12} style={{ marginRight: "4px" }} />
            Disabled
          </span>
        ) : visibleAlerts.length > 0 ? (
          <span className="badge badge-warning">{visibleAlerts.length}</span>
        ) : null}
      </div>
      <div className="card-body">
        {!alertsEnabled ? (
          <div className="empty-state">
            <BellOff size={32} />
            <p>Alerts are disabled</p>
            <span className="empty-subtext">
              Enable alerts in Settings to receive notifications
            </span>
          </div>
        ) : visibleAlerts.length === 0 ? (
          <div className="empty-state">
            <Bell size={32} />
            <p>No alerts at this time</p>
            <span className="empty-subtext">
              Alerts will appear when concerning patterns are detected
            </span>
          </div>
        ) : (
          <div className="alerts-list">
            {visibleAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className={`alert-item ${alert.type}`}>
                <div className="alert-icon">
                  {alert.type === "warning" ? (
                    <AlertTriangle size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                </div>
                <div className="alert-content">
                  <p className="alert-message">{alert.message}</p>
                  <span className="alert-time">{formatTime(alert.time)}</span>
                </div>
                <button
                  className="alert-dismiss"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

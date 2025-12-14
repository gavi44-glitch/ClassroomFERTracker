"use client";

import { Camera, Bell, Shield, Save, RotateCcw, Check } from "lucide-react";
import React, { useState, useEffect } from "react";
import type { AppSettings } from "../../lib/types";
import { defaultSettings } from "../../lib/store";
import "../styles/components.css";

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export default function Settings({
  settings,
  onUpdateSettings,
}: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    const changed = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasChanges(changed);
  }, [localSettings, settings]);

  const updateSetting = (key: keyof AppSettings, value: number | boolean) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setLocalSettings(defaultSettings);
    setSaved(false);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p>Configure monitoring preferences and alert thresholds</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={handleReset} className="btn btn-secondary">
            <RotateCcw size={18} />
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges && !saved}
            className={`btn ${
              saved
                ? "btn-primary"
                : hasChanges
                ? "btn-primary"
                : "btn-secondary"
            }`}
            style={{
              opacity: !hasChanges && !saved ? 0.5 : 1,
              cursor: !hasChanges && !saved ? "not-allowed" : "pointer",
              background: saved ? "var(--success)" : undefined,
            }}
          >
            {saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {hasChanges && (
        <div
          style={{
            marginBottom: "16px",
            padding: "8px 16px",
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "var(--radius)",
            color: "#f59e0b",
            fontSize: "14px",
          }}
        >
          You have unsaved changes. Click "Save Changes" to apply them.
        </div>
      )}

      <div className="settings-grid">
        {/* Camera Settings */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <Camera size={20} />
            <h3>Camera Settings</h3>
          </div>
          <div className="settings-card-body">
            <div className="setting-row">
              <div>
                <label>Detection Confidence</label>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--muted-foreground)",
                    display: "block",
                  }}
                >
                  Minimum confidence to detect a face
                </span>
              </div>
              <div className="setting-control">
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={localSettings.confidenceThreshold}
                  onChange={(e) =>
                    updateSetting(
                      "confidenceThreshold",
                      Number.parseFloat(e.target.value)
                    )
                  }
                />
                <span>
                  {Math.round(localSettings.confidenceThreshold * 100)}%
                </span>
              </div>
            </div>
            <div className="setting-row">
              <div>
                <label>Frame Rate</label>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--muted-foreground)",
                    display: "block",
                  }}
                >
                  Frames sent per second (higher = more CPU)
                </span>
              </div>
              <div className="setting-control">
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={localSettings.frameRate}
                  onChange={(e) =>
                    updateSetting("frameRate", Number.parseInt(e.target.value))
                  }
                />
                <span>{localSettings.frameRate} FPS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <Bell size={20} />
            <h3>Alert Settings</h3>
          </div>
          <div className="settings-card-body">
            <div className="setting-row">
              <div>
                <label>Enable Alerts</label>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--muted-foreground)",
                    display: "block",
                  }}
                >
                  Show notifications for concerning emotions
                </span>
              </div>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="alerts-enabled"
                  checked={localSettings.alertsEnabled}
                  onChange={(e) =>
                    updateSetting("alertsEnabled", e.target.checked)
                  }
                />
                <label htmlFor="alerts-enabled" className="toggle-label" />
              </div>
            </div>
            <div className="setting-row">
              <div>
                <label>Sadness Threshold</label>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--muted-foreground)",
                    display: "block",
                  }}
                >
                  Alert when sadness confidence exceeds
                </span>
              </div>
              <div className="setting-control">
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={localSettings.sadnessThreshold}
                  onChange={(e) =>
                    updateSetting(
                      "sadnessThreshold",
                      Number.parseInt(e.target.value)
                    )
                  }
                  disabled={!localSettings.alertsEnabled}
                />
                <span
                  style={{ opacity: localSettings.alertsEnabled ? 1 : 0.5 }}
                >
                  {localSettings.sadnessThreshold}%
                </span>
              </div>
            </div>
            <div className="setting-row">
              <div>
                <label>Anxiety Threshold</label>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--muted-foreground)",
                    display: "block",
                  }}
                >
                  Alert when fear/anxiety confidence exceeds
                </span>
              </div>
              <div className="setting-control">
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={localSettings.anxietyThreshold}
                  onChange={(e) =>
                    updateSetting(
                      "anxietyThreshold",
                      Number.parseInt(e.target.value)
                    )
                  }
                  disabled={!localSettings.alertsEnabled}
                />
                <span
                  style={{ opacity: localSettings.alertsEnabled ? 1 : 0.5 }}
                >
                  {localSettings.anxietyThreshold}%
                </span>
              </div>
            </div>
            <div className="setting-row">
              <div>
                <label>Frustration Threshold</label>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--muted-foreground)",
                    display: "block",
                  }}
                >
                  Alert when anger confidence exceeds
                </span>
              </div>
              <div className="setting-control">
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={localSettings.frustrationThreshold}
                  onChange={(e) =>
                    updateSetting(
                      "frustrationThreshold",
                      Number.parseInt(e.target.value)
                    )
                  }
                  disabled={!localSettings.alertsEnabled}
                />
                <span
                  style={{ opacity: localSettings.alertsEnabled ? 1 : 0.5 }}
                >
                  {localSettings.frustrationThreshold}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Data */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <Shield size={20} />
            <h3>Privacy & Data</h3>
          </div>
          <div className="settings-card-body">
            <div className="setting-row">
              <div>
                <label>Save Session History</label>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--muted-foreground)",
                    display: "block",
                  }}
                >
                  Store session data in your browser
                </span>
              </div>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="save-history"
                  checked={localSettings.saveHistory}
                  onChange={(e) =>
                    updateSetting("saveHistory", e.target.checked)
                  }
                />
                <label htmlFor="save-history" className="toggle-label" />
              </div>
            </div>
            <p className="setting-note">
              <strong>Privacy Notice:</strong> All video processing happens
              locally on your computer. No video, images, or personal data is
              stored or transmitted to external servers. Session history is
              stored only in your browser's local storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

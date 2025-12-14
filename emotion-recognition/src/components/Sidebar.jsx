"use client";

import React from "react";

import {
  LayoutDashboard,
  History,
  Settings,
  GraduationCap,
  Users,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "history", label: "Session History", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
];

const stats = [
  { label: "Total Sessions", value: "24" },
  { label: "Avg. Engagement", value: "78%" },
  { label: "Students Tracked", value: "156" },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <GraduationCap size={28} />
          <div className="logo-text">
            <span className="logo-title">ClassMood</span>
            <span className="logo-subtitle">Emotion Analytics</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-label">Menu</span>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            <Users size={16} />
          </div>
          <div className="user-details">
            <span className="user-name">Instructor</span>
            <span className="user-role">Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

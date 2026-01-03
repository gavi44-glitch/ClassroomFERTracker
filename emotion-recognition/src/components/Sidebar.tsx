"use client";

import React from "react";
import {
  LayoutDashboard,
  History,
  Settings,
  GraduationCap,
  Users,
} from "lucide-react";
import "../styles/components.css";

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

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
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

        <div className="nav-section">
          <span className="nav-section-label">Quick Stats</span>
          <div className="quick-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
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

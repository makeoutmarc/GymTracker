import { useState } from "react";
import { AppProvider } from "./AppContext";
import PlanScreen from "./screens/PlanScreen";
import VerlaufScreen from "./screens/VerlaufScreen";
import HealthScreen from "./screens/HealthScreen";
import WidgetsScreen from "./screens/WidgetsScreen";

type Tab = "plan" | "verlauf" | "health" | "widgets";

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>("verlauf");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--background)",
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Status Bar */}
      <div style={{ padding: "14px 24px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <SignalIcon /><WifiIcon /><BatteryIcon />
        </div>
      </div>

      {/* Screen */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {activeTab === "plan" && <PlanScreen />}
        {activeTab === "verlauf" && <VerlaufScreen />}
        {activeTab === "health" && <HealthScreen />}
        {activeTab === "widgets" && <WidgetsScreen />}
      </div>

      {/* Tab Bar */}
      <div
        style={{
          background: "rgba(13,13,20,0.92)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border)",
          padding: "12px 8px 28px",
          display: "flex",
          justifyContent: "space-around",
          flexShrink: 0,
        }}
      >
        {(
          [
            { id: "plan", label: "Plan", icon: (a: boolean) => <PlanIcon active={a} /> },
            { id: "verlauf", label: "Verlauf", icon: (a: boolean) => <TrainingIcon active={a} /> },
            { id: "health", label: "Health", icon: (a: boolean) => <HealthIcon active={a} /> },
            { id: "widgets", label: "Widgets", icon: (a: boolean) => <WidgetIcon active={a} /> },
          ] as const
        ).map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "6px 16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: active ? "var(--primary)" : "var(--muted-foreground)",
                transition: "color 0.15s",
                minWidth: 64,
              }}
            >
              {tab.icon(active)}
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.3 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlanIcon({ active }: { active: boolean }) {
  const c = active ? "#ff3d3d" : "#6b6b8a";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="3" stroke={c} strokeWidth="1.8" fill={active ? "rgba(255,61,61,0.12)" : "none"} />
      <path d="M8 2v4M16 2v4M3 10h18" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <rect x="7" y="14" width="3" height="3" rx="0.5" fill={c} />
      <rect x="14" y="14" width="3" height="3" rx="0.5" fill={c} opacity={active ? 1 : 0.5} />
    </svg>
  );
}

function TrainingIcon({ active }: { active: boolean }) {
  const c = active ? "#ff3d3d" : "#6b6b8a";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M6.5 8.5h11M6.5 15.5h11" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <circle cx="4" cy="8.5" r="2" fill={c} />
      <circle cx="20" cy="8.5" r="2" fill={c} />
      <circle cx="4" cy="15.5" r="2" fill={c} />
      <circle cx="20" cy="15.5" r="2" fill={c} />
      <path d="M12 5v14" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HealthIcon({ active }: { active: boolean }) {
  const c = active ? "#ff3d3d" : "#6b6b8a";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 21C12 21 3 15 3 9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 12-9 12z" fill={active ? "rgba(255,61,61,0.18)" : "none"} stroke={c} strokeWidth="1.8" />
      <path d="M9 12h6M12 9v6" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WidgetIcon({ active }: { active: boolean }) {
  const c = active ? "#ff3d3d" : "#6b6b8a";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="2" fill={active ? "rgba(255,61,61,0.18)" : "none"} stroke={c} strokeWidth="1.8" />
      <rect x="13" y="3" width="8" height="8" rx="2" fill={active ? "rgba(255,61,61,0.18)" : "none"} stroke={c} strokeWidth="1.8" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill={active ? "rgba(255,61,61,0.18)" : "none"} stroke={c} strokeWidth="1.8" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill={active ? "rgba(255,61,61,0.12)" : "none"} stroke={c} strokeWidth="1.8" strokeDasharray={active ? "0" : "3 2"} />
    </svg>
  );
}

function SignalIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="#f0f0f5">
      <rect x="0" y="8" width="3" height="4" rx="1" />
      <rect x="4.5" y="5" width="3" height="7" rx="1" />
      <rect x="9" y="2" width="3" height="10" rx="1" />
      <rect x="13.5" y="0" width="3" height="12" rx="1" opacity="0.3" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="#f0f0f5">
      <path d="M8 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
      <path d="M4.5 7a5 5 0 0 1 7 0" strokeWidth="1.5" stroke="#f0f0f5" fill="none" strokeLinecap="round" />
      <path d="M2 4.5a8 8 0 0 1 12 0" strokeWidth="1.5" stroke="#f0f0f5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
      <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#f0f0f5" strokeOpacity="0.35" />
      <rect x="2" y="2" width="16" height="8" rx="2" fill="#f0f0f5" />
      <path d="M23 4v4a2 2 0 0 0 0-4z" fill="#f0f0f5" fillOpacity="0.4" />
    </svg>
  );
}

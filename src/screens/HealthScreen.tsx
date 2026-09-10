import { useState } from "react";

const WEEKS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const WORKOUT_DAYS = [true, true, false, true, true, false, false];

const METRICS = [
  { label: "Herzfrequenz", value: "72", unit: "BPM", icon: "❤️", color: "#ff3d3d", change: "-3 vs. Vorwoche", trend: "down-good" },
  { label: "Aktive Kalorien", value: "486", unit: "kcal", icon: "🔥", color: "#ff6b35", change: "+12% vs. Vorwoche", trend: "up-good" },
  { label: "Schritte", value: "8.432", unit: "Schritte", icon: "👟", color: "#60a5fa", change: "+2.1k vs. gestern", trend: "up-good" },
  { label: "Schlaf", value: "7:24", unit: "h", icon: "🌙", color: "#c084fc", change: "-18 min vs. Vorwoche", trend: "down-bad" },
  { label: "Gewicht", value: "82.4", unit: "kg", icon: "⚖️", color: "#4ade80", change: "-0.6 kg letzte Woche", trend: "down-good" },
  { label: "Erholung", value: "88", unit: "%", icon: "⚡", color: "#fbbf24", change: "+5% vs. gestern", trend: "up-good" },
];

const WEEKLY_VOLUME = [12400, 0, 18600, 14200, 0, 0, 0];
const maxVol = Math.max(...WEEKLY_VOLUME);

export default function HealthScreen() {
  const [connected] = useState(true);

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "8px 20px 24px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>Apple Health</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: connected ? "#4ade80" : "#ff3d3d" }} />
          <span style={{ color: connected ? "#4ade80" : "#ff3d3d", fontSize: 13, fontWeight: 600 }}>
            {connected ? "Verbunden" : "Nicht verbunden"}
          </span>
        </div>
      </div>

      {/* Weekly overview */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 14 }}>
          Diese Woche
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 6, height: 80 }}>
          {WEEKS.map((day, i) => {
            const vol = WEEKLY_VOLUME[i];
            const height = maxVol > 0 ? (vol / maxVol) * 64 : 0;
            return (
              <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                {vol > 0 && (
                  <div style={{ fontSize: 8, fontFamily: "DM Mono, monospace", color: "var(--muted-foreground)", fontWeight: 600 }}>
                    {Math.round(vol / 1000)}k
                  </div>
                )}
                <div
                  style={{
                    width: "100%",
                    height: height || 4,
                    borderRadius: 4,
                    background: WORKOUT_DAYS[i] && vol > 0
                      ? "linear-gradient(180deg, #ff3d3d, #ff6b35)"
                      : "var(--muted)",
                    transition: "height 0.3s",
                    alignSelf: "flex-end",
                    opacity: vol === 0 ? 0.3 : 1,
                  }}
                />
                <span style={{ fontSize: 11, color: i === 2 ? "var(--primary)" : "var(--muted-foreground)", fontWeight: i === 2 ? 700 : 500 }}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>Trainings</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "DM Mono, monospace" }}>4</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>Gesamtvolumen</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "DM Mono, monospace" }}>45.200 kg</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>Ø Dauer</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "DM Mono, monospace" }}>68 min</div>
          </div>
        </div>
      </div>

      {/* Health Metrics Grid */}
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>
        Gesundheitsdaten
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {METRICS.map((m) => (
          <div
            key={m.label}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "16px",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{m.icon}</div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>
              {m.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 24, fontWeight: 800, fontFamily: "DM Mono, monospace", color: m.color }}>{m.value}</span>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 500 }}>{m.unit}</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 6, fontWeight: 500 }}>{m.change}</div>
          </div>
        ))}
      </div>

      {/* Personal Records */}
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>
        Persönliche Rekorde
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { exercise: "Bankdrücken", pr: "95 kg", date: "12. Aug 2026", icon: "🏋️" },
          { exercise: "Kniebeugen", pr: "120 kg", date: "3. Sep 2026", icon: "🦵" },
          { exercise: "Kreuzheben", pr: "140 kg", date: "28. Aug 2026", icon: "💪" },
        ].map((rec) => (
          <div
            key={rec.exercise}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>{rec.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{rec.exercise}</div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{rec.date}</div>
              </div>
            </div>
            <div style={{ fontFamily: "DM Mono, monospace", fontWeight: 800, fontSize: 18, color: "var(--primary)" }}>
              {rec.pr}
            </div>
          </div>
        ))}
      </div>

      {/* Connect Banner */}
      <div
        style={{
          marginTop: 16,
          background: "linear-gradient(135deg, rgba(255,61,61,0.12), rgba(255,107,53,0.08))",
          border: "1px solid rgba(255,61,61,0.2)",
          borderRadius: 16,
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ fontSize: 28 }}>❤️</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Health Sync aktiv</div>
          <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>
            Daten werden automatisch mit Apple Health synchronisiert.
          </div>
        </div>
      </div>
    </div>
  );
}

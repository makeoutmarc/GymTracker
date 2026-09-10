import { useState } from "react";
import { useApp } from "../AppContext";
import { SECTION_COLORS } from "../utils";
import type { CustomWidget } from "../types";

type WidgetSize = "small" | "medium" | "large";

const CONTENT_OPTIONS: { id: string; label: string; desc: string }[] = [
  { id: "today", label: "Heutiges Training", desc: "Trainingstyp & nächste Übungen" },
  { id: "streak", label: "Streak", desc: "Aktuelle Trainingsserie" },
  { id: "week", label: "Wochenfortschritt", desc: "Trainierte Tage der Woche" },
  { id: "prs", label: "Persönliche Rekorde", desc: "Deine besten Lifts" },
  { id: "volume", label: "Volumen Chart", desc: "Trainingsvolumen als Balken" },
  { id: "next", label: "Nächste Trainings", desc: "Kommende Trainingstage" },
];

const SIZE_LABELS: Record<WidgetSize, string> = {
  small: "Klein",
  medium: "Mittel",
  large: "Groß",
};

export default function WidgetsScreen() {
  const { widgets, setWidgets } = useApp();
  const [editing, setEditing] = useState<CustomWidget | null>(null);

  if (editing) {
    return (
      <WidgetEditor
        widget={editing}
        onBack={() => setEditing(null)}
        onSave={(w) => {
          setWidgets((prev) => {
            const exists = prev.some((x) => x.id === w.id);
            return exists ? prev.map((x) => (x.id === w.id ? w : x)) : [...prev, w];
          });
          setEditing(null);
        }}
        onDelete={(id) => {
          setWidgets((prev) => prev.filter((x) => x.id !== id));
          setEditing(null);
        }}
      />
    );
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "8px 20px 24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>Widgets</h1>
      <p style={{ color: "var(--muted-foreground)", fontSize: 14, margin: "0 0 20px" }}>
        Erstelle Widgets für deinen Home-Bildschirm
      </p>

      {/* Home screen preview */}
      <HomeScreenPreview widgets={widgets} onTap={setEditing} />

      {/* Widget list */}
      {widgets.length > 0 && (
        <>
          <div style={sectionLabel}>Meine Widgets</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {widgets.map((w) => (
              <button
                key={w.id}
                onClick={() => setEditing(w)}
                style={{
                  background: "var(--card)",
                  border: `1px solid ${w.accentColor}30`,
                  borderRadius: 16,
                  padding: "14px 16px",
                  cursor: "pointer",
                  color: "var(--foreground)",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${w.accentColor}20`,
                    border: `1px solid ${w.accentColor}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 20,
                  }}
                >
                  {w.content.includes("streak") ? "🔥" : w.content.includes("prs") ? "🏆" : w.content.includes("volume") ? "📊" : "💪"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{w.label}</div>
                  <div style={{ color: "var(--muted-foreground)", fontSize: 12, marginTop: 2 }}>
                    {SIZE_LABELS[w.size]} · {w.content.length} Inhalt{w.content.length !== 1 ? "e" : ""}
                  </div>
                </div>
                <div
                  style={{ width: 12, height: 12, borderRadius: "50%", background: w.accentColor, flexShrink: 0 }}
                />
                <span style={{ color: "var(--muted-foreground)" }}>›</span>
              </button>
            ))}
          </div>
        </>
      )}

      <button
        onClick={() =>
          setEditing({
            id: `w-${Date.now()}`,
            label: "",
            size: "medium",
            accentColor: SECTION_COLORS[0],
            content: ["today"],
          })
        }
        style={{
          width: "100%",
          background: "var(--secondary)",
          border: "1.5px dashed var(--border)",
          borderRadius: 16,
          padding: "18px",
          color: "var(--primary)",
          fontWeight: 700,
          fontSize: 16,
          cursor: "pointer",
          fontFamily: "Outfit, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 20 }}>+</span> Neues Widget erstellen
      </button>
    </div>
  );
}

// ─── Home Screen Preview ──────────────────────────────────────────────────────

function HomeScreenPreview({ widgets, onTap }: { widgets: CustomWidget[]; onTap: (w: CustomWidget) => void }) {
  return (
    <div
      style={{
        background: "linear-gradient(145deg, #0d0d2b, #0a0a15)",
        borderRadius: 24,
        padding: 16,
        marginBottom: 24,
        border: "1px solid var(--border)",
        minHeight: 160,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Starfield */}
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{ position: "absolute", width: 2, height: 2, borderRadius: "50%", background: "rgba(255,255,255,0.25)", top: `${(i * 37) % 90}%`, left: `${(i * 61) % 95}%` }} />
      ))}

      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>
        Home-Bildschirm Vorschau
      </div>

      {widgets.length === 0 ? (
        <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
          Erstelle dein erstes Widget ↓
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, position: "relative" }}>
          {widgets.map((w) => (
            <div key={w.id} onClick={() => onTap(w)} style={{ cursor: "pointer" }}>
              <WidgetPreviewCard widget={w} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Widget Preview Card ──────────────────────────────────────────────────────

export function WidgetPreviewCard({ widget }: { widget: CustomWidget }) {
  const sizeMap: Record<WidgetSize, { w: string; h: number }> = {
    small: { w: "calc(50% - 5px)", h: 100 },
    medium: { w: "100%", h: 100 },
    large: { w: "100%", h: 170 },
  };
  const sz = sizeMap[widget.size];
  const c = widget.accentColor;

  return (
    <div
      style={{
        width: sz.w,
        height: sz.h,
        background: `linear-gradient(135deg, ${c}22, ${c}08)`,
        backdropFilter: "blur(10px)",
        borderRadius: 18,
        padding: 14,
        border: `1px solid ${c}30`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Glow */}
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${c}20`, pointerEvents: "none" }} />

      {/* Label */}
      <div style={{ fontSize: 10, fontWeight: 800, color: c, textTransform: "uppercase", letterSpacing: 0.6 }}>
        {widget.label || "Widget"}
      </div>

      {/* Content preview */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {widget.content.includes("streak") && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: widget.size === "large" ? 36 : 28, fontWeight: 900, color: c, fontFamily: "DM Mono, monospace", lineHeight: 1 }}>14</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Tage Streak 🔥</span>
          </div>
        )}
        {widget.content.includes("today") && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>Push Day</div>
            {widget.size !== "small" && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Bankdrücken · Schulterdrücken</div>
            )}
          </div>
        )}
        {widget.content.includes("week") && (
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end", marginTop: 4 }}>
            {[true, true, false, true, false, false, false].map((done, i) => (
              <div key={i} style={{ flex: 1, height: done ? (widget.size === "small" ? 20 : 30) : 6, borderRadius: 3, background: done ? c : "rgba(255,255,255,0.1)" }} />
            ))}
          </div>
        )}
        {widget.content.includes("prs") && widget.size !== "small" && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Bankdrücken</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: c, fontFamily: "DM Mono, monospace" }}>95 kg</span>
          </div>
        )}
        {widget.content.includes("volume") && widget.size === "large" && (
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 40, marginTop: 4 }}>
            {[0.7, 0, 1, 0.8, 0, 0, 0].map((v, i) => (
              <div key={i} style={{ flex: 1, height: `${v * 100}%` || 6, borderRadius: 3, background: v ? `linear-gradient(180deg,${c},${c}88)` : "rgba(255,255,255,0.08)" }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Widget Editor ────────────────────────────────────────────────────────────

function WidgetEditor({
  widget,
  onBack,
  onSave,
  onDelete,
}: {
  widget: CustomWidget;
  onBack: () => void;
  onSave: (w: CustomWidget) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<CustomWidget>({ ...widget });
  const isNew = !widget.label;

  const toggleContent = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      content: prev.content.includes(id)
        ? prev.content.filter((c) => c !== id)
        : [...prev.content, id],
    }));
  };

  const canSave = draft.label.trim().length > 0 && draft.content.length > 0;

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "8px 20px 24px" }}>
      <button onClick={onBack} style={backBtnStyle}>‹ Widgets</button>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 20px", letterSpacing: -0.5 }}>
        {isNew ? "Neues Widget" : "Widget bearbeiten"}
      </h1>

      {/* Live preview */}
      <div style={sectionLabel}>Live Vorschau</div>
      <div
        style={{
          background: "linear-gradient(145deg, #0d0d2b, #0a0a15)",
          borderRadius: 20,
          padding: 16,
          marginBottom: 24,
          border: "1px solid var(--border)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 140,
        }}
      >
        <WidgetPreviewCard widget={draft} />
      </div>

      {/* Name */}
      <div style={sectionLabel}>Name</div>
      <input
        value={draft.label}
        onChange={(e) => setDraft((prev) => ({ ...prev, label: e.target.value }))}
        placeholder="Widget-Name…"
        style={{ ...inputStyle, marginBottom: 20 }}
      />

      {/* Size */}
      <div style={sectionLabel}>Größe</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {(["small", "medium", "large"] as WidgetSize[]).map((size) => (
          <button
            key={size}
            onClick={() => setDraft((prev) => ({ ...prev, size }))}
            style={{
              background: draft.size === size ? `${draft.accentColor}20` : "var(--secondary)",
              border: `1.5px solid ${draft.size === size ? draft.accentColor : "transparent"}`,
              borderRadius: 14,
              padding: "14px 8px",
              cursor: "pointer",
              fontFamily: "Outfit, sans-serif",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s",
            }}
          >
            {/* Visual size indicator */}
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 32 }}>
              {size === "small" ? (
                <div style={{ width: 24, height: 24, borderRadius: 6, background: draft.size === size ? draft.accentColor : "var(--muted)" }} />
              ) : size === "medium" ? (
                <div style={{ width: 44, height: 24, borderRadius: 6, background: draft.size === size ? draft.accentColor : "var(--muted)" }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 6, background: draft.size === size ? draft.accentColor : "var(--muted)" }} />
              )}
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: draft.size === size ? draft.accentColor : "var(--muted-foreground)" }}>
              {SIZE_LABELS[size]}
            </span>
          </button>
        ))}
      </div>

      {/* Color */}
      <div style={sectionLabel}>Farbe</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {SECTION_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setDraft((prev) => ({ ...prev, accentColor: c }))}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: c,
              border: draft.accentColor === c ? "3px solid #fff" : "3px solid transparent",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.15s",
              boxShadow: draft.accentColor === c ? `0 0 0 2px ${c}` : "none",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={sectionLabel}>Inhalte</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {CONTENT_OPTIONS.map((opt) => {
          const active = draft.content.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggleContent(opt.id)}
              style={{
                background: active ? `${draft.accentColor}12` : "var(--secondary)",
                border: `1.5px solid ${active ? draft.accentColor + "60" : "transparent"}`,
                borderRadius: 14,
                padding: "12px 16px",
                cursor: "pointer",
                color: "var(--foreground)",
                textAlign: "left",
                fontFamily: "Outfit, sans-serif",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "all 0.15s",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: active ? draft.accentColor : "var(--foreground)" }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{opt.desc}</div>
              </div>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: active ? draft.accentColor : "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: active ? "#fff" : "transparent",
                  fontSize: 13,
                  fontWeight: 800,
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
              >
                ✓
              </div>
            </button>
          );
        })}
      </div>

      {/* Save */}
      <button
        onClick={() => canSave && onSave(draft)}
        style={{
          ...btnPrimaryStyle,
          background: draft.accentColor,
          width: "100%",
          opacity: canSave ? 1 : 0.4,
          cursor: canSave ? "pointer" : "default",
          marginBottom: 12,
        }}
      >
        Widget speichern
      </button>

      {/* Delete */}
      {!isNew && (
        <button
          onClick={() => onDelete(widget.id)}
          style={{
            width: "100%",
            background: "rgba(255,61,61,0.1)",
            border: "1px solid rgba(255,61,61,0.25)",
            borderRadius: 14,
            padding: "13px",
            color: "#ff3d3d",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            fontFamily: "Outfit, sans-serif",
          }}
        >
          Widget löschen
        </button>
      )}
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--muted-foreground)",
  letterSpacing: 0.6,
  textTransform: "uppercase",
  marginBottom: 10,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--secondary)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "13px 14px",
  color: "var(--foreground)",
  fontSize: 15,
  fontFamily: "Outfit, sans-serif",
  outline: "none",
};

const btnPrimaryStyle: React.CSSProperties = {
  background: "var(--primary)",
  color: "#fff",
  border: "none",
  borderRadius: 14,
  padding: "15px",
  fontWeight: 800,
  fontSize: 16,
  cursor: "pointer",
  fontFamily: "Outfit, sans-serif",
};

const backBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--primary)",
  fontFamily: "Outfit, sans-serif",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  padding: "4px 0 16px",
  display: "block",
};

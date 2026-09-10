import { useState } from "react";
import { useApp } from "../AppContext";
import { SECTION_COLORS } from "../utils";
import type { Plan, Section } from "../types";

export default function PlanScreen() {
  const { plans, setPlans } = useApp();
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  if (editingPlan) {
    return (
      <PlanEditor
        plan={editingPlan}
        onBack={() => setEditingPlan(null)}
        onSave={(updated) => {
          setPlans((prev) => {
            const exists = prev.some((p) => p.id === updated.id);
            return exists ? prev.map((p) => (p.id === updated.id ? updated : p)) : [...prev, updated];
          });
          setEditingPlan(null);
        }}
      />
    );
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "8px 20px 24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>
        Trainingspläne
      </h1>
      <p style={{ color: "var(--muted-foreground)", fontSize: 14, margin: "0 0 24px" }}>
        Erstelle und verwalte deine Pläne
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setEditingPlan(plan)}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "18px 20px",
                textAlign: "left",
                cursor: "pointer",
                color: "var(--foreground)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{plan.name}</div>
                  <div style={{ color: "var(--muted-foreground)", fontSize: 13, marginTop: 3 }}>
                    {plan.sections.length} Blöcke ·{" "}
                    {plan.sections.reduce((a, s) => a + s.exercises.length, 0)} Übungen
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {plan.sections.slice(0, 5).map((s) => (
                      <div
                        key={s.id}
                        style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }}
                      />
                    ))}
                  </div>
                  <span style={{ color: "var(--muted-foreground)", fontSize: 18 }}>›</span>
                </div>
              </div>
            </button>
            <div
              style={{
                borderTop: "1px solid var(--border)",
                padding: "10px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {plan.sections.map((s) => (
                  <span
                    key={s.id}
                    style={{
                      background: `${s.color}18`,
                      color: s.color,
                      borderRadius: 6,
                      padding: "2px 8px",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setPlans((prev) => prev.filter((p) => p.id !== plan.id))}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ff3d3d",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Outfit, sans-serif",
                  padding: "4px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  flexShrink: 0,
                }}
              >
                <TrashIcon /> Löschen
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          setEditingPlan({ id: `p-${Date.now()}`, name: "", sections: [] })
        }
        style={{
          marginTop: 16,
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
        <span style={{ fontSize: 20 }}>+</span> Neuen Plan erstellen
      </button>
    </div>
  );
}

function PlanEditor({
  plan,
  onBack,
  onSave,
}: {
  plan: Plan;
  onBack: () => void;
  onSave: (p: Plan) => void;
}) {
  const [name, setName] = useState(plan.name);
  const [sections, setSections] = useState<Section[]>(plan.sections);

  const addSection = () => {
    const color = SECTION_COLORS[sections.length % SECTION_COLORS.length];
    setSections((prev) => [
      ...prev,
      { id: `s-${Date.now()}`, name: "", color, exercises: [] },
    ]);
  };

  const updateSection = (id: string, upd: Partial<Section>) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...upd } : s)));

  const deleteSection = (id: string) =>
    setSections((prev) => prev.filter((s) => s.id !== id));

  const addExercise = (sectionId: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, exercises: [...s.exercises, { id: `e-${Date.now()}`, name: "" }] }
          : s
      )
    );

  const updateExercise = (sectionId: string, exId: string, exName: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, exercises: s.exercises.map((e) => (e.id === exId ? { ...e, name: exName } : e)) }
          : s
      )
    );

  const deleteExercise = (sectionId: string, exId: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, exercises: s.exercises.filter((e) => e.id !== exId) }
          : s
      )
    );

  const canSave = name.trim().length > 0;

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "8px 20px 24px" }}>
      <button onClick={onBack} style={backBtnStyle}>
        ‹ Pläne
      </button>

      {/* Plan name */}
      <div style={{ marginBottom: 24 }}>
        <div style={sectionLabelStyle}>Planname</div>
        <input
          autoFocus={!plan.name}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. PPL Split, 3er Split…"
          style={{ ...inputStyle, fontSize: 20, fontWeight: 700, padding: "14px 16px" }}
        />
      </div>

      {/* Sections */}
      {sections.length > 0 && (
        <div style={sectionLabelStyle}>Trainingsblöcke</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: sections.length > 0 ? 12 : 0 }}>
        {sections.map((section) => (
          <SectionEditor
            key={section.id}
            section={section}
            onUpdate={(upd) => updateSection(section.id, upd)}
            onDelete={() => deleteSection(section.id)}
            onAddExercise={() => addExercise(section.id)}
            onUpdateExercise={(exId, exName) => updateExercise(section.id, exId, exName)}
            onDeleteExercise={(exId) => deleteExercise(section.id, exId)}
          />
        ))}
      </div>

      <button
        onClick={addSection}
        style={{
          marginTop: 14,
          width: "100%",
          background: "transparent",
          border: "1.5px dashed var(--border)",
          borderRadius: 14,
          padding: "14px",
          color: "var(--primary)",
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
          fontFamily: "Outfit, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        + Überschrift hinzufügen
      </button>

      <button
        onClick={() => canSave && onSave({ ...plan, name: name.trim(), sections })}
        style={{
          ...btnPrimaryStyle,
          width: "100%",
          marginTop: 20,
          opacity: canSave ? 1 : 0.35,
          cursor: canSave ? "pointer" : "default",
        }}
      >
        Speichern
      </button>
    </div>
  );
}

function SectionEditor({
  section,
  onUpdate,
  onDelete,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
}: {
  section: Section;
  onUpdate: (u: Partial<Section>) => void;
  onDelete: () => void;
  onAddExercise: () => void;
  onUpdateExercise: (id: string, name: string) => void;
  onDeleteExercise: (id: string) => void;
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: `1px solid ${section.color}40`,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Section header */}
      <div
        style={{
          padding: "12px 16px",
          background: `${section.color}10`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Color dots */}
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          {SECTION_COLORS.slice(0, 6).map((c) => (
            <button
              key={c}
              onClick={() => onUpdate({ color: c })}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: c,
                border: section.color === c ? "2px solid #fff" : "2px solid transparent",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        <input
          value={section.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Überschrift (z.B. Brust, Rücken…)"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: section.color || "var(--foreground)",
            fontFamily: "Outfit, sans-serif",
            fontSize: 16,
            fontWeight: 700,
          }}
        />

        <button
          onClick={onDelete}
          style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer", fontSize: 20, padding: 0, lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      {/* Exercises */}
      <div style={{ padding: "6px 16px 12px" }}>
        {section.exercises.map((ex, i) => (
          <div
            key={ex.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 0",
              borderBottom:
                i < section.exercises.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: section.color,
                flexShrink: 0,
              }}
            />
            <input
              value={ex.name}
              onChange={(e) => onUpdateExercise(ex.id, e.target.value)}
              placeholder="Übung (z.B. Bankdrücken…)"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--foreground)",
                fontFamily: "Outfit, sans-serif",
                fontSize: 14,
                fontWeight: 500,
              }}
            />
            <button
              onClick={() => onDeleteExercise(ex.id)}
              style={{
                background: "none",
                border: "none",
                color: "var(--muted-foreground)",
                cursor: "pointer",
                fontSize: 16,
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        ))}

        <button
          onClick={onAddExercise}
          style={{
            marginTop: 8,
            background: "none",
            border: "none",
            color: section.color,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "Outfit, sans-serif",
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          + Übung hinzufügen
        </button>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1.75 3.5h10.5M5.25 3.5V2.333a.583.583 0 0 1 .583-.583h2.334a.583.583 0 0 1 .583.583V3.5M11.083 3.5l-.583 7.583a.583.583 0 0 1-.583.584H4.083a.583.583 0 0 1-.583-.584L2.917 3.5" stroke="#ff3d3d" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--muted-foreground)",
  letterSpacing: 0.6,
  textTransform: "uppercase",
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--secondary)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "12px 14px",
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
  letterSpacing: 0.2,
};

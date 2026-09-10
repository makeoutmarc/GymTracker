import { useState, useCallback } from "react";
import { useApp } from "../AppContext";
import {
  formatDate,
  todayStr,
  parseDate,
  dowEu,
  DAY_NAMES_SHORT,
  MONTH_NAMES,
  MONTH_NAMES_SHORT,
  SECTION_COLORS,
  getScheduledSection,
  getDaysInMonth,
  getFirstDowOfMonth,
} from "../utils";
import type { WorkoutLog, ExerciseLog, SetLog, Assignment } from "../types";

type ViewMode = "year" | "month" | "week" | "day";

export default function VerlaufScreen() {
  const { plans, workoutLogs, setWorkoutLogs, assignment, setAssignment } = useApp();
  const today = todayStr();

  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [navDate, setNavDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const logsByDate = Object.fromEntries(workoutLogs.map((l) => [l.date, l]));

  const navigate = (delta: number) => {
    setNavDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "year") d.setFullYear(d.getFullYear() + delta);
      else if (viewMode === "month") d.setMonth(d.getMonth() + delta);
      else if (viewMode === "week") d.setDate(d.getDate() + delta * 7);
      else d.setDate(d.getDate() + delta);
      return d;
    });
  };

  const navLabel = () => {
    if (viewMode === "year") return String(navDate.getFullYear());
    if (viewMode === "month")
      return `${MONTH_NAMES[navDate.getMonth()]} ${navDate.getFullYear()}`;
    if (viewMode === "week") {
      const mon = new Date(navDate);
      mon.setDate(mon.getDate() - dowEu(mon));
      const sun = new Date(mon);
      sun.setDate(sun.getDate() + 6);
      return `${mon.getDate()}. – ${sun.getDate()}. ${MONTH_NAMES_SHORT[sun.getMonth()]} ${sun.getFullYear()}`;
    }
    return `${DAY_NAMES_SHORT[dowEu(navDate)]}, ${navDate.getDate()}. ${MONTH_NAMES_SHORT[navDate.getMonth()]} ${navDate.getFullYear()}`;
  };

  const getInfoForDate = useCallback(
    (dateStr: string) => {
      const log = logsByDate[dateStr];
      const sched = !log && assignment ? getScheduledSection(dateStr, assignment, plans) : null;
      return { log, sched };
    },
    [logsByDate, assignment, plans]
  );

  const handleDayTap = (dateStr: string) => setSelectedDay(dateStr);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "8px 20px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Verlauf</h1>
          <button
            onClick={() => setShowAssignModal(true)}
            style={{
              background: "rgba(255,61,61,0.12)",
              border: "1px solid rgba(255,61,61,0.25)",
              borderRadius: 10,
              padding: "7px 14px",
              color: "#ff3d3d",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "Outfit, sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ⚡ Plan zuweisen
          </button>
        </div>

        {/* View selector */}
        <div style={{ display: "flex", background: "var(--secondary)", borderRadius: 12, padding: 3, marginBottom: 14 }}>
          {(["year", "month", "week", "day"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              style={{
                flex: 1,
                background: viewMode === v ? "var(--card)" : "transparent",
                border: "none",
                borderRadius: 10,
                padding: "8px 0",
                color: viewMode === v ? "var(--foreground)" : "var(--muted-foreground)",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "Outfit, sans-serif",
                transition: "all 0.15s",
              }}
            >
              {v === "year" ? "Jahr" : v === "month" ? "Monat" : v === "week" ? "Woche" : "Tag"}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <button onClick={() => navigate(-1)} style={navBtnStyle}>‹</button>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{navLabel()}</span>
          <button onClick={() => navigate(1)} style={navBtnStyle}>›</button>
        </div>
      </div>

      {/* Calendar content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>
        {viewMode === "year" && (
          <YearView year={navDate.getFullYear()} today={today} getInfo={getInfoForDate} onDayTap={handleDayTap} />
        )}
        {viewMode === "month" && (
          <MonthView year={navDate.getFullYear()} month={navDate.getMonth()} today={today} getInfo={getInfoForDate} onDayTap={handleDayTap} />
        )}
        {viewMode === "week" && (
          <WeekView navDate={navDate} today={today} getInfo={getInfoForDate} onDayTap={handleDayTap} />
        )}
        {viewMode === "day" && (
          <DayViewInline
            dateStr={formatDate(navDate)}
            today={today}
            getInfo={getInfoForDate}
            onDayTap={handleDayTap}
          />
        )}
      </div>

      {/* Day detail sheet */}
      {selectedDay && (
        <WorkoutDaySheet
          dateStr={selectedDay}
          today={today}
          log={logsByDate[selectedDay] ?? null}
          scheduled={assignment ? getScheduledSection(selectedDay, assignment, plans) : null}
          plans={plans}
          planId={assignment?.planId ?? null}
          onClose={() => setSelectedDay(null)}
          onSave={(log) => {
            setWorkoutLogs((prev) => {
              const exists = prev.some((l) => l.id === log.id);
              return exists ? prev.map((l) => (l.id === log.id ? log : l)) : [...prev, log];
            });
            setSelectedDay(null);
          }}
        />
      )}

      {/* Assign plan sheet */}
      {showAssignModal && (
        <AssignPlanSheet
          plans={plans}
          current={assignment}
          onClose={() => setShowAssignModal(false)}
          onSave={(a) => {
            setAssignment(a);
            setShowAssignModal(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Year View (heatmap) ──────────────────────────────────────────────────────

function YearView({
  year,
  today,
  getInfo,
  onDayTap,
}: {
  year: number;
  today: string;
  getInfo: (d: string) => { log: WorkoutLog | undefined; sched: { sectionColor: string } | null };
  onDayTap: (d: string) => void;
}) {
  // Build 52 weeks × 7 days grid
  const jan1 = new Date(year, 0, 1);
  // Start from Mon of first week containing Jan 1
  const startMon = new Date(jan1);
  startMon.setDate(jan1.getDate() - dowEu(jan1));

  const cells: { dateStr: string; inYear: boolean }[] = [];
  for (let w = 0; w < 53; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(startMon);
      date.setDate(startMon.getDate() + w * 7 + d);
      cells.push({
        dateStr: formatDate(date),
        inYear: date.getFullYear() === year,
      });
    }
  }

  // Month labels positions
  const monthLabels: { label: string; col: number }[] = [];
  for (let m = 0; m < 12; m++) {
    const first = new Date(year, m, 1);
    const col = Math.floor((first.getTime() - startMon.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (col >= 0 && col < 53) monthLabels.push({ label: MONTH_NAMES_SHORT[m], col });
  }

  return (
    <div>
      {/* Day of week labels */}
      <div style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 2, marginBottom: 4 }}>
        <div />
        <div style={{ display: "flex", gap: 2 }}>
          {DAY_NAMES_SHORT.map((d) => (
            <div key={d} style={{ flex: 1, textAlign: "center", fontSize: 9, color: "var(--muted-foreground)", fontWeight: 600 }}>
              {d[0]}
            </div>
          ))}
        </div>
      </div>

      {/* Month labels + grid (transposed: weeks as rows) */}
      {/* Actually render as 7 rows × 53 cols */}
      <div style={{ position: "relative" }}>
        {/* Month labels row */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(53, 1fr)`, marginBottom: 4 }}>
          {Array.from({ length: 53 }, (_, col) => {
            const ml = monthLabels.find((m) => m.col === col);
            return (
              <div key={col} style={{ fontSize: 9, color: "var(--muted-foreground)", fontWeight: 600, whiteSpace: "nowrap" }}>
                {ml?.label ?? ""}
              </div>
            );
          })}
        </div>

        {/* Grid: 7 rows (Mon–Sun), 53 cols (weeks) */}
        {Array.from({ length: 7 }, (_, dow) => (
          <div key={dow} style={{ display: "grid", gridTemplateColumns: `repeat(53, 1fr)`, gap: 2, marginBottom: 2 }}>
            {Array.from({ length: 53 }, (_, week) => {
              const cell = cells[week * 7 + dow];
              if (!cell) return <div key={week} />;
              const { log, sched } = getInfo(cell.dateStr);
              const color = log?.sectionColor ?? sched?.sectionColor;
              const isToday = cell.dateStr === today;
              return (
                <button
                  key={week}
                  onClick={() => cell.inYear && onDayTap(cell.dateStr)}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: 2,
                    background: !cell.inYear ? "transparent" : color ? `${color}cc` : "var(--muted)",
                    border: isToday ? "1px solid #ff3d3d" : "none",
                    cursor: cell.inYear ? "pointer" : "default",
                    padding: 0,
                    opacity: !cell.inYear ? 0.15 : 1,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
        <LegendDot color="var(--muted)" label="Kein Training" />
        <LegendDot color="#ff3d3d" label="Push" />
        <LegendDot color="#60a5fa" label="Pull" />
        <LegendDot color="#c084fc" label="Beine" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{label}</span>
    </div>
  );
}

// ─── Month View ───────────────────────────────────────────────────────────────

function MonthView({
  year,
  month,
  today,
  getInfo,
  onDayTap,
}: {
  year: number;
  month: number;
  today: string;
  getInfo: (d: string) => { log: WorkoutLog | undefined; sched: { sectionName: string; sectionColor: string } | null };
  onDayTap: (d: string) => void;
}) {
  const firstDow = getFirstDowOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
        {DAY_NAMES_SHORT.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const { log, sched } = getInfo(dateStr);
          const isToday = dateStr === today;
          const color = log?.sectionColor ?? sched?.sectionColor;
          const label = log?.sectionName ?? sched?.sectionName;

          return (
            <button
              key={i}
              onClick={() => onDayTap(dateStr)}
              style={{
                background: color ? `${color}18` : "var(--secondary)",
                border: isToday ? `2px solid #ff3d3d` : "1px solid transparent",
                borderRadius: 10,
                padding: "8px 4px 6px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                minHeight: 58,
                transition: "all 0.1s",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: isToday ? 800 : 600,
                  color: isToday ? "#ff3d3d" : "var(--foreground)",
                  fontFamily: "DM Mono, monospace",
                }}
              >
                {day}
              </span>
              {color && (
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
              )}
              {label && (
                <span style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 0.2 }}>
                  {label.toUpperCase().slice(0, 4)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────

function WeekView({
  navDate,
  today,
  getInfo,
  onDayTap,
}: {
  navDate: Date;
  today: string;
  getInfo: (d: string) => { log: WorkoutLog | undefined; sched: { sectionName: string; sectionColor: string } | null };
  onDayTap: (d: string) => void;
}) {
  const mon = new Date(navDate);
  mon.setDate(navDate.getDate() - dowEu(navDate));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return { dateStr: formatDate(d), day: d.getDate(), dow: i };
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {days.map(({ dateStr, day, dow }) => {
        const { log, sched } = getInfo(dateStr);
        const isToday = dateStr === today;
        const color = log?.sectionColor ?? sched?.sectionColor;
        const secName = log?.sectionName ?? sched?.sectionName;
        const exCount = log?.exercises.length ?? 0;

        return (
          <button
            key={dateStr}
            onClick={() => onDayTap(dateStr)}
            style={{
              background: color ? `${color}15` : "var(--secondary)",
              border: isToday ? `2px solid #ff3d3d` : "1px solid var(--border)",
              borderRadius: 16,
              padding: "16px",
              cursor: "pointer",
              textAlign: "left",
              minHeight: 100,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gridColumn: dow === 6 ? "1 / -1" : undefined,
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", marginBottom: 4 }}>
                {DAY_NAMES_SHORT[dow]}
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  fontFamily: "DM Mono, monospace",
                  color: isToday ? "#ff3d3d" : "var(--foreground)",
                }}
              >
                {day}
              </div>
            </div>
            {secName ? (
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: 0.3 }}>
                  {secName.toUpperCase()}
                </div>
                {exCount > 0 && (
                  <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 2 }}>
                    {exCount} Übungen
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Kein Training</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Day View (inline) ────────────────────────────────────────────────────────

function DayViewInline({
  dateStr,
  today,
  getInfo,
  onDayTap,
}: {
  dateStr: string;
  today: string;
  getInfo: (d: string) => { log: WorkoutLog | undefined; sched: { sectionName: string; sectionColor: string } | null };
  onDayTap: (d: string) => void;
}) {
  const { log, sched } = getInfo(dateStr);
  const isToday = dateStr === today;
  const color = log?.sectionColor ?? sched?.sectionColor;
  const secName = log?.sectionName ?? sched?.sectionName;

  return (
    <button
      onClick={() => onDayTap(dateStr)}
      style={{
        width: "100%",
        background: color ? `${color}15` : "var(--secondary)",
        border: isToday ? `2px solid #ff3d3d` : "1px solid var(--border)",
        borderRadius: 20,
        padding: "30px 24px",
        cursor: "pointer",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      {isToday && (
        <span style={{ fontSize: 11, fontWeight: 700, color: "#ff3d3d", letterSpacing: 0.5 }}>HEUTE</span>
      )}
      <div style={{ fontSize: 56, fontWeight: 900, fontFamily: "DM Mono, monospace", color: isToday ? "#ff3d3d" : "var(--foreground)", lineHeight: 1 }}>
        {parseDate(dateStr).getDate()}
      </div>
      {secName ? (
        <>
          <div style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: 0.5 }}>{secName}</div>
          {log && <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{log.exercises.length} Übungen · Tippen zum Öffnen</div>}
          {!log && <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Geplant · Tippen zum Eintragen</div>}
        </>
      ) : (
        <div style={{ fontSize: 15, color: "var(--muted-foreground)" }}>Kein Training geplant</div>
      )}
    </button>
  );
}

// ─── Workout Day Sheet ────────────────────────────────────────────────────────

function WorkoutDaySheet({
  dateStr,
  today,
  log,
  scheduled,
  plans,
  planId,
  onClose,
  onSave,
}: {
  dateStr: string;
  today: string;
  log: WorkoutLog | null;
  scheduled: { sectionId: string; sectionName: string; sectionColor: string } | null;
  plans: ReturnType<typeof useApp>["plans"];
  planId: string | null;
  onClose: () => void;
  onSave: (log: WorkoutLog) => void;
}) {
  const isToday = dateStr === today;
  const isPast = dateStr < today;
  const [editing, setEditing] = useState(isToday || (!isPast));

  // Build initial log from plan section if no log yet
  const buildInitialLog = (): WorkoutLog => {
    const plan = plans.find((p) => p.id === planId);
    const section = plan?.sections.find((s) => s.id === scheduled?.sectionId);
    return {
      id: `log-${dateStr}`,
      date: dateStr,
      planId: planId ?? "",
      sectionId: scheduled?.sectionId ?? "",
      sectionName: scheduled?.sectionName ?? "",
      sectionColor: scheduled?.sectionColor ?? "#ff3d3d",
      completed: false,
      exercises: (section?.exercises ?? []).map((ex) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: [{ id: `${dateStr}-${ex.id}-0`, setNumber: 1, reps: "", weight: "", note: "", done: false }],
      })),
    };
  };

  const [workoutLog, setWorkoutLog] = useState<WorkoutLog>(() => log ?? buildInitialLog());

  const sectionColor = workoutLog.sectionColor || "#ff3d3d";

  const updateSet = (exIdx: number, setIdx: number, field: keyof SetLog, value: string | boolean) => {
    setWorkoutLog((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, ei) =>
        ei !== exIdx ? ex : {
          ...ex,
          sets: ex.sets.map((s, si) => si !== setIdx ? s : { ...s, [field]: value }),
        }
      ),
    }));
  };

  const addSet = (exIdx: number) => {
    setWorkoutLog((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, ei) =>
        ei !== exIdx ? ex : {
          ...ex,
          sets: [
            ...ex.sets,
            {
              id: `new-${Date.now()}`,
              setNumber: ex.sets.length + 1,
              reps: ex.sets[ex.sets.length - 1]?.reps ?? "",
              weight: ex.sets[ex.sets.length - 1]?.weight ?? "",
              note: "",
              done: false,
            },
          ],
        }
      ),
    }));
  };

  const deleteSet = (exIdx: number, setIdx: number) => {
    setWorkoutLog((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, ei) =>
        ei !== exIdx ? ex : {
          ...ex,
          sets: ex.sets
            .filter((_, si) => si !== setIdx)
            .map((s, si) => ({ ...s, setNumber: si + 1 })),
        }
      ),
    }));
  };

  const d = parseDate(dateStr);
  const dateLabel = `${DAY_NAMES_SHORT[dowEu(d)]}, ${d.getDate()}. ${MONTH_NAMES_SHORT[d.getMonth()]} ${d.getFullYear()}`;

  if (!log && !scheduled) {
    return (
      <Sheet onClose={onClose}>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>😴</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Kein Training geplant</div>
          <div style={{ color: "var(--muted-foreground)", marginTop: 6 }}>
            Weise erst einen Plan zu, um Trainingstage zu sehen.
          </div>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet onClose={onClose}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ color: "var(--muted-foreground)", fontSize: 13, marginBottom: 4 }}>{dateLabel}</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>
            <span style={{ color: sectionColor }}>{workoutLog.sectionName}</span>
          </div>
          {log?.completed && (
            <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 700, marginTop: 4, display: "block" }}>
              ✓ Abgeschlossen
            </span>
          )}
        </div>
        {isPast && !editing && (
          <button
            onClick={() => setEditing(true)}
            style={{
              background: "var(--secondary)",
              border: "none",
              borderRadius: 10,
              padding: "8px 14px",
              color: "var(--foreground)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "Outfit, sans-serif",
            }}
          >
            Bearbeiten
          </button>
        )}
      </div>

      {/* Exercises */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", maxHeight: "60vh" }}>
        {workoutLog.exercises.map((ex, exIdx) => (
          <div key={ex.exerciseId} style={{ background: "var(--secondary)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{ex.exerciseName}</span>
            </div>

            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr 36px", gap: 6, padding: "8px 14px 4px", alignItems: "center" }}>
              <span style={colHdr}>Satz</span>
              <span style={colHdr}>Wdhl.</span>
              <span style={colHdr}>kg</span>
              <span style={colHdr}>Bemerkung</span>
              <span />
            </div>

            {ex.sets.map((s, setIdx) =>
              editing ? (
                <div key={s.id} style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr 36px", gap: 6, padding: "4px 14px", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: s.done ? "#4ade80" : "var(--muted-foreground)", fontFamily: "DM Mono, monospace", textAlign: "center" }}>
                    {s.setNumber}
                  </span>
                  <NumberInput
                    value={s.reps}
                    onChange={(v) => updateSet(exIdx, setIdx, "reps", v)}
                    placeholder="–"
                    done={s.done}
                  />
                  <NumberInput
                    value={s.weight}
                    onChange={(v) => updateSet(exIdx, setIdx, "weight", v)}
                    placeholder="–"
                    done={s.done}
                  />
                  <input
                    value={s.note}
                    onChange={(e) => updateSet(exIdx, setIdx, "note", e.target.value)}
                    placeholder="Notiz…"
                    style={{
                      background: "var(--card)",
                      border: "none",
                      borderRadius: 8,
                      padding: "7px 8px",
                      color: "var(--muted-foreground)",
                      fontSize: 11,
                      fontFamily: "Outfit, sans-serif",
                      outline: "none",
                      width: "100%",
                    }}
                  />
                  <button
                    onClick={() => updateSet(exIdx, setIdx, "done", !s.done)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      border: "none",
                      background: s.done ? "#4ade80" : "var(--card)",
                      color: s.done ? "#000" : "var(--muted-foreground)",
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                  >
                    ✓
                  </button>
                </div>
              ) : (
                // Read-only row
                <div key={s.id} style={{ padding: "6px 14px", display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "DM Mono, monospace", minWidth: 28 }}>
                    {s.setNumber}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, fontFamily: "DM Mono, monospace" }}>
                    {s.reps} × {s.weight} kg
                  </span>
                  {s.note && (
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontStyle: "italic" }}>
                      {s.note}
                    </span>
                  )}
                  {s.done && <span style={{ color: "#4ade80", fontSize: 13, marginLeft: "auto" }}>✓</span>}
                </div>
              )
            )}

            {editing && (
              <div style={{ display: "flex", gap: 8, padding: "8px 14px 12px" }}>
                <button
                  onClick={() => addSet(exIdx)}
                  style={{
                    background: "none",
                    border: "none",
                    color: sectionColor,
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "Outfit, sans-serif",
                    padding: 0,
                  }}
                >
                  + Satz
                </button>
                {ex.sets.length > 1 && (
                  <button
                    onClick={() => deleteSet(exIdx, ex.sets.length - 1)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--muted-foreground)",
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "Outfit, sans-serif",
                      padding: 0,
                    }}
                  >
                    − Satz
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save button */}
      {editing && (
        <button
          onClick={() => onSave({ ...workoutLog, completed: true })}
          style={{
            marginTop: 16,
            width: "100%",
            background: sectionColor,
            color: "#fff",
            border: "none",
            borderRadius: 14,
            padding: "15px",
            fontWeight: 800,
            fontSize: 16,
            cursor: "pointer",
            fontFamily: "Outfit, sans-serif",
          }}
        >
          Training speichern
        </button>
      )}
    </Sheet>
  );
}

// ─── Assign Plan Sheet ────────────────────────────────────────────────────────

function AssignPlanSheet({
  plans,
  current,
  onClose,
  onSave,
}: {
  plans: ReturnType<typeof useApp>["plans"];
  current: Assignment | null;
  onClose: () => void;
  onSave: (a: Assignment) => void;
}) {
  const [selectedPlanId, setSelectedPlanId] = useState(current?.planId ?? plans[0]?.id ?? "");
  const [selectedDays, setSelectedDays] = useState<number[]>(current?.daysOfWeek ?? [0, 2, 4]);
  const [step, setStep] = useState<1 | 2>(1);

  const plan = plans.find((p) => p.id === selectedPlanId);

  const toggleDay = (d: number) =>
    setSelectedDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));

  const confirm = () => {
    if (!plan) return;
    onSave({
      planId: selectedPlanId,
      daysOfWeek: selectedDays,
      startDate: todayStr(),
      sectionRotation: plan.sections.map((s) => s.id),
    });
  };

  return (
    <Sheet onClose={onClose} title="Plan zuweisen">
      {step === 1 ? (
        <>
          <p style={{ color: "var(--muted-foreground)", fontSize: 14, marginTop: 0, marginBottom: 16 }}>
            Wähle deinen Trainingsplan:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {plans.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                style={{
                  background: selectedPlanId === p.id ? "rgba(255,61,61,0.1)" : "var(--secondary)",
                  border: `1.5px solid ${selectedPlanId === p.id ? "rgba(255,61,61,0.4)" : "transparent"}`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  cursor: "pointer",
                  color: "var(--foreground)",
                  textAlign: "left",
                  fontFamily: "Outfit, sans-serif",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                  <div style={{ color: "var(--muted-foreground)", fontSize: 12, marginTop: 2 }}>
                    {p.sections.map((s) => s.name).join(" · ")}
                  </div>
                </div>
                {selectedPlanId === p.id && <span style={{ color: "#ff3d3d", fontSize: 18 }}>✓</span>}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!selectedPlanId}
            style={{ ...btnPrimaryStyle, width: "100%", opacity: selectedPlanId ? 1 : 0.4 }}
          >
            Weiter →
          </button>
        </>
      ) : (
        <>
          <button onClick={() => setStep(1)} style={{ ...backBtnStyle, marginBottom: 12 }}>‹ Zurück</button>
          <p style={{ color: "var(--muted-foreground)", fontSize: 14, marginTop: 0, marginBottom: 16 }}>
            An welchen Tagen kannst du trainieren?
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 16 }}>
            {DAY_NAMES_SHORT.map((d, i) => (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                style={{
                  background: selectedDays.includes(i) ? "var(--primary)" : "var(--secondary)",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 0",
                  color: selectedDays.includes(i) ? "#fff" : "var(--muted-foreground)",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "Outfit, sans-serif",
                  transition: "all 0.15s",
                }}
              >
                {d}
              </button>
            ))}
          </div>

          {plan && selectedDays.length > 0 && (
            <div style={{ background: "var(--secondary)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", marginBottom: 8, letterSpacing: 0.4, textTransform: "uppercase" }}>
                Rotation ab heute
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {plan.sections.map((s, i) => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                      — Tag {i + 1}, dann alle {plan.sections.length} Tage
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={confirm}
            disabled={selectedDays.length === 0}
            style={{ ...btnPrimaryStyle, width: "100%", opacity: selectedDays.length > 0 ? 1 : 0.4 }}
          >
            Plan ab heute zuweisen
          </button>
        </>
      )}
    </Sheet>
  );
}

// ─── Sheet (bottom overlay) ───────────────────────────────────────────────────

function Sheet({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: "var(--card)",
          borderRadius: "24px 24px 0 0",
          padding: "20px 20px 40px",
          maxHeight: "88%",
          overflowY: "auto",
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: "var(--border)", borderRadius: 2, margin: "0 auto 16px" }} />
        {title && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontSize: 20 }}>{title}</span>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted-foreground)", fontSize: 22, cursor: "pointer", padding: 0 }}>×</button>
          </div>
        )}
        {!title && (
          <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "var(--muted-foreground)", fontSize: 22, cursor: "pointer", padding: 0 }}>×</button>
        )}
        {children}
      </div>
    </div>
  );
}

// ─── Small reusable components ────────────────────────────────────────────────

function NumberInput({
  value,
  onChange,
  placeholder,
  done,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  done: boolean;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: done ? "rgba(74,222,128,0.1)" : "var(--card)",
        border: "none",
        borderRadius: 8,
        padding: "7px 8px",
        color: "var(--foreground)",
        fontSize: 14,
        fontWeight: 700,
        fontFamily: "DM Mono, monospace",
        textAlign: "center",
        outline: "none",
        width: "100%",
      }}
    />
  );
}

const colHdr: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "var(--muted-foreground)",
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

const navBtnStyle: React.CSSProperties = {
  background: "var(--secondary)",
  border: "none",
  borderRadius: 10,
  width: 36,
  height: 36,
  color: "var(--foreground)",
  fontSize: 18,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Outfit, sans-serif",
};

const backBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--primary)",
  fontFamily: "Outfit, sans-serif",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  padding: 0,
  display: "block",
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

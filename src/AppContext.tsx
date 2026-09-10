import React, { createContext, useContext, useState } from "react";
import type { Plan, WorkoutLog, Assignment, CustomWidget } from "./types";
import { formatDate, SECTION_COLORS } from "./utils";

const DEFAULT_PLAN: Plan = {
  id: "p1",
  name: "PPL Split",
  sections: [
    {
      id: "s1",
      name: "Push",
      color: SECTION_COLORS[0],
      exercises: [
        { id: "e1", name: "Bankdrücken" },
        { id: "e2", name: "Schulterdrücken" },
        { id: "e3", name: "Trizeps Dips" },
        { id: "e4", name: "Seitheben" },
      ],
    },
    {
      id: "s2",
      name: "Pull",
      color: SECTION_COLORS[1],
      exercises: [
        { id: "e5", name: "Klimmzüge" },
        { id: "e6", name: "Rudern (Kabel)" },
        { id: "e7", name: "Bizeps Curl" },
        { id: "e8", name: "Face Pulls" },
      ],
    },
    {
      id: "s3",
      name: "Beine",
      color: SECTION_COLORS[2],
      exercises: [
        { id: "e9", name: "Kniebeugen" },
        { id: "e10", name: "Beinpresse" },
        { id: "e11", name: "Romanian Deadlift" },
        { id: "e12", name: "Wadenheben" },
      ],
    },
  ],
};

function generateSampleLogs(): WorkoutLog[] {
  const logs: WorkoutLog[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sections = DEFAULT_PLAN.sections;
  let si = 0;

  // 5 weeks of Mon/Wed/Fri workouts
  for (let w = 5; w >= 1; w--) {
    for (const targetDow of [0, 2, 4]) {
      const d = new Date(today);
      const todayDow = (today.getDay() + 6) % 7;
      const daysBack = w * 7 + ((todayDow - targetDow + 7) % 7);
      d.setDate(today.getDate() - daysBack);
      if (d >= today) continue;

      const dateStr = formatDate(d);
      const sec = sections[si % sections.length];
      si++;

      logs.push({
        id: `log-${dateStr}`,
        date: dateStr,
        planId: "p1",
        sectionId: sec.id,
        sectionName: sec.name,
        sectionColor: sec.color,
        completed: true,
        exercises: sec.exercises.slice(0, 3).map((ex, ei) => ({
          exerciseId: ex.id,
          exerciseName: ex.name,
          sets: Array.from({ length: 3 }, (_, i) => ({
            id: `${dateStr}-${ex.id}-${i}`,
            setNumber: i + 1,
            reps: String(10 - i),
            weight: String([80, 50, 0, 12, 0, 60, 15, 25, 100, 150, 80, 60][ei] ?? 60),
            note: "",
            done: true,
          })),
        })),
      });
    }
  }
  return logs;
}

type AppCtx = {
  plans: Plan[];
  setPlans: React.Dispatch<React.SetStateAction<Plan[]>>;
  workoutLogs: WorkoutLog[];
  setWorkoutLogs: React.Dispatch<React.SetStateAction<WorkoutLog[]>>;
  assignment: Assignment | null;
  setAssignment: React.Dispatch<React.SetStateAction<Assignment | null>>;
  widgets: CustomWidget[];
  setWidgets: React.Dispatch<React.SetStateAction<CustomWidget[]>>;
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>([DEFAULT_PLAN]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(generateSampleLogs());
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 35);
  const [assignment, setAssignment] = useState<Assignment | null>({
    planId: "p1",
    daysOfWeek: [0, 2, 4],
    startDate: formatDate(startDate),
    sectionRotation: ["s1", "s2", "s3"],
  });
  const [widgets, setWidgets] = useState<CustomWidget[]>([
    {
      id: "w1",
      label: "Heutiges Training",
      size: "medium",
      accentColor: "#ff3d3d",
      content: ["today", "streak"],
    },
  ]);

  return (
    <Ctx.Provider value={{ plans, setPlans, workoutLogs, setWorkoutLogs, assignment, setAssignment, widgets, setWidgets }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp outside AppProvider");
  return ctx;
}

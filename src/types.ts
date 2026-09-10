export type Exercise = {
  id: string;
  name: string;
};

export type Section = {
  id: string;
  name: string;
  color: string;
  exercises: Exercise[];
};

export type Plan = {
  id: string;
  name: string;
  sections: Section[];
};

export type SetLog = {
  id: string;
  setNumber: number;
  reps: string;
  weight: string;
  note: string;
  done: boolean;
};

export type ExerciseLog = {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
};

export type WorkoutLog = {
  id: string;
  date: string; // YYYY-MM-DD
  planId: string;
  sectionId: string;
  sectionName: string;
  sectionColor: string;
  exercises: ExerciseLog[];
  completed: boolean;
};

export type Assignment = {
  planId: string;
  daysOfWeek: number[]; // 0=Mon … 6=Sun
  startDate: string; // YYYY-MM-DD
  sectionRotation: string[]; // section IDs in rotation order
};

export type CustomWidget = {
  id: string;
  label: string;
  size: "small" | "medium" | "large";
  accentColor: string;
  content: string[];
};

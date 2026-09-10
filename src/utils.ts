import type { Assignment, Plan } from "./types";

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return formatDate(new Date());
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function dowEu(date: Date): number {
  // 0=Mon … 6=Sun
  return (date.getDay() + 6) % 7;
}

export const DAY_NAMES_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
export const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];
export const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
];

export function getScheduledSection(
  dateStr: string,
  assignment: Assignment,
  plans: Plan[]
): { sectionId: string; sectionName: string; sectionColor: string } | null {
  const plan = plans.find((p) => p.id === assignment.planId);
  if (!plan || plan.sections.length === 0) return null;

  const date = parseDate(dateStr);
  const dow = dowEu(date);
  if (!assignment.daysOfWeek.includes(dow)) return null;

  const startDate = parseDate(assignment.startDate);
  if (date < startDate) return null;

  // Count workout days from startDate up to (not including) date
  let count = 0;
  const cursor = new Date(startDate);
  while (cursor < date) {
    if (assignment.daysOfWeek.includes(dowEu(cursor))) count++;
    cursor.setDate(cursor.getDate() + 1);
  }

  const rotation =
    assignment.sectionRotation.length > 0
      ? assignment.sectionRotation
      : plan.sections.map((s) => s.id);

  const sectionId = rotation[count % rotation.length];
  const section = plan.sections.find((s) => s.id === sectionId);
  if (!section) return null;
  return { sectionId: section.id, sectionName: section.name, sectionColor: section.color };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDowOfMonth(year: number, month: number): number {
  return dowEu(new Date(year, month, 1));
}

export const SECTION_COLORS = [
  "#ff3d3d", "#60a5fa", "#c084fc", "#4ade80",
  "#fbbf24", "#fb7185", "#34d399", "#f97316",
];

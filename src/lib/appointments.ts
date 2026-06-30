export type AppointmentStatus = "completed" | "no_show" | "cancelled";

export interface Appointment {
  id: string;
  date: string;
  weekday: string;
  treatment: string;
  status: AppointmentStatus;
  doctor: string;
  patientAge: number;
}

export const WEEKDAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const WEEKDAY_DE: Record<string, string> = {
  Monday: "Mo",
  Tuesday: "Di",
  Wednesday: "Mi",
  Thursday: "Do",
  Friday: "Fr",
  Saturday: "Sa",
  Sunday: "So",
};

export const STATUS_DE: Record<AppointmentStatus, string> = {
  completed: "Abgeschlossen",
  no_show: "No-Show",
  cancelled: "Storniert",
};

export function computeKpis(items: Appointment[]) {
  const total = items.length;
  const noShows = items.filter((a) => a.status === "no_show").length;
  const cancelled = items.filter((a) => a.status === "cancelled").length;
  const completed = items.filter((a) => a.status === "completed").length;
  const noShowRate = total ? (noShows / total) * 100 : 0;
  const completionRate = total ? (completed / total) * 100 : 0;
  return { total, noShows, cancelled, completed, noShowRate, completionRate };
}

export function groupByWeekday(items: Appointment[]) {
  const map = new Map<string, number>();
  WEEKDAY_ORDER.forEach((d) => map.set(d, 0));
  items.forEach((a) => map.set(a.weekday, (map.get(a.weekday) ?? 0) + 1));
  return WEEKDAY_ORDER.filter((d) => (map.get(d) ?? 0) > 0 || ["Monday","Tuesday","Wednesday","Thursday","Friday"].includes(d))
    .map((d) => ({ day: WEEKDAY_DE[d], full: d, count: map.get(d) ?? 0 }));
}

export function groupByTreatment(items: Appointment[]) {
  const map = new Map<string, number>();
  items.forEach((a) => map.set(a.treatment, (map.get(a.treatment) ?? 0) + 1));
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function groupByStatus(items: Appointment[]) {
  const map = new Map<AppointmentStatus, number>();
  (["completed", "no_show", "cancelled"] as AppointmentStatus[]).forEach((s) => map.set(s, 0));
  items.forEach((a) => map.set(a.status, (map.get(a.status) ?? 0) + 1));
  return Array.from(map.entries()).map(([status, value]) => ({
    status,
    label: STATUS_DE[status],
    value,
  }));
}
export type RawStatus = "wahrgenommen" | "no_show" | "abgesagt" | null;

export interface RawAppointment {
  termin_id: string;
  datum: string;
  dauer_minuten: number;
  behandlungsart: string;
  arzt: string;
  status: RawStatus;
  neupatient: boolean;
}

export interface PraxisData {
  praxis: string;
  zeitraum: { von: string; bis: string };
  oeffnungszeiten_hinweis: string;
  termine: RawAppointment[];
}

export type NormStatus = "wahrgenommen" | "no_show" | "abgesagt" | "unbekannt";

export interface Appointment extends Omit<RawAppointment, "status" | "behandlungsart"> {
  status: NormStatus;
  behandlungsart: string;
  dateObj: Date;
  weekday: number; // 0=Sun..6=Sat
  hour: number;
}

export const STATUS_LABEL: Record<NormStatus, string> = {
  wahrgenommen: "Wahrgenommen",
  no_show: "No-Show",
  abgesagt: "Abgesagt",
  unbekannt: "Ohne Status",
};

export const STATUS_COLOR_VAR: Record<NormStatus, string> = {
  wahrgenommen: "var(--color-success)",
  no_show: "var(--color-destructive)",
  abgesagt: "var(--color-warning)",
  unbekannt: "var(--color-muted-foreground)",
};

export const WEEKDAY_DE_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
export const WEEKDAY_DE_LONG = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

// Normalize treatment names: collapse messy entries like "sonstiges - Rezept abholen??"
export function normalizeTreatment(t: string): string {
  const lower = t.toLowerCase();
  if (lower.startsWith("sonstiges")) return "Sonstiges";
  return t.trim();
}

export function normalize(raw: RawAppointment[]): Appointment[] {
  return raw.map((r) => {
    const d = new Date(r.datum);
    return {
      ...r,
      status: (r.status ?? "unbekannt") as NormStatus,
      behandlungsart: normalizeTreatment(r.behandlungsart),
      dateObj: d,
      weekday: d.getDay(),
      hour: d.getHours(),
    };
  });
}

export interface Kpis {
  total: number;
  wahrgenommen: number;
  noShow: number;
  abgesagt: number;
  unbekannt: number;
  noShowRate: number;
  completionRate: number;
  cancellationRate: number;
  neupatientenAnteil: number;
  durchschnittDauer: number; // Minuten je wahrgenommenem Termin
  geleisteteMinuten: number;
}

export function computeKpis(items: Appointment[]): Kpis {
  const total = items.length;
  const wahrgenommen = items.filter((a) => a.status === "wahrgenommen");
  const noShow = items.filter((a) => a.status === "no_show").length;
  const abgesagt = items.filter((a) => a.status === "abgesagt").length;
  const unbekannt = items.filter((a) => a.status === "unbekannt").length;
  const geleisteteMinuten = wahrgenommen.reduce(
    (s, a) => s + (a.dauer_minuten || 0),
    0,
  );
  const dauerCount = wahrgenommen.filter((a) => a.dauer_minuten > 0).length;
  const neupatienten = items.filter((a) => a.neupatient).length;
  return {
    total,
    wahrgenommen: wahrgenommen.length,
    noShow,
    abgesagt,
    unbekannt,
    noShowRate: total ? (noShow / total) * 100 : 0,
    completionRate: total ? (wahrgenommen.length / total) * 100 : 0,
    cancellationRate: total ? (abgesagt / total) * 100 : 0,
    neupatientenAnteil: total ? (neupatienten / total) * 100 : 0,
    durchschnittDauer: dauerCount ? geleisteteMinuten / dauerCount : 0,
    geleisteteMinuten,
  };
}

// Auslastung: Verhältnis geleisteter Behandlungsminuten zur verfügbaren
// Kapazität im Zeitraum. Kapazität = Arbeitstage (Mo–Fr) × tägliche
// Sprechstunde (9h = 540min, Mittagspause abgezogen) × Anzahl Ärzte.
export interface Capacity {
  workdays: number;
  doctors: number;
  minutesPerDoctorPerDay: number;
  totalMinutes: number;
}

export function computeCapacity(
  von: string,
  bis: string,
  doctors: number,
  minutesPerDoctorPerDay = 540,
): Capacity {
  const start = new Date(von + "T00:00:00");
  const end = new Date(bis + "T00:00:00");
  let workdays = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const wd = cur.getDay();
    if (wd >= 1 && wd <= 5) workdays++;
    cur.setDate(cur.getDate() + 1);
  }
  return {
    workdays,
    doctors,
    minutesPerDoctorPerDay,
    totalMinutes: workdays * doctors * minutesPerDoctorPerDay,
  };
}

export function groupByWeekday(items: Appointment[]) {
  const counts = new Map<number, { count: number; minutes: number }>();
  for (let i = 1; i <= 5; i++) counts.set(i, { count: 0, minutes: 0 });
  items.forEach((a) => {
    const cur = counts.get(a.weekday) ?? { count: 0, minutes: 0 };
    cur.count++;
    if (a.status === "wahrgenommen") cur.minutes += a.dauer_minuten || 0;
    counts.set(a.weekday, cur);
  });
  return Array.from(counts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([wd, v]) => ({
      day: WEEKDAY_DE_SHORT[wd],
      full: WEEKDAY_DE_LONG[wd],
      count: v.count,
      minutes: v.minutes,
    }));
}

export function groupByHour(items: Appointment[]) {
  const map = new Map<number, number>();
  for (let h = 8; h <= 18; h++) map.set(h, 0);
  items.forEach((a) => {
    if (a.status === "wahrgenommen")
      map.set(a.hour, (map.get(a.hour) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([h, v]) => ({ hour: `${h.toString().padStart(2, "0")}:00`, count: v }));
}

export function groupByTreatment(items: Appointment[]) {
  const map = new Map<string, number>();
  items.forEach((a) => map.set(a.behandlungsart, (map.get(a.behandlungsart) ?? 0) + 1));
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function groupByStatus(items: Appointment[]) {
  const order: NormStatus[] = ["wahrgenommen", "no_show", "abgesagt", "unbekannt"];
  const map = new Map<NormStatus, number>();
  order.forEach((s) => map.set(s, 0));
  items.forEach((a) => map.set(a.status, (map.get(a.status) ?? 0) + 1));
  return order
    .map((s) => ({ status: s, label: STATUS_LABEL[s], value: map.get(s) ?? 0 }))
    .filter((d) => d.value > 0);
}

export function groupByDoctor(items: Appointment[]) {
  const map = new Map<string, { count: number; minutes: number; noShow: number }>();
  items.forEach((a) => {
    const cur = map.get(a.arzt) ?? { count: 0, minutes: 0, noShow: 0 };
    cur.count++;
    if (a.status === "wahrgenommen") cur.minutes += a.dauer_minuten || 0;
    if (a.status === "no_show") cur.noShow++;
    map.set(a.arzt, cur);
  });
  return Array.from(map.entries())
    .map(([name, v]) => ({
      name,
      count: v.count,
      minutes: v.minutes,
      noShow: v.noShow,
      noShowRate: v.count ? (v.noShow / v.count) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}
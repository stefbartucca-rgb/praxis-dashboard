import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Award,
  CalendarCheck,
  CalendarDays,
  Clock,
  Gauge,
  Info,
  Stethoscope,
  TrendingDown,
  UserPlus,
  UserX,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  computeCapacity,
  computeKpis,
  computeAuslastungTrend,
  computeNoShowTrend,
  computeTotalTrend,
  dailyNoShowRate,
  dailySeries,
  groupByDoctor,
  groupByHour,
  groupByStatus,
  groupByTreatment,
  groupByWeekday,
  normalize,
  STATUS_COLOR_VAR,
  STATUS_LABEL,
  type Appointment,
  type NormStatus,
  type PraxisData,
  type Trend,
} from "@/lib/appointments";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Praxis Dashboard — Terminanalyse & Auslastung" },
      {
        name: "description",
        content:
          "Analyse der Termine einer Hausarztpraxis: Auslastung, No-Show-Quote, Behandlungsarten und Stoßzeiten.",
      },
      { property: "og:title", content: "Praxis Dashboard" },
      {
        property: "og:description",
        content: "Auslastungs- und Terminanalyse für eine Hausarztpraxis.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [data, setData] = useState<PraxisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<string>("all");
  const [treatment, setTreatment] = useState<string>("all");

  useEffect(() => {
    fetch("/termindaten.json")
      .then((r) => {
        if (!r.ok) throw new Error("Datei nicht gefunden");
        return r.json();
      })
      .then((d: PraxisData) => setData(d))
      .catch((e: Error) => setError(e.message));
  }, []);

  const all: Appointment[] = useMemo(
    () => (data ? normalize(data.termine) : []),
    [data],
  );

  const doctors = useMemo(
    () => Array.from(new Set(all.map((a) => a.arzt))).sort(),
    [all],
  );
  const treatments = useMemo(
    () => Array.from(new Set(all.map((a) => a.behandlungsart))).sort(),
    [all],
  );

  const filtered = useMemo(
    () =>
      all.filter(
        (a) =>
          (doctor === "all" || a.arzt === doctor) &&
          (treatment === "all" || a.behandlungsart === treatment),
      ),
    [all, doctor, treatment],
  );

  const kpis = useMemo(() => computeKpis(filtered), [filtered]);
  const byWeekday = useMemo(() => groupByWeekday(filtered), [filtered]);
  const byHour = useMemo(() => groupByHour(filtered), [filtered]);
  const byTreatment = useMemo(() => groupByTreatment(filtered), [filtered]);
  const byStatus = useMemo(() => groupByStatus(filtered), [filtered]);
  const byDoctor = useMemo(() => groupByDoctor(filtered), [filtered]);

  // Auslastung bezieht sich immer auf die berücksichtigten Ärzte im Filter.
  const capacityDoctors = doctor === "all" ? doctors.length : 1;
  const capacity = useMemo(
    () =>
      data
        ? computeCapacity(
            data.zeitraum.von,
            data.zeitraum.bis,
            Math.max(capacityDoctors, 1),
          )
        : null,
    [data, capacityDoctors],
  );
  const auslastung =
    capacity && capacity.totalMinutes > 0
      ? (kpis.geleisteteMinuten / capacity.totalMinutes) * 100
      : 0;

  const topTreatment = byTreatment[0];
  const topWeekday = [...byWeekday].sort((a, b) => b.count - a.count)[0];

  // Trends (1. vs. 2. Hälfte des Zeitraums) + Sparkline-Reihen
  const totalTrend = useMemo<Trend | null>(
    () => (data ? computeTotalTrend(filtered, data.zeitraum.von, data.zeitraum.bis) : null),
    [filtered, data],
  );
  const noShowTrend = useMemo<Trend | null>(
    () => (data ? computeNoShowTrend(filtered, data.zeitraum.von, data.zeitraum.bis) : null),
    [filtered, data],
  );
  const auslTrend = useMemo<Trend | null>(
    () =>
      data
        ? computeAuslastungTrend(
            filtered,
            data.zeitraum.von,
            data.zeitraum.bis,
            Math.max(capacityDoctors, 1),
          )
        : null,
    [filtered, data, capacityDoctors],
  );
  const totalSpark = useMemo(
    () => (data ? dailySeries(filtered, data.zeitraum.von, data.zeitraum.bis) : []),
    [filtered, data],
  );
  const noShowSpark = useMemo(
    () => (data ? dailyNoShowRate(filtered, data.zeitraum.von, data.zeitraum.bis) : []),
    [filtered, data],
  );
  const weekdaySpark = useMemo(() => byWeekday.map((d) => d.count), [byWeekday]);
  const treatmentSpark = useMemo(
    () => byTreatment.slice(0, 8).map((t) => t.value),
    [byTreatment],
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Stethoscope className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Praxis Dashboard
              </h1>
              <p className="truncate text-sm text-muted-foreground">
                {data?.praxis ?? "Terminanalyse & Auslastung"}
              </p>
            </div>
          </div>
          {data && (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                Zeitraum {formatDate(data.zeitraum.von)} – {formatDate(data.zeitraum.bis)}
              </Badge>
              <Badge variant="outline">{filtered.length} Termine</Badge>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Daten konnten nicht geladen werden: {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <Select value={doctor} onValueChange={setDoctor}>
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="Arzt wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Ärzte</SelectItem>
              {doctors.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={treatment} onValueChange={setTreatment}>
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="Behandlung wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Behandlungen</SelectItem>
              {treatments.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <KpiCard
            label="Gesamttermine"
            value={kpis.total.toString()}
            icon={<CalendarCheck className="h-5 w-5" />}
            accent="blue"
            trend={totalTrend ? { ...totalTrend, suffix: " Termine", goodWhen: "up" } : null}
            spark={totalSpark}
          />
          <KpiCard
            label="No-Show-Quote"
            value={`${kpis.noShowRate.toFixed(1)}%`}
            icon={<UserX className="h-5 w-5" />}
            accent="rose"
            alert={kpis.noShowRate >= 8}
            trend={
              noShowTrend
                ? { ...noShowTrend, suffix: " %-Pkt.", goodWhen: "down", asAbsolute: true }
                : null
            }
            spark={noShowSpark}
          />
          <KpiCard
            label="Häufigste Behandlung"
            value={topTreatment ? topTreatment.name : "—"}
            secondary={topTreatment ? `${topTreatment.value} Termine` : "Keine Daten"}
            icon={<Award className="h-5 w-5" />}
            accent="emerald"
            compactValue
            spark={treatmentSpark}
          />
          <KpiCard
            label="Top-Wochentag"
            value={topWeekday ? topWeekday.full : "—"}
            secondary={topWeekday ? `${topWeekday.count} Termine` : "Keine Daten"}
            icon={<CalendarDays className="h-5 w-5" />}
            accent="amber"
            compactValue
            spark={weekdaySpark}
          />
          <KpiCard
            label="Ø Auslastung"
            value={`${auslastung.toFixed(1)}%`}
            secondary={
              capacity
                ? `${Math.round(kpis.geleisteteMinuten / 60)}h / ${Math.round(
                    capacity.totalMinutes / 60,
                  )}h`
                : "—"
            }
            icon={<Gauge className="h-5 w-5" />}
            accent="indigo"
            alert={auslastung >= 90}
            trend={
              auslTrend
                ? { ...auslTrend, suffix: " %-Pkt.", goodWhen: "up", asAbsolute: true }
                : null
            }
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Stornoquote"
            value={`${kpis.cancellationRate.toFixed(1)}%`}
            secondary={`${kpis.abgesagt} abgesagte Termine`}
            icon={<TrendingDown className="h-5 w-5" />}
            accent="amber"
          />
          <KpiCard
            label="Ø Behandlungsdauer"
            value={`${kpis.durchschnittDauer.toFixed(0)} min`}
            secondary="je wahrgenommenem Termin"
            icon={<Clock className="h-5 w-5" />}
            accent="emerald"
          />
          <KpiCard
            label="Neupatienten-Anteil"
            value={`${kpis.neupatientenAnteil.toFixed(1)}%`}
            secondary="aller Termine im Filter"
            icon={<UserPlus className="h-5 w-5" />}
            accent="emerald"
          />
          <KpiCard
            label="Geleistete Stunden"
            value={`${(kpis.geleisteteMinuten / 60).toFixed(1)} h`}
            secondary="Summe wahrgenommener Termine"
            icon={<Activity className="h-5 w-5" />}
            accent="blue"
          />
        </div>

        {/* Auslastungs-Erklärung */}
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-2 py-4 text-sm sm:flex-row sm:items-start sm:gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="text-foreground">
              <p className="font-medium">Wie wird die Auslastung berechnet?</p>
              <p className="mt-1 text-muted-foreground">
                Auslastung = <em>geleistete Behandlungsminuten</em> (Summe der
                wahrgenommenen Termine) geteilt durch die <em>verfügbare
                Kapazität</em>. Die Kapazität entspricht den Werktagen (Mo–Fr) im
                Zeitraum × 9 Sprechstunden pro Tag (08–18 Uhr abzüglich
                Mittagspause) × {capacityDoctors} {capacityDoctors === 1 ? "Arzt" : "Ärzte"}
                {capacity ? ` = ${Math.round(capacity.totalMinutes / 60)} Stunden Kapazität` : ""}.
                {data?.oeffnungszeiten_hinweis ? ` Sprechzeiten: ${data.oeffnungszeiten_hinweis}.` : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Charts row 1 */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Termine pro Wochentag</CardTitle>
              <CardDescription>Anzahl Termine je Werktag im Zeitraum</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byWeekday} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={(_label, p) =>
                        (p?.[0]?.payload as { full?: string } | undefined)?.full ?? ""
                      }
                      formatter={(v, n) => [v as number, n === "count" ? "Termine" : (n as string)]}
                    />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status-Verteilung</CardTitle>
              <CardDescription>Wahrgenommen, No-Show, Absage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byStatus}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {byStatus.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLOR_VAR[entry.status]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts row 2 */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Stoßzeiten im Tagesverlauf</CardTitle>
              <CardDescription>
                Wahrgenommene Termine je Stunde (08–18 Uhr)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={byHour} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="hour" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Behandlungsarten</CardTitle>
              <CardDescription>Häufigkeit im Zeitraum</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={byTreatment}
                    layout="vertical"
                    margin={{ top: 10, right: 16, bottom: 0, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="var(--color-muted-foreground)"
                      fontSize={11}
                      width={130}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="var(--color-accent)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doctor breakdown + table */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Auslastung je Arzt</CardTitle>
              <CardDescription>
                Termine, geleistete Stunden und No-Show-Quote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Arzt</th>
                      <th className="px-3 py-2 text-right">Termine</th>
                      <th className="px-3 py-2 text-right">Stunden</th>
                      <th className="px-3 py-2 text-right">No-Show</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byDoctor.map((d) => (
                      <tr key={d.name} className="border-t border-border">
                        <td className="px-3 py-2 font-medium text-foreground">{d.name}</td>
                        <td className="px-3 py-2 text-right text-foreground">{d.count}</td>
                        <td className="px-3 py-2 text-right text-foreground">
                          {(d.minutes / 60).toFixed(1)} h
                        </td>
                        <td className="px-3 py-2 text-right text-muted-foreground">
                          {d.noShowRate.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                    {byDoctor.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                          Keine Daten
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Letzte Termine</CardTitle>
              <CardDescription>Aktuellste Einträge im Filter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Datum</th>
                      <th className="px-3 py-2">Behandlung</th>
                      <th className="px-3 py-2">Arzt</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...filtered]
                      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
                      .slice(0, 8)
                      .map((a) => (
                        <tr key={a.termin_id} className="border-t border-border">
                          <td className="px-3 py-2 text-foreground">
                            {a.dateObj.toLocaleDateString("de-DE", {
                              day: "2-digit",
                              month: "2-digit",
                            })}{" "}
                            <span className="text-muted-foreground">
                              {a.dateObj.toLocaleTimeString("de-DE", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-foreground">{a.behandlungsart}</td>
                          <td className="px-3 py-2 text-muted-foreground">{a.arzt}</td>
                          <td className="px-3 py-2">
                            <StatusPill status={a.status} />
                          </td>
                        </tr>
                      ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                          Keine Termine im aktuellen Filter
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function KpiCard({
  label,
  value,
  secondary,
  icon,
  accent,
  compactValue,
  trend,
  spark,
  alert,
}: {
  label: string;
  value: string;
  secondary?: string;
  icon: React.ReactNode;
  accent: "blue" | "rose" | "emerald" | "amber" | "indigo";
  compactValue?: boolean;
  trend?:
    | (Trend & { suffix?: string; goodWhen: "up" | "down"; asAbsolute?: boolean })
    | null;
  spark?: number[];
  alert?: boolean;
}) {
  const accentMap = {
    blue: { chip: "bg-blue-50 text-blue-600", label: "text-blue-600", spark: "#3b82f6", border: "border-blue-100", alert: "border-b-4 border-b-blue-500" },
    rose: { chip: "bg-rose-50 text-rose-600", label: "text-rose-600", spark: "#f43f5e", border: "border-rose-100", alert: "border-b-4 border-b-rose-500" },
    emerald: { chip: "bg-emerald-50 text-emerald-600", label: "text-emerald-600", spark: "#10b981", border: "border-emerald-100", alert: "border-b-4 border-b-emerald-500" },
    amber: { chip: "bg-amber-50 text-amber-600", label: "text-amber-600", spark: "#f59e0b", border: "border-amber-100", alert: "border-b-4 border-b-amber-500" },
    indigo: { chip: "bg-indigo-50 text-indigo-600", label: "text-indigo-600", spark: "#6366f1", border: "border-indigo-100", alert: "border-b-4 border-b-indigo-500" },
  }[accent];

  const trendChip = trend ? renderTrendChip(trend) : null;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border bg-card p-5 shadow-sm transition-all hover:shadow-md ${accentMap.border} ${
        alert ? accentMap.alert : ""
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className={`text-[11px] font-bold uppercase tracking-wider ${accentMap.label}`}>
          {label}
        </span>
        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${accentMap.chip}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={`font-extrabold tracking-tight text-foreground ${
              compactValue ? "truncate text-xl leading-tight" : "text-3xl"
            }`}
            title={compactValue ? value : undefined}
          >
            {value}
          </h3>
          {secondary && (
            <p className="mt-1 truncate text-xs font-medium text-muted-foreground">{secondary}</p>
          )}
          {trendChip}
        </div>
        {spark && spark.length > 1 && !compactValue && (
          <Sparkline values={spark} color={accentMap.spark} />
        )}
      </div>
      {spark && spark.length > 1 && compactValue && (
        <div className="mt-3 -mx-1">
          <Sparkline values={spark} color={accentMap.spark} wide />
        </div>
      )}
    </div>
  );
}

function renderTrendChip(
  trend: Trend & { suffix?: string; goodWhen: "up" | "down"; asAbsolute?: boolean },
) {
  const up = trend.deltaAbs >= 0;
  const good = (up && trend.goodWhen === "up") || (!up && trend.goodWhen === "down");
  const cls = good ? "text-emerald-600" : "text-rose-600";
  const arrow = up ? "▲" : "▼";
  const val = trend.asAbsolute
    ? `${Math.abs(trend.deltaAbs).toFixed(1)}${trend.suffix ?? ""}`
    : `${Math.abs(trend.deltaPct).toFixed(1)}%`;
  return (
    <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${cls}`}>
      <span>{arrow}</span>
      <span>{val}</span>
      <span className="font-normal text-muted-foreground">vs. 1. Hälfte</span>
    </div>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 96;
  const h = 36;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const pts = values.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = `M ${pts.join(" L ")}`;
  const area = `${line} L ${w},${h} L 0,${h} Z`;
  const gradId = `g-${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-24 shrink-0">
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusPill({ status }: { status: NormStatus }) {
  const map: Record<NormStatus, string> = {
    wahrgenommen: "bg-success/15 text-success",
    no_show: "bg-destructive/15 text-destructive",
    abgesagt: "bg-warning/20 text-warning",
    unbekannt: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${map[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
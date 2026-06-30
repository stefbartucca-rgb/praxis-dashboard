import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, CalendarCheck, TrendingDown, UserX } from "lucide-react";
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
  computeKpis,
  groupByStatus,
  groupByTreatment,
  groupByWeekday,
  STATUS_DE,
  type Appointment,
} from "@/lib/appointments";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Praxis Dashboard — Terminanalyse" },
      { name: "description", content: "Übersicht über Termine, No-Show-Quote und Behandlungsarten der Arztpraxis." },
      { property: "og:title", content: "Praxis Dashboard" },
      { property: "og:description", content: "Terminanalyse-Dashboard für Arztpraxen." },
    ],
  }),
  component: Index,
});

function Index() {
  const [data, setData] = useState<Appointment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<string>("all");
  const [treatment, setTreatment] = useState<string>("all");

  useEffect(() => {
    fetch("/appointments.json")
      .then((r) => {
        if (!r.ok) throw new Error("Fehler beim Laden");
        return r.json();
      })
      .then((d: Appointment[]) => setData(d))
      .catch((e: Error) => setError(e.message));
  }, []);

  const doctors = useMemo(
    () => (data ? Array.from(new Set(data.map((a) => a.doctor))).sort() : []),
    [data],
  );
  const treatments = useMemo(
    () => (data ? Array.from(new Set(data.map((a) => a.treatment))).sort() : []),
    [data],
  );

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter(
      (a) =>
        (doctor === "all" || a.doctor === doctor) &&
        (treatment === "all" || a.treatment === treatment),
    );
  }, [data, doctor, treatment]);

  const kpis = useMemo(() => computeKpis(filtered), [filtered]);
  const byWeekday = useMemo(() => groupByWeekday(filtered), [filtered]);
  const byTreatment = useMemo(() => groupByTreatment(filtered), [filtered]);
  const byStatus = useMemo(() => groupByStatus(filtered), [filtered]);

  const statusColors: Record<string, string> = {
    completed: "var(--color-success)",
    no_show: "var(--color-destructive)",
    cancelled: "var(--color-warning)",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Activity className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Praxis Dashboard
              </h1>
              <p className="truncate text-sm text-muted-foreground">
                Terminanalyse &amp; Auslastung
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="self-start sm:self-auto">
            {filtered.length} Termine im Zeitraum
          </Badge>
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
                <SelectItem key={d} value={d}>{d}</SelectItem>
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
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Gesamttermine"
            value={kpis.total.toString()}
            hint="Im aktuellen Filter"
            icon={<CalendarCheck className="h-5 w-5" />}
            tone="primary"
          />
          <KpiCard
            label="Abgeschlossen"
            value={`${kpis.completionRate.toFixed(1)}%`}
            hint={`${kpis.completed} Termine`}
            icon={<Activity className="h-5 w-5" />}
            tone="success"
          />
          <KpiCard
            label="No-Show-Quote"
            value={`${kpis.noShowRate.toFixed(1)}%`}
            hint={`${kpis.noShows} verpasste Termine`}
            icon={<UserX className="h-5 w-5" />}
            tone="destructive"
          />
          <KpiCard
            label="Stornierungen"
            value={kpis.cancelled.toString()}
            hint="Im aktuellen Filter"
            icon={<TrendingDown className="h-5 w-5" />}
            tone="warning"
          />
        </div>

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Termine pro Wochentag</CardTitle>
              <CardDescription>Verteilung der Termine über die Woche</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byWeekday} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
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
              <CardDescription>Abgeschlossen vs. No-Show vs. Storno</CardDescription>
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
                        <Cell key={entry.status} fill={statusColors[entry.status]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Häufigste Behandlungsarten</CardTitle>
              <CardDescription>Top-Behandlungen im Zeitraum</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byTreatment} layout="vertical" margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} width={110} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="value" fill="var(--color-accent)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .slice(0, 8)
                      .map((a) => (
                        <tr key={a.id} className="border-t border-border">
                          <td className="px-3 py-2 text-foreground">
                            {new Date(a.date).toLocaleDateString("de-DE", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-3 py-2 text-foreground">{a.treatment}</td>
                          <td className="px-3 py-2 text-muted-foreground">{a.doctor}</td>
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

function KpiCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: "primary" | "success" | "destructive" | "warning";
}) {
  const toneMap: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/15 text-warning",
  };
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          </div>
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${toneMap[tone]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }: { status: "completed" | "no_show" | "cancelled" }) {
  const map = {
    completed: "bg-success/15 text-success",
    no_show: "bg-destructive/15 text-destructive",
    cancelled: "bg-warning/20 text-warning",
  } as const;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${map[status]}`}>
      {STATUS_DE[status]}
    </span>
  );
}

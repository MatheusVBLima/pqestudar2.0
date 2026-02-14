import { useState, useMemo } from "react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";
import SeoAuditSection from "@/components/admin/SeoAuditSection";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Period = "day" | "week" | "month" | "year" | "all";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
  { value: "year", label: "Ano" },
  { value: "all", label: "Todo o histórico" },
];

function getRange(period: Period): { start_at: string; end_at: string } {
  const now = new Date();
  const end_at = now.toISOString();
  let start: Date;

  switch (period) {
    case "day": {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      break;
    }
    case "week":
      start = new Date(now.getTime() - 7 * 86400000);
      break;
    case "month":
      start = new Date(now.getTime() - 30 * 86400000);
      break;
    case "year":
      start = new Date(now.getTime() - 365 * 86400000);
      break;
    case "all":
    default:
      start = new Date("1970-01-01T00:00:00Z");
      break;
  }

  return { start_at: start.toISOString(), end_at };
}

export default function AdminAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: rolesLoading } = useUserRoles();
  const [period, setPeriod] = useState<Period>("week");

  const range = useMemo(() => getRange(period), [period]);

  const topTools = useQuery({
    queryKey: ["analytics_top_tools", range.start_at, range.end_at],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("analytics_top_tools", {
        start_at: range.start_at,
        end_at: range.end_at,
      });
      if (error) throw error;
      return data as { entity_id: string; tool_label: string; click_count: number }[];
    },
    enabled: isAdmin,
    staleTime: 0,
    refetchOnMount: true,
  });

  const avgRead = useQuery({
    queryKey: ["analytics_concurso_avg_read", range.start_at, range.end_at],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("analytics_concurso_avg_read", {
        start_at: range.start_at,
        end_at: range.end_at,
      });
      if (error) throw error;
      return data as { entity_id: string; concurso_label: string; avg_read_seconds: number; total_sessions: number }[];
    },
    enabled: isAdmin,
    staleTime: 0,
    refetchOnMount: true,
  });

  const eventCounts = useQuery({
    queryKey: ["analytics_concurso_event_counts", range.start_at, range.end_at],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("analytics_concurso_event_counts", {
        start_at: range.start_at,
        end_at: range.end_at,
      });
      if (error) throw error;
      return data as { entity_id: string; concurso_label: string; opens: number; edital_clicks: number; saves: number; shares: number }[];
    },
    enabled: isAdmin,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Guard: loading
  if (authLoading || rolesLoading) {
    return (
      <div className="container mx-auto py-12 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Guard: not admin → 404
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="container mx-auto py-10 px-4 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Insights</h1>
        </div>

        {/* Period filter */}
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Ferramentas */}
      <Section title="Top Ferramentas por Clique" loading={topTools.isLoading} empty={!topTools.data?.length}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ferramenta</TableHead>
              <TableHead className="text-right">Cliques</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topTools.data?.map((row) => (
              <TableRow key={row.entity_id}>
                <TableCell className="font-medium">{row.tool_label}</TableCell>
                <TableCell className="text-right">{row.click_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      {/* Concursos — Tempo de Leitura */}
      <Section title="Concursos — Tempo Médio de Leitura" loading={avgRead.isLoading} empty={!avgRead.data?.length}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concurso</TableHead>
              <TableHead className="text-right">Tempo médio (s)</TableHead>
              <TableHead className="text-right">Sessões</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {avgRead.data?.map((row) => (
              <TableRow key={row.entity_id}>
                <TableCell className="font-medium">{row.concurso_label}</TableCell>
                <TableCell className="text-right">{row.avg_read_seconds}</TableCell>
                <TableCell className="text-right">{row.total_sessions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      {/* Concursos — Eventos */}
      <Section title="Eventos por Concurso" loading={eventCounts.isLoading} empty={!eventCounts.data?.length}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concurso</TableHead>
              <TableHead className="text-right">Aberturas</TableHead>
              <TableHead className="text-right">Editais</TableHead>
              <TableHead className="text-right">Saves</TableHead>
              <TableHead className="text-right">Shares</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventCounts.data?.map((row) => (
              <TableRow key={row.entity_id}>
                <TableCell className="font-medium">{row.concurso_label}</TableCell>
                <TableCell className="text-right">{row.opens}</TableCell>
                <TableCell className="text-right">{row.edital_clicks}</TableCell>
                <TableCell className="text-right">{row.saves}</TableCell>
                <TableCell className="text-right">{row.shares}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
      {/* SEO Audit */}
      <SeoAuditSection />
    </main>
  );
}

function Section({
  title,
  loading,
  empty,
  children,
}: {
  title: string;
  loading: boolean;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="rounded-lg border bg-card">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : empty ? (
          <p className="p-6 text-sm text-muted-foreground">Nenhum dado encontrado para este período.</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

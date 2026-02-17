import { useState } from 'react';
import { PageHeader } from '@/components/admin/dashboard/PageHeader';
import { PeriodSelector, Period } from '@/components/admin/dashboard/PeriodSelector';
import { ChartCard } from '@/components/admin/dashboard/ChartCard';
import { DataTable } from '@/components/admin/dashboard/DataTable';
import { periodToRange } from '@/components/admin/dashboard/periodHelper';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AUDIT_TYPE = 'seo';

export default function InsightsSeoAudit() {
  const [period, setPeriod] = useState<Period>('all');
  const range = periodToRange(period);

  const { data: history } = useQuery({
    queryKey: ['insights-audit-history', AUDIT_TYPE, period],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('insights_audit_history', {
        p_audit_type: AUDIT_TYPE,
        start_at: range.start_at,
        end_at: range.end_at,
      });
      if (error) throw error;
      return (data as { run_id: string; run_date: string; avg_score: number; total_findings: number; status: string }[])?.map(r => ({
        ...r,
        label: format(new Date(r.run_date), 'dd/MM HH:mm', { locale: ptBR }),
      })) ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: issuesByCategory } = useQuery({
    queryKey: ['insights-audit-categories', AUDIT_TYPE],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('insights_audit_issues_by_category', {
        p_audit_type: AUDIT_TYPE,
      });
      if (error) throw error;
      return (data as { category: string; issue_count: number }[]) ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: findings } = useQuery({
    queryKey: ['insights-audit-findings', AUDIT_TYPE],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('insights_audit_latest_findings', {
        p_audit_type: AUDIT_TYPE,
      });
      if (error) throw error;
      return (data as { url: string; path: string; score: number; issue_count: number; run_date: string }[]) ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const scoreChart = history?.filter(h => h.status === 'completed').reverse() ?? [];
  const tableRows = findings?.map(f => ({
    url: f.path,
    score: String(f.score),
    issues: String(f.issue_count),
    date: format(new Date(f.run_date), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="SEO Audit"
        description="Resultados das auditorias de SEO por rota"
        actions={<PeriodSelector value={period} onChange={setPeriod} />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Score médio por execução" description="Histórico de auditorias">
          {scoreChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={scoreChart} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: 12 }} />
                <Line type="monotone" dataKey="avg_score" name="Score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : undefined}
        </ChartCard>
        <ChartCard title="Issues por categoria" description="crawlability, indexation, technical, on-page">
          {issuesByCategory && issuesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={issuesByCategory} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: 12 }} />
                <Bar dataKey="issue_count" name="Issues" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : undefined}
        </ChartCard>
      </div>

      <DataTable
        title="Última auditoria — Findings por URL"
        columns={[
          { key: 'url', label: 'URL' },
          { key: 'score', label: 'Score' },
          { key: 'issues', label: 'Issues' },
          { key: 'date', label: 'Data' },
        ]}
        rows={tableRows}
      />
    </div>
  );
}

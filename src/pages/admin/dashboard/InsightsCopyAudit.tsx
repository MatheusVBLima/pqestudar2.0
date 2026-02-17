import { useState } from 'react';
import { PageHeader } from '@/components/admin/dashboard/PageHeader';
import { PeriodSelector, Period } from '@/components/admin/dashboard/PeriodSelector';
import { ChartCard } from '@/components/admin/dashboard/ChartCard';
import { DataTable } from '@/components/admin/dashboard/DataTable';

export default function InsightsCopyAudit() {
  const [period, setPeriod] = useState<Period>('all');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Copy Audit"
        description="Resultados das auditorias de copywriting por rota"
        actions={<PeriodSelector value={period} onChange={setPeriod} />}
      />

      {/* TODO: Conectar dados reais via Supabase (insights_audit_runs + insights_audit_findings com audit_type='copywriting') */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Score médio por execução" description="Histórico de auditorias" />
        <ChartCard title="Issues por categoria" description="clarity, persuasion, tone, structure" />
      </div>

      <DataTable
        title="Última auditoria — Findings por URL"
        columns={[
          { key: 'url', label: 'URL' },
          { key: 'score', label: 'Score' },
          { key: 'issues', label: 'Issues' },
          { key: 'date', label: 'Data' },
        ]}
      />
    </div>
  );
}

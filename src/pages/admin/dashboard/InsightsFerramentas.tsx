import { useState } from 'react';
import { PageHeader } from '@/components/admin/dashboard/PageHeader';
import { PeriodSelector, Period } from '@/components/admin/dashboard/PeriodSelector';
import { ChartCard } from '@/components/admin/dashboard/ChartCard';
import { DataTable } from '@/components/admin/dashboard/DataTable';

export default function InsightsFerramentas() {
  const [period, setPeriod] = useState<Period>('month');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ferramentas"
        description="Métricas de uso e engajamento das ferramentas"
        actions={<PeriodSelector value={period} onChange={setPeriod} />}
      />

      {/* TODO: Conectar dados reais via Supabase (analytics_events com entity_type='tool') */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Cliques por ferramenta" description={`Período: ${period}`} />
        <ChartCard title="Ferramentas mais salvas" description={`Período: ${period}`} />
      </div>

      <DataTable
        title="Ranking de ferramentas"
        columns={[
          { key: 'name', label: 'Ferramenta' },
          { key: 'clicks', label: 'Cliques' },
          { key: 'saves', label: 'Salvamentos' },
          { key: 'outbound', label: 'Cliques outbound' },
        ]}
      />
    </div>
  );
}

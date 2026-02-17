import { useState } from 'react';
import { PageHeader } from '@/components/admin/dashboard/PageHeader';
import { PeriodSelector, Period } from '@/components/admin/dashboard/PeriodSelector';
import { ChartCard } from '@/components/admin/dashboard/ChartCard';
import { DataTable } from '@/components/admin/dashboard/DataTable';

export default function InsightsConcursosEventos() {
  const [period, setPeriod] = useState<Period>('month');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Concursos — Eventos"
        description="Salvamentos, compartilhamentos e cliques em editais"
        actions={<PeriodSelector value={period} onChange={setPeriod} />}
      />

      {/* TODO: Conectar dados reais via Supabase (analytics_events com event save/share/edital_click) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Eventos por tipo" description={`Período: ${period}`} />
        <ChartCard title="Tendência de salvamentos" description={`Período: ${period}`} />
      </div>

      <DataTable
        title="Concursos com mais interações"
        columns={[
          { key: 'title', label: 'Concurso' },
          { key: 'saves', label: 'Salvamentos' },
          { key: 'shares', label: 'Compartilhamentos' },
          { key: 'editalClicks', label: 'Cliques edital' },
        ]}
      />
    </div>
  );
}

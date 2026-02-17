import { useState } from 'react';
import { PageHeader } from '@/components/admin/dashboard/PageHeader';
import { PeriodSelector, Period } from '@/components/admin/dashboard/PeriodSelector';
import { ChartCard } from '@/components/admin/dashboard/ChartCard';
import { DataTable } from '@/components/admin/dashboard/DataTable';

export default function InsightsConcursosLeitura() {
  const [period, setPeriod] = useState<Period>('month');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Concursos — Leitura"
        description="Tempo de leitura e profundidade de rolagem por concurso"
        actions={<PeriodSelector value={period} onChange={setPeriod} />}
      />

      {/* TODO: Conectar dados reais via Supabase (analytics_events com event heartbeat/scroll) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Tempo médio de leitura" description={`Período: ${period}`} />
        <ChartCard title="Profundidade de rolagem" description={`Período: ${period}`} />
      </div>

      <DataTable
        title="Ranking por tempo de leitura"
        columns={[
          { key: 'title', label: 'Concurso' },
          { key: 'avgTime', label: 'Tempo médio' },
          { key: 'scrollDepth', label: 'Scroll médio' },
          { key: 'views', label: 'Visualizações' },
        ]}
      />
    </div>
  );
}

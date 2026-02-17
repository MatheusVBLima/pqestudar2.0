import { Users, Wrench, BookOpen, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/admin/dashboard/PageHeader';
import { StatCard } from '@/components/admin/dashboard/StatCard';
import { ChartCard } from '@/components/admin/dashboard/ChartCard';
import { DataTable } from '@/components/admin/dashboard/DataTable';

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description="Visão geral do painel administrativo" />

      {/* TODO: Conectar dados reais via Supabase (analytics_events, tools, courses, oportunidades) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Visitantes (30d)" value="—" icon={Users} description="Placeholder" />
        <StatCard title="Ferramentas ativas" value="—" icon={Wrench} description="Placeholder" />
        <StatCard title="Concursos publicados" value="—" icon={BookOpen} description="Placeholder" />
        <StatCard title="Taxa de cliques" value="—" icon={TrendingUp} description="Placeholder" />
      </div>

      <ChartCard title="Visitantes" description="Total nos últimos 30 dias" />

      <DataTable
        title="Atividade recente"
        columns={[
          { key: 'event', label: 'Evento' },
          { key: 'entity', label: 'Entidade' },
          { key: 'date', label: 'Data' },
        ]}
      />
    </div>
  );
}

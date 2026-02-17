import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, Wrench, BookOpen, MousePointerClick, Search, FileText,
  Crown, Package, CalendarDays, Users, Ticket, ChevronDown,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const insightsItems = [
  { title: 'Ferramentas', href: '/admin/insights/ferramentas', icon: Wrench },
  { title: 'Concursos — Leitura', href: '/admin/insights/concursos-leitura', icon: BookOpen },
  { title: 'Concursos — Eventos', href: '/admin/insights/concursos-eventos', icon: MousePointerClick },
  { title: 'SEO Audit', href: '/admin/insights/seo-audit', icon: Search },
  { title: 'Copy Audit', href: '/admin/insights/copy-audit', icon: FileText },
];

const premiumItems = [
  { title: 'Itens Premium', href: '/admin/premium/itens', icon: Package },
  { title: 'Atualizações Semanais', href: '/admin/premium/atualizacoes', icon: CalendarDays },
  { title: 'Usuários & Assinaturas', href: '/admin/premium/usuarios', icon: Users },
  { title: 'Tokens de Resgate', href: '/admin/premium/tokens', icon: Ticket },
];

export function AdminSidebar() {
  const { pathname } = useLocation();
  const isActive = (href: string) => pathname === href;
  const isInsightsOpen = pathname.startsWith('/admin/insights');
  const isPremiumOpen = pathname.startsWith('/admin/premium');

  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarHeader className="p-4 border-b">
        <Link to="/admin" className="flex items-center gap-2 font-bold text-lg">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <span className="group-data-[collapsible=icon]:hidden">PqEstudar Admin</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Overview */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                  <Link to="/admin">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Insights */}
        <SidebarGroup>
          <Collapsible defaultOpen={isInsightsOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="group-data-[collapsible=icon]:hidden">Insights</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[collapsible=icon]:hidden [[data-state=open]>&]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {insightsItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive(item.href)}>
                        <Link to={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Curadorias */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/curadorias')}>
                  <Link to="/admin/curadorias">
                    <BookOpen className="h-4 w-4" />
                    <span>Curadorias</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Premium */}
        <SidebarGroup>
          <Collapsible defaultOpen={isPremiumOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
              <div className="flex items-center gap-2">
                <Crown className="h-3.5 w-3.5" />
                <span className="group-data-[collapsible=icon]:hidden">Admin Premium</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[collapsible=icon]:hidden [[data-state=open]>&]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {premiumItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive(item.href)}>
                        <Link to={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

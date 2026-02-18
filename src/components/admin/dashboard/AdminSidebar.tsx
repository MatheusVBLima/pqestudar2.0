import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, Wrench, BookOpen, MousePointerClick, Search, FileText,
  Crown, Package, CalendarDays, Users, Ticket, ChevronDown,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
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
  const isInsightsActive = pathname.startsWith('/admin/insights');
  const isPremiumActive = pathname.startsWith('/admin/premium');

  return (
    <Sidebar className="border-none bg-transparent" collapsible="icon" data-slot="admin-sidebar">
      <SidebarHeader className="p-4 border-b">
        <Link to="/admin" className="flex items-center gap-2 font-bold text-lg">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <span className="group-data-[collapsible=icon]:hidden">PqEstudar Admin</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {/* Overview */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/admin'}
                  className={cn(
                    'rounded-[1.2rem] font-medium',
                    pathname === '/admin' && 'bg-primary/10 text-primary font-semibold'
                  )}
                >
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
          <Collapsible defaultOpen={isInsightsActive}>
            <CollapsibleTrigger
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-sm rounded-[1.2rem] transition-colors',
                'hover:bg-muted',
                isInsightsActive
                  ? 'font-semibold text-foreground'
                  : 'font-medium text-muted-foreground'
              )}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className={cn('h-4 w-4', isInsightsActive && 'text-primary')} />
                <span className="group-data-[collapsible=icon]:hidden">Insights</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[collapsible=icon]:hidden [[data-state=open]>&]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="mt-1">
                  {insightsItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          className={cn(
                            'rounded-[1.2rem] pl-9 text-sm',
                            active
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-muted-foreground font-normal hover:text-foreground'
                          )}
                        >
                          <Link to={item.href}>
                            <item.icon className={cn('h-3.5 w-3.5', active ? 'text-primary' : 'text-muted-foreground')} />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
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
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith('/admin/curadorias')}
                  className={cn(
                    'rounded-[1.2rem] font-medium',
                    pathname.startsWith('/admin/curadorias') && 'bg-primary/10 text-primary font-semibold'
                  )}
                >
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
          <Collapsible defaultOpen={isPremiumActive}>
            <CollapsibleTrigger
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-sm rounded-[1.2rem] transition-colors',
                'hover:bg-muted',
                isPremiumActive
                  ? 'font-semibold text-foreground'
                  : 'font-medium text-muted-foreground'
              )}
            >
              <div className="flex items-center gap-2">
                <Crown className={cn('h-4 w-4', isPremiumActive && 'text-primary')} />
                <span className="group-data-[collapsible=icon]:hidden">Admin Premium</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[collapsible=icon]:hidden [[data-state=open]>&]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="mt-1">
                  {premiumItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          className={cn(
                            'rounded-[1.2rem] pl-9 text-sm',
                            active
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-muted-foreground font-normal hover:text-foreground'
                          )}
                        >
                          <Link to={item.href}>
                            <item.icon className={cn('h-3.5 w-3.5', active ? 'text-primary' : 'text-muted-foreground')} />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

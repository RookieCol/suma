import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, Users, Wallet, ShieldCheck, LogOut, BarChart2, ChevronDown, TrendingUp, PieChart, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { signOut } from '../../api/auth';
import { useSummary } from '../../hooks/useDashboard';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';

const REPORTS_SUB = [
  { to: '/reports/portfolio', label: 'Cartera',  Icon: PieChart       },
  { to: '/reports/collection',   label: 'Cobro',    Icon: TrendingUp     },
  { to: '/reports/risk',  label: 'Riesgo',   Icon: AlertTriangle  },
];

const NAV = [
  { to: '/dashboard',  label: 'Resumen',  Icon: LayoutDashboard },
  { to: '/portfolio',  label: 'Cartera',  Icon: Wallet           },
  { to: '/customers', label: 'Clientes', Icon: Users             },
  { to: '/users', label: 'Usuarios', Icon: ShieldCheck, allowedRoles: ['admin'] as string[] },
];

export function AppSidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: summary } = useSummary();

  const isReportsActive = pathname.startsWith('/reports');
  const [reportsOpen, setReportsOpen] = useState(isReportsActive);

  useEffect(() => {
    if (isReportsActive) setReportsOpen(true);
  }, [isReportsActive]);

  const items = NAV.filter(t => !t.allowedRoles || t.allowedRoles.includes(user?.role ?? ''));

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?';

  async function handleLogout() {
    await signOut();
    logout();
    navigate('/login');
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <span className="cursor-default">
                <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
                  <span className="text-[10px] font-bold">C</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Suma</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">Panel de gestión</span>
                </div>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>

              {/* Resumen */}
              <SidebarMenuItem>
                <NavLink to="/dashboard">
                  {({ isActive }) => (
                    <SidebarMenuButton isActive={isActive} tooltip="Resumen">
                      <LayoutDashboard className="size-4 shrink-0" />
                      <span>Resumen</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>

              {/* Reportes — collapsible */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isReportsActive}
                  tooltip="Reportes"
                  onClick={() => setReportsOpen(o => !o)}
                  className="cursor-pointer"
                >
                  <BarChart2 className="size-4 shrink-0" />
                  <span>Reportes</span>
                  <ChevronDown
                    className={`ml-auto size-3.5 shrink-0 text-sidebar-foreground/50 transition-transform duration-200 ${reportsOpen ? 'rotate-180' : ''}`}
                  />
                </SidebarMenuButton>
                {reportsOpen && (
                  <SidebarMenuSub>
                    {REPORTS_SUB.map(({ to, label, Icon }) => (
                      <SidebarMenuSubItem key={to}>
                        <NavLink to={to}>
                          {({ isActive }) => (
                            <SidebarMenuSubButton isActive={isActive}>
                              <Icon className="size-3.5 shrink-0" />
                              <span>{label}</span>
                            </SidebarMenuSubButton>
                          )}
                        </NavLink>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* Rest of nav items */}
              {items.map(({ to, label, Icon }) => (
                <SidebarMenuItem key={to}>
                  <NavLink to={to}>
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive} tooltip={label}>
                        <Icon className="size-4 shrink-0" />
                        <span>{label}</span>
                        {to === '/portfolio' && summary?.customersWithDebt ? (
                          <span className="ml-auto text-[10px] font-mono tabular-nums text-sidebar-foreground/60">
                            {summary.customersWithDebt}
                          </span>
                        ) : null}
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <NavLink to="/profile">
              {({ isActive }) => (
                <SidebarMenuButton size="lg" isActive={isActive} className="h-auto py-2" tooltip="Mi perfil">
                  <div className="flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground shrink-0 text-xs font-semibold">
                    {initials}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.name ?? ''}</span>
                    <span className="truncate text-xs capitalize text-sidebar-foreground/60">{user?.role ?? ''}</span>
                  </div>
                </SidebarMenuButton>
              )}
            </NavLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Cerrar sesión"
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
            >
              <LogOut className="size-4 shrink-0" />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

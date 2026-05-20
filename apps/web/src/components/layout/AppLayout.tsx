import { useLocation, Link } from 'react-router';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const PAGE_LABELS: Record<string, string> = {
  '/dashboard':          'Resumen',
  '/portfolio':          'Cartera',
  '/customers':         'Clientes',
  '/users':         'Usuarios',
  '/reports/portfolio': 'Cartera',
  '/reports/collection':   'Cobro',
  '/reports/risk':  'Riesgo',
  '/profile':       'Mi perfil',
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  const isReportesSub = pathname.startsWith('/reports/');
  const subLabel = PAGE_LABELS[pathname];
  const topLabel = isReportesSub ? undefined : (PAGE_LABELS[pathname] ?? 'Dashboard');

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {isReportesSub ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/reports/portfolio" className="text-ink-3 hover:text-ink transition-colors">Reportes</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{subLabel}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage>{topLabel}</BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

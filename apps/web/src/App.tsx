import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useAuthStore } from './store/auth.store';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage }        from './pages/LoginPage';
import { DashboardPage }      from './pages/DashboardPage';
import { PortfolioReport }  from './pages/PortfolioReport';
import { CollectionReport }    from './pages/CollectionReport';
import { RiskReport }   from './pages/RiskReport';
import { PortfolioPage }      from './pages/PortfolioPage';
import { CustomersPage }     from './pages/CustomersPage';
import { UsersPage }     from './pages/UsersPage';
import { ProfilePage }   from './pages/ProfilePage';

function ProtectedRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"           element={<DashboardPage />} />
        <Route path="reports"          element={<Navigate to="/reports/portfolio" replace />} />
        <Route path="reports/portfolio"  element={<PortfolioReport />} />
        <Route path="reports/collection"    element={<CollectionReport />} />
        <Route path="reports/risk"   element={<RiskReport />} />
        <Route path="portfolio"           element={<PortfolioPage />} />
        <Route path="customers"          element={<CustomersPage />} />
        <Route path="users"          element={<UsersPage />} />
        <Route path="profile"        element={<ProfilePage />} />
      </Routes>
    </AppLayout>
  );
}

export function App() {
  const token = useAuthStore(s => s.token);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/*"     element={token ? <ProtectedRoutes /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

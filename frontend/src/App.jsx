import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import LoginPage from './pages/LoginPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import ToolsPage from './pages/admin/ToolsPage';
import LoansPage from './pages/admin/LoansPage';
import ActivityLogsPage from './pages/admin/ActivityLogsPage';

// Petugas
import PetugasDashboard from './pages/petugas/PetugasDashboard';
import ApprovalPage from './pages/petugas/ApprovalPage';
import ReturnsPage from './pages/petugas/ReturnsPage';
import ReportsPage from './pages/petugas/ReportsPage';

// Peminjam
import PeminjamDashboard from './pages/peminjam/PeminjamDashboard';
import CatalogPage from './pages/peminjam/CatalogPage';
import MyLoansPage from './pages/peminjam/MyLoansPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/categories" element={<CategoriesPage />} />
              <Route path="/admin/tools" element={<ToolsPage />} />
              <Route path="/admin/loans" element={<LoansPage />} />
              <Route path="/admin/activity-logs" element={<ActivityLogsPage />} />
            </Route>
          </Route>

          {/* Petugas Routes */}
          <Route element={<ProtectedRoute roles={['petugas']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/petugas" element={<PetugasDashboard />} />
              <Route path="/petugas/approval" element={<ApprovalPage />} />
              <Route path="/petugas/returns" element={<ReturnsPage />} />
              <Route path="/petugas/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {/* Peminjam Routes */}
          <Route element={<ProtectedRoute roles={['peminjam']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/peminjam" element={<PeminjamDashboard />} />
              <Route path="/peminjam/catalog" element={<CatalogPage />} />
              <Route path="/peminjam/loans" element={<MyLoansPage />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

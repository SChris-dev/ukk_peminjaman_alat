import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard, Users, FolderOpen, Wrench, FileText,
    ClipboardList, CheckCircle, RotateCcw, BarChart3,
    PackageSearch, SendHorizontal, LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const navByRole = {
    admin: [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/admin/users', icon: Users, label: 'Users' },
        { to: '/admin/categories', icon: FolderOpen, label: 'Kategori' },
        { to: '/admin/tools', icon: Wrench, label: 'Alat' },
        { to: '/admin/loans', icon: FileText, label: 'Peminjaman' },
        { to: '/admin/activity-logs', icon: ClipboardList, label: 'Log Aktivitas' },
    ],
    petugas: [
        { to: '/petugas', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/petugas/approval', icon: CheckCircle, label: 'Persetujuan' },
        { to: '/petugas/returns', icon: RotateCcw, label: 'Pengembalian' },
        { to: '/petugas/reports', icon: BarChart3, label: 'Laporan' },
    ],
    peminjam: [
        { to: '/peminjam', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/peminjam/catalog', icon: PackageSearch, label: 'Katalog Alat' },
        { to: '/peminjam/loans', icon: SendHorizontal, label: 'Peminjaman Saya' },
    ],
};

const roleLabels = { admin: 'Administrator', petugas: 'Petugas', peminjam: 'Peminjam' };

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const nav = navByRole[user?.role] || [];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const linkClasses = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors ${isActive
            ? 'bg-primary-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <Wrench className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-slate-800 text-sm">PeminjamanAlat</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {nav.map(({ to, icon: Icon, label, end }) => (
                        <NavLink key={to} to={to} end={end} className={linkClasses} onClick={() => setSidebarOpen(false)}>
                            <Icon className="w-[18px] h-[18px]" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary-700">{user?.username?.[0]?.toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{user?.username}</p>
                            <p className="text-xs text-slate-400">{roleLabels[user?.role]}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-[18px] h-[18px]" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:ml-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-4 lg:px-6">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-3 text-slate-500 hover:text-slate-700">
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="hidden sm:inline">{user?.email}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                            {roleLabels[user?.role]}
                        </span>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

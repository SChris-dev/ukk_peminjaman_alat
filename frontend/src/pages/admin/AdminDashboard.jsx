import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Users, Wrench, FileText, FolderOpen } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, tools: 0, categories: 0, loans: 0 });

    useEffect(() => {
        Promise.all([
            api.get('/admin/users?per_page=1'),
            api.get('/admin/tools?per_page=1'),
            api.get('/admin/categories?per_page=1'),
            api.get('/admin/loans?per_page=1'),
        ]).then(([u, t, c, l]) => {
            setStats({ users: u.data.total, tools: t.data.total, categories: c.data.total, loans: l.data.total });
        }).catch(() => { });
    }, []);

    const cards = [
        { label: 'Total Users', value: stats.users, icon: Users, color: 'bg-primary-50 text-primary-600' },
        { label: 'Total Alat', value: stats.tools, icon: Wrench, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Kategori', value: stats.categories, icon: FolderOpen, color: 'bg-amber-50 text-amber-600' },
        { label: 'Peminjaman', value: stats.loans, icon: FileText, color: 'bg-violet-50 text-violet-600' },
    ];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-lg font-semibold text-slate-800">Dashboard Admin</h1>
                <p className="text-sm text-slate-400 mt-0.5">Ringkasan data sistem</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((c) => (
                    <div key={c.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{c.label}</p>
                                <p className="text-2xl font-bold text-slate-800 mt-1">{c.value}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.color}`}>
                                <c.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { PackageSearch, SendHorizontal, CheckCircle } from 'lucide-react';

export default function PeminjamDashboard() {
    const [stats, setStats] = useState({ active: 0, pending: 0, returned: 0 });

    useEffect(() => {
        api.get('/peminjam/loans?per_page=100').then(res => {
            const loans = res.data.data;
            setStats({
                active: loans.filter(l => l.status === 'disetujui').length,
                pending: loans.filter(l => l.status === 'menunggu').length,
                returned: loans.filter(l => l.status === 'kembali').length,
            });
        }).catch(() => { });
    }, []);

    const cards = [
        { label: 'Menunggu Persetujuan', value: stats.pending, icon: SendHorizontal, color: 'bg-amber-50 text-amber-600' },
        { label: 'Sedang Dipinjam', value: stats.active, icon: PackageSearch, color: 'bg-primary-50 text-primary-600' },
        { label: 'Dikembalikan', value: stats.returned, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
    ];

    return (
        <div>
            <div className="mb-6"><h1 className="text-lg font-semibold text-slate-800">Dashboard Peminjam</h1><p className="text-sm text-slate-400 mt-0.5">Ringkasan peminjaman Anda</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {cards.map((c) => (
                    <div key={c.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <div className="flex items-center justify-between">
                            <div><p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{c.label}</p><p className="text-2xl font-bold text-slate-800 mt-1">{c.value}</p></div>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.color}`}><c.icon className="w-5 h-5" /></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Clock, CheckCircle, RotateCcw, XCircle } from 'lucide-react';

export default function PetugasDashboard() {
    const [stats, setStats] = useState({ pending: 0, approved: 0, returned: 0, rejected: 0 });

    useEffect(() => {
        Promise.all([
            api.get('/petugas/loans/pending?per_page=1').catch(() => ({ data: { total: 0 } })),
            api.get('/petugas/returns/active?per_page=1').catch(() => ({ data: { total: 0 } })),
            api.get('/petugas/reports?status=kembali').catch(() => ({ data: { summary: { total_returned: 0 } } })),
            api.get('/petugas/reports?status=ditolak').catch(() => ({ data: { summary: { total_rejected: 0 } } })),
        ]).then(([p, a, r, rej]) => {
            setStats({ pending: p.data.total || 0, approved: a.data.total || 0, returned: r.data.summary?.total_returned || 0, rejected: rej.data.summary?.total_rejected || 0 });
        });
    }, []);

    const cards = [
        { label: 'Menunggu Persetujuan', value: stats.pending, icon: Clock, color: 'bg-amber-50 text-amber-600' },
        { label: 'Dipinjam (Aktif)', value: stats.approved, icon: CheckCircle, color: 'bg-primary-50 text-primary-600' },
        { label: 'Dikembalikan', value: stats.returned, icon: RotateCcw, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Ditolak', value: stats.rejected, icon: XCircle, color: 'bg-red-50 text-red-600' },
    ];

    return (
        <div>
            <div className="mb-6"><h1 className="text-lg font-semibold text-slate-800">Dashboard Petugas</h1><p className="text-sm text-slate-400 mt-0.5">Ringkasan peminjaman & pengembalian</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

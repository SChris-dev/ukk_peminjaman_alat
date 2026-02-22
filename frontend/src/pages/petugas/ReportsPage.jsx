import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Printer, FileText } from 'lucide-react';

const statusBadge = (s) => {
    const styles = { menunggu: 'bg-amber-50 text-amber-700 border-amber-200', disetujui: 'bg-emerald-50 text-emerald-700 border-emerald-200', ditolak: 'bg-red-50 text-red-700 border-red-200', kembali: 'bg-slate-100 text-slate-600 border-slate-200' };
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${styles[s]}`}>{s}</span>;
};

export default function ReportsPage() {
    const [loans, setLoans] = useState([]);
    const [summary, setSummary] = useState({});
    const [filters, setFilters] = useState({ status: '', start_date: '', end_date: '' });

    const fetchReport = async () => {
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date) params.end_date = filters.end_date;
            const res = await api.get('/petugas/reports', { params });
            setLoans(res.data.loans); setSummary(res.data.summary);
        } catch { }
    };

    useEffect(() => { fetchReport(); }, []);

    const handlePrint = () => window.print();

    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
                <div><h1 className="text-lg font-semibold text-slate-800">Laporan Peminjaman</h1><p className="text-sm text-slate-400 mt-0.5">Generate dan cetak laporan</p></div>
                <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors print:hidden">
                    <Printer className="w-4 h-4" />Cetak
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4 print:hidden">
                <div className="flex flex-wrap gap-3 items-end">
                    <div><label className="block text-xs font-medium text-slate-500 mb-1">Status</label><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"><option value="">Semua</option><option value="menunggu">Menunggu</option><option value="disetujui">Disetujui</option><option value="ditolak">Ditolak</option><option value="kembali">Kembali</option></select></div>
                    <div><label className="block text-xs font-medium text-slate-500 mb-1">Dari Tanggal</label><input type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
                    <div><label className="block text-xs font-medium text-slate-500 mb-1">Sampai Tanggal</label><input type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
                    <button onClick={fetchReport} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">Filter</button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                {[
                    { l: 'Total', v: summary.total_loans },
                    { l: 'Menunggu', v: summary.total_pending },
                    { l: 'Disetujui', v: summary.total_approved },
                    { l: 'Ditolak', v: summary.total_rejected },
                    { l: 'Kembali', v: summary.total_returned },
                    { l: 'Total Denda', v: `Rp ${Number(summary.total_denda || 0).toLocaleString('id-ID')}` },
                ].map(s => (
                    <div key={s.l} className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 text-center">
                        <p className="text-xs text-slate-400 uppercase tracking-wide">{s.l}</p>
                        <p className="text-lg font-bold text-slate-800 mt-0.5">{s.v ?? 0}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-slate-100 bg-slate-50/50">
                            {['#', 'Peminjam', 'Alat', 'Jml', 'Tgl Pinjam', 'Tgl Kembali', 'Status', 'Denda'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {loans.length > 0 ? loans.map(l => (
                                <tr key={l.id} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 text-slate-600">{l.id}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{l.user?.username}</td>
                                    <td className="px-4 py-3 text-slate-600">{l.tool?.name}</td>
                                    <td className="px-4 py-3 text-slate-600">{l.amount}</td>
                                    <td className="px-4 py-3 text-slate-600">{l.loan_date?.split('T')[0]}</td>
                                    <td className="px-4 py-3 text-slate-600">{l.return_date?.split('T')[0]}</td>
                                    <td className="px-4 py-3">{statusBadge(l.status)}</td>
                                    <td className="px-4 py-3">{l.denda > 0 ? <span className="text-red-600 font-medium">Rp {Number(l.denda).toLocaleString('id-ID')}</span> : '-'}</td>
                                </tr>
                            )) : <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">Tidak ada data.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

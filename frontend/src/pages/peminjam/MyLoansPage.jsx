import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/DataTable';
import { RotateCcw } from 'lucide-react';

const statusBadge = (s) => {
    const styles = { menunggu: 'bg-amber-50 text-amber-700 border-amber-200', disetujui: 'bg-emerald-50 text-emerald-700 border-emerald-200', ditolak: 'bg-red-50 text-red-700 border-red-200', kembali: 'bg-slate-100 text-slate-600 border-slate-200' };
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${styles[s]}`}>{s}</span>;
};

export default function MyLoansPage() {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState({});

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get('/peminjam/loans', { params: { page } });
            setData(res.data.data); setPagination(res.data);
        } catch { }
    }, [page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleReturn = async (loan) => {
        if (!confirm(`Ajukan pengembalian alat "${loan.tool?.name}"?`)) return;
        setLoading(p => ({ ...p, [loan.id]: true }));
        try {
            await api.patch(`/peminjam/loans/${loan.id}/return`);
            alert('Permintaan pengembalian telah dicatat. Silakan serahkan alat ke Petugas untuk konfirmasi.');
            fetchData();
        } catch (err) { alert(err.response?.data?.message || 'Terjadi kesalahan.'); }
        finally { setLoading(p => ({ ...p, [loan.id]: false })); }
    };

    const columns = [
        { header: '#', render: (r) => r.id },
        { header: 'Alat', render: (r) => <span className="font-medium text-slate-800">{r.tool?.name}</span> },
        { header: 'Jumlah', render: (r) => r.amount },
        { header: 'Tgl Pinjam', render: (r) => r.loan_date?.split('T')[0] },
        { header: 'Tgl Kembali', render: (r) => r.return_date?.split('T')[0] },
        { header: 'Status', render: (r) => statusBadge(r.status) },
        { header: 'Denda', render: (r) => r.denda > 0 ? <span className="text-red-600 font-medium">Rp {Number(r.denda).toLocaleString('id-ID')}</span> : '-' },
        {
            header: 'Aksi', render: (r) => r.status === 'disetujui' ? (
                <button onClick={() => handleReturn(r)} disabled={loading[r.id]} className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" />{loading[r.id] ? '...' : 'Kembalikan'}
                </button>
            ) : null
        },
    ];

    return (
        <div>
            <div className="mb-6"><h1 className="text-lg font-semibold text-slate-800">Peminjaman Saya</h1><p className="text-sm text-slate-400 mt-0.5">Riwayat dan status peminjaman Anda</p></div>
            <DataTable columns={columns} data={data} pagination={pagination} onPageChange={setPage} emptyMessage="Belum ada data peminjaman." />
        </div>
    );
}

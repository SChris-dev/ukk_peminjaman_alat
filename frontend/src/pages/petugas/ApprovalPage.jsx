import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/DataTable';
import { Check, X } from 'lucide-react';

export default function ApprovalPage() {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState({});

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get('/petugas/loans/pending', { params: { search, page } });
            setData(res.data.data); setPagination(res.data);
        } catch { }
    }, [search, page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAction = async (loan, action) => {
        setLoading(p => ({ ...p, [loan.id]: action }));
        try {
            await api.patch(`/petugas/loans/${loan.id}/${action}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Terjadi kesalahan.');
        } finally { setLoading(p => ({ ...p, [loan.id]: null })); }
    };

    const columns = [
        { header: '#', render: (r) => r.id },
        { header: 'Peminjam', render: (r) => <span className="font-medium text-slate-800">{r.user?.username}</span> },
        { header: 'Alat', render: (r) => r.tool?.name },
        { header: 'Jumlah', render: (r) => r.amount },
        { header: 'Tgl Pinjam', render: (r) => r.loan_date?.split('T')[0] },
        { header: 'Tgl Kembali', render: (r) => r.return_date?.split('T')[0] },
        {
            header: 'Aksi', render: (r) => (
                <div className="flex gap-1.5">
                    <button onClick={() => handleAction(r, 'approve')} disabled={loading[r.id]} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                        <Check className="w-3.5 h-3.5" />{loading[r.id] === 'approve' ? '...' : 'Setuju'}
                    </button>
                    <button onClick={() => handleAction(r, 'reject')} disabled={loading[r.id]} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                        <X className="w-3.5 h-3.5" />{loading[r.id] === 'reject' ? '...' : 'Tolak'}
                    </button>
                </div>
            )
        },
    ];

    return (
        <div>
            <div className="mb-6"><h1 className="text-lg font-semibold text-slate-800">Persetujuan Peminjaman</h1><p className="text-sm text-slate-400 mt-0.5">Setujui atau tolak permintaan peminjaman</p></div>
            <DataTable columns={columns} data={data} pagination={pagination} onPageChange={setPage} searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Cari peminjam atau alat..." emptyMessage="Tidak ada permintaan menunggu." />
        </div>
    );
}

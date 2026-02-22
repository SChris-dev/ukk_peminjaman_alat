import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/DataTable';
import { Trash2 } from 'lucide-react';

const statusBadge = (s) => {
    const styles = { menunggu: 'bg-amber-50 text-amber-700 border-amber-200', disetujui: 'bg-emerald-50 text-emerald-700 border-emerald-200', ditolak: 'bg-red-50 text-red-700 border-red-200', kembali: 'bg-slate-100 text-slate-600 border-slate-200' };
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${styles[s]}`}>{s}</span>;
};

export default function LoansPage() {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get('/admin/loans', { params: { search, page } });
            setData(res.data.data); setPagination(res.data);
        } catch { }
    }, [search, page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async (loan) => {
        if (!confirm(`Hapus data peminjaman #${loan.id}?`)) return;
        try { await api.delete(`/admin/loans/${loan.id}`); fetchData(); } catch { }
    };

    const columns = [
        { header: '#', render: (r) => r.id },
        { header: 'Peminjam', render: (r) => <span className="font-medium text-slate-800">{r.user?.username || '-'}</span> },
        { header: 'Alat', render: (r) => r.tool?.name || '-' },
        { header: 'Jumlah', render: (r) => r.amount },
        { header: 'Tgl Pinjam', render: (r) => r.loan_date?.split('T')[0] || '-' },
        { header: 'Tgl Kembali', render: (r) => r.return_date?.split('T')[0] || '-' },
        { header: 'Status', render: (r) => statusBadge(r.status) },
        { header: 'Denda', render: (r) => r.denda > 0 ? <span className="text-red-600 font-medium">Rp {Number(r.denda).toLocaleString('id-ID')}</span> : <span className="text-slate-400">-</span> },
        {
            header: '', render: (r) => (
                <div className="flex gap-1 justify-end">
                    <button onClick={() => handleDelete(r)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
            ), cellClassName: 'text-right'
        },
    ];

    return (
        <div>
            <div className="mb-6"><h1 className="text-lg font-semibold text-slate-800">Data Peminjaman</h1><p className="text-sm text-slate-400 mt-0.5">Semua data transaksi peminjaman</p></div>
            <DataTable columns={columns} data={data} pagination={pagination} onPageChange={setPage} searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Cari peminjam atau alat..." />
        </div>
    );
}

import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/DataTable';
import { RotateCcw } from 'lucide-react';

export default function ReturnsPage() {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState({});

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get('/petugas/returns/active', { params: { search, page } });
            setData(res.data.data); setPagination(res.data);
        } catch { }
    }, [search, page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleConfirm = async (loan) => {
        if (!confirm(`Konfirmasi pengembalian alat "${loan.tool?.name}" oleh "${loan.user?.username}"?`)) return;
        setLoading(p => ({ ...p, [loan.id]: true }));
        try {
            const res = await api.patch(`/petugas/returns/${loan.id}/confirm`);
            const denda = res.data.denda;
            if (denda > 0) alert(`Pengembalian dikonfirmasi. Denda keterlambatan: Rp ${Number(denda).toLocaleString('id-ID')}`);
            fetchData();
        } catch (err) { alert(err.response?.data?.message || 'Terjadi kesalahan.'); }
        finally { setLoading(p => ({ ...p, [loan.id]: false })); }
    };

    const isLate = (returnDate) => new Date() > new Date(returnDate);

    const columns = [
        { header: '#', render: (r) => r.id },
        { header: 'Peminjam', render: (r) => <span className="font-medium text-slate-800">{r.user?.username}</span> },
        { header: 'Alat', render: (r) => r.tool?.name },
        { header: 'Jumlah', render: (r) => r.amount },
        {
            header: 'Tgl Kembali', render: (r) => {
                const late = isLate(r.return_date);
                return <span className={late ? 'text-red-600 font-medium' : 'text-slate-600'}>{r.return_date?.split('T')[0]}{late && ' (Terlambat)'}</span>;
            }
        },
        {
            header: 'Aksi', render: (r) => (
                <button onClick={() => handleConfirm(r)} disabled={loading[r.id]} className="flex items-center gap-1 px-2.5 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" />{loading[r.id] ? '...' : 'Konfirmasi Kembali'}
                </button>
            )
        },
    ];

    return (
        <div>
            <div className="mb-6"><h1 className="text-lg font-semibold text-slate-800">Monitoring Pengembalian</h1><p className="text-sm text-slate-400 mt-0.5">Konfirmasi pengembalian alat dan hitung denda</p></div>
            <DataTable columns={columns} data={data} pagination={pagination} onPageChange={setPage} searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Cari peminjam atau alat..." emptyMessage="Tidak ada peminjaman aktif." />
        </div>
    );
}

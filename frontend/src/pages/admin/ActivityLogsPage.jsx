import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/DataTable';

export default function ActivityLogsPage() {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get('/admin/activity-logs', { params: { search, page, per_page: 20 } });
            setData(res.data.data); setPagination(res.data);
        } catch { }
    }, [search, page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const columns = [
        { header: '#', render: (r) => r.id },
        { header: 'User', render: (r) => <span className="font-medium text-slate-800">{r.user?.username || '-'}</span> },
        { header: 'Aktivitas', render: (r) => <span className="text-slate-600">{r.activity}</span> },
        { header: 'Waktu', render: (r) => new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) },
    ];

    return (
        <div>
            <div className="mb-6"><h1 className="text-lg font-semibold text-slate-800">Log Aktivitas</h1><p className="text-sm text-slate-400 mt-0.5">Riwayat aktivitas pengguna sistem</p></div>
            <DataTable columns={columns} data={data} pagination={pagination} onPageChange={setPage} searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Cari aktivitas..." />
        </div>
    );
}

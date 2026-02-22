import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function CategoriesPage() {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState({ open: false, mode: 'create', category: null });
    const [form, setForm] = useState({ category_name: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get('/admin/categories', { params: { search, page } });
            setData(res.data.data);
            setPagination(res.data);
        } catch { }
    }, [search, page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openCreate = () => { setForm({ category_name: '' }); setError(''); setModal({ open: true, mode: 'create' }); };
    const openEdit = (cat) => { setForm({ category_name: cat.category_name }); setError(''); setModal({ open: true, mode: 'edit', category: cat }); };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true); setError('');
        try {
            if (modal.mode === 'create') await api.post('/admin/categories', form);
            else await api.put(`/admin/categories/${modal.category.id}`, form);
            setModal({ open: false }); fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Terjadi kesalahan.'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (cat) => {
        if (!confirm(`Hapus kategori "${cat.category_name}"?`)) return;
        try { await api.delete(`/admin/categories/${cat.id}`); fetchData(); } catch { }
    };

    const columns = [
        { header: '#', render: (r) => r.id },
        { header: 'Nama Kategori', render: (r) => <span className="font-medium text-slate-800">{r.category_name}</span> },
        { header: 'Jumlah Alat', render: (r) => <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{r.tools_count ?? 0}</span> },
        {
            header: '', render: (r) => (
                <div className="flex gap-1 justify-end">
                    <button onClick={() => openEdit(r)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-primary-600"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(r)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
            ), cellClassName: 'text-right'
        },
    ];

    return (
        <div>
            <div className="mb-6"><h1 className="text-lg font-semibold text-slate-800">Manajemen Kategori</h1><p className="text-sm text-slate-400 mt-0.5">Kelola kategori alat</p></div>
            <DataTable columns={columns} data={data} pagination={pagination} onPageChange={setPage} searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Cari kategori..."
                actions={<button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"><Plus className="w-4 h-4" />Tambah</button>}
            />
            <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'create' ? 'Tambah Kategori' : 'Edit Kategori'}>
                <form onSubmit={handleSave} className="space-y-4">
                    {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Nama Kategori</label><input value={form.category_name} onChange={(e) => setForm({ ...form, category_name: e.target.value })} required maxLength={50} className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" /></div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModal({ open: false })} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Batal</button>
                        <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">{saving ? 'Menyimpan...' : 'Simpan'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Plus, Pencil, Trash2, ImageIcon } from 'lucide-react';

export default function ToolsPage() {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState({ open: false, mode: 'create', tool: null });
    const [form, setForm] = useState({ category_id: '', name: '', description: '', stock: 0, gambar: null });
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get('/admin/tools', { params: { search, page } });
            setData(res.data.data); setPagination(res.data);
        } catch { }
    }, [search, page]);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { api.get('/admin/categories?per_page=100').then(r => setCategories(r.data.data)).catch(() => { }); }, []);

    const openCreate = () => { setForm({ category_id: categories[0]?.id || '', name: '', description: '', stock: 0, gambar: null }); setPreview(null); setError(''); setModal({ open: true, mode: 'create' }); };
    const openEdit = (tool) => { setForm({ category_id: tool.category_id, name: tool.name, description: tool.description, stock: tool.stock, gambar: null }); setPreview(tool.gambar ? `/storage/${tool.gambar}` : null); setError(''); setModal({ open: true, mode: 'edit', tool }); };

    const handleFile = (e) => {
        const file = e.target.files[0];
        setForm({ ...form, gambar: file });
        if (file) setPreview(URL.createObjectURL(file));
    };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true); setError('');
        try {
            const fd = new FormData();
            fd.append('category_id', form.category_id);
            fd.append('name', form.name);
            fd.append('description', form.description);
            fd.append('stock', form.stock);
            if (form.gambar) fd.append('gambar', form.gambar);

            if (modal.mode === 'create') {
                await api.post('/admin/tools', fd);
            } else {
                fd.append('_method', 'PUT');
                await api.post(`/admin/tools/${modal.tool.id}`, fd);
            }
            setModal({ open: false }); fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Terjadi kesalahan.'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (tool) => {
        if (!confirm(`Hapus alat "${tool.name}"?`)) return;
        try { await api.delete(`/admin/tools/${tool.id}`); fetchData(); } catch { }
    };

    const columns = [
        { header: '#', render: (r) => r.id },
        { header: 'Gambar', render: (r) => r.gambar ? <img src={`/storage/${r.gambar}`} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200" /> : <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-slate-300" /></div> },
        { header: 'Nama', render: (r) => <span className="font-medium text-slate-800">{r.name}</span> },
        { header: 'Kategori', render: (r) => <span className="text-slate-500">{r.category?.category_name || '-'}</span> },
        { header: 'Stok', render: (r) => <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{r.stock}</span> },
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
            <div className="mb-6"><h1 className="text-lg font-semibold text-slate-800">Manajemen Alat</h1><p className="text-sm text-slate-400 mt-0.5">Kelola data alat peminjaman</p></div>
            <DataTable columns={columns} data={data} pagination={pagination} onPageChange={setPage} searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Cari alat..."
                actions={<button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"><Plus className="w-4 h-4" />Tambah</button>}
            />
            <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'create' ? 'Tambah Alat' : 'Edit Alat'}>
                <form onSubmit={handleSave} className="space-y-4">
                    {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label><select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">{categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Nama Alat</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Stok</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} min={0} required className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" /></div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Gambar</label>
                        <input type="file" accept="image/*" onChange={handleFile} className="w-full text-sm border border-slate-300 rounded-lg file:mr-3 file:px-3 file:py-2 file:border-0 file:bg-slate-100 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200" />
                        {preview && <img src={preview} alt="Preview" className="mt-2 w-20 h-20 rounded-lg object-cover border border-slate-200" />}
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModal({ open: false })} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Batal</button>
                        <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">{saving ? 'Menyimpan...' : 'Simpan'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import Modal from '../../components/Modal';
import { Search, ImageIcon, PackageSearch } from 'lucide-react';

export default function CatalogPage() {
    const [tools, setTools] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [modal, setModal] = useState({ open: false, tool: null });
    const [form, setForm] = useState({ amount: 1, loan_date: '', return_date: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchTools = useCallback(async () => {
        try {
            const params = { search, page, per_page: 12 };
            if (categoryId) params.category_id = categoryId;
            const res = await api.get('/peminjam/catalog', { params });
            setTools(res.data.data); setPagination(res.data);
        } catch { }
    }, [search, page, categoryId]);

    useEffect(() => { fetchTools(); }, [fetchTools]);
    useEffect(() => { api.get('/peminjam/catalog/categories').then(r => setCategories(r.data)).catch(() => { }); }, []);

    const openBorrow = (tool) => {
        const today = new Date().toISOString().split('T')[0];
        setForm({ amount: 1, loan_date: today, return_date: '' }); setError(''); setSuccess('');
        setModal({ open: true, tool });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true); setError(''); setSuccess('');
        try {
            await api.post('/peminjam/loans', { tool_id: modal.tool.id, ...form });
            setSuccess('Permintaan peminjaman berhasil diajukan!');
            fetchTools();
            setTimeout(() => setModal({ open: false }), 1500);
        } catch (err) { setError(err.response?.data?.message || 'Terjadi kesalahan.'); }
        finally { setSaving(false); }
    };

    return (
        <div>
            <div className="mb-6"><h1 className="text-lg font-semibold text-slate-800">Katalog Alat</h1><p className="text-sm text-slate-400 mt-0.5">Telusuri dan pinjam alat yang tersedia</p></div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari alat..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-slate-300" />
                    </div>
                    <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }} className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Semua Kategori</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                    </select>
                </div>
            </div>

            {/* Cards Grid */}
            {tools.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tools.map(tool => (
                        <div key={tool.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                                {tool.gambar ? (
                                    <img src={`/storage/${tool.gambar}`} alt={tool.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-slate-300" /></div>
                                )}
                            </div>
                            <div className="p-4">
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 mb-2">{tool.category?.category_name}</span>
                                <h3 className="font-semibold text-slate-800 text-sm leading-tight mb-1">{tool.name}</h3>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-3">{tool.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-medium ${tool.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>Stok: {tool.stock}</span>
                                    <button onClick={() => openBorrow(tool)} disabled={tool.stock <= 0} className="px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors">
                                        Pinjam
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                    <PackageSearch className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Tidak ada alat ditemukan.</p>
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: pagination.last_page }, (_, i) => (
                        <button key={i + 1} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{i + 1}</button>
                    ))}
                </div>
            )}

            {/* Borrow Modal */}
            <Modal open={modal.open} onClose={() => setModal({ open: false })} title={`Pinjam: ${modal.tool?.name || ''}`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}
                    {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm rounded-lg px-4 py-3">{success}</div>}
                    <div className="bg-slate-50 rounded-lg p-3 text-sm"><span className="text-slate-500">Stok tersedia:</span> <span className="font-semibold text-slate-800">{modal.tool?.stock}</span></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 1 })} min={1} max={modal.tool?.stock || 1} required className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Pinjam</label><input type="date" value={form.loan_date} onChange={(e) => setForm({ ...form, loan_date: e.target.value })} required className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Kembali</label><input type="date" value={form.return_date} onChange={(e) => setForm({ ...form, return_date: e.target.value })} required className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" /></div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModal({ open: false })} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Batal</button>
                        <button type="submit" disabled={saving || !!success} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">{saving ? 'Mengirim...' : 'Ajukan Peminjaman'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

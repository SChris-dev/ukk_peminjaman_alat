import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function UsersPage() {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState({ open: false, mode: 'create', user: null });
    const [form, setForm] = useState({ username: '', email: '', password: '', role: 'peminjam' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get('/admin/users', { params: { search, page } });
            setData(res.data.data);
            setPagination(res.data);
        } catch { }
    }, [search, page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openCreate = () => { setForm({ username: '', email: '', password: '', role: 'peminjam' }); setError(''); setModal({ open: true, mode: 'create' }); };
    const openEdit = (user) => { setForm({ username: user.username, email: user.email, password: '', role: user.role }); setError(''); setModal({ open: true, mode: 'edit', user }); };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            if (modal.mode === 'create') {
                await api.post('/admin/users', form);
            } else {
                const payload = { ...form };
                if (!payload.password) delete payload.password;
                await api.put(`/admin/users/${modal.user.id}`, payload);
            }
            setModal({ open: false });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan.');
        } finally { setSaving(false); }
    };

    const handleDelete = async (user) => {
        if (!confirm(`Hapus user "${user.username}"?`)) return;
        try { await api.delete(`/admin/users/${user.id}`); fetchData(); } catch { }
    };

    const roleBadge = (role) => {
        const styles = { admin: 'bg-red-50 text-red-700 border-red-200', petugas: 'bg-amber-50 text-amber-700 border-amber-200', peminjam: 'bg-primary-50 text-primary-700 border-primary-200' };
        return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${styles[role]}`}>{role}</span>;
    };

    const columns = [
        { header: '#', render: (r) => r.id },
        { header: 'Username', key: 'username', render: (r) => <span className="font-medium text-slate-800">{r.username}</span> },
        { header: 'Email', key: 'email' },
        { header: 'Role', render: (r) => roleBadge(r.role) },
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
            <div className="mb-6 flex items-center justify-between">
                <div><h1 className="text-lg font-semibold text-slate-800">Manajemen Users</h1><p className="text-sm text-slate-400 mt-0.5">Kelola data pengguna sistem</p></div>
            </div>
            <DataTable
                columns={columns} data={data} pagination={pagination}
                onPageChange={setPage} searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}
                searchPlaceholder="Cari username atau email..."
                actions={<button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"><Plus className="w-4 h-4" />Tambah</button>}
            />
            <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'create' ? 'Tambah User' : 'Edit User'}>
                <form onSubmit={handleSave} className="space-y-4">
                    {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Username</label><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Password {modal.mode === 'edit' && <span className="text-slate-400 font-normal">(kosongkan jika tidak diubah)</span>}</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} {...(modal.mode === 'create' ? { required: true } : {})} className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Role</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"><option value="admin">Admin</option><option value="petugas">Petugas</option><option value="peminjam">Peminjam</option></select></div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModal({ open: false })} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Batal</button>
                        <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">{saving ? 'Menyimpan...' : 'Simpan'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

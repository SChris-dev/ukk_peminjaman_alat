import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export default function DataTable({ columns, data, pagination, onPageChange, searchValue, onSearchChange, searchPlaceholder = 'Cari...', actions, emptyMessage = 'Tidak ada data.' }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Search bar */}
            {onSearchChange && (
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-slate-300"
                        />
                    </div>
                    {actions && <div className="flex gap-2">{actions}</div>}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            {columns.map((col, i) => (
                                <th key={i} className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.className || ''}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data?.length > 0 ? data.map((row, rowIndex) => (
                            <tr key={row.id || rowIndex} className="hover:bg-slate-50/50 transition-colors">
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className={`px-4 py-3 text-slate-600 ${col.cellClassName || ''}`}>
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">{emptyMessage}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
                <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Halaman {pagination.current_page} dari {pagination.last_page} ({pagination.total} data)</span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onPageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page <= 1}
                            className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page >= pagination.last_page}
                            className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

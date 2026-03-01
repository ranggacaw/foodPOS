import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { ActivityLog, PaginatedData } from '@/types';
import { useState } from 'react';

interface Props {
    logs: PaginatedData<ActivityLog>;
    filters: {
        action: string;
        from: string;
        to: string;
    };
}

export default function AuditLogIndex({ logs, filters }: Props) {
    const [filterParams, setFilterParams] = useState(filters);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.audit-log.index'), filterParams as any, { preserveState: true });
    };

    const clearFilters = () => {
        setFilterParams({ action: '', from: '', to: '' });
        router.get(route('admin.audit-log.index'));
    };

    const formatDateTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Audit Log</h2>}
        >
            <Head title="Audit Log" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="mb-6 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <form onSubmit={handleFilter} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Action Type</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. order.created"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        value={filterParams.action}
                                        onChange={e => setFilterParams({ ...filterParams, action: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">From Date</label>
                                    <input
                                        type="date"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        value={filterParams.from}
                                        onChange={e => setFilterParams({ ...filterParams, from: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">To Date</label>
                                    <input
                                        type="date"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        value={filterParams.to}
                                        onChange={e => setFilterParams({ ...filterParams, to: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        Apply Filters
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Timestamp</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Model</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Payload</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {logs.data.map((log) => (
                                        <tr key={log.id}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {formatDateTime(log.created_at)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {log.user ? log.user.name : <span className="text-gray-400">System</span>}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-indigo-600">
                                                {log.action}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {log.model_type.split('\\').pop()} #{log.model_id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={JSON.stringify(log.payload)}>
                                                {log.payload ? JSON.stringify(log.payload).substring(0, 50) + (JSON.stringify(log.payload).length > 50 ? '...' : '') : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                                No audit logs found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {logs.meta.last_page > 1 && (
                            <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6 flex items-center justify-between">
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{logs.meta.from}</span> to <span className="font-medium">{logs.meta.to}</span> of <span className="font-medium">{logs.meta.total}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                            <button
                                                onClick={() => logs.links.prev && router.get(logs.links.prev)}
                                                disabled={!logs.links.prev}
                                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Previous</span>
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={() => logs.links.next && router.get(logs.links.next)}
                                                disabled={!logs.links.next}
                                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Next</span>
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

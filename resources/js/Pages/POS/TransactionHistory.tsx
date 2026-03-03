import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { DaySummary, PaginatedData } from '@/types';

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function TransactionHistory({ summaries, filters }: { summaries: PaginatedData<DaySummary>, filters: { from: string, to: string } }) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('pos.history.index'),
            { from, to },
            { preserveState: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Transaction History
                </h2>
            }
        >
            <Head title="Transaction History" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Date Range Filter */}
                    <div className="mb-8 overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <form
                            onSubmit={handleFilter}
                            className="flex flex-col gap-4 sm:flex-row sm:items-end"
                        >
                            <div>
                                <label
                                    htmlFor="from"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    From
                                </label>
                                <input
                                    id="from"
                                    type="date"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="to"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    To
                                </label>
                                <input
                                    id="to"
                                    type="date"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Filter
                            </button>
                        </form>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Daily Transactions
                            </h3>
                        </div>
                        {summaries.data.length === 0 ? (
                            <div className="px-6 py-12 text-center text-gray-500">
                                <p className="text-lg font-medium">No transaction history found</p>
                                <p className="mt-1 text-sm">No daily transactions for the given filters.</p>
                                <Link
                                    href={route('pos.index')}
                                    className="mt-4 inline-flex h-10 items-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
                                >
                                    Go to POS
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Orders
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Total Revenue
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {summaries.data.map((summary) => (
                                            <tr
                                                key={summary.date}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                    {formatDate(summary.date)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                                                    {summary.order_count}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                    {formatIDR(summary.total_revenue)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                    <Link
                                                        href={route('pos.history.show', summary.date)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {summaries.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{summaries.from ?? 0}</span> to <span className="font-medium">{summaries.to ?? 0}</span> of{' '}
                                    <span className="font-medium">{summaries.total}</span> days
                                </p>
                                <div className="flex gap-2">
                                    {summaries.prev_page_url ? (
                                        <Link
                                            href={summaries.prev_page_url}
                                            className="inline-flex h-9 items-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Previous
                                        </Link>
                                    ) : (
                                        <span className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-gray-100 px-3 text-sm font-medium text-gray-400">
                                            Previous
                                        </span>
                                    )}
                                    {summaries.next_page_url ? (
                                        <Link
                                            href={summaries.next_page_url}
                                            className="inline-flex h-9 items-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Next
                                        </Link>
                                    ) : (
                                        <span className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-gray-100 px-3 text-sm font-medium text-gray-400">
                                            Next
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

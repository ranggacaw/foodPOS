import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

const formatCurrency = (value: number | string) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
        Number(value),
    );

interface TopSellingItem {
    menu_item_id: number;
    total_quantity: number;
    total_revenue: number;
    menu_item?: {
        id: number;
        name: string;
        price: string;
    };
}

interface ReportProps {
    summary: {
        total_revenue: number;
        total_orders: number;
        total_cogs: number;
        profit: number;
    };
    topSellingItems: TopSellingItem[];
    filters: {
        from: string;
        to: string;
    };
}

export default function Index({
    summary,
    topSellingItems,
    filters,
}: PageProps<ReportProps>) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.reports.index'),
            { from, to },
            { preserveState: true },
        );
    };

    const summaryCards = [
        {
            label: 'Revenue',
            value: formatCurrency(summary.total_revenue),
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            bgLight: 'bg-blue-50',
        },
        {
            label: 'Orders',
            value: summary.total_orders.toLocaleString('id-ID'),
            color: 'bg-emerald-500',
            textColor: 'text-emerald-600',
            bgLight: 'bg-emerald-50',
        },
        {
            label: 'COGS',
            value: formatCurrency(summary.total_cogs),
            color: 'bg-amber-500',
            textColor: 'text-amber-600',
            bgLight: 'bg-amber-50',
        },
        {
            label: 'Profit',
            value: formatCurrency(summary.profit),
            color: 'bg-purple-500',
            textColor: 'text-purple-600',
            bgLight: 'bg-purple-50',
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Reports
                </h2>
            }
        >
            <Head title="Reports" />

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

                    {/* Summary Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {summaryCards.map((card) => (
                            <div
                                key={card.label}
                                className="overflow-hidden rounded-lg bg-white shadow-sm"
                            >
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <div
                                            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${card.bgLight}`}
                                        >
                                            <div
                                                className={`h-6 w-6 rounded-full ${card.color}`}
                                            />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <p className="text-sm font-medium text-gray-500">
                                                {card.label}
                                            </p>
                                            <p
                                                className={`text-xl font-bold ${card.textColor}`}
                                            >
                                                {card.value}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Top Selling Items */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Top Selling Items
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Rank
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Item Name
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Quantity Sold
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Revenue
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {topSellingItems.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-8 text-center text-sm text-gray-500"
                                            >
                                                No sales data available for the selected period.
                                            </td>
                                        </tr>
                                    ) : (
                                        topSellingItems.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    <span
                                                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                                            index === 0
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : index === 1
                                                                  ? 'bg-gray-200 text-gray-700'
                                                                  : index === 2
                                                                    ? 'bg-orange-100 text-orange-800'
                                                                    : 'bg-gray-100 text-gray-500'
                                                        }`}
                                                    >
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                    {item.menu_item?.name ?? 'Unknown'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                                                    {Number(item.total_quantity).toLocaleString('id-ID')}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                    {formatCurrency(item.total_revenue)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Order, PaginatedData } from '@/types';

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const paymentLabels: Record<string, string> = {
    cash: 'Cash',
    card: 'Card',
    qris: 'QRIS',
};

export default function History({ orders }: { orders: PaginatedData<Order> }) {
    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Today's Orders
                </h2>
            }
        >
            <Head title="Order History" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {orders.data.length === 0 ? (
                            <div className="px-6 py-12 text-center text-gray-500">
                                <p className="text-lg font-medium">No orders today</p>
                                <p className="mt-1 text-sm">Orders placed today will appear here.</p>
                                <Link
                                    href={route('pos.index')}
                                    className="mt-4 inline-flex h-10 items-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
                                >
                                    Go to POS
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
                                            <th className="px-6 py-3 font-medium">Order #</th>
                                            <th className="px-6 py-3 font-medium">Time</th>
                                            <th className="px-6 py-3 text-center font-medium">Items</th>
                                            <th className="px-6 py-3 text-right font-medium">Total</th>
                                            <th className="px-6 py-3 font-medium">Payment</th>
                                            <th className="px-6 py-3 font-medium">Status</th>
                                            <th className="px-6 py-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.data.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {order.order_number}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {formatTime(order.created_at)}
                                                </td>
                                                <td className="px-6 py-4 text-center text-gray-600">
                                                    {order.items?.length ?? 0}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                    {formatIDR(parseFloat(order.total))}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {paymentLabels[order.payment_method] ?? order.payment_method}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColors[order.status] ?? 'bg-gray-100 text-gray-800'}`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={route('pos.orders.show', order.id)}
                                                        className="font-medium text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {orders.meta.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3">
                                <p className="text-sm text-gray-600">
                                    Showing {orders.meta.from ?? 0} to {orders.meta.to ?? 0} of{' '}
                                    {orders.meta.total} orders
                                </p>
                                <div className="flex gap-2">
                                    {orders.links.prev ? (
                                        <Link
                                            href={orders.links.prev}
                                            className="inline-flex h-9 items-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Previous
                                        </Link>
                                    ) : (
                                        <span className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-gray-100 px-3 text-sm font-medium text-gray-400">
                                            Previous
                                        </span>
                                    )}
                                    {orders.links.next ? (
                                        <Link
                                            href={orders.links.next}
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

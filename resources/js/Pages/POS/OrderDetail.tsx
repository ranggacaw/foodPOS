import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Order } from '@/types';

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

export default function OrderDetail({ order }: { order: Order }) {
    const formatDateTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Order {order.order_number}
                    </h2>
                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[order.status] ?? 'bg-gray-100 text-gray-800'}`}
                    >
                        {order.status}
                    </span>
                </div>
            }
        >
            <Head title={`Order ${order.order_number}`} />

            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {/* Order Info */}
                        <div className="border-b border-gray-200 px-6 py-5">
                            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                                <div>
                                    <p className="text-gray-500">Order Number</p>
                                    <p className="font-semibold text-gray-900">{order.order_number}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Date & Time</p>
                                    <p className="font-semibold text-gray-900">{formatDateTime(order.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Cashier</p>
                                    <p className="font-semibold text-gray-900">{order.user?.name ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Payment</p>
                                    <p className="font-semibold text-gray-900">
                                        {paymentLabels[order.payment_method] ?? order.payment_method}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="px-6 py-5">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left text-gray-500">
                                        <th className="pb-3 font-medium">Item</th>
                                        <th className="pb-3 text-center font-medium">Qty</th>
                                        <th className="pb-3 text-right font-medium">Unit Price</th>
                                        <th className="pb-3 text-right font-medium">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items?.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-100">
                                            <td className="py-3 font-medium text-gray-900">
                                                {item.menu_item?.name ?? `Item #${item.menu_item_id}`}
                                            </td>
                                            <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                                            <td className="py-3 text-right text-gray-600">
                                                {formatIDR(parseFloat(item.unit_price))}
                                            </td>
                                            <td className="py-3 text-right font-medium text-gray-900">
                                                {formatIDR(parseFloat(item.subtotal))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="border-t border-gray-200 bg-gray-50 px-6 py-5">
                            <div className="flex flex-col items-end space-y-1.5 text-sm">
                                <div className="flex w-60 justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{formatIDR(parseFloat(order.subtotal))}</span>
                                </div>
                                <div className="flex w-60 justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span>{formatIDR(parseFloat(order.tax))}</span>
                                </div>
                                <div className="flex w-60 justify-between border-t border-gray-300 pt-2 text-base font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>{formatIDR(parseFloat(order.total))}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 px-6 py-5">
                            <button
                                onClick={() => window.print()}
                                className="inline-flex h-10 items-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                            >
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                                </svg>
                                Print Receipt
                            </button>
                            <Link
                                href={route('pos.index')}
                                className="inline-flex h-10 items-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
                            >
                                Back to POS
                            </Link>
                            <Link
                                href={route('pos.index')}
                                className="inline-flex h-10 items-center rounded-lg bg-green-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700"
                            >
                                New Order
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

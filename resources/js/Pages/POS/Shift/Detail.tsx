import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Shift, PageProps } from '@/types';

interface Props extends PageProps {
    shift: Shift;
    stats: {
        total_orders: number;
        total_revenue: number;
        payment_breakdown: {
            cash: number;
            card: number;
            qris: number;
        };
        expected_cash: number;
    }
}

export default function ShiftDetail({ shift, stats, auth }: Props) {
    const isOwner = auth.user.id === shift.user_id;
    const canClose = shift.status === 'open' && (isOwner || auth.user.role === 'admin');

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const diff = shift.closing_cash ? parseFloat(shift.closing_cash) - stats.expected_cash : 0;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Shift #{shift.id}</h2>}>
            <Head title={`Shift #${shift.id}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 px-6 py-5 sm:flex sm:items-center sm:justify-between">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                                Shift Summary - {shift.user?.name}
                                {shift.status === 'open' ? (
                                    <span className="ml-3 inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">Active</span>
                                ) : (
                                    <span className="ml-3 inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-sm font-medium text-gray-800">Closed</span>
                                )}
                            </h3>
                            <div className="mt-3 flex sm:ml-4 sm:mt-0">
                                {canClose && (
                                    <Link
                                        href={route('pos.shifts.close', shift.id)}
                                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    >
                                        Close Shift Now
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="border-b border-gray-200">
                            <dl className="grid grid-cols-1 sm:grid-cols-2">
                                <div className="border-b border-gray-200 px-6 py-5 sm:border-b-0 sm:border-r">
                                    <dt className="text-sm font-medium text-gray-500">Opened At</dt>
                                    <dd className="mt-1 text-base text-gray-900">{formatDate(shift.opened_at)}</dd>
                                </div>
                                <div className="px-6 py-5">
                                    <dt className="text-sm font-medium text-gray-500">Closed At</dt>
                                    <dd className="mt-1 text-base text-gray-900">
                                        {shift.closed_at ? formatDate(shift.closed_at) : '—'}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-5">
                            <h4 className="text-base font-medium text-gray-900">Sales Summary</h4>
                            <dl className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
                                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                                    <dt className="truncate text-sm font-medium text-gray-500">Total Orders</dt>
                                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats.total_orders}</dd>
                                </div>
                                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                                    <dt className="truncate text-sm font-medium text-gray-500">Total Revenue</dt>
                                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">Rp {stats.total_revenue.toLocaleString('id-ID')}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-base font-medium text-gray-900 mb-4">Payment Methods Breakdown</h4>
                                <ul role="list" className="divide-y divide-gray-200 rounded-md border border-gray-200">
                                    <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                                        <div className="flex w-0 flex-1 items-center font-medium">Cash</div>
                                        <div className="ml-4 flex-shrink-0 text-gray-900">Rp {stats.payment_breakdown.cash.toLocaleString('id-ID')}</div>
                                    </li>
                                    <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm bg-gray-50">
                                        <div className="flex w-0 flex-1 items-center font-medium">Card</div>
                                        <div className="ml-4 flex-shrink-0 text-gray-900">Rp {stats.payment_breakdown.card.toLocaleString('id-ID')}</div>
                                    </li>
                                    <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                                        <div className="flex w-0 flex-1 items-center font-medium">QRIS</div>
                                        <div className="ml-4 flex-shrink-0 text-gray-900">Rp {stats.payment_breakdown.qris.toLocaleString('id-ID')}</div>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-base font-medium text-gray-900 mb-4">Cash Drawer Summary</h4>
                                <dl className="divide-y divide-gray-200">
                                    <div className="flex justify-between py-3 text-sm">
                                        <dt className="text-gray-500">Opening Cash</dt>
                                        <dd className="text-gray-900">Rp {parseFloat(shift.opening_cash).toLocaleString('id-ID')}</dd>
                                    </div>
                                    <div className="flex justify-between py-3 text-sm">
                                        <dt className="text-gray-500">Expected Closing Cash</dt>
                                        <dd className="font-medium text-indigo-600">Rp {stats.expected_cash.toLocaleString('id-ID')}</dd>
                                    </div>
                                    {shift.status === 'closed' && shift.closing_cash !== null && (
                                        <>
                                            <div className="flex justify-between py-3 text-sm font-semibold">
                                                <dt className="text-gray-900">Actual Closing Cash</dt>
                                                <dd className="text-gray-900">Rp {parseFloat(shift.closing_cash).toLocaleString('id-ID')}</dd>
                                            </div>
                                            <div className="flex justify-between py-3 text-sm">
                                                <dt className="text-gray-500">Difference</dt>
                                                <dd className={`font-medium ${diff === 0 ? 'text-green-600' : diff > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                    {diff === 0 ? 'Matches Expected' : `${diff > 0 ? '+' : '-'} Rp ${Math.abs(diff).toLocaleString('id-ID')}`}
                                                </dd>
                                            </div>
                                        </>
                                    )}
                                </dl>

                                {shift.notes && (
                                    <div className="mt-4 rounded-md bg-yellow-50 p-4">
                                        <h3 className="text-sm font-medium text-yellow-800">Shift Notes</h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p>{shift.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Orders in Shift */}
                        <div className="border-t border-gray-200 px-6 py-5">
                            <h4 className="text-base font-medium text-gray-900 mb-4">Shift Orders</h4>
                            {shift.orders && shift.orders.length > 0 ? (
                                <ul role="list" className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                                    {shift.orders.map((order) => (
                                        <li key={order.id} className="relative flex justify-between gap-x-6 px-4 py-4 hover:bg-gray-50 sm:px-6">
                                            <div className="flex min-w-0 gap-x-4">
                                                <div className="min-w-0 flex-auto">
                                                    <p className="text-sm font-semibold leading-6 text-gray-900">
                                                        <Link href={route('pos.orders.show', order.id)}>
                                                            <span className="absolute inset-x-0 -top-px bottom-0" />
                                                            {order.order_number}
                                                        </Link>
                                                    </p>
                                                    <p className="mt-1 flex text-xs leading-5 text-gray-500">
                                                        <span>{formatDate(order.created_at)}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-x-4">
                                                <div className="hidden sm:flex sm:flex-col sm:items-end">
                                                    <p className="text-sm leading-6 text-gray-900">Rp {parseFloat(order.total).toLocaleString('id-ID')}</p>
                                                    <p className="mt-1 text-xs leading-5 text-gray-500 capitalize">{order.payment_method}</p>
                                                </div>
                                                <svg className="h-5 w-5 flex-none text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No orders recorded in this shift yet.</p>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

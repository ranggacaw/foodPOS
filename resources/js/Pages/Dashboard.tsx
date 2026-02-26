import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

interface DashboardProps {
    stats: {
        today_orders: number;
        today_revenue: number;
        low_stock_count: number;
    };
}

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

export default function Dashboard({ stats }: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        {/* Today's Orders */}
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                                        <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Today's Orders</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.today_orders}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Today's Revenue */}
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-50">
                                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatIDR(stats.today_revenue)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Low Stock Items */}
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${stats.low_stock_count > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                                        <svg className={`h-6 w-6 ${stats.low_stock_count > 0 ? 'text-red-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                                        <p className={`text-2xl font-bold ${stats.low_stock_count > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                            {stats.low_stock_count}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <Link
                                href={route('pos.index')}
                                className="inline-flex h-12 items-center rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                            >
                                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                                Go to POS
                            </Link>

                            {isAdmin && (
                                <>
                                    <Link
                                        href={route('admin.menu-items.index')}
                                        className="inline-flex h-12 items-center rounded-lg border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                                    >
                                        <svg className="mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                        </svg>
                                        Manage Menu
                                    </Link>
                                    <Link
                                        href={route('admin.reports.index')}
                                        className="inline-flex h-12 items-center rounded-lg border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                                    >
                                        <svg className="mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                        </svg>
                                        View Reports
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

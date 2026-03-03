import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopProduct {
    name: string;
    qty: number;
}

interface PaymentMethod {
    method: string;
    count: number;
    revenue: number;
}

interface DashboardStats {
    total_penjualan: number;
    total_penjualan_change: number | null;
    total_keuntungan: number;
    total_keuntungan_change: number | null;
    total_transaksi: number;
    total_transaksi_change: number | null;
    produk_terjual: number;
    produk_terjual_change: number | null;

    penjualan_kotor: number;
    diskon: number;
    redeem_poin: number;
    biaya_layanan: number;
    pajak: number;
    total_penjualan_detail: number;

    total_kasbon: number;
    total_uang_muka: number;
    total_pelanggan_kasbon: number;

    total_kas_masuk: number;
    total_kas_keluar: number;

    low_stock_count: number;
    today_orders: number;
    today_revenue: number;
}

interface DashboardProps {
    stats: DashboardStats;
    top_products: TopProduct[];
    payment_breakdown: PaymentMethod[];
    filters: {
        start_date: string;
        end_date: string;
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const formatChange = (change: number | null) => {
    if (change === null) return null;
    const positive = change >= 0;
    return {
        value: `${positive ? '+' : ''}${change.toFixed(2)}%`,
        isPositive: positive,
    };
};

const formatDateRange = (start: string, end: string) => {
    if (start === end) {
        if (start === new Date().toISOString().split('T')[0]) return 'Hari Ini';
        return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(start));
    }
    return `${new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(start))} - ${new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(end))}`;
};

const paymentLabel: Record<string, string> = {
    cash: 'Tunai',
    card: 'Non Tunai - Kartu',
    qris: 'Non Tunai - QRIS',
    other: 'Non Tunai - Lainnya',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChangeBadge({ change }: { change: number | null }) {
    const info = formatChange(change);
    if (info === null) return <span className="text-xs text-gray-400">—</span>;
    return (
        <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${info.isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
                }`}
        >
            {info.isPositive ? (
                <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 3l5 6H3l5-6z" />
                </svg>
            ) : (
                <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 13L3 7h10l-5 6z" />
                </svg>
            )}
            {info.value}
        </span>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">
            {children}
        </h3>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard({ stats, top_products, payment_breakdown, filters }: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';

    const [startDate, setStartDate] = React.useState(filters.start_date);
    const [endDate, setEndDate] = React.useState(filters.end_date);

    const handleFilter = () => {
        router.get(route('dashboard'), {
            start_date: startDate,
            end_date: endDate,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const totalTransaksi = stats.total_transaksi;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Dashboard
                    </h2>
                    <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-1.5 shadow-sm">
                        <div className="flex items-center gap-2 px-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border-none bg-transparent p-0 text-sm focus:ring-0"
                            />
                            <span className="text-gray-400">→</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border-none bg-transparent p-0 text-sm focus:ring-0"
                            />
                        </div>
                        <button
                            onClick={handleFilter}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                        >
                            Filter
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* ── Quick Actions ──────────────────────────────── */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={route('pos.index')}
                            className="inline-flex h-10 items-center rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                            Buka POS
                        </Link>
                        {isAdmin && (
                            <>
                                <Link
                                    href={route('admin.menu-items.index')}
                                    className="inline-flex h-10 items-center rounded-lg border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                                >
                                    Kelola Menu
                                </Link>
                                <Link
                                    href={route('admin.reports.index')}
                                    className="inline-flex h-10 items-center rounded-lg border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                                >
                                    Laporan
                                </Link>
                            </>
                        )}
                    </div>

                    {/* ── Dashboard Summary Cards ────────────────────── */}
                    <div>
                        <SectionTitle>Ringkasan: {formatDateRange(filters.start_date, filters.end_date)}</SectionTitle>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                            {/* Total Penjualan */}
                            <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                                        <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                                        </svg>
                                    </div>
                                    <ChangeBadge change={stats.total_penjualan_change} />
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500">Total Penjualan</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">{formatIDR(stats.total_penjualan)}</p>
                                </div>
                                <div className="mt-4 border-t border-gray-50 pt-3">
                                    <Link
                                        href={route('admin.reports.index')}
                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                                    >
                                        Lihat Detail →
                                    </Link>
                                </div>
                            </div>

                            {/* Total Keuntungan */}
                            <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                                        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <ChangeBadge change={stats.total_keuntungan_change} />
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500">Total Keuntungan</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">{formatIDR(stats.total_keuntungan)}</p>
                                </div>
                                <div className="mt-4 border-t border-gray-50 pt-3">
                                    <Link
                                        href={route('admin.reports.index')}
                                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                                    >
                                        Lihat Detail →
                                    </Link>
                                </div>
                            </div>

                            {/* Total Transaksi */}
                            <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                                        <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                        </svg>
                                    </div>
                                    <ChangeBadge change={stats.total_transaksi_change} />
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500">Total Transaksi</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total_transaksi}</p>
                                </div>
                                <div className="mt-4 border-t border-gray-50 pt-3">
                                    <Link
                                        href={route('pos.history.index')}
                                        className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                                    >
                                        Lihat Detail →
                                    </Link>
                                </div>
                            </div>

                            {/* Produk Terjual */}
                            <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                                        <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                                        </svg>
                                    </div>
                                    <ChangeBadge change={stats.produk_terjual_change} />
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500">Produk Terjual</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">{stats.produk_terjual}</p>
                                </div>
                                <div className="mt-4 border-t border-gray-50 pt-3">
                                    <Link
                                        href={route('admin.reports.index')}
                                        className="text-xs font-semibold text-amber-600 hover:text-amber-700"
                                    >
                                        Lihat Detail →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Row 2: Detail Penjualan + Kasbon + Arus Kas ── */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                        {/* Detail Penjualan */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <SectionTitle>Detail Penjualan</SectionTitle>
                            <dl className="space-y-3">
                                {[
                                    { label: 'Penjualan Kotor', value: stats.penjualan_kotor },
                                    { label: 'Diskon', value: stats.diskon },
                                    { label: 'Redeem Poin', value: stats.redeem_poin },
                                    { label: 'Biaya Layanan', value: stats.biaya_layanan },
                                    { label: 'Pajak', value: stats.pajak },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex items-center justify-between">
                                        <dt className="text-sm text-gray-500">{label}</dt>
                                        <dd className="text-sm font-medium text-gray-800">{formatIDR(value)}</dd>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-3">
                                    <dt className="text-sm font-semibold text-gray-700">Total Penjualan</dt>
                                    <dd className="text-sm font-bold text-indigo-600">{formatIDR(stats.total_penjualan_detail)}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Kasbon */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <SectionTitle>Kasbon</SectionTitle>
                            <dl className="space-y-3">
                                {[
                                    { label: 'Total Kasbon', value: formatIDR(stats.total_kasbon) },
                                    { label: 'Total Uang Muka & Cicilan', value: formatIDR(stats.total_uang_muka) },
                                    { label: 'Total Pelanggan', value: String(stats.total_pelanggan_kasbon) },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex items-center justify-between">
                                        <dt className="text-sm text-gray-500">{label}</dt>
                                        <dd className="text-sm font-medium text-gray-800">{value}</dd>
                                    </div>
                                ))}
                            </dl>

                            {/* Arus Kas (inside same card column) */}
                            <div className="mt-6 border-t border-gray-100 pt-5">
                                <SectionTitle>Arus Kas</SectionTitle>
                                <dl className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-sm text-gray-500">Total Kas Masuk</dt>
                                        <dd className="text-sm font-semibold text-emerald-600">{formatIDR(stats.total_kas_masuk)}</dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-sm text-gray-500">Total Kas Keluar</dt>
                                        <dd className="text-sm font-semibold text-red-500">{formatIDR(stats.total_kas_keluar)}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Low Stock */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <SectionTitle>Stok Rendah</SectionTitle>
                            <div className="flex items-center gap-4">
                                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stats.low_stock_count > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                                    <svg className={`h-7 w-7 ${stats.low_stock_count > 0 ? 'text-red-500' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Produk Hampir Habis</p>
                                    <p className={`text-3xl font-bold ${stats.low_stock_count > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                        {stats.low_stock_count}
                                    </p>
                                </div>
                            </div>
                            {stats.low_stock_count > 0 && (
                                <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                                    Segera cek inventaris — ada {stats.low_stock_count} produk mendekati batas stok minimum.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ── Row 3: Top Products + Payments + Order Type ── */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                        {/* Produk Terlaris */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <SectionTitle>Produk Terlaris</SectionTitle>
                            {top_products.length === 0 ? (
                                <p className="py-6 text-center text-sm text-gray-400">Belum ada data untuk periode ini</p>
                            ) : (
                                <ol className="space-y-3">
                                    {top_products.map((product, index) => {
                                        const maxQty = top_products[0]?.qty ?? 1;
                                        const pct = Math.round((product.qty / maxQty) * 100);
                                        const colors = [
                                            'bg-indigo-500',
                                            'bg-violet-500',
                                            'bg-amber-500',
                                            'bg-emerald-500',
                                            'bg-pink-500',
                                        ];
                                        return (
                                            <li key={product.name} className="flex items-center gap-3">
                                                <span className="w-5 text-center text-sm font-bold text-gray-300">
                                                    {index + 1}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="truncate text-sm font-medium text-gray-800">{product.name}</span>
                                                        <span className="ml-2 shrink-0 text-sm font-bold text-gray-700">{product.qty}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                                                        <div
                                                            className={`h-1.5 rounded-full ${colors[index] ?? 'bg-gray-400'}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>
                            )}
                        </div>

                        {/* Pembayaran Terpopuler */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <SectionTitle>Pembayaran Terpopuler</SectionTitle>
                            {payment_breakdown.length === 0 ? (
                                <p className="py-6 text-center text-sm text-gray-400">Belum ada transaksi untuk periode ini</p>
                            ) : (
                                <ul className="space-y-4">
                                    {payment_breakdown.map((pm) => {
                                        const maxCount = payment_breakdown[0]?.count ?? 1;
                                        const pct = Math.round((pm.count / maxCount) * 100);
                                        return (
                                            <li key={pm.method}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {paymentLabel[pm.method] ?? pm.method}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{pm.count} transaksi</span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-gray-100">
                                                    <div
                                                        className="h-1.5 rounded-full bg-indigo-400"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <p className="mt-1 text-xs text-gray-400">{formatIDR(pm.revenue)}</p>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* Tipe Order */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <SectionTitle>Tipe Order</SectionTitle>
                            {totalTransaksi === 0 ? (
                                <p className="py-6 text-center text-sm text-gray-400">Belum ada transaksi untuk periode ini</p>
                            ) : (
                                <ul className="space-y-4">
                                    {/* Currently all orders have no type; extend when order_type column exists */}
                                    <li>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-800">Tanpa Tipe Order</span>
                                            <span className="text-xs text-gray-500">{totalTransaksi} transaksi</span>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-gray-100">
                                            <div className="h-1.5 rounded-full bg-violet-400" style={{ width: '100%' }} />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400">{formatIDR(stats.total_penjualan)}</p>
                                    </li>
                                </ul>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

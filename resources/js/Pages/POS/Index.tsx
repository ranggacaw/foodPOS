import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { Category, MenuItem } from '@/types';

interface CartItem {
    menu_item_id: number;
    menu_item: MenuItem;
    quantity: number;
}

type PaymentMethod = 'cash' | 'card' | 'qris';

const TAX_RATE = 11;

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

export default function Index({ categories }: { categories: Category[] }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [processing, setProcessing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [discount, setDiscount] = useState<number>(0);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const filteredItems = useMemo(() => {
        const baseItems =
            activeCategory === null
                ? categories.flatMap((c) => c.menu_items ?? [])
                : (categories.find((c) => c.id === activeCategory)?.menu_items ?? []);

        if (!searchQuery.trim()) return baseItems;

        const q = searchQuery.toLowerCase().trim();
        return baseItems.filter(
            (item) =>
                item.name.toLowerCase().includes(q) ||
                (item.description ?? '').toLowerCase().includes(q)
        );
    }, [categories, activeCategory, searchQuery]);

    const addToCart = (item: MenuItem) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.menu_item_id === item.id);
            if (existing) {
                return prev.map((c) =>
                    c.menu_item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c
                );
            }
            return [...prev, { menu_item_id: item.id, menu_item: item, quantity: 1 }];
        });
    };

    const updateQuantity = (menuItemId: number, delta: number) => {
        setCart((prev) =>
            prev
                .map((c) =>
                    c.menu_item_id === menuItemId
                        ? { ...c, quantity: c.quantity + delta }
                        : c
                )
                .filter((c) => c.quantity > 0)
        );
    };

    const removeFromCart = (menuItemId: number) => {
        setCart((prev) => prev.filter((c) => c.menu_item_id !== menuItemId));
    };

    const clearCart = () => setCart([]);

    const subtotal = cart.reduce(
        (sum, item) => sum + parseFloat(item.menu_item.price) * item.quantity,
        0
    );
    const subtotalAfterDiscount = Math.max(0, subtotal - discount);
    const tax = subtotalAfterDiscount * (TAX_RATE / 100);
    const total = subtotalAfterDiscount + tax;

    const placeOrder = () => {
        if (cart.length === 0 || processing) return;

        setProcessing(true);

        router.post(route('pos.orders.store'), {
            items: cart.map((c) => ({
                menu_item_id: c.menu_item_id,
                quantity: c.quantity,
            })),
            payment_method: paymentMethod,
            tax_rate: TAX_RATE,
            discount: discount,
        }, {
            onSuccess: () => {
                setCart([]);
                setPaymentMethod('cash');
                setDiscount(0);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <AuthenticatedLayout hideNavigation={isFullscreen}>
            <Head title="POS" />

            <div className={`flex overflow-hidden ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-4rem)]'}`}>
                {/* Left Panel - Menu Items */}
                <div className="flex w-[62%] flex-col overflow-hidden border-r border-gray-200">
                    {/* Search Bar */}
                    <div className="flex-shrink-0 bg-white px-4 pt-4 pb-3 border-b border-gray-100">
                        <div className="relative">
                            {/* Search Icon */}
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg
                                    className="h-4 w-4 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                    />
                                </svg>
                            </div>

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search menu items…"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-9 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                            />

                            {/* Clear Button */}
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Clear search"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 pt-3">
                        <div className="flex gap-2 overflow-x-auto pb-3">
                            <button
                                onClick={() => setActiveCategory(null)}
                                className={`flex-shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${activeCategory === null
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                All Items
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={`flex-shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${activeCategory === category.id
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Menu Items Grid */}
                    <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                        {/* Result count when searching */}
                        {searchQuery.trim() && (
                            <p className="mb-3 text-xs font-medium text-gray-500">
                                {filteredItems.length === 0
                                    ? 'No results'
                                    : `${filteredItems.length} result${filteredItems.length !== 1 ? 's' : ''} for "${searchQuery.trim()}"`}
                            </p>
                        )}

                        {filteredItems.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-gray-400">
                                {searchQuery.trim() ? (
                                    <>
                                        <svg className="mb-3 h-10 w-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                        </svg>
                                        <p className="text-sm">No items match "{searchQuery}"</p>
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 underline underline-offset-2"
                                        >
                                            Clear search
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-sm">No items found in this category.</p>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                                {filteredItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => addToCart(item)}
                                        className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:border-indigo-300 hover:shadow-md active:scale-[0.98]"
                                    >
                                        <span className="text-sm font-semibold text-gray-900 leading-tight">
                                            {item.name}
                                        </span>
                                        {item.description && (
                                            <span className="mt-1 text-xs text-gray-500 line-clamp-2">
                                                {item.description}
                                            </span>
                                        )}
                                        <span className="mt-auto pt-3 text-sm font-bold text-indigo-600">
                                            {formatIDR(parseFloat(item.price))}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Cart */}
                <div className="flex w-[38%] flex-col bg-white">
                    {/* Cart Header */}
                    <div className="flex-shrink-0 border-b border-gray-200 px-5 py-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Current Order</h2>
                        <button
                            onClick={toggleFullscreen}
                            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                        >
                            {isFullscreen ? (
                                <>
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9V4.5M15 9h4.5M15 9l5.25-5.25M15 15v4.5M15 15h4.5M15 15l5.25 5.25" />
                                    </svg>
                                    <span className="hidden sm:inline">Exit Fullscreen</span>
                                </>
                            ) : (
                                <>
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
                                    </svg>
                                    <span className="hidden sm:inline">Fullscreen</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-5 py-3">
                        {cart.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-gray-400">
                                <svg className="mb-3 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                </svg>
                                <p className="text-sm">Cart is empty</p>
                                <p className="text-xs">Tap an item to add it</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map((item) => {
                                    const unitPrice = parseFloat(item.menu_item.price);
                                    const lineSubtotal = unitPrice * item.quantity;
                                    return (
                                        <div
                                            key={item.menu_item_id}
                                            className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {item.menu_item.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {formatIDR(unitPrice)} each
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.menu_item_id)}
                                                    className="flex-shrink-0 rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                                                    title="Remove item"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.menu_item_id, -1)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 active:bg-gray-200"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                                                        </svg>
                                                    </button>
                                                    <span className="w-10 text-center text-sm font-semibold">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.menu_item_id, 1)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 active:bg-gray-200"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {formatIDR(lineSubtotal)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Cart Footer */}
                    <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-5 py-4">
                        {/* Totals */}
                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatIDR(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600">
                                <span>Discount</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-400">Rp</span>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-24 rounded-lg border border-gray-300 py-1 px-2 text-right text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                        value={discount || ''}
                                        onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax (PPN {TAX_RATE}%)</span>
                                <span>{formatIDR(tax)}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-300 pt-2 text-base font-bold text-gray-900">
                                <span>Total</span>
                                <span>{formatIDR(total)}</span>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mt-4">
                            <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Payment Method
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {(['cash', 'card', 'qris'] as PaymentMethod[]).map((method) => (
                                    <button
                                        key={method}
                                        onClick={() => setPaymentMethod(method)}
                                        className={`h-10 rounded-lg text-sm font-medium transition-colors ${paymentMethod === method
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {method === 'cash' ? 'Cash' : method === 'card' ? 'Card' : 'QRIS'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={clearCart}
                                disabled={cart.length === 0}
                                className="h-12 rounded-lg border border-red-300 px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Clear
                            </button>
                            <button
                                onClick={placeOrder}
                                disabled={cart.length === 0 || processing}
                                className="flex h-12 flex-1 items-center justify-center rounded-lg bg-green-600 text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-700 active:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    `Place Order - ${formatIDR(total)}`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

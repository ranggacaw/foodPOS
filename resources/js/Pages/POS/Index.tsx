import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
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

    const filteredItems = useMemo(() => {
        if (activeCategory === null) {
            return categories.flatMap((c) => c.menu_items ?? []);
        }
        const cat = categories.find((c) => c.id === activeCategory);
        return cat?.menu_items ?? [];
    }, [categories, activeCategory]);

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
    const tax = subtotal * (TAX_RATE / 100);
    const total = subtotal + tax;

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
        }, {
            onSuccess: () => {
                setCart([]);
                setPaymentMethod('cash');
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="POS" />

            <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
                {/* Left Panel - Menu Items */}
                <div className="flex w-[62%] flex-col overflow-hidden border-r border-gray-200">
                    {/* Category Tabs */}
                    <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 pt-4">
                        <div className="flex gap-2 overflow-x-auto pb-3">
                            <button
                                onClick={() => setActiveCategory(null)}
                                className={`flex-shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                                    activeCategory === null
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
                                    className={`flex-shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                                        activeCategory === category.id
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
                        {filteredItems.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-gray-400">
                                No items found in this category.
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
                    <div className="flex-shrink-0 border-b border-gray-200 px-5 py-4">
                        <h2 className="text-lg font-bold text-gray-900">Current Order</h2>
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
                                        className={`h-10 rounded-lg text-sm font-medium transition-colors ${
                                            paymentMethod === method
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

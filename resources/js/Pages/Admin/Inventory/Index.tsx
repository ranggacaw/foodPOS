import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Inventory, PageProps } from '@/types';
import { useState } from 'react';

export default function Index({
    inventory,
}: PageProps<{ inventory: (Inventory & { is_low_stock: boolean })[] }>) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<{
        quantity_on_hand: string;
        restock_threshold: string;
    }>({ quantity_on_hand: '', restock_threshold: '' });

    const startEditing = (item: Inventory & { is_low_stock: boolean }) => {
        setEditingId(item.id);
        setEditValues({
            quantity_on_hand: item.quantity_on_hand,
            restock_threshold: item.restock_threshold,
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditValues({ quantity_on_hand: '', restock_threshold: '' });
    };

    const saveEditing = (item: Inventory) => {
        router.put(
            route('admin.inventory.update', item.id),
            {
                quantity_on_hand: editValues.quantity_on_hand,
                restock_threshold: editValues.restock_threshold,
            },
            {
                onSuccess: () => {
                    setEditingId(null);
                },
                preserveScroll: true,
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Inventory
                </h2>
            }
        >
            <Head title="Inventory" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Ingredient
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Unit
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Quantity on Hand
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Restock Threshold
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {inventory.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-8 text-center text-sm text-gray-500"
                                            >
                                                No inventory records found. Add ingredients first.
                                            </td>
                                        </tr>
                                    ) : (
                                        inventory.map((item) => (
                                            <tr
                                                key={item.id}
                                                className={`${
                                                    item.is_low_stock
                                                        ? 'bg-red-50 hover:bg-red-100'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                    {item.ingredient?.name}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {item.ingredient?.unit}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                                                    {editingId === item.id ? (
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={editValues.quantity_on_hand}
                                                            onChange={(e) =>
                                                                setEditValues((prev) => ({
                                                                    ...prev,
                                                                    quantity_on_hand:
                                                                        e.target.value,
                                                                }))
                                                            }
                                                            className="w-28 rounded-md border-gray-300 text-right text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        />
                                                    ) : (
                                                        Number(
                                                            item.quantity_on_hand,
                                                        ).toLocaleString('id-ID')
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                                                    {editingId === item.id ? (
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={
                                                                editValues.restock_threshold
                                                            }
                                                            onChange={(e) =>
                                                                setEditValues((prev) => ({
                                                                    ...prev,
                                                                    restock_threshold:
                                                                        e.target.value,
                                                                }))
                                                            }
                                                            className="w-28 rounded-md border-gray-300 text-right text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        />
                                                    ) : (
                                                        Number(
                                                            item.restock_threshold,
                                                        ).toLocaleString('id-ID')
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    {item.is_low_stock ? (
                                                        <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                                                            Low Stock
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                            In Stock
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                    {editingId === item.id ? (
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                onClick={() =>
                                                                    saveEditing(item)
                                                                }
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={cancelEditing}
                                                                className="text-gray-600 hover:text-gray-900"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => startEditing(item)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
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

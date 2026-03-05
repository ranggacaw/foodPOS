import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Branch, Ingredient } from '@/types';

interface InventoryTransfer {
    id: number;
    from_branch_id: number;
    to_branch_id: number;
    ingredient_id: number;
    quantity: number;
    status: 'pending' | 'approved' | 'rejected';
    requested_by: number;
    approved_by: number | null;
    rejected_by: number | null;
    approved_at: string | null;
    rejected_at: string | null;
    notes: string | null;
    created_at: string;
    from_branch: Branch;
    to_branch: Branch;
    ingredient: Ingredient;
    requested_by_user: { id: number; name: string };
    approved_by_user: { id: number; name: string } | null;
    rejected_by_user: { id: number; name: string } | null;
}

interface Props {
    transfers: {
        data: InventoryTransfer[];
        links: any[];
        meta: any;
    };
    branches: Branch[];
    ingredients: Ingredient[];
}

export default function Index({ transfers, branches, ingredients }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const approveTransfer = (transfer: InventoryTransfer) => {
        if (confirm(`Are you sure you want to approve this transfer?`)) {
            router.patch(route('admin.inventory-transfers.approve', transfer.id), {}, {
                preserveScroll: true,
            });
        }
    };

    const rejectTransfer = (transfer: InventoryTransfer) => {
        if (confirm(`Are you sure you want to reject this transfer?`)) {
            router.patch(route('admin.inventory-transfers.reject', transfer.id), {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Inventory Transfers
                    </h2>
                    <Link
                        href={route('admin.inventory-transfers.create')}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                    >
                        New Transfer
                    </Link>
                </div>
            }
        >
            <Head title="Inventory Transfers" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            From
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            To
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Ingredient
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Requested By
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Notes
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {transfers.data.map((transfer) => (
                                        <tr key={transfer.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {new Date(transfer.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {transfer.from_branch.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {transfer.to_branch.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {transfer.ingredient.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {transfer.quantity} {transfer.ingredient.unit}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadge(transfer.status)}`}>
                                                    {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {transfer.requested_by_user.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {transfer.notes || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                {transfer.status === 'pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => approveTransfer(transfer)}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => rejectTransfer(transfer)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {transfers.data.length === 0 && (
                            <div className="px-6 py-12 text-center text-gray-500">
                                No inventory transfers found.
                            </div>
                        )}
                        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3">
                            <div className="text-sm text-gray-700">
                                Showing {transfers.meta.from} to {transfers.meta.to} of {transfers.meta.total} results
                            </div>
                            <div className="flex gap-2">
                                {transfers.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`rounded-md px-3 py-1 text-sm ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

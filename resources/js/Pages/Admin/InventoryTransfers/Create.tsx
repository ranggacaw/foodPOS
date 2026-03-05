import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Branch, Ingredient } from '@/types';

interface Props {
    branches: Branch[];
    ingredients: Ingredient[];
}

export default function Create({ branches, ingredients }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        from_branch_id: '',
        to_branch_id: '',
        ingredient_id: '',
        quantity: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.inventory-transfers.store'));
    };

    const selectedIngredient = ingredients.find((i) => i.id === Number(data.ingredient_id));

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create Inventory Transfer
                </h2>
            }
        >
            <Head title="Create Inventory Transfer" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white p-8 shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="from_branch_id" className="block text-sm font-medium text-gray-700">
                                        From Branch *
                                    </label>
                                    <select
                                        id="from_branch_id"
                                        value={data.from_branch_id}
                                        onChange={(e) => setData('from_branch_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    >
                                        <option value="">Select branch</option>
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.from_branch_id && (
                                        <p className="mt-2 text-sm text-red-600">{errors.from_branch_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="to_branch_id" className="block text-sm font-medium text-gray-700">
                                        To Branch *
                                    </label>
                                    <select
                                        id="to_branch_id"
                                        value={data.to_branch_id}
                                        onChange={(e) => setData('to_branch_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    >
                                        <option value="">Select branch</option>
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.to_branch_id && (
                                        <p className="mt-2 text-sm text-red-600">{errors.to_branch_id}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="ingredient_id" className="block text-sm font-medium text-gray-700">
                                    Ingredient *
                                </label>
                                <select
                                    id="ingredient_id"
                                    value={data.ingredient_id}
                                    onChange={(e) => setData('ingredient_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Select ingredient</option>
                                    {ingredients.map((ingredient) => (
                                        <option key={ingredient.id} value={ingredient.id}>
                                            {ingredient.name} ({ingredient.unit})
                                        </option>
                                    ))}
                                </select>
                                {errors.ingredient_id && (
                                    <p className="mt-2 text-sm text-red-600">{errors.ingredient_id}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                                    Quantity ({selectedIngredient?.unit || 'units'}) *
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    min="0.0001"
                                    step="0.0001"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                    autoFocus
                                />
                                {errors.quantity && (
                                    <p className="mt-2 text-sm text-red-600">{errors.quantity}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                    Notes
                                </label>
                                <textarea
                                    id="notes"
                                    rows={3}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="Add any notes about this transfer..."
                                />
                                {errors.notes && (
                                    <p className="mt-2 text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Creating...' : 'Create Transfer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

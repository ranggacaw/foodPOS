import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Ingredient, MenuItem, PageProps, Recipe } from '@/types';
import { FormEventHandler } from 'react';

const formatCurrency = (value: number | string) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
        Number(value),
    );

export default function Index({
    menuItem,
    ingredients,
}: PageProps<{ menuItem: MenuItem; ingredients: Ingredient[] }>) {
    const recipes = menuItem.recipes || [];

    const { data, setData, post, processing, errors, reset } = useForm({
        ingredient_id: '',
        quantity: '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.menu-items.recipes.store', menuItem.id), {
            onSuccess: () => reset(),
        });
    };

    const handleDelete = (recipe: Recipe) => {
        if (confirm('Are you sure you want to remove this ingredient from the recipe?')) {
            router.delete(
                route('admin.menu-items.recipes.destroy', [menuItem.id, recipe.id]),
            );
        }
    };

    const totalCost = recipes.reduce((sum, recipe) => {
        const qty = Number(recipe.quantity);
        const cost = Number(recipe.ingredient?.cost_per_unit || 0);
        return sum + qty * cost;
    }, 0);

    const sellingPrice = Number(menuItem.price);
    const foodCostPercentage =
        sellingPrice > 0 ? (totalCost / sellingPrice) * 100 : 0;

    // Filter out ingredients already in the recipe
    const recipeIngredientIds = recipes.map((r) => r.ingredient_id);
    const availableIngredients = ingredients.filter(
        (i) => !recipeIngredientIds.includes(i.id),
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Recipe: {menuItem.name}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Selling Price: {formatCurrency(menuItem.price)}
                        </p>
                    </div>
                    <Link
                        href={route('admin.menu-items.index')}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        Back to Menu Items
                    </Link>
                </div>
            }
        >
            <Head title={`Recipe: ${menuItem.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Current Recipe Table */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Recipe Ingredients
                            </h3>
                        </div>
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
                                            Quantity
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Cost per Unit
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Cost
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {recipes.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-8 text-center text-sm text-gray-500"
                                            >
                                                No ingredients in this recipe yet. Add ingredients below.
                                            </td>
                                        </tr>
                                    ) : (
                                        recipes.map((recipe) => {
                                            const qty = Number(recipe.quantity);
                                            const costPerUnit = Number(
                                                recipe.ingredient?.cost_per_unit || 0,
                                            );
                                            const lineCost = qty * costPerUnit;

                                            return (
                                                <tr key={recipe.id} className="hover:bg-gray-50">
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                        {recipe.ingredient?.name}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {recipe.ingredient?.unit}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                                                        {Number(recipe.quantity).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                                                        {formatCurrency(costPerUnit)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                        {formatCurrency(lineCost)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleDelete(recipe)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                                {recipes.length > 0 && (
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-3 text-right text-sm font-semibold text-gray-900"
                                            >
                                                Total Cost:
                                            </td>
                                            <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                                                {formatCurrency(totalCost)}
                                            </td>
                                            <td />
                                        </tr>
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-3 text-right text-sm font-semibold text-gray-900"
                                            >
                                                Food Cost %:
                                            </td>
                                            <td
                                                className={`px-6 py-3 text-right text-sm font-bold ${
                                                    foodCostPercentage > 35
                                                        ? 'text-red-600'
                                                        : foodCostPercentage > 30
                                                          ? 'text-yellow-600'
                                                          : 'text-green-600'
                                                }`}
                                            >
                                                {foodCostPercentage.toFixed(1)}%
                                            </td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>

                    {/* Add Ingredient Form */}
                    <div className="mt-8 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Add Ingredient to Recipe
                            </h3>
                        </div>
                        <div className="p-6">
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col gap-4 sm:flex-row sm:items-end"
                            >
                                <div className="flex-1">
                                    <label
                                        htmlFor="ingredient_id"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Ingredient <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="ingredient_id"
                                        value={data.ingredient_id}
                                        onChange={(e) =>
                                            setData('ingredient_id', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    >
                                        <option value="">Select an ingredient</option>
                                        {availableIngredients.map((ingredient) => (
                                            <option key={ingredient.id} value={ingredient.id}>
                                                {ingredient.name} ({ingredient.unit}) -{' '}
                                                {formatCurrency(ingredient.cost_per_unit)}/
                                                {ingredient.unit}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.ingredient_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.ingredient_id}
                                        </p>
                                    )}
                                </div>

                                <div className="w-full sm:w-48">
                                    <label
                                        htmlFor="quantity"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="quantity"
                                        type="number"
                                        step="0.001"
                                        min="0.001"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="e.g. 0.5"
                                        required
                                    />
                                    {errors.quantity && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.quantity}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                >
                                    {processing ? 'Adding...' : 'Add Ingredient'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

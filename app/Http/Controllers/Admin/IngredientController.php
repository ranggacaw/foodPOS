<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class IngredientController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Ingredients/Index', [
            'ingredients' => Ingredient::with('inventory')
                ->orderBy('name')
                ->paginate(15),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Ingredients/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'unit' => ['required', 'string', 'max:50'],
            'cost_per_unit' => ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($validated) {
            $ingredient = Ingredient::create($validated);

            $ingredient->inventory()->create([
                'quantity_on_hand' => 0,
                'restock_threshold' => 0,
            ]);
        });

        return to_route('admin.ingredients.index')
            ->with('success', 'Ingredient created successfully.');
    }

    public function edit(Ingredient $ingredient): Response
    {
        return Inertia::render('Admin/Ingredients/Edit', [
            'ingredient' => $ingredient,
        ]);
    }

    public function update(Request $request, Ingredient $ingredient): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'unit' => ['required', 'string', 'max:50'],
            'cost_per_unit' => ['required', 'numeric', 'min:0'],
        ]);

        $ingredient->update($validated);

        return to_route('admin.ingredients.index')
            ->with('success', 'Ingredient updated successfully.');
    }

    public function destroy(Ingredient $ingredient): RedirectResponse
    {
        $ingredient->delete();

        return to_route('admin.ingredients.index')
            ->with('success', 'Ingredient deleted successfully.');
    }
}

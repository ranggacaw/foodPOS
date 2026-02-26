<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\MenuItem;
use App\Models\Recipe;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecipeController extends Controller
{
    public function index(MenuItem $menuItem): Response
    {
        return Inertia::render('Admin/Recipes/Index', [
            'menuItem' => $menuItem->load(['recipes.ingredient', 'category']),
            'ingredients' => Ingredient::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request, MenuItem $menuItem): RedirectResponse
    {
        $validated = $request->validate([
            'ingredient_id' => ['required', 'exists:ingredients,id'],
            'quantity' => ['required', 'numeric', 'min:0.0001'],
        ]);

        $menuItem->recipes()->updateOrCreate(
            ['ingredient_id' => $validated['ingredient_id']],
            ['quantity' => $validated['quantity']],
        );

        return to_route('admin.menu-items.recipes.index', $menuItem)
            ->with('success', 'Recipe ingredient saved successfully.');
    }

    public function destroy(MenuItem $menuItem, Recipe $recipe): RedirectResponse
    {
        $recipe->delete();

        return to_route('admin.menu-items.recipes.index', $menuItem)
            ->with('success', 'Recipe ingredient removed successfully.');
    }
}

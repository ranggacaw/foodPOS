<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(): Response
    {
        $inventory = Inventory::with('ingredient')
            ->orderBy('ingredient_id')
            ->get()
            ->map(function (Inventory $item) {
                return array_merge($item->toArray(), [
                    'is_low_stock' => $item->isLowStock(),
                ]);
            });

        return Inertia::render('Admin/Inventory/Index', [
            'inventory' => $inventory,
        ]);
    }

    public function update(Request $request, Inventory $inventory): RedirectResponse
    {
        $validated = $request->validate([
            'quantity_on_hand' => ['required', 'numeric', 'min:0'],
            'restock_threshold' => ['required', 'numeric', 'min:0'],
        ]);

        $inventory->update($validated);

        return to_route('admin.inventory.index')
            ->with('success', 'Inventory updated successfully.');
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CancelOrderController extends Controller
{
    public function __invoke(Request $request, Order $order): RedirectResponse
    {
        if ($order->status === 'cancelled') {
            abort(422, 'This order has already been cancelled.');
        }

        DB::transaction(function () use ($request, $order) {
            // Restore inventory: reverse the deduction made at order creation
            foreach ($order->items()->with('menuItem.recipes.ingredient.inventory')->get() as $item) {
                foreach ($item->menuItem->recipes as $recipe) {
                    $inventory = $recipe->ingredient->inventory;
                    if ($inventory) {
                        $restoreQty = (float) $recipe->quantity * (int) $item->quantity;
                        $inventory->increment('quantity_on_hand', $restoreQty);
                    }
                }
            }

            $order->update([
                'status' => 'cancelled',
                'cancelled_by' => $request->user()->id,
                'cancelled_at' => now(),
            ]);
        });

        return to_route('pos.orders.show', $order)
            ->with('success', "Order {$order->order_number} has been cancelled and inventory restored.");
    }
}

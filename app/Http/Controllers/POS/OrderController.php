<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(): Response
    {
        $categories = Category::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->with(['menuItems' => function ($query) {
                $query->where('is_active', true)->orderBy('name');
            }])
            ->get();

        return Inertia::render('POS/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_item_id' => ['required', 'exists:menu_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'payment_method' => ['required', 'string', 'in:cash,card,qris'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $order = DB::transaction(function () use ($validated, $request) {
            $taxRate = ($validated['tax_rate'] ?? 10) / 100;
            $subtotal = 0;
            $orderItemsData = [];

            foreach ($validated['items'] as $item) {
                $menuItem = MenuItem::with('recipes.ingredient')->findOrFail($item['menu_item_id']);

                $unitPrice = (float) $menuItem->price;
                $quantity = $item['quantity'];
                $lineSubtotal = $unitPrice * $quantity;

                // Calculate COGS per unit from recipes
                $unitCost = $menuItem->recipes->sum(function ($recipe) {
                    return (float) $recipe->quantity * (float) $recipe->ingredient->cost_per_unit;
                });
                $lineCost = $unitCost * $quantity;

                $subtotal += $lineSubtotal;

                $orderItemsData[] = [
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $lineSubtotal,
                    'cost' => $lineCost,
                ];

                // Deduct ingredient quantities from inventory
                foreach ($menuItem->recipes as $recipe) {
                    $totalNeeded = (float) $recipe->quantity * $quantity;

                    $inventory = $recipe->ingredient->inventory;
                    if ($inventory) {
                        $inventory->decrement('quantity_on_hand', $totalNeeded);
                    }
                }
            }

            $tax = round($subtotal * $taxRate, 2);
            $total = round($subtotal + $tax, 2);

            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $request->user()->id,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'status' => 'completed',
            ]);

            $order->items()->createMany($orderItemsData);

            return $order;
        });

        return to_route('pos.orders.show', $order)
            ->with('success', "Order {$order->order_number} created successfully.");
    }

    public function show(Order $order): Response
    {
        return Inertia::render('POS/OrderDetail', [
            'order' => $order->load(['items.menuItem', 'user']),
        ]);
    }

    public function history(Request $request): Response
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->whereDate('created_at', today())
            ->orderByDesc('created_at')
            ->with('items.menuItem')
            ->paginate(20);

        return Inertia::render('POS/History', [
            'orders' => $orders,
        ]);
    }
}

<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Order;
use App\Services\BranchContext;
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
            ->with([
                'menuItems' => function ($query) {
                    $query->where('is_active', true)->orderBy('name');
                }
            ])
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
            'discount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $order = DB::transaction(function () use ($validated, $request) {
            $taxRate = ($validated['tax_rate'] ?? 10) / 100;
            $discount = (float) ($validated['discount'] ?? 0);
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

            $subtotalAfterDiscount = max(0, $subtotal - $discount);
            $tax = round($subtotalAfterDiscount * $taxRate, 2);
            $total = round($subtotalAfterDiscount + $tax, 2);

            $shift_id = $request->user()->shifts()->where('status', 'open')->value('id');
            $branch_id = $request->user()->branch_id ?? BranchContext::getActiveBranchId();

            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'branch_id' => $branch_id,
                'user_id' => $request->user()->id,
                'shift_id' => $shift_id,
                'subtotal' => $subtotal,
                'discount' => $discount,
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
            'order' => $order->load(['items.menuItem', 'user', 'cancelledBy']),
        ]);
    }

    public function history(Request $request): Response
    {
        $from = $request->input('from', today()->toDateString());
        $to = $request->input('to', today()->toDateString());

        $orders = Order::where('user_id', $request->user()->id)
            ->whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->orderByDesc('created_at')
            ->with('items.menuItem')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('POS/History', [
            'orders' => $orders,
            'filters' => [
                'from' => $from,
                'to' => $to,
            ]
        ]);
    }
}

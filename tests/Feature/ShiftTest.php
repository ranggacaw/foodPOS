<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Inventory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Recipe;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShiftTest extends TestCase
{
    use RefreshDatabase;

    public function test_cashier_can_open_shift()
    {
        $cashier = User::factory()->create(['role' => 'cashier']);
        $this->actingAs($cashier);

        $response = $this->post(route('pos.shifts.store'), [
            'opening_cash' => 100000,
        ]);

        $response->assertRedirect(route('pos.index'));

        $shift = Shift::where('user_id', $cashier->id)->first();
        $this->assertNotNull($shift);
        $this->assertEquals(100000, $shift->opening_cash);
        $this->assertEquals('open', $shift->status);
    }

    public function test_cashier_cannot_open_multiple_shifts()
    {
        $cashier = User::factory()->create(['role' => 'cashier']);
        $this->actingAs($cashier);

        Shift::create([
            'user_id' => $cashier->id,
            'opening_cash' => 100000,
            'status' => 'open',
            'opened_at' => now(),
        ]);

        $response = $this->post(route('pos.shifts.store'), [
            'opening_cash' => 50000,
        ]);

        $response->assertSessionHasErrors('opening_cash');
        $this->assertEquals(1, Shift::where('user_id', $cashier->id)->count());
    }

    public function test_cashier_can_close_their_own_shift()
    {
        $cashier = User::factory()->create(['role' => 'cashier']);
        $this->actingAs($cashier);

        $shift = Shift::create([
            'user_id' => $cashier->id,
            'opening_cash' => 100000,
            'status' => 'open',
            'opened_at' => now(),
        ]);

        $response = $this->patch(route('pos.shifts.update', $shift->id), [
            'closing_cash' => 100000,
            'notes' => 'All good',
        ]);

        $response->assertRedirect(route('pos.shifts.show', $shift->id));

        $shift->refresh();
        $this->assertEquals('closed', $shift->status);
        $this->assertNotNull($shift->closed_at);
        $this->assertEquals(100000, $shift->closing_cash);
        $this->assertEquals('All good', $shift->notes);
    }

    public function test_cashier_cannot_close_another_cashiers_shift()
    {
        $cashier1 = User::factory()->create(['role' => 'cashier']);
        $cashier2 = User::factory()->create(['role' => 'cashier']);

        $shift = Shift::create([
            'user_id' => $cashier1->id,
            'opening_cash' => 100000,
            'status' => 'open',
            'opened_at' => now(),
        ]);

        $this->actingAs($cashier2);

        $response = $this->patch(route('pos.shifts.update', $shift->id), [
            'closing_cash' => 100000,
        ]);

        $response->assertStatus(403);
    }

    public function test_order_placed_during_open_shift_has_shift_id_populated()
    {
        $cashier = User::factory()->create(['role' => 'cashier']);
        $this->actingAs($cashier);

        $shift = Shift::create([
            'user_id' => $cashier->id,
            'opening_cash' => 100000,
            'status' => 'open',
            'opened_at' => now(),
        ]);

        // Required setup for order creation
        $category = Category::create(['name' => 'Beverages', 'sort_order' => 1, 'is_active' => true]);
        $ingredient = Ingredient::create(['name' => 'Sugar', 'unit' => 'kg', 'cost_per_unit' => 5000]);
        $inventory = Inventory::create(['ingredient_id' => $ingredient->id, 'quantity_on_hand' => 10.0, 'restock_threshold' => 1.0]);
        $menuItem = MenuItem::create(['category_id' => $category->id, 'name' => 'Tea', 'price' => 15000, 'is_active' => true]);
        Recipe::create(['menu_item_id' => $menuItem->id, 'ingredient_id' => $ingredient->id, 'quantity' => 0.01]);

        $response = $this->post(route('pos.orders.store'), [
            'items' => [
                ['menu_item_id' => $menuItem->id, 'quantity' => 1]
            ],
            'payment_method' => 'cash',
        ]);

        $order = Order::first();
        $this->assertNotNull($order);
        $this->assertEquals($shift->id, $order->shift_id);
    }

    public function test_order_placed_with_no_open_shift_has_null_shift_id()
    {
        $cashier = User::factory()->create(['role' => 'cashier']);
        $this->actingAs($cashier);

        // Required setup for order creation
        $category = Category::create(['name' => 'Beverages', 'sort_order' => 1, 'is_active' => true]);
        $ingredient = Ingredient::create(['name' => 'Sugar', 'unit' => 'kg', 'cost_per_unit' => 5000]);
        $inventory = Inventory::create(['ingredient_id' => $ingredient->id, 'quantity_on_hand' => 10.0, 'restock_threshold' => 1.0]);
        $menuItem = MenuItem::create(['category_id' => $category->id, 'name' => 'Tea', 'price' => 15000, 'is_active' => true]);
        Recipe::create(['menu_item_id' => $menuItem->id, 'ingredient_id' => $ingredient->id, 'quantity' => 0.01]);

        $response = $this->post(route('pos.orders.store'), [
            'items' => [
                ['menu_item_id' => $menuItem->id, 'quantity' => 1]
            ],
            'payment_method' => 'cash',
        ]);

        $order = Order::first();
        $this->assertNotNull($order);
        $this->assertNull($order->shift_id);
    }
}

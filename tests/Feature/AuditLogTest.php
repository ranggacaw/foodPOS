<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Inventory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_audit_log_viewer()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $response = $this->actingAs($admin)->get(route('admin.audit-log.index'));
        $response->assertStatus(200);
    }

    public function test_cashier_cannot_access_audit_log_viewer()
    {
        $cashier = User::factory()->create(['role' => 'cashier']);
        $response = $this->actingAs($cashier)->get(route('admin.audit-log.index'));
        $response->assertStatus(403);
    }

    public function test_user_creation_logs_event_without_password()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        ActivityLog::truncate();

        $user = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'cashier',
        ]);

        $log = ActivityLog::where('action', 'user.created')->first();

        $this->assertNotNull($log);
        $this->assertEquals($admin->id, $log->user_id);
        $this->assertEquals(User::class, $log->model_type);
        $this->assertEquals($user->id, $log->model_id);

        $this->assertArrayNotHasKey('password', $log->payload);
        $this->assertArrayNotHasKey('remember_token', $log->payload);
        $this->assertEquals('John Doe', $log->payload['name']);
    }

    public function test_inventory_update_logs_old_and_new_quantities()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        $ingredient = Ingredient::create([
            'name' => 'Salt',
            'unit' => 'kg',
            'cost_per_unit' => 10,
        ]);

        $inventory = Inventory::create([
            'ingredient_id' => $ingredient->id,
            'quantity_on_hand' => 10,
            'restock_threshold' => 2,
        ]);

        // Clear logs from creation
        ActivityLog::truncate();

        $inventory->update(['quantity_on_hand' => 5]);

        $log = ActivityLog::where('action', 'inventory.updated')->first();

        $this->assertNotNull($log);
        $this->assertEquals(Inventory::class, $log->model_type);
        $this->assertEquals($inventory->id, $log->model_id);

        $this->assertEquals(10, $log->payload['old_quantity']);
        $this->assertEquals(5, $log->payload['new_quantity']);
        $this->assertEquals('Salt', $log->payload['ingredient_name']);
    }

    public function test_order_creation_logs_event()
    {
        $cashier = User::factory()->create(['role' => 'cashier']);
        $this->actingAs($cashier);

        // Required setup for order creation
        $category = Category::create(['name' => 'Beverages', 'sort_order' => 1, 'is_active' => true]);
        $ingredient = Ingredient::create(['name' => 'Sugar', 'unit' => 'kg', 'cost_per_unit' => 5000]);
        $inventory = Inventory::create(['ingredient_id' => $ingredient->id, 'quantity_on_hand' => 10.0, 'restock_threshold' => 1.0]);
        $menuItem = MenuItem::create(['category_id' => $category->id, 'name' => 'Tea', 'price' => 15000, 'is_active' => true]);
        Recipe::create(['menu_item_id' => $menuItem->id, 'ingredient_id' => $ingredient->id, 'quantity' => 0.01]);

        ActivityLog::truncate(); // clear Setup logs

        $response = $this->post(route('pos.orders.store'), [
            'items' => [
                ['menu_item_id' => $menuItem->id, 'quantity' => 1]
            ],
            'payment_method' => 'cash',
        ]);

        $order = Order::first();

        $log = ActivityLog::where('action', 'order.created')->first();

        $this->assertNotNull($log);
        $this->assertEquals($cashier->id, $log->user_id);
        $this->assertEquals(Order::class, $log->model_type);
        $this->assertEquals($order->id, $log->model_id);
        $this->assertEquals($order->order_number, $log->payload['order_number']);
        $this->assertEquals('cash', $log->payload['payment_method']);
    }

    public function test_order_cancellation_logs_event()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $order = Order::create([
            'order_number' => 'ORD-TEST-001',
            'user_id' => $admin->id,
            'subtotal' => 100,
            'tax' => 10,
            'total' => 110,
            'payment_method' => 'cash',
            'status' => 'completed',
        ]);

        // Manually truncate to avoid previous logs bleeding in if db didn't refresh
        ActivityLog::truncate();

        $this->actingAs($admin)->patch(route('admin.orders.cancel', $order));

        $log = ActivityLog::where('action', 'order.cancelled')->first();

        $this->assertNotNull($log);
        $this->assertEquals($admin->id, $log->user_id);
        $this->assertEquals(Order::class, $log->model_type);
        $this->assertEquals($order->id, $log->model_id);
        $this->assertEquals('ORD-TEST-001', $log->payload['order_number']);
    }
}

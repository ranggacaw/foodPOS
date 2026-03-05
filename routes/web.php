<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\IngredientController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\InventoryTransferController;
use App\Http\Controllers\Admin\MenuItemController;
use App\Http\Controllers\Admin\RecipeController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\CancelOrderController;
use App\Http\Controllers\Admin\BranchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\POS\OrderController;
use App\Http\Controllers\POS\ShiftController;
use App\Http\Controllers\POS\TransactionHistoryController;
use App\Http\Controllers\POS\PushSubscriptionController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Dashboard (authenticated)
Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Profile routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin routes (role:admin middleware)
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::resource('branches', BranchController::class)->except(['show', 'destroy']);
        Route::post('branches/switch', [BranchController::class, 'switch'])->name('branches.switch');
        Route::resource('categories', CategoryController::class)->except(['show']);
        Route::resource('menu-items', MenuItemController::class)->except(['show']);
        Route::resource('ingredients', IngredientController::class)->except(['show']);

        // Recipes (nested under menu items)
        Route::get('menu-items/{menu_item}/recipes', [RecipeController::class, 'index'])
            ->name('menu-items.recipes.index');
        Route::post('menu-items/{menu_item}/recipes', [RecipeController::class, 'store'])
            ->name('menu-items.recipes.store');
        Route::delete('menu-items/{menu_item}/recipes/{recipe}', [RecipeController::class, 'destroy'])
            ->name('menu-items.recipes.destroy');

        // Inventory
        Route::get('inventory', [InventoryController::class, 'index'])
            ->name('inventory.index');
        Route::put('inventory/{inventory}', [InventoryController::class, 'update'])
            ->name('inventory.update');

        // Reports
        Route::get('reports', [ReportController::class, 'index'])
            ->name('reports.index');

        // Audit Log
        Route::get('audit-log', [AuditLogController::class, 'index'])
            ->name('audit-log.index');

        // Order cancellation
        Route::patch('orders/{order}/cancel', CancelOrderController::class)
            ->name('orders.cancel');

        // Inventory Transfers
        Route::resource('inventory-transfers', InventoryTransferController::class)->only(['index', 'create', 'store']);
        Route::patch('inventory-transfers/{transfer}/approve', [InventoryTransferController::class, 'approve'])->name('inventory-transfers.approve');
        Route::patch('inventory-transfers/{transfer}/reject', [InventoryTransferController::class, 'reject'])->name('inventory-transfers.reject');
    });

// POS routes (accessible by both admin and cashier)
Route::middleware(['auth', 'verified'])
    ->prefix('pos')
    ->name('pos.')
    ->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
        Route::get('/orders/history', [OrderController::class, 'history'])->name('orders.history');
        Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');

        // Transaction History
        Route::get('/history', [TransactionHistoryController::class, 'index'])->name('history.index');
        Route::get('/history/{date}', [TransactionHistoryController::class, 'show'])->name('history.show');

        // Shifts
        Route::get('/shifts', [ShiftController::class, 'index'])->name('shifts.index');
        Route::get('/shifts/open', [ShiftController::class, 'create'])->name('shifts.open');
        Route::post('/shifts', [ShiftController::class, 'store'])->name('shifts.store');
        Route::get('/shifts/{shift}/close', [ShiftController::class, 'close'])->name('shifts.close');
        Route::patch('/shifts/{shift}', [ShiftController::class, 'update'])->name('shifts.update');
        Route::get('/shifts/{shift}', [ShiftController::class, 'show'])->name('shifts.show');

        // Push Subscriptions
        Route::post('/push-subscriptions', [PushSubscriptionController::class, 'store'])->name('push-subscriptions.store');
        Route::delete('/push-subscriptions/{endpoint}', [PushSubscriptionController::class, 'destroy'])->name('push-subscriptions.destroy');
    });

require __DIR__ . '/auth.php';

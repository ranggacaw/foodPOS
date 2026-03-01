<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Models\Order;
use App\Models\Inventory;
use App\Models\Ingredient;
use App\Models\MenuItem;
use App\Models\User;
use App\Observers\OrderObserver;
use App\Observers\InventoryObserver;
use App\Observers\IngredientObserver;
use App\Observers\MenuItemObserver;
use App\Observers\UserObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Order::observe(OrderObserver::class);
        Inventory::observe(InventoryObserver::class);
        Ingredient::observe(IngredientObserver::class);
        MenuItem::observe(MenuItemObserver::class);
        User::observe(UserObserver::class);
    }
}

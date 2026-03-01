<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     * Skipped on SQLite (test environment) — SQLite does not support MODIFY COLUMN.
     * The base orders migration already defines the correct enum for new SQLite installs.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_method ENUM('cash', 'card', 'qris') DEFAULT 'cash'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_method ENUM('cash', 'card', 'other') DEFAULT 'cash'");
    }
};

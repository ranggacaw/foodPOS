<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Seed the application's database with default admin and cashier users.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@foodpos.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ],
        );

        User::updateOrCreate(
            ['email' => 'cashier@foodpos.com'],
            [
                'name' => 'Cashier',
                'password' => Hash::make('password'),
                'role' => 'cashier',
            ],
        );
    }
}

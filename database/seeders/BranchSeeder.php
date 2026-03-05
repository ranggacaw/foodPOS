<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Order;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        $branch = Branch::firstOrCreate(
            ['name' => 'Pusat'],
            [
                'address' => 'Main Office',
                'phone' => null,
                'is_active' => true,
            ]
        );

        User::whereNull('branch_id')->update(['branch_id' => $branch->id]);
        Order::whereNull('branch_id')->update(['branch_id' => $branch->id]);
        Shift::whereNull('branch_id')->update(['branch_id' => $branch->id]);
    }
}

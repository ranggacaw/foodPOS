<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Inventory;
use App\Models\MenuItem;
use App\Models\Recipe;
use Illuminate\Database\Seeder;

class SampleDataSeeder extends Seeder
{
    /**
     * Seed sample data: categories, ingredients, inventory, menu items, and recipes
     * for a realistic Indonesian restaurant.
     */
    public function run(): void
    {
        // ---------------------------------------------------------------
        // 1. Categories
        // ---------------------------------------------------------------
        $categories = [
            ['name' => 'Nasi & Mie',       'description' => 'Rice and noodle dishes',          'sort_order' => 1, 'is_active' => true],
            ['name' => 'Ayam & Daging',     'description' => 'Chicken and meat dishes',         'sort_order' => 2, 'is_active' => true],
            ['name' => 'Seafood',           'description' => 'Fish, shrimp, and seafood',       'sort_order' => 3, 'is_active' => true],
            ['name' => 'Sayuran',           'description' => 'Vegetable side dishes',           'sort_order' => 4, 'is_active' => true],
            ['name' => 'Gorengan & Snack',  'description' => 'Fried snacks and appetisers',     'sort_order' => 5, 'is_active' => true],
            ['name' => 'Minuman',           'description' => 'Beverages',                       'sort_order' => 6, 'is_active' => true],
        ];

        $catModels = [];
        foreach ($categories as $cat) {
            $catModels[$cat['name']] = Category::updateOrCreate(['name' => $cat['name']], $cat);
        }

        // ---------------------------------------------------------------
        // 2. Ingredients + Inventory
        // ---------------------------------------------------------------
        $ingredients = [
            // Rice & staples
            ['name' => 'Beras Putih',           'unit' => 'kg',     'cost_per_unit' => 14000,   'stock' => 100,  'threshold' => 20],
            ['name' => 'Mie Telur',             'unit' => 'kg',     'cost_per_unit' => 22000,   'stock' => 40,   'threshold' => 10],
            ['name' => 'Bihun',                 'unit' => 'kg',     'cost_per_unit' => 20000,   'stock' => 30,   'threshold' => 8],
            ['name' => 'Kwetiaw',               'unit' => 'kg',     'cost_per_unit' => 24000,   'stock' => 25,   'threshold' => 8],

            // Proteins
            ['name' => 'Ayam (whole)',           'unit' => 'kg',     'cost_per_unit' => 36000,   'stock' => 50,   'threshold' => 10],
            ['name' => 'Daging Sapi',           'unit' => 'kg',     'cost_per_unit' => 130000,  'stock' => 20,   'threshold' => 5],
            ['name' => 'Udang',                 'unit' => 'kg',     'cost_per_unit' => 90000,   'stock' => 15,   'threshold' => 5],
            ['name' => 'Ikan Dori Fillet',      'unit' => 'kg',     'cost_per_unit' => 55000,   'stock' => 15,   'threshold' => 5],
            ['name' => 'Telur Ayam',            'unit' => 'butir',  'cost_per_unit' => 2500,    'stock' => 300,  'threshold' => 50],
            ['name' => 'Tahu',                  'unit' => 'kg',     'cost_per_unit' => 16000,   'stock' => 20,   'threshold' => 5],
            ['name' => 'Tempe',                 'unit' => 'kg',     'cost_per_unit' => 18000,   'stock' => 20,   'threshold' => 5],
            ['name' => 'Cumi',                  'unit' => 'kg',     'cost_per_unit' => 75000,   'stock' => 10,   'threshold' => 3],

            // Vegetables
            ['name' => 'Kangkung',              'unit' => 'ikat',   'cost_per_unit' => 5000,    'stock' => 40,   'threshold' => 10],
            ['name' => 'Kol / Kubis',           'unit' => 'kg',     'cost_per_unit' => 10000,   'stock' => 20,   'threshold' => 5],
            ['name' => 'Wortel',                'unit' => 'kg',     'cost_per_unit' => 12000,   'stock' => 15,   'threshold' => 5],
            ['name' => 'Tauge',                 'unit' => 'kg',     'cost_per_unit' => 8000,    'stock' => 15,   'threshold' => 5],
            ['name' => 'Bayam',                 'unit' => 'ikat',   'cost_per_unit' => 5000,    'stock' => 30,   'threshold' => 8],
            ['name' => 'Timun',                 'unit' => 'kg',     'cost_per_unit' => 8000,    'stock' => 10,   'threshold' => 3],
            ['name' => 'Tomat',                 'unit' => 'kg',     'cost_per_unit' => 12000,   'stock' => 10,   'threshold' => 3],
            ['name' => 'Daun Bawang',           'unit' => 'ikat',   'cost_per_unit' => 4000,    'stock' => 30,   'threshold' => 8],

            // Aromatics & spices
            ['name' => 'Bawang Merah',          'unit' => 'kg',     'cost_per_unit' => 35000,   'stock' => 15,   'threshold' => 5],
            ['name' => 'Bawang Putih',          'unit' => 'kg',     'cost_per_unit' => 32000,   'stock' => 15,   'threshold' => 5],
            ['name' => 'Cabai Merah',           'unit' => 'kg',     'cost_per_unit' => 45000,   'stock' => 10,   'threshold' => 3],
            ['name' => 'Cabai Rawit',           'unit' => 'kg',     'cost_per_unit' => 50000,   'stock' => 8,    'threshold' => 2],
            ['name' => 'Jahe',                  'unit' => 'kg',     'cost_per_unit' => 30000,   'stock' => 5,    'threshold' => 2],
            ['name' => 'Kunyit',                'unit' => 'kg',     'cost_per_unit' => 25000,   'stock' => 5,    'threshold' => 2],
            ['name' => 'Lengkuas',              'unit' => 'kg',     'cost_per_unit' => 20000,   'stock' => 5,    'threshold' => 2],
            ['name' => 'Serai',                 'unit' => 'batang', 'cost_per_unit' => 1000,    'stock' => 50,   'threshold' => 15],
            ['name' => 'Daun Salam',            'unit' => 'lembar', 'cost_per_unit' => 500,     'stock' => 100,  'threshold' => 20],
            ['name' => 'Daun Jeruk',            'unit' => 'lembar', 'cost_per_unit' => 500,     'stock' => 100,  'threshold' => 20],
            ['name' => 'Kemiri',                'unit' => 'kg',     'cost_per_unit' => 60000,   'stock' => 3,    'threshold' => 1],
            ['name' => 'Ketumbar Bubuk',        'unit' => 'kg',     'cost_per_unit' => 80000,   'stock' => 2,    'threshold' => 1],

            // Sauces & condiments
            ['name' => 'Kecap Manis',           'unit' => 'liter',  'cost_per_unit' => 25000,   'stock' => 10,   'threshold' => 3],
            ['name' => 'Kecap Asin',            'unit' => 'liter',  'cost_per_unit' => 20000,   'stock' => 8,    'threshold' => 3],
            ['name' => 'Saus Tiram',            'unit' => 'liter',  'cost_per_unit' => 30000,   'stock' => 6,    'threshold' => 2],
            ['name' => 'Saus Tomat',            'unit' => 'liter',  'cost_per_unit' => 18000,   'stock' => 6,    'threshold' => 2],
            ['name' => 'Saus Sambal',           'unit' => 'liter',  'cost_per_unit' => 20000,   'stock' => 6,    'threshold' => 2],
            ['name' => 'Santan (kotak)',        'unit' => 'liter',  'cost_per_unit' => 18000,   'stock' => 20,   'threshold' => 5],
            ['name' => 'Minyak Goreng',         'unit' => 'liter',  'cost_per_unit' => 18000,   'stock' => 30,   'threshold' => 10],
            ['name' => 'Garam',                 'unit' => 'kg',     'cost_per_unit' => 5000,    'stock' => 10,   'threshold' => 3],
            ['name' => 'Gula Pasir',            'unit' => 'kg',     'cost_per_unit' => 14000,   'stock' => 10,   'threshold' => 3],
            ['name' => 'Merica Bubuk',          'unit' => 'kg',     'cost_per_unit' => 120000,  'stock' => 2,    'threshold' => 1],
            ['name' => 'Tepung Terigu',         'unit' => 'kg',     'cost_per_unit' => 10000,   'stock' => 20,   'threshold' => 5],
            ['name' => 'Tepung Beras',          'unit' => 'kg',     'cost_per_unit' => 12000,   'stock' => 10,   'threshold' => 3],

            // Beverages
            ['name' => 'Teh Celup',             'unit' => 'pcs',    'cost_per_unit' => 500,     'stock' => 200,  'threshold' => 50],
            ['name' => 'Kopi Bubuk',            'unit' => 'kg',     'cost_per_unit' => 80000,   'stock' => 5,    'threshold' => 2],
            ['name' => 'Gula Merah',            'unit' => 'kg',     'cost_per_unit' => 25000,   'stock' => 8,    'threshold' => 3],
            ['name' => 'Es Batu',               'unit' => 'kg',     'cost_per_unit' => 5000,    'stock' => 30,   'threshold' => 10],
            ['name' => 'Air Mineral (galon)',    'unit' => 'galon',  'cost_per_unit' => 6000,    'stock' => 10,   'threshold' => 3],
            ['name' => 'Jeruk Nipis',           'unit' => 'kg',     'cost_per_unit' => 15000,   'stock' => 5,    'threshold' => 2],
            ['name' => 'Sirup Cocopandan',      'unit' => 'botol',  'cost_per_unit' => 15000,   'stock' => 5,    'threshold' => 2],
            ['name' => 'Susu Kental Manis',     'unit' => 'kaleng', 'cost_per_unit' => 10000,   'stock' => 15,   'threshold' => 5],

            // Kerupuk & extras
            ['name' => 'Kerupuk Udang',         'unit' => 'kg',     'cost_per_unit' => 40000,   'stock' => 10,   'threshold' => 3],
            ['name' => 'Emping',                'unit' => 'kg',     'cost_per_unit' => 50000,   'stock' => 5,    'threshold' => 2],
        ];

        $ingModels = [];
        foreach ($ingredients as $ing) {
            $model = Ingredient::updateOrCreate(
                ['name' => $ing['name']],
                [
                    'unit' => $ing['unit'],
                    'cost_per_unit' => $ing['cost_per_unit'],
                ],
            );
            $ingModels[$ing['name']] = $model;

            Inventory::updateOrCreate(
                ['ingredient_id' => $model->id],
                [
                    'quantity_on_hand' => $ing['stock'],
                    'restock_threshold' => $ing['threshold'],
                ],
            );
        }

        // ---------------------------------------------------------------
        // 3. Menu Items + Recipes
        // ---------------------------------------------------------------
        $menuItems = [
            // --- Nasi & Mie ---
            [
                'category' => 'Nasi & Mie',
                'name' => 'Nasi Goreng Spesial',
                'description' => 'Fried rice with egg, chicken, and kerupuk',
                'price' => 28000,
                'recipe' => [
                    ['Beras Putih', 0.25],      // 250g cooked rice
                    ['Telur Ayam', 1],           // 1 egg
                    ['Ayam (whole)', 0.08],      // 80g chicken
                    ['Bawang Merah', 0.02],
                    ['Bawang Putih', 0.01],
                    ['Cabai Merah', 0.02],
                    ['Kecap Manis', 0.02],
                    ['Minyak Goreng', 0.03],
                    ['Garam', 0.005],
                    ['Daun Bawang', 0.25],       // 1/4 bunch
                    ['Kerupuk Udang', 0.02],
                ],
            ],
            [
                'category' => 'Nasi & Mie',
                'name' => 'Nasi Goreng Seafood',
                'description' => 'Fried rice with shrimp, squid, and vegetables',
                'price' => 35000,
                'recipe' => [
                    ['Beras Putih', 0.25],
                    ['Udang', 0.06],
                    ['Cumi', 0.05],
                    ['Telur Ayam', 1],
                    ['Bawang Merah', 0.02],
                    ['Bawang Putih', 0.015],
                    ['Cabai Merah', 0.02],
                    ['Kecap Manis', 0.02],
                    ['Saus Tiram', 0.01],
                    ['Minyak Goreng', 0.03],
                    ['Garam', 0.005],
                ],
            ],
            [
                'category' => 'Nasi & Mie',
                'name' => 'Mie Goreng Spesial',
                'description' => 'Stir-fried egg noodles with chicken and vegetables',
                'price' => 27000,
                'recipe' => [
                    ['Mie Telur', 0.2],
                    ['Ayam (whole)', 0.06],
                    ['Telur Ayam', 1],
                    ['Kol / Kubis', 0.05],
                    ['Wortel', 0.03],
                    ['Tauge', 0.03],
                    ['Bawang Merah', 0.02],
                    ['Bawang Putih', 0.01],
                    ['Kecap Manis', 0.02],
                    ['Saus Tiram', 0.01],
                    ['Minyak Goreng', 0.03],
                ],
            ],
            [
                'category' => 'Nasi & Mie',
                'name' => 'Mie Goreng Seafood',
                'description' => 'Stir-fried noodles with shrimp and squid',
                'price' => 33000,
                'recipe' => [
                    ['Mie Telur', 0.2],
                    ['Udang', 0.05],
                    ['Cumi', 0.04],
                    ['Kol / Kubis', 0.05],
                    ['Wortel', 0.03],
                    ['Bawang Merah', 0.02],
                    ['Bawang Putih', 0.01],
                    ['Kecap Manis', 0.015],
                    ['Saus Tiram', 0.015],
                    ['Minyak Goreng', 0.03],
                ],
            ],
            [
                'category' => 'Nasi & Mie',
                'name' => 'Bihun Goreng',
                'description' => 'Stir-fried rice vermicelli with vegetables',
                'price' => 25000,
                'recipe' => [
                    ['Bihun', 0.15],
                    ['Ayam (whole)', 0.05],
                    ['Telur Ayam', 1],
                    ['Kol / Kubis', 0.05],
                    ['Wortel', 0.03],
                    ['Tauge', 0.03],
                    ['Bawang Merah', 0.02],
                    ['Bawang Putih', 0.01],
                    ['Kecap Manis', 0.015],
                    ['Minyak Goreng', 0.03],
                ],
            ],
            [
                'category' => 'Nasi & Mie',
                'name' => 'Kwetiaw Goreng',
                'description' => 'Stir-fried flat rice noodles with egg and vegetables',
                'price' => 28000,
                'recipe' => [
                    ['Kwetiaw', 0.2],
                    ['Ayam (whole)', 0.06],
                    ['Telur Ayam', 1],
                    ['Tauge', 0.04],
                    ['Daun Bawang', 0.25],
                    ['Bawang Putih', 0.015],
                    ['Kecap Manis', 0.02],
                    ['Kecap Asin', 0.01],
                    ['Minyak Goreng', 0.03],
                ],
            ],
            [
                'category' => 'Nasi & Mie',
                'name' => 'Nasi Putih',
                'description' => 'Steamed white rice',
                'price' => 8000,
                'recipe' => [
                    ['Beras Putih', 0.2],
                ],
            ],

            // --- Ayam & Daging ---
            [
                'category' => 'Ayam & Daging',
                'name' => 'Ayam Goreng Kremes',
                'description' => 'Fried chicken with crispy spiced crumbles',
                'price' => 32000,
                'recipe' => [
                    ['Ayam (whole)', 0.25],
                    ['Bawang Putih', 0.015],
                    ['Kunyit', 0.005],
                    ['Ketumbar Bubuk', 0.003],
                    ['Garam', 0.005],
                    ['Tepung Beras', 0.03],
                    ['Minyak Goreng', 0.1],
                ],
            ],
            [
                'category' => 'Ayam & Daging',
                'name' => 'Ayam Bakar Madu',
                'description' => 'Grilled chicken marinated in honey-soy glaze',
                'price' => 35000,
                'recipe' => [
                    ['Ayam (whole)', 0.25],
                    ['Kecap Manis', 0.03],
                    ['Bawang Putih', 0.015],
                    ['Jahe', 0.005],
                    ['Minyak Goreng', 0.02],
                    ['Garam', 0.003],
                    ['Merica Bubuk', 0.002],
                ],
            ],
            [
                'category' => 'Ayam & Daging',
                'name' => 'Ayam Geprek',
                'description' => 'Smashed crispy chicken with sambal',
                'price' => 28000,
                'recipe' => [
                    ['Ayam (whole)', 0.2],
                    ['Tepung Terigu', 0.04],
                    ['Bawang Putih', 0.01],
                    ['Cabai Rawit', 0.03],
                    ['Bawang Merah', 0.02],
                    ['Tomat', 0.03],
                    ['Garam', 0.005],
                    ['Minyak Goreng', 0.1],
                ],
            ],
            [
                'category' => 'Ayam & Daging',
                'name' => 'Rendang Sapi',
                'description' => 'Slow-cooked beef in coconut and spice paste',
                'price' => 45000,
                'recipe' => [
                    ['Daging Sapi', 0.15],
                    ['Santan (kotak)', 0.15],
                    ['Bawang Merah', 0.03],
                    ['Bawang Putih', 0.015],
                    ['Cabai Merah', 0.03],
                    ['Jahe', 0.01],
                    ['Lengkuas', 0.01],
                    ['Serai', 2],
                    ['Daun Jeruk', 3],
                    ['Daun Salam', 2],
                    ['Kunyit', 0.005],
                    ['Kemiri', 0.01],
                    ['Garam', 0.005],
                    ['Minyak Goreng', 0.02],
                ],
            ],
            [
                'category' => 'Ayam & Daging',
                'name' => 'Sapi Lada Hitam',
                'description' => 'Beef stir-fried with black pepper sauce',
                'price' => 42000,
                'recipe' => [
                    ['Daging Sapi', 0.15],
                    ['Merica Bubuk', 0.005],
                    ['Bawang Merah', 0.02],
                    ['Bawang Putih', 0.015],
                    ['Saus Tiram', 0.02],
                    ['Kecap Manis', 0.01],
                    ['Wortel', 0.03],
                    ['Minyak Goreng', 0.03],
                    ['Garam', 0.003],
                ],
            ],

            // --- Seafood ---
            [
                'category' => 'Seafood',
                'name' => 'Udang Saus Padang',
                'description' => 'Shrimp in spicy Padang-style sauce',
                'price' => 45000,
                'recipe' => [
                    ['Udang', 0.15],
                    ['Cabai Merah', 0.03],
                    ['Bawang Merah', 0.02],
                    ['Bawang Putih', 0.015],
                    ['Tomat', 0.04],
                    ['Saus Tomat', 0.02],
                    ['Garam', 0.003],
                    ['Gula Pasir', 0.005],
                    ['Minyak Goreng', 0.03],
                ],
            ],
            [
                'category' => 'Seafood',
                'name' => 'Cumi Goreng Tepung',
                'description' => 'Deep-fried battered squid',
                'price' => 38000,
                'recipe' => [
                    ['Cumi', 0.15],
                    ['Tepung Terigu', 0.05],
                    ['Tepung Beras', 0.02],
                    ['Bawang Putih', 0.01],
                    ['Garam', 0.005],
                    ['Merica Bubuk', 0.002],
                    ['Minyak Goreng', 0.1],
                ],
            ],
            [
                'category' => 'Seafood',
                'name' => 'Ikan Dori Goreng',
                'description' => 'Fried dory fish fillet with sambal',
                'price' => 32000,
                'recipe' => [
                    ['Ikan Dori Fillet', 0.15],
                    ['Tepung Terigu', 0.03],
                    ['Kunyit', 0.003],
                    ['Bawang Putih', 0.01],
                    ['Garam', 0.005],
                    ['Minyak Goreng', 0.08],
                    ['Cabai Rawit', 0.02],
                    ['Bawang Merah', 0.015],
                    ['Tomat', 0.03],
                ],
            ],
            [
                'category' => 'Seafood',
                'name' => 'Udang Goreng Mentega',
                'description' => 'Butter-fried shrimp with garlic',
                'price' => 48000,
                'recipe' => [
                    ['Udang', 0.18],
                    ['Bawang Putih', 0.02],
                    ['Daun Bawang', 0.25],
                    ['Merica Bubuk', 0.003],
                    ['Garam', 0.003],
                    ['Minyak Goreng', 0.03],
                    ['Gula Pasir', 0.005],
                ],
            ],

            // --- Sayuran ---
            [
                'category' => 'Sayuran',
                'name' => 'Kangkung Belacan',
                'description' => 'Water spinach stir-fried with shrimp paste',
                'price' => 20000,
                'recipe' => [
                    ['Kangkung', 1],           // 1 bunch
                    ['Cabai Rawit', 0.02],
                    ['Bawang Merah', 0.02],
                    ['Bawang Putih', 0.01],
                    ['Tomat', 0.03],
                    ['Minyak Goreng', 0.02],
                    ['Garam', 0.003],
                    ['Gula Pasir', 0.003],
                ],
            ],
            [
                'category' => 'Sayuran',
                'name' => 'Cap Cay',
                'description' => 'Mixed vegetables stir-fry with oyster sauce',
                'price' => 25000,
                'recipe' => [
                    ['Kol / Kubis', 0.08],
                    ['Wortel', 0.05],
                    ['Tauge', 0.04],
                    ['Bawang Putih', 0.015],
                    ['Saus Tiram', 0.02],
                    ['Minyak Goreng', 0.02],
                    ['Garam', 0.003],
                    ['Merica Bubuk', 0.002],
                ],
            ],
            [
                'category' => 'Sayuran',
                'name' => 'Sayur Bayam',
                'description' => 'Spinach in clear corn soup',
                'price' => 18000,
                'recipe' => [
                    ['Bayam', 1],
                    ['Bawang Merah', 0.015],
                    ['Bawang Putih', 0.01],
                    ['Tomat', 0.03],
                    ['Garam', 0.005],
                ],
            ],
            [
                'category' => 'Sayuran',
                'name' => 'Tumis Tauge Tahu',
                'description' => 'Stir-fried bean sprouts with tofu',
                'price' => 20000,
                'recipe' => [
                    ['Tauge', 0.1],
                    ['Tahu', 0.1],
                    ['Bawang Merah', 0.015],
                    ['Bawang Putih', 0.01],
                    ['Daun Bawang', 0.25],
                    ['Kecap Manis', 0.01],
                    ['Minyak Goreng', 0.02],
                    ['Garam', 0.003],
                ],
            ],

            // --- Gorengan & Snack ---
            [
                'category' => 'Gorengan & Snack',
                'name' => 'Tahu Goreng (5 pcs)',
                'description' => 'Fried tofu served with sweet soy dipping sauce',
                'price' => 15000,
                'recipe' => [
                    ['Tahu', 0.2],
                    ['Minyak Goreng', 0.05],
                    ['Kecap Manis', 0.015],
                    ['Cabai Rawit', 0.01],
                ],
            ],
            [
                'category' => 'Gorengan & Snack',
                'name' => 'Tempe Goreng (5 pcs)',
                'description' => 'Crispy fried tempeh',
                'price' => 15000,
                'recipe' => [
                    ['Tempe', 0.2],
                    ['Tepung Beras', 0.02],
                    ['Bawang Putih', 0.005],
                    ['Garam', 0.003],
                    ['Minyak Goreng', 0.05],
                ],
            ],
            [
                'category' => 'Gorengan & Snack',
                'name' => 'Pisang Goreng (3 pcs)',
                'description' => 'Banana fritters',
                'price' => 12000,
                'recipe' => [
                    ['Tepung Terigu', 0.06],
                    ['Tepung Beras', 0.02],
                    ['Gula Pasir', 0.01],
                    ['Garam', 0.002],
                    ['Minyak Goreng', 0.05],
                ],
            ],
            [
                'category' => 'Gorengan & Snack',
                'name' => 'Kerupuk Udang',
                'description' => 'Prawn crackers',
                'price' => 8000,
                'recipe' => [
                    ['Kerupuk Udang', 0.04],
                    ['Minyak Goreng', 0.03],
                ],
            ],
            [
                'category' => 'Gorengan & Snack',
                'name' => 'Telur Dadar',
                'description' => 'Indonesian-style omelette',
                'price' => 12000,
                'recipe' => [
                    ['Telur Ayam', 2],
                    ['Daun Bawang', 0.25],
                    ['Cabai Rawit', 0.01],
                    ['Garam', 0.003],
                    ['Minyak Goreng', 0.02],
                ],
            ],

            // --- Minuman ---
            [
                'category' => 'Minuman',
                'name' => 'Es Teh Manis',
                'description' => 'Iced sweet tea',
                'price' => 8000,
                'recipe' => [
                    ['Teh Celup', 1],
                    ['Gula Pasir', 0.025],
                    ['Es Batu', 0.1],
                ],
            ],
            [
                'category' => 'Minuman',
                'name' => 'Teh Tawar Hangat',
                'description' => 'Hot plain tea',
                'price' => 5000,
                'recipe' => [
                    ['Teh Celup', 1],
                ],
            ],
            [
                'category' => 'Minuman',
                'name' => 'Kopi Hitam',
                'description' => 'Traditional black coffee',
                'price' => 8000,
                'recipe' => [
                    ['Kopi Bubuk', 0.01],
                    ['Gula Pasir', 0.02],
                ],
            ],
            [
                'category' => 'Minuman',
                'name' => 'Kopi Susu',
                'description' => 'Coffee with sweetened condensed milk',
                'price' => 12000,
                'recipe' => [
                    ['Kopi Bubuk', 0.01],
                    ['Susu Kental Manis', 0.08],
                    ['Es Batu', 0.1],
                ],
            ],
            [
                'category' => 'Minuman',
                'name' => 'Es Jeruk',
                'description' => 'Iced lime juice',
                'price' => 10000,
                'recipe' => [
                    ['Jeruk Nipis', 0.05],
                    ['Gula Pasir', 0.025],
                    ['Es Batu', 0.1],
                ],
            ],
            [
                'category' => 'Minuman',
                'name' => 'Es Cocopandan',
                'description' => 'Iced cocopandan drink',
                'price' => 10000,
                'recipe' => [
                    ['Sirup Cocopandan', 0.04],
                    ['Es Batu', 0.15],
                ],
            ],
            [
                'category' => 'Minuman',
                'name' => 'Air Mineral',
                'description' => 'Bottled mineral water',
                'price' => 5000,
                'recipe' => [
                    ['Air Mineral (galon)', 0.05],  // ~50ml from galon
                ],
            ],
        ];

        foreach ($menuItems as $item) {
            $menuItem = MenuItem::updateOrCreate(
                ['name' => $item['name']],
                [
                    'category_id' => $catModels[$item['category']]->id,
                    'description' => $item['description'],
                    'price' => $item['price'],
                    'is_active' => true,
                ],
            );

            // Clear existing recipes and recreate
            $menuItem->recipes()->delete();

            foreach ($item['recipe'] as [$ingredientName, $quantity]) {
                Recipe::create([
                    'menu_item_id' => $menuItem->id,
                    'ingredient_id' => $ingModels[$ingredientName]->id,
                    'quantity' => $quantity,
                ]);
            }
        }
    }
}

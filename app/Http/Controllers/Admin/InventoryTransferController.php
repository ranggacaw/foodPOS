<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Ingredient;
use App\Models\InventoryTransfer;
use App\Models\User;
use App\Notifications\InventoryTransferStatusUpdate;
use App\Services\BranchContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InventoryTransferController extends Controller
{
    public function index(Request $request): Response
    {
        $query = InventoryTransfer::with(['fromBranch', 'toBranch', 'ingredient', 'requestedBy', 'approvedBy', 'rejectedBy']);

        $branchId = $request->user()->branch_id ?? BranchContext::getActiveBranchId();

        if ($branchId) {
            $query->where(function ($q) use ($branchId) {
                $q->where('from_branch_id', $branchId)
                    ->orWhere('to_branch_id', $branchId);
            });
        }

        $transfers = $query->latest()->paginate(15)->withQueryString();

        $branches = Branch::where('is_active', true)->get();
        $ingredients = Ingredient::with('inventory')->get();

        return Inertia::render('Admin/InventoryTransfers/Index', [
            'transfers' => $transfers,
            'branches' => $branches,
            'ingredients' => $ingredients,
        ]);
    }

    public function create(): Response
    {
        $branches = Branch::where('is_active', true)->get();
        $ingredients = Ingredient::with('inventory')->get();

        return Inertia::render('Admin/InventoryTransfers/Create', [
            'branches' => $branches,
            'ingredients' => $ingredients,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'from_branch_id' => ['required', 'exists:branches,id', 'different:to_branch_id'],
            'to_branch_id' => ['required', 'exists:branches,id', 'different:from_branch_id'],
            'ingredient_id' => ['required', 'exists:ingredients,id'],
            'quantity' => ['required', 'numeric', 'min:0.0001'],
            'notes' => ['nullable', 'string'],
        ]);

        $transfer = DB::transaction(function () use ($validated, $request) {
            return InventoryTransfer::create([
                'from_branch_id' => $validated['from_branch_id'],
                'to_branch_id' => $validated['to_branch_id'],
                'ingredient_id' => $validated['ingredient_id'],
                'quantity' => $validated['quantity'],
                'status' => 'pending',
                'requested_by' => $request->user()->id,
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return redirect()->route('admin.inventory-transfers.index')
            ->with('success', 'Inventory transfer request created successfully.');
    }

    public function approve(Request $request, InventoryTransfer $transfer)
    {
        if ($transfer->status !== 'pending') {
            return back()->with('error', 'Cannot approve a transfer that is not pending.');
        }

        $transfer = DB::transaction(function () use ($transfer, $request) {
            $fromInventory = $transfer->ingredient->inventory()
                ->whereHas('branch', function ($query) use ($transfer) {
                    $query->where('id', $transfer->from_branch_id);
                })->first();

            $toInventory = $transfer->ingredient->inventory()
                ->whereHas('branch', function ($query) use ($transfer) {
                    $query->where('id', $transfer->to_branch_id);
                })->first();

            if ($fromInventory) {
                $fromInventory->decrement('quantity_on_hand', $transfer->quantity);
            }

            if ($toInventory) {
                $toInventory->increment('quantity_on_hand', $transfer->quantity);
            } else {
                \App\Models\Inventory::create([
                    'ingredient_id' => $transfer->ingredient_id,
                    'branch_id' => $transfer->to_branch_id,
                    'quantity_on_hand' => $transfer->quantity,
                    'restock_threshold' => 0,
                ]);
            }

            $transfer->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
            ]);

            return $transfer;
        });

        $transfer->requested_by_user->notify(new InventoryTransferStatusUpdate($transfer, 'approved'));

        return redirect()->route('admin.inventory-transfers.index')
            ->with('success', 'Inventory transfer approved successfully.');
    }

    public function reject(Request $request, InventoryTransfer $transfer)
    {
        if ($transfer->status !== 'pending') {
            return back()->with('error', 'Cannot reject a transfer that is not pending.');
        }

        $transfer->update([
            'status' => 'rejected',
            'rejected_by' => $request->user()->id,
            'rejected_at' => now(),
        ]);

        $transfer->requested_by_user->notify(new InventoryTransferStatusUpdate($transfer, 'rejected'));

        return redirect()->route('admin.inventory-transfers.index')
            ->with('success', 'Inventory transfer rejected successfully.');
    }
}

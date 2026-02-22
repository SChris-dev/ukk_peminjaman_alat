<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\Tool;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Carbon\Carbon;

class LoanApprovalController extends Controller
{
    /**
     * Display all pending loans (status: menunggu).
     */
    public function pending(Request $request)
    {
        $query = Loan::with(['user', 'tool.category'])
            ->where('status', 'menunggu');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn($q2) => $q2->where('username', 'like', "%{$search}%"))
                    ->orWhereHas('tool', fn($q2) => $q2->where('name', 'like', "%{$search}%"));
            });
        }

        $loans = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json($loans);
    }

    /**
     * Approve a loan (menunggu → disetujui).
     */
    public function approve(Request $request, Loan $loan)
    {
        if ($loan->status !== 'menunggu') {
            return response()->json([
                'message' => 'Only pending loans can be approved.',
            ], 422);
        }

        $tool = $loan->tool;

        if ($tool->stock < $loan->amount) {
            return response()->json([
                'message' => 'Insufficient stock. Available: ' . $tool->stock,
            ], 422);
        }

        // Decrease stock
        $tool->decrement('stock', $loan->amount);

        $loan->update(['status' => 'disetujui']);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'activity' => "Approved loan #{$loan->id} for '{$loan->user->username}' - '{$loan->tool->name}' x{$loan->amount}.",
        ]);

        return response()->json([
            'message' => 'Loan approved successfully.',
            'loan' => $loan->fresh()->load(['user', 'tool']),
        ]);
    }

    /**
     * Reject a loan (menunggu → ditolak).
     */
    public function reject(Request $request, Loan $loan)
    {
        if ($loan->status !== 'menunggu') {
            return response()->json([
                'message' => 'Only pending loans can be rejected.',
            ], 422);
        }

        $loan->update(['status' => 'ditolak']);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'activity' => "Rejected loan #{$loan->id} for '{$loan->user->username}'.",
        ]);

        return response()->json([
            'message' => 'Loan rejected.',
            'loan' => $loan->fresh()->load(['user', 'tool']),
        ]);
    }
}

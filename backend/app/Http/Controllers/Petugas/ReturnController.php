<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReturnController extends Controller
{
    /**
     * Display active loans (disetujui) that need monitoring.
     */
    public function activeLoans(Request $request)
    {
        $query = Loan::with(['user', 'tool.category'])
            ->where('status', 'disetujui');

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
     * Confirm return of a loan (disetujui → kembali).
     * Calculates late fees (denda) if return is past due.
     */
    public function confirmReturn(Request $request, Loan $loan)
    {
        if ($loan->status !== 'disetujui') {
            return response()->json([
                'message' => 'Only approved/active loans can be returned.',
            ], 422);
        }

        $today = Carbon::today();
        $returnDate = Carbon::parse($loan->return_date);
        $denda = 0;

        // Calculate late fee: Rp 1.000 per day late
        if ($today->greaterThan($returnDate)) {
            $daysLate = $today->diffInDays($returnDate);
            $denda = $daysLate * 1000;
        }

        // Restore stock
        $loan->tool->increment('stock', $loan->amount);

        $loan->update([
            'status' => 'kembali',
            'confirmed_return_date' => $today,
            'denda' => $denda,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'activity' => "Confirmed return for loan #{$loan->id} - '{$loan->user->username}'. Denda: Rp " . number_format($denda, 0, ',', '.'),
        ]);

        return response()->json([
            'message' => 'Return confirmed successfully.',
            'loan' => $loan->fresh()->load(['user', 'tool']),
            'days_late' => $today->greaterThan($returnDate) ? $today->diffInDays($returnDate) : 0,
            'denda' => $denda,
        ]);
    }
}

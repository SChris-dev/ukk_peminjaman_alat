<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Generate loan/return report with filters.
     */
    public function index(Request $request)
    {
        $query = Loan::with(['user', 'tool.category']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('loan_date', [$request->start_date, $request->end_date]);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $loans = $query->latest()->get();

        // Summary statistics
        $summary = [
            'total_loans' => $loans->count(),
            'total_approved' => $loans->where('status', 'disetujui')->count(),
            'total_returned' => $loans->where('status', 'kembali')->count(),
            'total_pending' => $loans->where('status', 'menunggu')->count(),
            'total_rejected' => $loans->where('status', 'ditolak')->count(),
            'total_denda' => $loans->sum('denda'),
        ];

        return response()->json([
            'summary' => $summary,
            'loans' => $loans,
        ]);
    }
}

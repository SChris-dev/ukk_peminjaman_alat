<?php

namespace App\Http\Controllers\Peminjam;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\Tool;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class LoanRequestController extends Controller
{
    /**
     * Display the peminjam's own loans.
     */
    public function index(Request $request)
    {
        $query = Loan::with(['tool.category'])
            ->where('user_id', $request->user()->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $loans = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json($loans);
    }

    /**
     * Submit a new loan request (status defaults to 'menunggu').
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tool_id' => 'required|exists:tools,id',
            'amount' => 'required|integer|min:1',
            'loan_date' => 'required|date|after_or_equal:today',
            'return_date' => 'required|date|after:loan_date',
        ]);

        $tool = Tool::findOrFail($validated['tool_id']);

        if ($tool->stock < $validated['amount']) {
            return response()->json([
                'message' => 'Insufficient stock. Available: ' . $tool->stock,
            ], 422);
        }

        $loan = Loan::create([
            'user_id' => $request->user()->id,
            'tool_id' => $validated['tool_id'],
            'amount' => $validated['amount'],
            'loan_date' => $validated['loan_date'],
            'return_date' => $validated['return_date'],
            'status' => 'menunggu',
        ]);

        $loan->load('tool');

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'activity' => "Submitted loan request #{$loan->id} for '{$tool->name}' x{$loan->amount}.",
        ]);

        return response()->json([
            'message' => 'Loan request submitted successfully.',
            'loan' => $loan,
        ], 201);
    }

    /**
     * View details of own loan.
     */
    public function show(Request $request, Loan $loan)
    {
        // Ensure user can only view their own loans
        if ($loan->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $loan->load(['tool.category']);

        return response()->json($loan);
    }

    /**
     * Trigger return process (peminjam signals they want to return).
     * The actual confirmation is done by Petugas.
     */
    public function triggerReturn(Request $request, Loan $loan)
    {
        if ($loan->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($loan->status !== 'disetujui') {
            return response()->json([
                'message' => 'Only active/approved loans can be returned.',
            ], 422);
        }

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'activity' => "Peminjam '{$request->user()->username}' triggered return for loan #{$loan->id}.",
        ]);

        return response()->json([
            'message' => 'Return request noted. Please submit the tool to a Petugas for confirmation.',
            'loan' => $loan->load('tool'),
        ]);
    }
}

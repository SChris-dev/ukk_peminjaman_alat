<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\Tool;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    /**
     * Display a listing of all loans.
     */
    public function index(Request $request)
    {
        $query = Loan::with(['user', 'tool.category']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%");
            })->orWhereHas('tool', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $loans = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json($loans);
    }

    /**
     * Store a newly created loan.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'tool_id' => 'required|exists:tools,id',
            'amount' => 'required|integer|min:1',
            'loan_date' => 'required|date',
            'return_date' => 'required|date|after_or_equal:loan_date',
            'status' => 'sometimes|in:menunggu,disetujui,ditolak,kembali',
        ]);

        $tool = Tool::findOrFail($validated['tool_id']);

        if ($tool->stock < $validated['amount']) {
            return response()->json([
                'message' => 'Insufficient stock. Available: ' . $tool->stock,
            ], 422);
        }

        $validated['status'] = $validated['status'] ?? 'menunggu';

        $loan = Loan::create($validated);
        $loan->load(['user', 'tool']);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'activity' => "Admin created loan #{$loan->id} for user '{$loan->user->username}' - tool '{$loan->tool->name}' x{$loan->amount}.",
        ]);

        return response()->json([
            'message' => 'Loan created successfully.',
            'loan' => $loan,
        ], 201);
    }

    /**
     * Display the specified loan.
     */
    public function show(Loan $loan)
    {
        $loan->load(['user', 'tool.category']);

        return response()->json($loan);
    }

    /**
     * Update the specified loan.
     */
    public function update(Request $request, Loan $loan)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'tool_id' => 'sometimes|exists:tools,id',
            'amount' => 'sometimes|integer|min:1',
            'loan_date' => 'sometimes|date',
            'return_date' => 'sometimes|date',
            'confirmed_return_date' => 'sometimes|nullable|date',
            'status' => 'sometimes|in:menunggu,disetujui,ditolak,kembali',
            'denda' => 'sometimes|numeric|min:0',
        ]);

        $loan->update($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'activity' => "Admin updated loan #{$loan->id}.",
        ]);

        return response()->json([
            'message' => 'Loan updated successfully.',
            'loan' => $loan->fresh()->load(['user', 'tool']),
        ]);
    }

    /**
     * Remove the specified loan.
     */
    public function destroy(Request $request, Loan $loan)
    {
        $loanId = $loan->id;

        // Restore stock if loan was approved
        if ($loan->status === 'disetujui') {
            $loan->tool->increment('stock', $loan->amount);
        }

        $loan->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'activity' => "Admin deleted loan #{$loanId}.",
        ]);

        return response()->json([
            'message' => 'Loan deleted successfully.',
        ]);
    }
}

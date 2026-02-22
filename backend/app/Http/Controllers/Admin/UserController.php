<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json($users);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,petugas,peminjam',
        ]);

        $user = User::create($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'activity' => "Created user '{$user->username}' with role '{$user->role}'.",
        ]);

        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user,
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        return response()->json($user);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'username' => ['sometimes', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|string|min:6',
            'role' => 'sometimes|in:admin,petugas,peminjam',
        ]);

        $user->update($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'activity' => "Updated user '{$user->username}' (ID: {$user->id}).",
        ]);

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(Request $request, User $user)
    {
        $username = $user->username;

        $user->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'activity' => "Deleted user '{$username}' (ID: {$user->id}).",
        ]);

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }
}

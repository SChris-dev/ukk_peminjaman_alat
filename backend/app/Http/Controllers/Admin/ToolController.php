<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ToolController extends Controller
{
    /**
     * Display a listing of tools.
     */
    public function index(Request $request)
    {
        $query = Tool::with('category');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $tools = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json($tools);
    }

    /**
     * Store a newly created tool.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'stock' => 'required|integer|min:0',
            'gambar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('gambar')) {
            $validated['gambar'] = $request->file('gambar')->store('tools', 'public');
        }

        $tool = Tool::create($validated);
        $tool->load('category');

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'activity' => "Created tool '{$tool->name}' (stock: {$tool->stock}).",
        ]);

        return response()->json([
            'message' => 'Tool created successfully.',
            'tool' => $tool,
        ], 201);
    }

    /**
     * Display the specified tool.
     */
    public function show(Tool $tool)
    {
        $tool->load('category');

        return response()->json($tool);
    }

    /**
     * Update the specified tool.
     */
    public function update(Request $request, Tool $tool)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'stock' => 'sometimes|integer|min:0',
            'gambar' => 'sometimes|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('gambar')) {
            // Delete old image
            if ($tool->gambar && Storage::disk('public')->exists($tool->gambar)) {
                Storage::disk('public')->delete($tool->gambar);
            }
            $validated['gambar'] = $request->file('gambar')->store('tools', 'public');
        }

        $tool->update($validated);
        $tool->load('category');

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'activity' => "Updated tool '{$tool->name}' (ID: {$tool->id}).",
        ]);

        return response()->json([
            'message' => 'Tool updated successfully.',
            'tool' => $tool->fresh()->load('category'),
        ]);
    }

    /**
     * Remove the specified tool.
     */
    public function destroy(Request $request, Tool $tool)
    {
        $name = $tool->name;

        // Delete image
        if ($tool->gambar && Storage::disk('public')->exists($tool->gambar)) {
            Storage::disk('public')->delete($tool->gambar);
        }

        $tool->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'activity' => "Deleted tool '{$name}' (ID: {$tool->id}).",
        ]);

        return response()->json([
            'message' => 'Tool deleted successfully.',
        ]);
    }
}

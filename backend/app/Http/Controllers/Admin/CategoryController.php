<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(Request $request)
    {
        $query = Category::withCount('tools');

        if ($request->has('search')) {
            $query->where('category_name', 'like', "%{$request->search}%");
        }

        $categories = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json($categories);
    }

    /**
     * Store a newly created category.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_name' => 'required|string|max:50',
        ]);

        $category = Category::create($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'activity' => "Created category '{$category->category_name}'.",
        ]);

        return response()->json([
            'message' => 'Category created successfully.',
            'category' => $category,
        ], 201);
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category)
    {
        $category->loadCount('tools');

        return response()->json($category);
    }

    /**
     * Update the specified category.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'category_name' => 'required|string|max:50',
        ]);

        $category->update($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'activity' => "Updated category '{$category->category_name}' (ID: {$category->id}).",
        ]);

        return response()->json([
            'message' => 'Category updated successfully.',
            'category' => $category->fresh(),
        ]);
    }

    /**
     * Remove the specified category.
     */
    public function destroy(Request $request, Category $category)
    {
        $name = $category->category_name;

        $category->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'activity' => "Deleted category '{$name}' (ID: {$category->id}).",
        ]);

        return response()->json([
            'message' => 'Category deleted successfully.',
        ]);
    }
}

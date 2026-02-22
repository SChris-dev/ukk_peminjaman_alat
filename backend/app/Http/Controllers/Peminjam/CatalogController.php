<?php

namespace App\Http\Controllers\Peminjam;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\Category;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    /**
     * Browse available tools (with stock > 0).
     */
    public function index(Request $request)
    {
        $query = Tool::with('category')->where('stock', '>', 0);

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

        $tools = $query->latest()->paginate($request->get('per_page', 12));

        return response()->json($tools);
    }

    /**
     * Get a single tool's details.
     */
    public function show(Tool $tool)
    {
        $tool->load('category');

        return response()->json($tool);
    }

    /**
     * Get all categories for filtering.
     */
    public function categories()
    {
        $categories = Category::withCount('tools')->get();

        return response()->json($categories);
    }
}

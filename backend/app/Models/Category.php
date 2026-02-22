<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'category_name',
    ];

    /**
     * Get the tools for the category.
     */
    public function tools()
    {
        return $this->hasMany(Tool::class);
    }
}

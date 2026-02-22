<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tool extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'category_id',
        'name',
        'description',
        'stock',
        'gambar',
    ];

    /**
     * Get the category that owns the tool.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the loans for the tool.
     */
    public function loans()
    {
        return $this->hasMany(Loan::class);
    }
}

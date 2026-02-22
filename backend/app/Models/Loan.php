<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'tool_id',
        'amount',
        'loan_date',
        'return_date',
        'confirmed_return_date',
        'status',
        'denda',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'loan_date' => 'date',
            'return_date' => 'date',
            'confirmed_return_date' => 'date',
            'denda' => 'decimal:2',
        ];
    }

    /**
     * Get the user that owns the loan.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the tool that is being loaned.
     */
    public function tool()
    {
        return $this->belongsTo(Tool::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Worker extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'profession_id',
        'name',
        'phone',
        'password',
        'avatar',
        'region',
        'proof_document',
        'is_verified',
        'availability_status',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_verified' => 'boolean',
        ];
    }

    public function profession(): BelongsTo
    {
        return $this->belongsTo(Profession::class);
    }
}
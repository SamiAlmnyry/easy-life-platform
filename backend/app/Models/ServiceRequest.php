<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceRequest extends Model
{
    use HasFactory;

    protected $table = 'service_requests';

    protected $fillable = [
        'worker_id',
        'client_name',
        'client_phone',
        'problem_description',
        'location',
        'status',
        'rating',
        'review_comment',
    ];

    protected $casts = [
        'worker_id' => 'integer',
        'rating'    => 'integer',
    ];
}
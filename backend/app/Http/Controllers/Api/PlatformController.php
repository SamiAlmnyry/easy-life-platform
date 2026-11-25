<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profession;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PlatformController extends Controller
{
    public function home(): JsonResponse
    {
        $activeProfessions = Profession::where('is_active', true)
            ->select('id', 'name', 'description')
            ->orderBy('name')
            ->get();

        $verifiedWorkersCount = Schema::hasTable('workers')
            ? DB::table('workers')->where('is_verified', true)->count()
            : 0;

        $completedRequestsCount = Schema::hasTable('service_requests')
            ? DB::table('service_requests')->where('status', 'completed')->count()
            : 0;

        return response()->json([
            'success' => true,
            'message' => 'Easy Life API is ready',
            'data' => [
                'stats' => [
                    'professions_count' => $activeProfessions->count(),
                    'verified_workers_count' => $verifiedWorkersCount,
                    'completed_requests_count' => $completedRequestsCount,
                ],
                'professions' => $activeProfessions,
            ],
        ], 200);
    }
}
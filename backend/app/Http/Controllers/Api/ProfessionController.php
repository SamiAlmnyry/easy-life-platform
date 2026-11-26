<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProfessionRequest;
use App\Models\Profession;
use Illuminate\Http\JsonResponse;

class ProfessionController extends Controller
{
    public function index(): JsonResponse
    {
        $professions = Profession::orderByDesc('id')->get();

        return response()->json([
            'success' => true,
            'data' => $professions,
        ], 200);
    }

    public function store(StoreProfessionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['is_active'] = $request->boolean('is_active', true);

        $profession = Profession::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة التخصص المهني بنجاح.',
            'data' => $profession,
        ], 201);
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProfessionRequest;
use App\Http\Requests\UpdateProfessionRequest;
use App\Models\Profession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Profession::withCount('workers')->orderByDesc('id');

        if ($request->boolean('active_only')) {
            $query->where('is_active', true);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
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

    public function update(UpdateProfessionRequest $request, Profession $profession): JsonResponse
    {
        $validated = $request->validated();
        if ($request->has('is_active')) {
            $validated['is_active'] = $request->boolean('is_active');
        }

        $profession->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات التخصص بنجاح.',
            'data' => $profession->fresh()->loadCount('workers'),
        ], 200);
    }

    public function toggleStatus(Profession $profession): JsonResponse
    {
        $profession->is_active = ! $profession->is_active;
        $profession->save();

        return response()->json([
            'success' => true,
            'message' => $profession->is_active ? 'تم تفعيل التخصص بنجاح.' : 'تم تعطيل التخصص بنجاح.',
            'data' => $profession->loadCount('workers'),
        ], 200);
    }

    public function destroy(Profession $profession): JsonResponse
    {
        if ($profession->workers()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف هذا التخصص لوجود فنيين مسجلين تحته. يمكنك تعطيله بدلاً من الحذف.',
            ], 409);
        }

        $profession->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف التخصص بنجاح.',
        ], 200);
    }
}
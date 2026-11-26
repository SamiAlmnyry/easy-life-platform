<?php

use App\Http\Controllers\Api\PlatformController;
use App\Http\Controllers\Api\WorkerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


use App\Http\Controllers\Api\ServiceRequestController;

// نقطة البداية والصفحة الرئيسية للمنصة (US-101)
Route::get('/home', [PlatformController::class, 'home']);

// وحدة الفنيين والتوثيق (EPIC-02): /api/workers
Route::prefix('workers')->group(function () {
    Route::post('/register', [WorkerController::class, 'register']);
});

// نقاط التكامل المستقبلية لوحدات الفريق:
// - وحدة التخصصات (EPIC-01): /api/professions
// - وحدة الفنيين والتوثيق (EPIC-02): /api/workers
// - وحدة طلبات الصيانة والتقييم (EPIC-03): /api/service-requests
Route::post('/service-requests', [ServiceRequestController::class, 'store']);
Route::get('/service-requests', [ServiceRequestController::class, 'index']);
Route::get('/service-requests/{id}', [ServiceRequestController::class, 'show']);

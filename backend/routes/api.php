<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


use App\Http\Controllers\Api\PlatformController;

// نقطة البداية والصفحة الرئيسية للمنصة (US-101)
Route::get('/home', [PlatformController::class, 'home']);

// نقاط التكامل المستقبلية لوحدات الفريق:
// - وحدة التخصصات (EPIC-01): /api/professions
// - وحدة الفنيين والتوثيق (EPIC-02): /api/workers
// - وحدة طلبات الصيانة والتقييم (EPIC-03): /api/service-requests
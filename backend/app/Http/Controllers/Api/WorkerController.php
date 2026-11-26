<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterWorkerRequest;
use App\Models\Worker;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class WorkerController extends Controller
{
    public function register(RegisterWorkerRequest $request): JsonResponse
    {
        $data = $request->validated();

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('workers/avatars', 'public');
        }

        $proofDocumentPath = $request->file('proof_document')->store('workers/documents', 'public');

        $worker = Worker::create([
            'profession_id' => $data['profession_id'],
            'name' => $data['name'],
            'phone' => $data['phone'],
            'password' => $data['password'],
            'region' => $data['region'],
            'avatar' => $avatarPath,
            'proof_document' => $proofDocumentPath,
            'is_verified' => false,
            'availability_status' => 'available',
        ]);

        $worker->load('profession:id,name');

        return response()->json([
            'message' => 'تم تسجيل حسابك بنجاح، وجارٍ مراجعة وثائقك من قِبل الإدارة لتوثيق الحساب.',
            'worker' => [
                'id' => $worker->id,
                'name' => $worker->name,
                'phone' => $worker->phone,
                'region' => $worker->region,
                'profession' => $worker->profession,
                'avatar_url' => $worker->avatar ? Storage::url($worker->avatar) : null,
                'proof_document_url' => Storage::url($worker->proof_document),
                'is_verified' => $worker->is_verified,
                'availability_status' => $worker->availability_status,
                'created_at' => $worker->created_at,
            ],
        ], 201);
    }
}
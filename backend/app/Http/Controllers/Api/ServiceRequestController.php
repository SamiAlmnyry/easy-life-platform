<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class ServiceRequestController extends Controller
{
    /**
     * استعراض قائمة الطلبات مع التصفية (US-302 / SCRUM-31)
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'worker_id'    => ['nullable', 'integer', 'min:1'],
            'client_phone' => ['nullable', 'string', 'max:20'],
            'status'       => ['nullable', 'in:pending,accepted,rejected,completed,cancelled'],
        ], [
            'worker_id.integer' => 'رقم الفني يجب أن يكون رقماً صحيحاً.',
            'status.in'         => 'حالة الطلب غير صالحة.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'معايير البحث غير صحيحة.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $query = ServiceRequest::query()->orderByDesc('created_at');

        if ($request->filled('worker_id')) {
            $query->where('worker_id', $request->worker_id);
        }

        if ($request->filled('client_phone')) {
            $query->where('client_phone', 'like', '%' . trim($request->client_phone) . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $requests = $query->get();

        return response()->json([
            'status' => true,
            'count'  => $requests->count(),
            'data'   => $requests,
        ], 200);
    }

    /**
     * استعراض تفاصيل طلب واحد وحالته (US-302 / SCRUM-31)
     */
    public function show($id)
    {
        $serviceRequest = ServiceRequest::find($id);

        if (!$serviceRequest) {
            return response()->json([
                'status'  => false,
                'message' => 'الطلب المطلوب غير موجود.',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data'   => $serviceRequest,
        ], 200);
    }

    /**
     * إنشاء طلب عمل أو صيانة جديد (US-301 / SCRUM-30)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'worker_id'           => ['required', 'integer', 'min:1'],
            'client_name'         => ['required', 'string', 'min:2', 'max:120'],
            'client_phone'        => ['required', 'string', 'regex:/^(\+?[0-9]{8,15})$/'],
            'problem_description' => ['required', 'string', 'min:10', 'max:2000'],
            'location'            => ['required', 'string', 'min:3', 'max:255'],
        ], [
            'worker_id.required'           => 'يجب تحديد الفني المطلوب.',
            'client_name.required'         => 'يرجى إدخال اسم العميل.',
            'client_phone.required'        => 'يرجى إدخال رقم الهاتف.',
            'client_phone.regex'           => 'صيغة رقم الهاتف غير صحيحة (أدخل 8 إلى 15 رقماً).',
            'problem_description.required' => 'يرجى كتابة وصف المشكلة.',
            'problem_description.min'      => 'وصف المشكلة قصير جداً (10 أحرف على الأقل).',
            'location.required'            => 'يرجى إدخال الموقع أو العنوان.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'خطأ في البيانات المدخلة',
                'errors'  => $validator->errors(),
            ], 422);
        }

        if (Schema::hasTable('workers')) {
            $worker = DB::table('workers')->where('id', $request->worker_id)->first();

            if (!$worker) {
                return response()->json([
                    'status'  => false,
                    'message' => 'الفني المطلوب غير موجود.',
                ], 404);
            }

            if (!$worker->is_verified) {
                return response()->json([
                    'status'  => false,
                    'message' => 'لا يُسمح بإنشاء طلب لفني غير موثق.',
                ], 403);
            }
        }

        $serviceRequest = ServiceRequest::create([
            'worker_id'           => $request->worker_id,
            'client_name'         => trim($request->client_name),
            'client_phone'        => trim($request->client_phone),
            'problem_description' => trim($request->problem_description),
            'location'            => trim($request->location),
            'status'              => 'pending',
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'تم إرسال طلب الصيانة بنجاح وهو الآن قيد الانتظار.',
            'data'    => $serviceRequest,
        ], 201);
    }

    /**
     * تحديث حالة الطلب من طرف الفني (US-303 / SCRUM-32)
     */
    public function updateStatus(Request $request, $id)
    {
        $serviceRequest = ServiceRequest::find($id);

        if (!$serviceRequest) {
            return response()->json([
                'status'  => false,
                'message' => 'الطلب المطلوب غير موجود.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => ['required', 'in:accepted,rejected,completed'],
        ], [
            'status.required' => 'يرجى تحديد الحالة الجديدة للطلب.',
            'status.in'       => 'الحالة يجب أن تكون: accepted أو rejected أو completed.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'خطأ في البيانات المدخلة.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $currentStatus = $serviceRequest->status;
        $newStatus     = $request->status;

        $allowedTransitions = [
            'pending'  => ['accepted', 'rejected'],
            'accepted' => ['completed'],
        ];

        if (!isset($allowedTransitions[$currentStatus]) || !in_array($newStatus, $allowedTransitions[$currentStatus], true)) {
            return response()->json([
                'status'  => false,
                'message' => "لا يمكن تحويل حالة الطلب من ({$currentStatus}) إلى ({$newStatus}).",
            ], 422);
        }

        $serviceRequest->status = $newStatus;
        $serviceRequest->save();

        return response()->json([
            'status'  => true,
            'message' => 'تم تحديث حالة الطلب بنجاح.',
            'data'    => $serviceRequest,
        ], 200);
    }

    /**
     * إلغاء الطلب من طرف العميل وفق السياسة المعتمدة (US-303 / SCRUM-32)
     */
    public function cancel(Request $request, $id)
    {
        $serviceRequest = ServiceRequest::find($id);

        if (!$serviceRequest) {
            return response()->json([
                'status'  => false,
                'message' => 'الطلب المطلوب غير موجود.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'client_phone' => ['required', 'string'],
        ], [
            'client_phone.required' => 'يرجى إدخال رقم هاتف العميل لتأكيد الإلغاء.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'بيانات التحقق غير مكتملة.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        if (trim($request->client_phone) !== $serviceRequest->client_phone) {
            return response()->json([
                'status'  => false,
                'message' => 'رقم الهاتف غير مطابق لصاحب الطلب.',
            ], 403);
        }

        if (!in_array($serviceRequest->status, ['pending', 'accepted'], true)) {
            return response()->json([
                'status'  => false,
                'message' => 'لا يمكن إلغاء الطلب بعد اكتماله أو رفضه أو إلغائه مسبقاً.',
            ], 422);
        }

        $serviceRequest->status = 'cancelled';
        $serviceRequest->save();

        return response()->json([
            'status'  => true,
            'message' => 'تم إلغاء طلب الصيانة بنجاح.',
            'data'    => $serviceRequest,
        ], 200);
    }

    /**
     * إضافة تقييم وتعليق بعد اكتمال الخدمة (US-303 / SCRUM-32)
     */
    public function submitReview(Request $request, $id)
    {
        $serviceRequest = ServiceRequest::find($id);

        if (!$serviceRequest) {
            return response()->json([
                'status'  => false,
                'message' => 'الطلب المطلوب غير موجود.',
            ], 404);
        }

        if ($serviceRequest->status !== 'completed') {
            return response()->json([
                'status'  => false,
                'message' => 'لا يمكن تقييم الطلب إلا بعد اكتمال الخدمة (completed).',
            ], 422);
        }

        if (!is_null($serviceRequest->rating)) {
            return response()->json([
                'status'  => false,
                'message' => 'تم تقييم هذا الطلب مسبقاً ولا يمكن تعديله.',
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'rating'         => ['required', 'integer', 'min:1', 'max:5'],
            'review_comment' => ['nullable', 'string', 'max:1000'],
        ], [
            'rating.required' => 'يرجى اختيار التقييم من 1 إلى 5 نجوم.',
            'rating.integer'  => 'التقييم يجب أن يكون رقماً صحيحاً.',
            'rating.min'      => 'أقل تقييم مسموح به هو 1.',
            'rating.max'      => 'أعلى تقييم مسموح به هو 5.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'بيانات التقييم غير صحيحة.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $serviceRequest->rating         = (int) $request->rating;
        $serviceRequest->review_comment = $request->filled('review_comment') ? trim($request->review_comment) : null;
        $serviceRequest->save();

        return response()->json([
            'status'  => true,
            'message' => 'شكراً لك! تم حفظ تقييمك بنجاح.',
            'data'    => $serviceRequest,
        ], 200);
    }
}
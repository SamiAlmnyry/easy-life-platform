<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterWorkerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'profession_id' => [
                'required',
                'integer',
                Rule::exists('professions', 'id')->where('is_active', true),
            ],
            'name' => ['required', 'string', 'min:3', 'max:120'],
            'phone' => ['required', 'string', 'min:7', 'max:20', 'unique:workers,phone'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'region' => ['required', 'string', 'min:2', 'max:100'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'proof_document' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'profession_id.required' => 'يرجى اختيار التخصص المهني.',
            'profession_id.exists' => 'التخصص المهني المختار غير موجود أو غير متاح حالياً.',
            'name.required' => 'الاسم الكامل مطلوب.',
            'name.min' => 'يجب أن لا يقل الاسم عن 3 أحرف.',
            'name.max' => 'يجب أن لا يتجاوز الاسم 120 حرفاً.',
            'phone.required' => 'رقم الهاتف مطلوب.',
            'phone.unique' => 'رقم الهاتف مسجّل مسبقاً لحساب آخر.',
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.min' => 'يجب أن لا تقل كلمة المرور عن 8 أحرف.',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق.',
            'region.required' => 'المنطقة أو المدينة مطلوبة.',
            'avatar.image' => 'يجب أن تكون الصورة الشخصية ملف صورة صالح.',
            'avatar.mimes' => 'صيغ الصورة الشخصية المسموحة هي: jpg, jpeg, png, webp.',
            'avatar.max' => 'يجب أن لا يتجاوز حجم الصورة الشخصية 2 ميجابايت.',
            'proof_document.required' => 'رفع وثيقة إثبات الهوية والخبرة إلزامي.',
            'proof_document.mimes' => 'صيغ الوثيقة المسموحة هي: pdf, jpg, jpeg, png.',
            'proof_document.max' => 'يجب أن لا يتجاوز حجم الوثيقة 5 ميجابايت.',
        ];
    }
}
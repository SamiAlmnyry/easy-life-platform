<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProfessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('name') && is_string($this->name)) {
            $this->merge([
                'name' => trim($this->name),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:100', 'unique:professions,name'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'اسم التخصص مطلوب.',
            'name.min' => 'اسم التخصص يجب أن لا يقل عن حرفين.',
            'name.max' => 'اسم التخصص يجب أن لا يتجاوز 100 حرف.',
            'name.unique' => 'هذا التخصص مسجل مسبقاً، لا يمكن تكراره.',
            'description.max' => 'الوصف يجب أن لا يتجاوز 1000 حرف.',
            'is_active.boolean' => 'حالة التفعيل غير صالحة.',
        ];
    }
}
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profession_id')->constrained('professions');
            $table->string('name', 120);
            $table->string('phone', 20)->unique();
            $table->string('password');
            $table->string('avatar')->nullable();
            $table->string('region', 100);
            $table->string('proof_document');
            $table->boolean('is_verified')->default(false);
            $table->enum('availability_status', ['available', 'busy'])->default('available');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workers');
    }
};
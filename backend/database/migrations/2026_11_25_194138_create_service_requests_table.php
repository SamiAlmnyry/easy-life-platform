<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('worker_id')->index();

            $table->string('client_name', 120);
            $table->string('client_phone', 20);
            $table->text('problem_description');
            $table->string('location', 255);

            $table->enum('status', ['pending', 'accepted', 'completed'])
                  ->default('pending');

            $table->unsignedTinyInteger('rating')->nullable();
            $table->text('review_comment')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_requests');
    }
};
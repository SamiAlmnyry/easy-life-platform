<?php

namespace Tests\Feature;

use App\Models\Worker;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WorkerRegistrationTest extends TestCase
{
    use RefreshDatabase;

    private function createProfession(bool $isActive = true, string $name = 'كهربائي'): int
    {
        return DB::table('professions')->insertGetId([
            'name' => $name,
            'description' => 'تخصص فني معتمد',
            'is_active' => $isActive,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_worker_can_register_with_valid_data_and_documents(): void
    {
        Storage::fake('public');
        $professionId = $this->createProfession();

        $response = $this->postJson('/api/workers/register', [
            'profession_id' => $professionId,
            'name' => 'أحمد صالح المعمري',
            'phone' => '771234567',
            'password' => 'Secret1234',
            'password_confirmation' => 'Secret1234',
            'region' => 'صلالة',
            'avatar' => UploadedFile::fake()->image('avatar.jpg', 300, 300),
            'proof_document' => UploadedFile::fake()->create('id_card.pdf', 500, 'application/pdf'),
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('worker.name', 'أحمد صالح المعمري')
            ->assertJsonPath('worker.is_verified', false)
            ->assertJsonPath('worker.availability_status', 'available')
            ->assertJsonMissingPath('worker.password');

        $worker = Worker::where('phone', '771234567')->first();

        $this->assertNotNull($worker);
        $this->assertFalse($worker->is_verified);
        $this->assertNotEquals('Secret1234', $worker->password);
        $this->assertTrue(Hash::check('Secret1234', $worker->password));
        Storage::disk('public')->assertExists($worker->avatar);
        Storage::disk('public')->assertExists($worker->proof_document);
    }

    public function test_worker_cannot_force_verified_status_during_registration(): void
    {
        Storage::fake('public');
        $professionId = $this->createProfession();

        $response = $this->postJson('/api/workers/register', [
            'profession_id' => $professionId,
            'name' => 'خالد علي',
            'phone' => '779876543',
            'password' => 'Secret1234',
            'password_confirmation' => 'Secret1234',
            'region' => 'صلالة',
            'proof_document' => UploadedFile::fake()->create('license.pdf', 300, 'application/pdf'),
            'is_verified' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('worker.is_verified', false);

        $this->assertDatabaseHas('workers', [
            'phone' => '779876543',
            'is_verified' => false,
        ]);
    }

    public function test_registration_fails_with_invalid_or_duplicate_data(): void
    {
        Storage::fake('public');
        $activeProfessionId = $this->createProfession(true, 'سباك');
        $inactiveProfessionId = $this->createProfession(false, 'تخصص متوقف');

        $this->postJson('/api/workers/register', [
            'profession_id' => $activeProfessionId,
            'name' => 'فني أول',
            'phone' => '770000111',
            'password' => 'Secret1234',
            'password_confirmation' => 'Secret1234',
            'region' => 'صلالة',
            'proof_document' => UploadedFile::fake()->create('doc.pdf', 200, 'application/pdf'),
        ])->assertStatus(201);

        $response = $this->postJson('/api/workers/register', [
            'profession_id' => $inactiveProfessionId,
            'name' => 'أ',
            'phone' => '770000111',
            'password' => '123',
            'password_confirmation' => '456',
            'region' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'profession_id',
                'name',
                'phone',
                'password',
                'region',
                'proof_document',
            ]);
    }

    public function test_registration_fails_with_invalid_file_type_or_oversized_files(): void
    {
        Storage::fake('public');
        $professionId = $this->createProfession();

        $response = $this->postJson('/api/workers/register', [
            'profession_id' => $professionId,
            'name' => 'سالم حسن',
            'phone' => '775554443',
            'password' => 'Secret1234',
            'password_confirmation' => 'Secret1234',
            'region' => 'صلالة',
            'avatar' => UploadedFile::fake()->create('virus.txt', 3000, 'text/plain'),
            'proof_document' => UploadedFile::fake()->create('huge.pdf', 6000, 'application/pdf'),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['avatar', 'proof_document']);
    }
}
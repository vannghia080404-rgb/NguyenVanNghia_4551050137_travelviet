<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('user_vouchers');
        Schema::dropIfExists('vouchers');

        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->enum('scope', ['shop', 'tour', 'all'])->default('shop');
            $table->enum('discount_type', ['fixed', 'percent', 'free_shipping']);
            $table->decimal('discount_value', 15, 2);
            $table->decimal('min_order_value', 15, 2)->default(0);
            $table->integer('min_quantity')->nullable();
            $table->decimal('max_discount', 15, 2)->nullable();
            $table->enum('applies_to', ['all', 'specific_categories', 'specific_products', 'specific_tours'])->default('all');
            $table->json('target_ids')->nullable();
            $table->dateTime('valid_from')->nullable();
            $table->dateTime('valid_to')->nullable();
            $table->integer('usage_limit')->nullable();
            $table->integer('used_count')->default(0);
            $table->integer('user_limit')->default(1);
            $table->boolean('is_public')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('user_vouchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('voucher_id')->constrained('vouchers')->cascadeOnDelete();
            $table->boolean('is_used')->default(false);
            $table->dateTime('used_at')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'voucher_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_vouchers');
        Schema::dropIfExists('vouchers');
    }
};

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
        Schema::create('product_review_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_review_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['like', 'dislike']);
            $table->timestamps();

            $table->unique(['user_id', 'product_review_id']); // One reaction per user per review
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_review_reactions');
    }
};

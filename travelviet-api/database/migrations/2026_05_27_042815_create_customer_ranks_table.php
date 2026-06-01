<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_ranks', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Member, Silver, Gold, Platinum
            $table->decimal('min_spending', 15, 2)->default(0); // Minimum spending to reach this rank
            $table->decimal('discount_percent', 5, 2)->default(0); // e.g. 5.00 for 5%
            $table->string('badge_icon')->nullable(); // URL or icon name
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_ranks');
    }
};

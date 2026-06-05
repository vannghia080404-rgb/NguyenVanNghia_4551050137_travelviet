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
        Schema::create('shop_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('order_code')->unique();
            $table->decimal('total_price', 12, 2);
            $table->string('shipping_name');
            $table->string('shipping_phone');
            $table->text('shipping_address');
            $table->text('notes')->nullable();
            $table->string('status')->default('pending'); // pending, shipping, completed, cancelled
            $table->string('payment_method')->default('cash'); // cash, vnpay, momo
            $table->string('payment_status')->default('unpaid'); // unpaid, paid, failed
            $table->string('payment_transaction_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shop_orders');
    }
};

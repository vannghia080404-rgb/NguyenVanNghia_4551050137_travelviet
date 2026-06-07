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
        Schema::table('shop_orders', function (Blueprint $table) {
            $table->string('delivery_method')->default('home_delivery')->after('shipping_address');
            $table->decimal('shipping_fee', 15, 2)->default(0)->after('total_price');
            $table->string('payment_receipt')->nullable()->after('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shop_orders', function (Blueprint $table) {
            $table->dropColumn(['delivery_method', 'shipping_fee', 'payment_receipt']);
        });
    }
};

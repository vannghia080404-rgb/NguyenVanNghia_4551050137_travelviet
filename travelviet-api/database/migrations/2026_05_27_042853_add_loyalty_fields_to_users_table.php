<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('total_spent', 15, 2)->default(0)->after('remember_token');
            $table->foreignId('rank_id')->nullable()->after('total_spent')->constrained('customer_ranks')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['rank_id']);
            $table->dropColumn(['total_spent', 'rank_id']);
        });
    }
};

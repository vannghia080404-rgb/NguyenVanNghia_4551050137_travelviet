<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('address');
            $table->string('email')->nullable()->after('phone');
            $table->string('contact_person')->nullable()->after('email');
            $table->string('region')->nullable()->after('contact_person');
            $table->string('image')->nullable()->after('region');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('image');
        });
    }

    public function down(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->dropColumn(['phone', 'email', 'contact_person', 'region', 'image', 'status']);
        });
    }
};

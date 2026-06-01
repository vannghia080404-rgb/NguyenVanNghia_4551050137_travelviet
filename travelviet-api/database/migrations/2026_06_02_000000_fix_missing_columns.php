<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * This migration safely adds any columns that may be missing due to
 * migration conflicts (e.g. reviews created in create_travelviet_tables
 * without is_approved, featured not applied to tours, etc.).
 */
return new class extends Migration
{
    public function up(): void
    {
        // Fix reviews table – add is_approved, admin_reply, replied_at if missing
        Schema::table('reviews', function (Blueprint $table) {
            if (!Schema::hasColumn('reviews', 'is_approved')) {
                $table->boolean('is_approved')->default(true)->after('comment');
            }
            if (!Schema::hasColumn('reviews', 'admin_reply')) {
                $table->text('admin_reply')->nullable()->after('is_approved');
            }
            if (!Schema::hasColumn('reviews', 'replied_at')) {
                $table->timestamp('replied_at')->nullable()->after('admin_reply');
            }
        });

        // Fix tours table – add featured if missing
        Schema::table('tours', function (Blueprint $table) {
            if (!Schema::hasColumn('tours', 'featured')) {
                $table->boolean('featured')->default(false)->after('status');
            }
        });
    }

    public function down(): void
    {
        // We don't drop these columns on rollback since other migrations
        // might depend on them.
    }
};

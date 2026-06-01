<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "Starting truncation...\n";

DB::statement('SET FOREIGN_KEY_CHECKS=0;');

$tables = [
    'promotions',
    'customer_ranks',
    'reviews',
    'wishlists',
    'bookings',
    'tour_images',
    'tours',
    'destinations',
    'categories'
];

foreach ($tables as $table) {
    echo "Truncating $table...\n";
    DB::table($table)->truncate();
}

echo "Deleting non-admin users...\n";
DB::table('users')->where('role', '!=', 'admin')->delete();

DB::statement('SET FOREIGN_KEY_CHECKS=1;');

echo "Done.\n";

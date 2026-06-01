<?php
use Illuminate\Contracts\Console\Kernel;
use App\Models\Promotion;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$promo = Promotion::where('title', 'Chào Hè Rực Rỡ 2026')->first();
if ($promo) {
    $promo->start_date = '2026-05-01 00:00:00';
    $promo->save();
    echo "Updated start date successfully.\n";
} else {
    echo "Promotion not found.\n";
}

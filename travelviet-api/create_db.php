<?php
$host = '127.0.0.1';
$user = 'root';
$pass = 'nghia123';

try {
    $dbh = new PDO("mysql:host=$host", $user, $pass);
    $dbh->exec("CREATE DATABASE IF NOT EXISTS `travelviet`;");
    echo "Database created successfully\n";
} catch (PDOException $e) {
    die("DB ERROR: " . $e->getMessage());
}

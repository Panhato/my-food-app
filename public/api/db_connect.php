<?php
// បើកឱ្យបង្ហាញ Error (ដើម្បីងាយស្រួលរកកន្លែងខុស)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// កំណត់ Headers (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// ព័ត៌មាន Database (យកតាម test.php ដែលជោគជ័យ)
$servername = "sql308.infinityfree.com";
$username = "if0_40794791";
$password = "Gtnl1wzELIQRm";
$dbname = "if0_40794791_food";

// បង្កើតការភ្ជាប់
$conn = new mysqli($servername, $username, $password, $dbname);

// កំណត់ភាសាខ្មែរ
$conn->set_charset("utf8");

// ត្រួតពិនិត្យ
if ($conn->connect_error) {
    die(json_encode([
        "status" => "error",
        "message" => "Connection failed: " . $conn->connect_error
    ]));
}
?>
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$user = "root";
$pass = "";
$db   = "food_shop_db";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// 🔥 សំខាន់៖ កំណត់ភាសាឱ្យស្គាល់អក្សរខ្មែរ
$conn->set_charset("utf8mb4");

// 🔥 សំខាន់៖ ប្រើ "description as desc" ដើម្បីឱ្យឈ្មោះត្រូវគ្នាជាមួយ Vue Frontend
// ORDER BY id DESC គឺដើម្បីឱ្យទំនិញថ្មីនៅលើគេ
$sql = "SELECT id, title, price, category, image, description as `desc` FROM products ORDER BY id DESC";

$result = $conn->query($sql);

$products = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // បំប្លែងតម្លៃទៅជាលេខ (ដើម្បីកុំឱ្យជាប់ជា String "12.50")
        $row['price'] = (float)$row['price'];
        $products[] = $row;
    }
}

echo json_encode($products);
$conn->close();
?>
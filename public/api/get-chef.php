<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "food_shop_db");
$result = $conn->query("SELECT * FROM chef_section LIMIT 1");
echo json_encode($result->fetch_assoc());
$conn->close();

include_once 'db_connect.php';

$sql = "SELECT * FROM chef WHERE id = 1";
$result = $conn->query($sql);
$data = $result->fetch_assoc();

echo json_encode($data);
?>
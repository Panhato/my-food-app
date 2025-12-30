<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'db_connect.php';

$sql = "SELECT * FROM banners ORDER BY id DESC";
$result = $conn->query($sql);

$banners = [];
while($row = $result->fetch_assoc()) {
    $banners[] = $row['image']; // យើងយកតែ Image URL
}
echo json_encode($banners);
?>
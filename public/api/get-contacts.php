<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include_once 'db_connect.php';

$sql = "SELECT * FROM contacts ORDER BY id DESC";
$result = $conn->query($sql);

$messages = [];
while($row = $result->fetch_assoc()) {
    $messages[] = $row;
}
echo json_encode($messages);
?>
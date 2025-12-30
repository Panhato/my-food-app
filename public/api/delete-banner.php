<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
include_once 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->url)) {
    $url = $data->url;
    $sql = "DELETE FROM banners WHERE image = '$url'";
    $conn->query($sql);
    echo json_encode(["message" => "Deleted"]);
}
?>
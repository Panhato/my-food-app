<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$data = json_decode(file_get_contents("php://input"));

if(isset($data->id)) {
    include 'db_connect.php';
    $pass = ""; 
    $db   = "food_shop_db";

    $conn = new mysqli($host, $user, $pass, $db);
    
    // លុបតាម ID
    $sql = "DELETE FROM products WHERE id=" . $data->id;
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["message" => "Deleted successfully"]);
    } else {
        echo json_encode(["error" => "Error deleting: " . $conn->error]);
    }
    $conn->close();
}
?>
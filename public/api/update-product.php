<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$data = json_decode(file_get_contents("php://input"));

if(isset($data->id)) {
    $host = "localhost"; $user = "root"; $pass = ""; $db = "food_shop_db";
    $conn = new mysqli($host, $user, $pass, $db);

    $id = $data->id;
    $title = $data->title;
    $price = $data->price;
    $category = $data->category;
    $image = $data->image;
    $desc = $data->desc;

    $sql = "UPDATE products SET title='$title', price='$price', category='$category', image='$image', description='$desc' WHERE id=$id";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["message" => "Updated successfully"]);
    } else {
        echo json_encode(["error" => "Error updating: " . $conn->error]);
    }
    $conn->close();
}
?>
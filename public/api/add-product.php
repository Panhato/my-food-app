<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$data = json_decode(file_get_contents("php://input"));

if(isset($data->title) && isset($data->price)) {
   include 'db_connect.php';
    $pass = ""; 
    $db = "food_shop_db";

    $conn = new mysqli($host, $user, $pass, $db);

    if ($conn->connect_error) {
        die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
    }

    // 🔥 ១. ប្រើ real_escape_string ដើម្បីការពារ Error ពេលមានសញ្ញា ' ឬ "
    $title = $conn->real_escape_string($data->title);
    $price = $conn->real_escape_string($data->price);
    $category = $conn->real_escape_string($data->category);
    $image = $conn->real_escape_string($data->image);
    // ឆែកមើលថាមាន desc ដែរឬទេ បើអត់ដាក់ជាអក្សរទទេ
    $desc = isset($data->desc) ? $conn->real_escape_string($data->desc) : '';

    // 🔥 ២. Query បញ្ចូលទិន្នន័យ (ត្រូវប្រាកដថា Column ក្នុង Database ឈ្មោះ 'description')
    $sql = "INSERT INTO products (title, price, category, image, description) 
            VALUES ('$title', '$price', '$category', '$image', '$desc')";

    if ($conn->query($sql) === TRUE) {
        // 🔥 ៣. សំខាន់៖ ត្រូវ Return ID ទៅឱ្យ Vue វិញ
        echo json_encode([
            "message" => "Added successfully",
            "id" => $conn->insert_id 
        ]);
    } else {
        echo json_encode(["error" => "Error: " . $conn->error]);
    }

    $conn->close();
} else {
    echo json_encode(["error" => "Missing title or price"]);
}
?>
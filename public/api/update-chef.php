<?php
// បើកការបង្ហាញ Error សម្រាប់ Debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include_once 'db_connect.php';

// ឆែកមើលការតភ្ជាប់ Database
if ($conn->connect_error) {
    echo json_encode(["message" => "Database Connect Failed: " . $conn->connect_error]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

// ឆែកមើលថាតើមានការបញ្ជូនទិន្នន័យមកគ្រប់គ្រាន់ឬអត់
if(isset($data->title) && isset($data->subtitle)) {
    $title = $conn->real_escape_string($data->title);
    $subtitle = $conn->real_escape_string($data->subtitle);
    $image = $data->image; // នេះអាចជា URL ចាស់ ឬក៏ជា Base64 នៃរូបថ្មី

    // ប្រសិនបើ $image ជា Base64 (មានន័យថាមានការ Upload រូបថ្មី)
    if (strpos($image, 'data:image') === 0) {
        $targetDir = "../uploads/";
        
        // បង្កើត Folder បើវាមិនទាន់មាន
        if (!is_dir($targetDir)) {
            if (!mkdir($targetDir, 0777, true)) {
                echo json_encode(["message" => "បង្កើត Folder មិនបាន (Permission Error)"]);
                exit();
            }
        }

        $imageName = "chef_" . time() . ".png";
        $path = $targetDir . $imageName;
        
        $imageParts = explode(";base64,", $image);
        if (count($imageParts) < 2) {
                echo json_encode(["message" => "ទម្រង់រូបភាពមិនត្រឹមត្រូវ (Invalid Base64)"]);
                exit();
        }
        
        $imageBase64 = base64_decode($imageParts[1]);
        
        // Save រូបភាពចូល Folder
        if (file_put_contents($path, $imageBase64) === false) {
            echo json_encode(["message" => "សរសេររូបចូល Folder មិនបាន។ សូមឆែកមើល Permission."]);
            exit();
        }
        
        // កំណត់ URL ថ្មីសម្រាប់រូបភាព
        // ចំណាំ៖ កែ 'my-food-app' ឱ្យត្រូវនឹងឈ្មោះ Folder Project របស់បង
        $image = "http://localhost/my-food-app/public/uploads/" . $imageName;
    }

    // Update ទិន្នន័យក្នុង Database (សន្មតថា Chef មាន ID=1)
    $sql = "UPDATE chef SET title='$title', subtitle='$subtitle', image='$image' WHERE id=1";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["message" => "Success", "image" => $image]);
    } else {
        echo json_encode(["message" => "Database Error: " . $conn->error]);
    }

} else {
    echo json_encode(["message" => "ទិន្នន័យមិនគ្រប់គ្រាន់"]);
}
?>
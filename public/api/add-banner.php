<?php
// ១. បើកការបង្ហាញ Error ទាំងអស់ (សំខាន់សម្រាប់ Debug)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json"); // កំណត់ថាឆ្លើយតបជា JSON

include_once 'db_connect.php';

// ២. ឆែកមើលថា Database តភ្ជាប់បានអត់?
if ($conn->connect_error) {
    echo json_encode(["message" => "Database Connect Failed: " . $conn->connect_error]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if(isset($data->image)) {
    $imageData = $data->image;
    
    // ៣. កំណត់ទីតាំង Folder
    $targetDir = "../uploads/";
    
    // បើ Folder មិនទាន់មាន បង្កើតវា
    if (!is_dir($targetDir)) {
        if (!mkdir($targetDir, 0777, true)) {
            echo json_encode(["message" => "បង្កើត Folder មិនបាន (Permission Error)"]);
            exit();
        }
    }

    $imageName = "banner_" . time() . ".png";
    $path = $targetDir . $imageName;
    
    // ៤. បំបែក Base64
    $imageParts = explode(";base64,", $imageData);
    if (count($imageParts) < 2) {
         echo json_encode(["message" => "ទម្រង់រូបភាពមិនត្រឹមត្រូវ (Invalid Base64)"]);
         exit();
    }
    
    $imageBase64 = base64_decode($imageParts[1]);
    
    // ៥. សាកល្បង Save រូបចូល Folder
    if (file_put_contents($path, $imageBase64) === false) {
        echo json_encode(["message" => "សរសេររូបចូល Folder មិនបាន។ សូមឆែកមើល Permission."]);
        exit();
    }
    
    // ៦. Save ចូល Database
    // ចំណាំ៖ ត្រូវប្រាកដថា Port និងឈ្មោះ Folder ត្រូវនឹងម៉ាស៊ីនបង
    $dbUrl = "http://localhost/my-food-app/public/uploads/" . $imageName; 
    
    $sql = "INSERT INTO banners (image) VALUES ('$dbUrl')";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["message" => "Success", "url" => $dbUrl]);
    } else {
        echo json_encode(["message" => "Database Error: " . $conn->error]);
    }
} else {
    echo json_encode(["message" => "មិនមានទិន្នន័យរូបភាពត្រូវបានបញ្ជូនមកទេ"]);
}
?>
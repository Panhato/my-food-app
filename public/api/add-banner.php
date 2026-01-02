<?php
// ១. ហៅ Database និង Header មកប្រើ (ដាក់លើគេបង្អស់)
include_once 'db_connect.php'; 

// បើក Error ដើម្បីងាយស្រួលរកកំហុស (អាចបិទវិញពេលដាក់ឱ្យភ្ញៀវប្រើ)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ២. ទទួលទិន្នន័យ JSON
$data = json_decode(file_get_contents("php://input"));

if(isset($data->image)) {
    $imageData = $data->image;
    
    // ៣. កំណត់ទីតាំង Folder សម្រាប់ Save រូប (នៅលើ Server)
    // ចំណាំ: ../uploads/ មានន័យថាថយក្រោយមួយ Folder (ពី api ទៅ public)
    $targetDir = "../uploads/";
    
    // បង្កើត Folder បើមិនទាន់មាន
    if (!is_dir($targetDir)) {
        if (!mkdir($targetDir, 0777, true)) {
            echo json_encode(["message" => "បង្កើត Folder មិនបាន (Permission Error)"]);
            exit();
        }
    }

    $imageName = "banner_" . time() . ".png";
    $path = $targetDir . $imageName;
    
    // ៤. បំបែក Base64 និង Save រូបភាព
    $imageParts = explode(";base64,", $imageData);
    if (count($imageParts) < 2) {
         echo json_encode(["message" => "ទម្រង់រូបភាពមិនត្រឹមត្រូវ (Invalid Base64)"]);
         exit();
    }
    
    $imageBase64 = base64_decode($imageParts[1]);
    
    if (file_put_contents($path, $imageBase64) === false) {
        echo json_encode(["message" => "សរសេររូបចូល Folder មិនបាន។ សូមឆែកមើល Permission."]);
        exit();
    }
    
    // ៥. 🔥 កែសម្រួល URL សម្រាប់ Save ចូល Database (សំខាន់!)
    // កូដនេះនឹងចាប់យក Domain ដោយស្វ័យប្រវត្តិ (មិនថា localhost ឬ my-food-shop.rf.gd)
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $domain = $_SERVER['HTTP_HOST']; 
    
    // លទ្ធផលនឹងចេញ៖ http://my-food-shop.rf.gd/uploads/banner_12345.png
    $dbUrl = "$protocol://$domain/uploads/$imageName"; 
    
    // ៦. ប្រើ Prepared Statement (សុវត្ថិភាពជាង)
    $stmt = $conn->prepare("INSERT INTO banners (image) VALUES (?)");
    $stmt->bind_param("s", $dbUrl);
    
    if ($stmt->execute()) {
        echo json_encode(["message" => "Success", "url" => $dbUrl]);
    } else {
        echo json_encode(["message" => "Database Error: " . $stmt->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(["message" => "មិនមានទិន្នន័យរូបភាពត្រូវបានបញ្ជូនមកទេ"]);
}

$conn->close();
?>
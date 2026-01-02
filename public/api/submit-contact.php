<?php
// ១. បិទការបង្ហាញ Error ជាអក្សរ (ដើម្បីកុំឱ្យខូច JSON)
error_reporting(0);
ini_set('display_errors', 0);

// ២. Headers (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ៣. ហៅ Database
include 'db_connect.php';

// ៤. ទទួលទិន្នន័យ
$input = file_get_contents("php://input");
$data = json_decode($input);

// បើ decode មិនចេញ (អាចជា null), ព្យាយាមមើល $_POST
if (is_null($data)) {
    $data = (object)$_POST;
}

// ៥. ចាប់ផ្តើមដំណើរការ
if(isset($data->name) && (isset($data->message) || isset($data->phone) || isset($data->email))) {
    
    $name = $conn->real_escape_string($data->name);
    $message = isset($data->message) ? $conn->real_escape_string($data->message) : "No Message";
    
    // ចាប់យក Contact (Phone ឬ Email)
    $contactInfo = "N/A";
    if (!empty($data->phone)) {
        $contactInfo = $conn->real_escape_string($data->phone);
    } elseif (!empty($data->email)) {
        $contactInfo = $conn->real_escape_string($data->email);
    }

    // --- SAVE ចូល Database ---
    $sql = "INSERT INTO contacts (name, phone, message) VALUES ('$name', '$contactInfo', '$message')";
    
    if ($conn->query($sql) === TRUE) {
        
        // --- ផ្ញើ TELEGRAM (ដាក់ក្នុង Try Catch បែបសាមញ្ញ) ---
        // យើងនឹងមិនឱ្យ Telegram បរាជ័យ ធ្វើឱ្យខូចលទ្ធផល Database ទេ
        $botToken = "8023985088:AAG5XP2zrhtI_Kup7vu2v7slOx8HLWBg8EM";
        $chatId   = "-4676998115";
        
        $text = "📩 *សារថ្មីពីអតិថិជន (MyFood)*\n\n👤 Name: $name\n📞 Contact: $contactInfo\n💬 Msg: $message";
        
        $url = "https://api.telegram.org/bot$botToken/sendMessage";
        $postData = ['chat_id' => $chatId, 'text' => $text, 'parse_mode' => 'Markdown'];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5); // កុំឱ្យចាំយូរពេក (5 វិនាទីបានហើយ)
        
        $result = curl_exec($ch);
        curl_close($ch);
        
        // ជោគជ័យ!
        echo json_encode(["status" => "success", "message" => "Message saved successfully"]);
        
    } else {
        // បរាជ័យ Database
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "DB Error: " . $conn->error]);
    }

} else {
    // ទិន្នន័យមិនគ្រប់
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing Name or Contact Info"]);
}

$conn->close();
?>
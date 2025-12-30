<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"));

if(isset($data->name) && isset($data->email) && isset($data->message)) {
    
    // ១. កំណត់ Token និង Chat ID របស់បងនៅទីនេះ
    // $botToken = "8023985088:AAG5XP2zrhtI_Kup7vu2v7slOx8HLWBg8EM"; // ដាក់ Token ដែលបានពី BotFather
    // $chatId = "-4676998115";  
    
     $botToken = "8023985088:AAG5XP2zrhtI_Kup7vu2v7slOx8HLWBg8EM"; // ដាក់ Token ដែលបានពី BotFather
    $chatId  = "-4676998115"; // ដាក់ Chat ID របស់ Group ឬខ្លួនឯង

    // ២. រៀបចំសារដែលត្រូវផ្ញើ
    $text = "📩​  *សារថ្មីពីអតិថិជន (MyFood)*\n\n";
    $text .= "👤  *ឈ្មោះ:* " . $data->name . "\n";
    $text .= "📧  *អ៊ីមែល/លេខ:* " . $data->email . "\n";
    $text .= "💬  *សារ:* " . $data->message . "\n";
    $text .= "\n📅  _" . date('d-m-Y H:i A') . "_";

    // ៣. ផ្ញើទៅ Telegram API
    $url = "https://api.telegram.org/bot$botToken/sendMessage";
    $postData = [
        'chat_id' => $chatId,
        'text' => $text,
        'parse_mode' => 'Markdown' // ដើម្បីឱ្យអក្សរដិត ឬទ្រេត
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);

    // ៤. ឆ្លើយតបទៅ Vue វិញ
    if ($response) {
        echo json_encode(["message" => "Success"]);
    } else {
        echo json_encode(["message" => "Failed to send to Telegram"]);
    }

} else {
    echo json_encode(["message" => "Incomplete Data"]);
}
?>
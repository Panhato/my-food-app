<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// ទទួលទិន្នន័យពី Vue
$data = json_decode(file_get_contents("php://input"));

// Function សម្រាប់ Format លុយ (រៀល ឬ ដុល្លារ)
function formatMoney($amount) {
    // បើសិនលេខធំជាង 100 ភាគច្រើនជារៀល (សន្មត) -> ដាក់សញ្ញា ៛
    if ($amount > 100) {
        return number_format($amount, 0) . " ៛";
    }
    // បើសិនលេខតូចជាង 100 គឺដុល្លារ -> ដាក់សញ្ញា $
    return "$" . number_format($amount, 2);
}

if(isset($data->customer) && isset($data->items) && count($data->items) > 0) {
    
    // ១. កំណត់ Telegram Config
    $botToken = "8023985088:AAG5XP2zrhtI_Kup7vu2v7slOx8HLWBg8EM"; // Token របស់បង
    $chatId = "7309869072";     // Chat ID Group របស់បង

    // ២. គណនាតម្លៃសរុប និងរៀបចំបញ្ជីមុខម្ហូប
    $itemsList = "";
    $grandTotal = 0;

    foreach ($data->items as $index => $item) {
        // បំប្លែងតម្លៃទៅជាលេខសុទ្ធ
        $price = floatval($item->price);
        
        // ចាប់យកចំនួន (Quantity) ឱ្យត្រូវ ទោះបី Vue ផ្ញើមក qty ឬ quantity
        $qty = 0;
        if (isset($item->quantity)) {
            $qty = intval($item->quantity);
        } elseif (isset($item->qty)) {
            $qty = intval($item->qty);
        }

        // គណនាតម្លៃសរុបក្នុងមួយមុខ
        $subtotal = $price * $qty;
        $grandTotal += $subtotal;
        
        // រៀបចំអក្សរសម្រាប់វិក្កយបត្រ
        $itemsList .= ($index + 1) . ". " . $item->title . "\n";
        // ប្រើ formatMoney ដើម្បីបង្ហាញ រៀល ឬ ដុល្លារ
        $itemsList .= "   ├ <code>" . $qty . " x " . formatMoney($price) . "</code> = <b>" . formatMoney($subtotal) . "</b>\n";
    }

    // ៣. រៀបចំទម្រង់វិក្កយបត្រ (Bill Format)
    $text = "🧾 <b>ការបញ្ជាទិញថ្មី (New Order)</b>\n";
    $text .= "--------------------------------\n";
    $text .= "👤 <b>អតិថិជន:</b> " . $data->customer->name . "\n";
    $text .= "📞 <b>លេខទូរស័ព្ទ:</b> " . $data->customer->phone . "\n";
    $text .= "📍 <b>ទីតាំង:</b> " . $data->customer->address . "\n";
    $text .= "--------------------------------\n";
    $text .= "<b>📝 បញ្ជីមុខម្ហូប:</b>\n";
    $text .= $itemsList;
    $text .= "--------------------------------\n";
    // បង្ហាញតម្លៃសរុបជារៀល ឬដុល្លារ
    $text .= "💰 <b>សរុបទាំងអស់: " . formatMoney($grandTotal) . "</b>\n";
    $text .= "--------------------------------\n";
    $text .= "📅 <i>" . date('d-m-Y h:i A') . "</i>";

    // ៤. ផ្ញើទៅ Telegram
    $url = "https://api.telegram.org/bot$botToken/sendMessage";
    $postData = [
        'chat_id' => $chatId,
        'text' => $text,
        'parse_mode' => 'HTML' 
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    
    // Check error របស់ CURL បើមាន
    if (curl_errno($ch)) {
        echo json_encode(["message" => "Telegram Error: " . curl_error($ch)]);
    } else {
        echo json_encode(["message" => "Success"]);
    }
    
    curl_close($ch);

} else {
    echo json_encode(["message" => "No Data"]);
}
?>
<?php
// Ensure the token is fetched correctly
$token = isset($_POST["token"]) ? $_POST["token"] : null;

$password = $_POST["password"];
$password_confirmation = $_POST["password_confirmation"];

// Validate inputs
if (empty($token) || empty($password) || empty($password_confirmation)) {
    die("Please fill all fields");
}

// Connect to the database
$mysqli = require "db.php";

// Hash the token only if it's not null
if ($token !== null) {
    $token_hash = hash("sha256", $token);

    // Fetch the user with the token
    $sql = "SELECT * FROM users WHERE reset_token_hash = ?";
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("s", $token_hash);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    // Check if user exists and if the token is valid
    if (!$user) {
        die("Invalid token");
    }

    if (strtotime($user["reset_token_expires_at"]) <= time()) {
        die("Token has expired");
    }
} else {
    die("Token not provided");
}

// Hash the new password
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// Update the user's password in the database
$sql_update = "UPDATE users
               SET password = ?, reset_token_hash = NULL, reset_token_expires_at = NULL
               WHERE id = ?";
$stmt_update = $mysqli->prepare($sql_update);
$stmt_update->bind_param("si", $password_hash, $user["id"]); // Assuming id is an integer
$stmt_update->execute();

if ($stmt_update->affected_rows > 0) {
   
    header("Location: http://localhost/ChatChat/chatApp/Frontend/Login/login.html");
    exit;

} else {
    echo "Failed to update password.";
}
?>

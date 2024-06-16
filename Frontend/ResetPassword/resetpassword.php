<!DOCTYPE html>
<html>
<head>
    <title>Reset Password</title>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">
    <link rel="stylesheet" href="resetpassword.css">
</head>
<body>
    <div class="container">
        <h1>Reset Password</h1>

        <form method="post" action="http://localhost/ChatChat/chatApp/Backend/process-reset.php">
            <?php
            // Ensure the token is fetched correctly from the GET parameter
            $token = isset($_GET["token"]) ? $_GET["token"] : null;
            if (!$token) {
                echo "<p>Token not provided.</p>";
                exit; // Stop execution if token is not found
            }
            ?>
            <input type="hidden" name="token" value="<?= htmlspecialchars($token) ?>">

            <label for="password">New Password</label>
            <input type="password" id="password" name="password" required>

            <label for="password_confirmation">Repeat Password</label>
            <input type="password" id="password_confirmation" name="password_confirmation" required>

            <button type="submit">Reset Password</button>
        </form>
    </div>
</body>
</html>

<!DOCTYPE html>
<html>
<head>
    <title>Reset Password</title>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">
    <link rel="stylesheet" href="resetpassword.css">
</head>
<body>

    <div class="wrapper">
        <div class="form">
            <header>Reset Password</header>

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

                <div class="field">
                    <label for="password">New Password</label>
                    <input type="password" id="password" name="password" required>
                </div>

                <div class="field">
                    <label for="password_confirmation">Repeat Password</label>
                    <input type="password" id="password_confirmation" name="password_confirmation" required>
                </div>

                <div class="field button">
                    <input type="submit" value="Reset Password">

                </div>
            </form>
        </div>
    </div>
</body>
</html>

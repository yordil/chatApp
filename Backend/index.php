<?php
header('Content-Type: application/json');
// Allow from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, DELETE, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Database connection parameters
$host = '127.0.0.1';
$db = 'chatApp';
$user = 'root'; // Change this to your database user
$pass = ''; // Change this to your database password
$charset = 'utf8mb4';
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

function handleAddUser($pdo) {
    // Get form data
    $fname = $_POST['fname'];
    $lname = $_POST['lname'];
    $email = $_POST['email'];
    $password = $_POST['password'];

    // Validate inputs (basic validation, enhance as needed)
    if (empty($fname) || empty($lname) || empty($email) || empty($password)) {
        ob_clean();
        echo json_encode(['success' => false, 'message' => 'Please fill all required fields.']);
        exit();
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        ob_clean();
        echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
        exit();
    }

    // Check if the email exists in the database
    $sql = "SELECT * FROM users WHERE email = :email";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();
    if ($user) {
        ob_clean();
        echo json_encode(['success' => false, 'message' => 'Email already exists.']);
        exit();
    }

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Handle file upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] == UPLOAD_ERR_OK) {
        $imageTmpPath = $_FILES['image']['tmp_name'];
        $imageName = $_FILES['image']['name'];
        $imageSize = $_FILES['image']['size'];
        $imageType = $_FILES['image']['type'];
        $imageNameCmps = explode(".", $imageName);
        $imageExtension = strtolower(end($imageNameCmps));
        $newImageName = md5(time() . $imageName) . '.' . $imageExtension;

        // Allowed file extensions
        $allowedfileExtensions = array('jpg', 'gif', 'png', 'jpeg');
        if (in_array($imageExtension, $allowedfileExtensions)) {
            // Directory in which the uploaded file will be moved
            $uploadFileDir = './uploaded_files/';
            if (!file_exists($uploadFileDir)) {
                mkdir($uploadFileDir, 0755, true);
            }
            $dest_path = $uploadFileDir . $newImageName;

            if (move_uploaded_file($imageTmpPath, $dest_path)) {
                // Insert user data into the database
                $sql = "INSERT INTO users (fname, lname, email, password, image, status) VALUES (:fname, :lname, :email, :password, :image, 'active now')";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    ':fname' => $fname,
                    ':lname' => $lname,
                    ':email' => $email,
                    ':password' => $hashedPassword,
                    ':image' => $newImageName,
                ]);

                ob_clean();
                echo json_encode(['success' => true, 'message' => 'Registration successful!']);
            } else {
                ob_clean();
                echo json_encode(['success' => false, 'message' => 'There was some error moving the file to upload directory.']);
            }
        } else {
            ob_clean();
            echo json_encode(['success' => false, 'message' => 'Upload failed. Allowed file types: ' . implode(',', $allowedfileExtensions)]);
        }
    } else {
        ob_clean();
        echo json_encode(['success' => false, 'message' => 'There is some error in the file upload.']);
    }
}

function handleLogin($pdo) {
    // Get form data
    $email = $_POST['email'];
    $password = $_POST['password'];

    // Validate inputs
    if (empty($email) || empty($password)) {
        ob_clean();
        echo json_encode(['success' => false, 'message' => 'Please fill all required fields.']);
        exit();
    }

    // Check if the email exists in the database
    $sql = "SELECT * FROM users WHERE email = :email";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user) {
        ob_clean();
        echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
        exit();
    }

    // Verify the password
    if (password_verify($password, $user['password'])) {
        ob_clean();
        echo json_encode(['success' => true, 'message' => 'Login successful!', 'user' => $user]);
    } else {
        ob_clean();
        echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    }
}

// Route the request to the appropriate handler
$request_uri = $_SERVER['REQUEST_URI'];
if ($_SERVER['REQUEST_METHOD'] == 'POST' && strpos($request_uri, '/add_user') !== false) {
    handleAddUser($pdo);
} else if ($_SERVER['REQUEST_METHOD'] == 'POST' && strpos($request_uri, '/login') !== false) {
    handleLogin($pdo);
} else {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Invalid request method or endpoint.']);
}
?>

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
        echo json_encode(['success' => true, 'message' => 'Login successful!', 'user' => ['id' => $user['id'], 'fname' => $user['fname'], 'lname' => $user['lname'], 'email' => $user['email'], 'image' => $user['image'], 'status' => $user['status']]]);
    } else {
        ob_clean();
        echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    }
}

function handleGetUsers($pdo) {
    try {
        $sql = "SELECT id, fname, lname, email, image, status FROM users";
        $stmt = $pdo->query($sql);
        $users = $stmt->fetchAll();
        echo json_encode(['success' => true, 'users' => $users]);
    } catch (\PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to fetch users: ' . $e->getMessage()]);
    }
}


// Fetch all messages from the database
 function feachAllMessages($pdo) {
    try {
        $sql = "SELECT * FROM messages";
        $stmt = $pdo->query($sql);
        $messages = $stmt->fetchAll();
        echo json_encode(['success' => true, 'messages' => $messages]);
    } catch (\PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to fetch messages: ' . $e->getMessage()]);
    }
}

function handleFetchMessages($pdo) {
    try {
        $sender_id = $_GET['sender_id'];
        $receiver_id = $_GET['receiver_id'];

        $sql = "SELECT * FROM messages WHERE (sender_id = :sender_id AND receiver_id = :receiver_id) OR (sender_id = :receiver_id AND receiver_id = :sender_id) ORDER BY id ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':sender_id' => $sender_id,
            ':receiver_id' => $receiver_id
        ]);
        $messages = $stmt->fetchAll();

        echo json_encode(['success' => true, 'messages' => $messages]);
    } catch (\PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to fetch messages: ' . $e->getMessage()]);
    } catch (\Exception $e) {
        echo json_encode(['success' => false, 'message' => 'An unexpected error occurred: ' . $e->getMessage()]);
    }
}




function handleSendMessage($pdo) {
    try {
        // Retrieve the POST data
        $sender_id = $_POST['sender_id'];
        $receiver_id = $_POST['receiver_id'];
        $message = $_POST['message'];

        // Validate the input
        if (empty($sender_id) || empty($receiver_id) || empty($message)) {
            throw new Exception('Missing required fields');
        }

        // Prepare and execute the SQL query
        $stmt = $pdo->prepare("INSERT INTO messages (sender_id, receiver_id, message) VALUES (:sender_id, :receiver_id, :message)");
        $stmt->execute([
            ':sender_id' => $sender_id,
            ':receiver_id' => $receiver_id,
            ':message' => $message
        ]);

        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Message sent successfully.'
        ]);
    } catch (Exception $e) {
        // Return error response
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

function handleUpdateProfile($pdo) {
    try {
        // Retrieve POST data
        $user_id = $_POST['userID'];
        $fname = $_POST['fname'];
        $lname = $_POST['lname'];
        

        // Validate inputs (basic validation, enhance as needed)
        if (empty($user_id) || empty($fname) || empty($lname)) {
            throw new Exception('Please fill all required fields.');
        }

        // Initialize profilePic variable
        $profilePic = null;

        // Handle file upload if a file is uploaded
        if (isset($_FILES['profilePic']) && $_FILES['profilePic']['error'] == UPLOAD_ERR_OK) {
            $imageTmpPath = $_FILES['profilePic']['tmp_name'];
            $imageName = $_FILES['profilePic']['name'];
            $imageSize = $_FILES['profilePic']['size'];
            $imageType = $_FILES['profilePic']['type'];
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
                    $profilePic = $newImageName;
                } else {
                    throw new Exception('There was some error moving the file to upload directory.');
                }
            } else {
                throw new Exception('Upload failed. Allowed file types: ' . implode(',', $allowedfileExtensions));
            }
        }

        // Prepare and execute the SQL query for updating user profile
        if ($profilePic) {
            $stmt = $pdo->prepare("UPDATE users SET fname = :fname, lname = :lname, image = :image WHERE id = :user_id");
            $stmt->execute([
                ':fname' => $fname,
                ':lname' => $lname,
                ':image' => $profilePic,
                ':user_id' => $user_id
            ]);
        } else {
            $stmt = $pdo->prepare("UPDATE users SET fname = :fname, lname = :lname WHERE id = :user_id");
            $stmt->execute([
                ':fname' => $fname,
                ':lname' => $lname,
                ':user_id' => $user_id
            ]);
        }

        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'profilePic' => $profilePic ? $profilePic : null
        ]);
    } catch (Exception $e) {
        // Return error response
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

function handleDeleteAccount($pdo) {
    try {
        // Retrieve the POST data
        $user_id = $_POST['userID'];
        
        // Validate the input
        if (empty($user_id)) {
            throw new Exception('User ID is required.');
        }

        // Begin a transaction
        $pdo->beginTransaction();

        // Delete the user (this will also delete related messages due to ON DELETE CASCADE)
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = :user_id");
        $stmt->execute([':user_id' => $user_id]);

        // Commit the transaction
        $pdo->commit();

        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Account deleted successfully.'
        ]);
    } catch (Exception $e) {
        // Rollback the transaction in case of error
        $pdo->rollBack();

        // Log error to a file
        file_put_contents('error_log.txt', $e->getMessage() . PHP_EOL, FILE_APPEND);

        // Return error response
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}






// Route the request to the appropriate handler
$request_uri = $_SERVER['REQUEST_URI'];
if ($_SERVER['REQUEST_METHOD'] == 'POST' && strpos($request_uri, '/add_user') !== false) {
    handleAddUser($pdo);
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST' && strpos($request_uri, '/login') !== false) {
    handleLogin($pdo);
} elseif ($_SERVER['REQUEST_METHOD'] == 'GET' && strpos($request_uri, '/get_users') !== false) {
    handleGetUsers($pdo);
} elseif ($_SERVER['REQUEST_METHOD'] == 'GET' && strpos($request_uri, '/fetch_messages') !== false) {
    handleFetchMessages($pdo);
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST' && strpos($request_uri, '/send_message') !== false) {
    handleSendMessage($pdo);
} elseif ($_SERVER['REQUEST_METHOD'] == 'GET' && strpos($request_uri, '/fetch_all_messages') !== false) {
    feachAllMessages($pdo);
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST' && strpos($request_uri, '/updateprofile') !== false) {
    handleUpdateProfile($pdo);
}elseif ($_SERVER['REQUEST_METHOD'] == 'POST' && strpos($request_uri, '/delete') !== false) {
    handleDeleteAccount($pdo);
}


else {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Invalid request method or endpoint.']);
}
?>

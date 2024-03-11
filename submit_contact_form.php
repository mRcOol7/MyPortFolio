<?php
// Database configuration
$host = "localhost"; // Your host (usually 'localhost' for XAMPP)
$username = "root"; // Your MySQL username (default is 'root' for XAMPP)
$password = ""; // Your MySQL password (default is blank for XAMPP)
$database = "portfolio"; // Your database name

// Create database connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Capture form data
$name = $conn->real_escape_string($_POST['name']);
$email = $conn->real_escape_string($_POST['email']);
$message = $conn->real_escape_string($_POST['message']);
$submission_date = date('Y-m-d H:i:s');

// SQL query to insert data into the database
$sql = "INSERT INTO contact_submissions (name, email, message, submission_date) VALUES ('$name', '$email', '$message', '$submission_date')";

// Execute the query
if ($conn->query($sql) === TRUE) {
    // If insertion is successful, send a JSON response indicating success
    http_response_code(200); // Set HTTP response code to 200 (OK)
    echo json_encode(array("success" => true, "message" => "Your message has been sent successfully!"));
} else {
    // If there's an error, send a JSON response indicating failure
    http_response_code(500); // Set HTTP response code to 500 (Internal Server Error)
    echo json_encode(array("success" => false, "message" => "Failed to send message. Please try again later."));
}

// Close the database connection
$conn->close();
?>

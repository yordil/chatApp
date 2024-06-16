---

# Real-Time Chat Application

## Overview
This project is a real-time chat application built with PHP for the backend, MySQL for the database, and pure HTML, CSS, and JavaScript for the frontend. It supports private messaging, group chats, email notifications, and chat history export. Users can create groups, chat within them, edit profiles, and view profile statistics.

## Features
- **Real-Time Messaging:** Instant messaging between users with real-time updates.
- **Private and Group Chats:** Users can chat one-on-one or create groups for collective conversations.
- **User Profile Management:** Users can edit their profiles and view statistics such as last active time and message count.
- **Email Notifications:** Receive email notifications for important events like new messages or group invites.
- **Chat History Export:** Users can export their chat history for backup or offline viewing.

## Requirements
- PHP
- Composer
- MySQL
- A web server (e.g., Apache or Nginx)

## Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yordil/chatApp.git
   cd chatApp
   ```

2. **Install dependencies:**
   ```sh
   composer install
   ```

3. **Create and configure the database:**
   - Create a MySQL database named `chatapp`.
   - Import the database schema located in `Backend/database/schema.sql`.
   - Update the database configuration in `Backend/config/database.php` with your MySQL credentials.

4. **Set up your web server:**
   - Configure your web server to serve the `Backend` and `Frontend` directories.
   - Ensure the PHP server is running and properly configured.

## Endpoints
- **User Endpoints:**
  - Create user
  - Edit profile
  - Get profile statistics

- **Message Endpoints:**
  - Send message
  - Get messages
  - Export chat history

- **Group Endpoints:**
  - Create group
  - Join group
  - Chat in group

## Usage

1. **Starting the Server:**
   Ensure your PHP server is running and your web server is configured correctly to serve the application.

2. **Accessing the Application:**
   Open your web browser and navigate to the application URL.

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Create a new Pull Request

---

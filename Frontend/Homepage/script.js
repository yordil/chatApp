document.addEventListener("DOMContentLoaded", function () {
  let receiverUser = {};

  document
    .querySelector(".group-btn")
    .addEventListener("click", async function () {
      // Implement the logic for fetching and displaying groups
    });

  document
    .querySelector(".user-btn")
    .addEventListener("click", async function () {
      try {
        const response = await fetch(
          "http://localhost/ChatChat/chatApp/Backend/index.php/get_users"
        );
        const data = await response.json();

        if (data.success) {
          const usersList = document.querySelector(".users-list");
          usersList.innerHTML = "";
          data.users.forEach((user) => {
            const userItem = document.createElement("div");
            userItem.classList.add("user");
            userItem.addEventListener("click", () => {
              const chatBox = document.querySelector(".chat-box");
              chatBox.innerHTML = "";
              receiverUser = user;
              openChat(user);
            });
            userItem.innerHTML = `
            <img src="http://localhost/ChatChat/chatApp/Backend/uploaded_files/${user.image}" alt="User Image">
            <div class="details">
              <span>${user.fname} ${user.lname}</span>
              <p>${user.status}</p>
            </div>
          `;
            usersList.appendChild(userItem);
          });
        } else {
          console.error("Failed to fetch users:", data.message);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    });

  function openChat(user) {
    const chatHeader = document.querySelector(".chat header .details span");
    const chatImage = document.querySelector(".chat header .Image");
    chatHeader.textContent = `${user.fname} ${user.lname}`;

    const img = document.createElement("img");
    img.src = `http://localhost/ChatChat/chatApp/Backend/uploaded_files/${user.image}`;
    img.alt = "User Image";
    chatImage.innerHTML = "";
    chatImage.appendChild(img);

    document.querySelector(".receiver_id_id").value = user.id;

    // Fetch messages immediately and then set interval for real-time updates
    fetchMessages();
    if (window.messageInterval) {
      clearInterval(window.messageInterval);
    }
    window.messageInterval = setInterval(fetchMessages, 2000); // Fetch messages every 2 seconds
  }

  async function fetchMessages() {
    const chatBox = document.querySelector(".chat-box");
    const sender_id = parseInt(localStorage.getItem("userID"));
    const receiver_id = parseInt(
      document.querySelector(".receiver_id_id").value
    );

    try {
      const response = await fetch(
        `http://localhost/ChatChat/chatApp/Backend/index.php/fetch_all_messages`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      const allMessages = data.messages || [];
      chatBox.innerHTML = "";
      allMessages.forEach((message) => {
        if (
          (message.sender_id === sender_id &&
            message.receiver_id === receiver_id) ||
          (message.sender_id === receiver_id &&
            message.receiver_id === sender_id)
        ) {
          const messageElement = document.createElement("div");
          messageElement.classList.add(
            "message",
            message.sender_id === sender_id ? "outgoing" : "incoming"
          );

          let messageContent = `<p>${message.message}</p>`;
          let attachmentMessage = "";
          if (message.attachment) {
            const fileExtension = message.attachment
              .split(".")
              .pop()
              .toLowerCase();
            if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
              attachmentMessage = `
                <a href="http://localhost/ChatChat/chatApp/Backend/uploaded_files/${message.attachment}" target="_blank">
                  <img src="http://localhost/ChatChat/chatApp/Backend/uploaded_files/${message.attachment}" alt="Attachment" style="max-width: 200px; max-height: 200px;" />
                </a>
                <a href="http://localhost/ChatChat/chatApp/Backend/uploaded_files/${message.attachment}" download>
                  <i class="fa-solid fa-download"></i>
                </a>`;
            } else if (fileExtension === "pdf") {
              attachmentMessage = `
                <a href="http://localhost/ChatChat/chatApp/Backend/uploaded_files/${message.attachment}" target="_blank">
                  <i class="fas fa-file-pdf"></i> Download PDF
                </a>
                <a href="http://localhost/ChatChat/chatApp/Backend/uploaded_files/${message.attachment}" download>
                  <i class="fa-solid fa-download"></i>
                </a>`;
            }
          }

          messageElement.innerHTML = messageContent;
          chatBox.appendChild(messageElement);
          if (attachmentMessage) {
            const attachmentElement = document.createElement("div");
            attachmentElement.classList.add(
              "message",
              message.sender_id === sender_id ? "outgoing" : "incoming"
            );
            attachmentElement.innerHTML = attachmentMessage;
            chatBox.appendChild(attachmentElement);
          }
        }
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  // Set sender_id from local storage to the form
  if (localStorage.getItem("userID")) {
    document.querySelector(".sender_id_id").value =
      localStorage.getItem("userID");
  }
});

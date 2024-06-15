document
  .querySelector(".group-btn")
  .addEventListener("click", async function () {
    // Implement the logic for fetching and displaying groups
  });
let receiveruser = {};
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
            // clear chat box
            const chatBox = document.querySelector(".chat-box");
            chatBox.innerHTML = "";
            receiveruser = user;
            openChat(user); // Function to open chat with the selected user
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
  const chatimage = document.querySelector(".chat header .Image");
  chatHeader.textContent = `${user.fname} ${user.lname}`;
  // creating a new image element
  const img = document.createElement("img");
  img.src = `http://localhost/ChatChat/chatApp/Backend/uploaded_files/${user.image}`;
  img.alt = "User Image";
  chatimage.innerHTML = "";
  chatimage.appendChild(img);

  document.querySelector(".receiver_id_id").value = user.id;
  const chatBox = document.querySelector(".chat-box");

  // Fetch messages between the logged-in user and the selected user
  const sender_id = parseInt(localStorage.getItem("userID"));
  const receiver_id = user.id;

  let allMessages = [];
  fetch(
    `http://localhost/ChatChat/chatApp/Backend/index.php/fetch_all_messages`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((response) => {
    response.json().then((data) => {
      allMessages = data;
      //   console.log(allMessages);
      allMessages?.messages?.forEach((message) => {
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
          messageElement.innerHTML = `
              <p>${message.message}</p>
          
            `;
          chatBox.appendChild(messageElement);
        }
      });
    });
  });
}

// setInterval(() => {
//   const chatBox = document.querySelector(".chat-box");
//   chatBox.innerHTML = "";

//   openChat(receiveruser);
// }, 500);

// function openChat(user) {
//   const chatHeader = document.querySelector(".chat header .details span");
//   chatHeader.textContent = `Chat with ${user.fname} ${user.lname}`;
//   document.querySelector(".receiver_id_id").value = user.id;
//   const chatBox = document.querySelector(".chat-box");

//   // Fetch messages between the logged-in user and the selected user
//   const sender_id = parseInt(localStorage.getItem("userID"));
//   const receiver_id = user.id;

//   console.log(
//     "Fetching messages for sender:",
//     sender_id,
//     "receiver:",
//     receiver_id
//   );

//   fetch(
//     `http://localhost/ChatChat/chatApp/Backend/index.php/fetch_messages?sender_id=${sender_id}&receiver_id=${receiver_id}`,
//     {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     }
//   )
//     .then((response) => response.text())
//     .then((text) => {
//       try {
//         const data = JSON.parse(text);
//         if (data.success) {
//           // Clear previous chat messages
//           chatBox.innerHTML = "";

//           // Display fetched messages
//           data.messages.forEach((message) => {
//             const messageElement = document.createElement("div");
//             messageElement.classList.add(
//               "message",
//               message.sender_id === sender_id ? "outgoing" : "incoming"
//             );
//             messageElement.innerHTML = `
//                   <p>${message.message}</p>
//                   <span class="time">${new Date(
//                     message.created_at
//                   ).toLocaleTimeString()}</span>
//                 `;
//             chatBox.appendChild(messageElement);
//           });

//           // Scroll to the bottom of the chat box
//           chatBox.scrollTop = chatBox.scrollHeight;
//         } else {
//           console.error("Failed to fetch messages:", data.message);
//         }
//       } catch (jsonError) {
//         console.error("Failed to parse JSON:", jsonError, text);
//       }
//     })
//     .catch((error) => {
//       console.error("Error fetching messages:", error);
//     });
// }

// // Add event listeners for buttons
// document
//   .querySelector(".user-btn")
//   .addEventListener("click", async function () {
//     try {
//       const response = await fetch(
//         "http://localhost/ChatChat/chatApp/Backend/index.php/get_users"
//       );
//       const data = await response.json();

//       if (data.success) {
//         const usersList = document.querySelector(".users-list");
//         usersList.innerHTML = "";
//         data.users.forEach((user) => {
//           const userItem = document.createElement("div");
//           userItem.classList.add("user");
//           userItem.addEventListener("click", () => {
//             openChat(user); // Function to open chat with the selected user
//           });
//           userItem.innerHTML = `
//             <img src="http://localhost/ChatChat/chatApp/Backend/uploaded_files/${user.image}" alt="User Image">
//             <div class="details">
//               <span>${user.fname} ${user.lname}</span>
//               <p>${user.status}</p>
//             </div>
//           `;
//           usersList.appendChild(userItem);
//         });
//       } else {
//         console.error("Failed to fetch users:", data.message);
//       }
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   });

// Set sender_id from local storage to the form
if (localStorage.getItem("userID")) {
  document.querySelector(".sender_id_id").value =
    localStorage.getItem("userID");
}

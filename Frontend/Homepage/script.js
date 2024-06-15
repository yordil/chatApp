document.addEventListener("DOMContentLoaded", function () {
  ///////////////////////////////////// send message ///////////////////////////////////

  let ActiveTab = localStorage.getItem("ActiveTab");
  console.log("ActiveTab:", ActiveTab);

  document
    .querySelector(".typing-area")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      let formData = new FormData(this);
      if (localStorage.getItem("ActiveTab") === "user") {
        formData.append("sender_id", localStorage.getItem("userID"));
        // formData.append("receiver_id", localStorage.getItem("receiver_id"));
        try {
          let response = await fetch(
            "http://localhost/ChatChat/chatApp/Backend/index.php/send_message",
            {
              method: "POST",
              body: formData,
            }
          );
          let text = await response.text();
          try {
            let data = JSON.parse(text);
            if (data.success) {
              document.querySelector(
                ".typing-area input[name='message']"
              ).value = "";
            } else {
              console.error("Failed to send message:", data.message);
            }
          } catch (jsonError) {
            console.error("Failed to parse JSON:", jsonError, text);
          }
        } catch (networkError) {
          console.error("Network error:", networkError);
        }
      } else {
        formData.append("sender_id", localStorage.getItem("userID"));
        formData.append("group_id", localStorage.getItem("groupID"));

        try {
          let response = await fetch(
            "http://localhost/ChatChat/chatApp/Backend/index.php/send_group_message",
            {
              method: "POST",
              body: formData,
            }
          );
          let text = await response.text();
          try {
            let data = JSON.parse(text);
            if (data.success) {
              document.querySelector(
                ".typing-area input[name='message']"
              ).value = "";
            } else {
              console.error("Failed to send message:", data.message);
            }
          } catch (jsonError) {
            console.error("Failed to parse JSON:", jsonError, text);
          }
        } catch (networkError) {
          console.error("Network error:", networkError);
        }
      }
    });

  /////////////////////////////////////
  let receiverUser = {};

  const modal = document.getElementById("createGroupModal");
  const modalClose = document.querySelector(".modal .close");
  const createGroupForm = document.getElementById("createGroupForm");
  const membersList = document.querySelector(".members-list");

  document.querySelector(".group-btn").addEventListener("click", function () {
    const groupActions = document.querySelector(".group-actions");
    const usersList = document.querySelector(".users-list");
    groupActions.style.display = "block";
    usersList.style.display = "none";
    localStorage.setItem("ActiveTab", "group");
    fetchGroups();
  });

  document
    .querySelector(".create-group-btn")
    .addEventListener("click", function () {
      fetchUsers(); // Fetch users to populate the members list
      modal.style.display = "block";
    });

  modalClose.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  createGroupForm.onsubmit = async function (event) {
    event.preventDefault();
    const groupName = document.getElementById("groupName").value;
    const photo = document.getElementById("photo").files[0];
    const selectedMembers = Array.from(
      membersList.querySelectorAll('input[type="checkbox"]:checked')
    ).map((checkbox) => checkbox.value);

    if (groupName && selectedMembers.length > 0) {
      createGroup(groupName, selectedMembers, photo);
      modal.style.display = "none";
    } else {
      alert("Please enter a group name and select at least one member.");
    }
  };

  async function fetchUsers() {
    try {
      const response = await fetch(
        "http://localhost/ChatChat/chatApp/Backend/index.php/get_users"
      );
      const data = await response.json();
      if (data.success) {
        membersList.innerHTML = "";
        data.users.forEach((user) => {
          const userItem = document.createElement("div");
          userItem.classList.add("user");
          userItem.innerHTML = `
            <label>
              <input type="checkbox" value="${user.id}">
              <img src="http://localhost/ChatChat/chatApp/Backend/uploaded_files/${user.image}" alt="User Image">
              ${user.fname} ${user.lname}
            </label>
          `;
          membersList.appendChild(userItem);
        });
      } else {
        console.error("Failed to fetch users:", data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async function createGroup(groupName, members, photo) {
    const formData = new FormData();
    // formData.append("action", "create_group");
    formData.append("group_name", groupName);
    formData.append("photo", photo);
    members.forEach((member, index) => {
      formData.append(`members[${index}]`, member);
    });

    try {
      const response = await fetch(
        "http://localhost/ChatChat/chatApp/Backend/index.php/create_group",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (data.success) {
        fetchGroups();
      } else {
        console.error("Failed to create group:", data.message);
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  }

  async function fetchGroups() {
    try {
      const response = await fetch(
        `http://localhost/ChatChat/chatApp/Backend/index.php/get_groups?user_id=${localStorage.getItem(
          "userID"
        )}`
      );
      const data = await response.json();
      if (data.success) {
        const groupList = document.querySelector(".group-actions .group-list");
        groupList.innerHTML = "";
        data.groups.forEach((group) => {
          const groupItem = document.createElement("div");
          groupItem.classList.add("group");
          groupItem.addEventListener("click", () => {
            const chatBox = document.querySelector(".chat-box");
            chatBox.innerHTML = "";
            receiverUser = group;
            openGroupChat(group);
          });
          // interuing the group photo
          const img = document.createElement("img");
          img.src = `http://localhost/ChatChat/chatApp/Backend/uploaded_files/${group.photo}`;
          img.alt = "Group Image";
          groupItem.appendChild(img);
          const details = document.createElement("div");
          details.classList.add("details");
          details.innerHTML = `<span>${group.name}</span>`;
          ///styling the group name and imag
          img.style.width = "50px";
          img.style.height = "50px";
          img.style.borderRadius = "50%";
          img.style.marginRight = "10px";
          img.style.marginLeft = "10px";
          details.style.display = "flex";
          details.style.alignItems = "center";
          groupItem.style.display = "flex";

          groupItem.appendChild(details);

          // groupItem.innerHTML = `<span>${group.name}</span>`;
          groupList.appendChild(groupItem);
        });
      } else {
        console.error("Failed to fetch groups:", data.message);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  }

  function openGroupChat(group) {
    const chatBox = document.querySelector(".chat-box");
    chatBox.innerHTML = "";
    const chatHeader = document.querySelector(".chat header .details span");
    const chatImage = document.querySelector(".chat header .Image");
    const img = document.createElement("img");
    img.src = `http://localhost/ChatChat/chatApp/Backend/uploaded_files/${group.photo}`;

    localStorage.setItem("groupID", group.id);

    // clear chat box

    chatHeader.textContent = `${group.name}`;
    chatImage.innerHTML = "";
    chatImage.appendChild(img);
    document.querySelector(".receiver_id_id").value = group.id;
    fetchGroupMessages();
    if (window.messageInterval) {
      clearInterval(window.messageInterval);
    }
    window.messageInterval = setInterval(fetchGroupMessages, 2000); // Fetch messages every 2 seconds
  }

  async function fetchGroupMessages() {
    const chatBox = document.querySelector(".chat-box");
    const group_id = document.querySelector(".receiver_id_id").value;

    try {
      const response = await fetch(
        `http://localhost/ChatChat/chatApp/Backend/index.php/fetch_allgroup_messages?group_id=${localStorage.getItem(
          "groupID"
        )}`,
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
        const messageElement = document.createElement("div");
        messageElement.classList.add(
          "message",
          message.sender_id === parseInt(localStorage.getItem("userID"))
            ? "outgoing"
            : "incoming"
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
            message.sender_id === parseInt(localStorage.getItem("userID"))
              ? "outgoing"
              : "incoming"
          );
          attachmentElement.innerHTML = attachmentMessage;
          chatBox.appendChild(attachmentElement);
        }
      });
    } catch (error) {
      console.error("Error fetching group messages:", error);
    }
  }

  async function fetchMessages() {
    const chatBox = document.querySelector(".chat-box");
    const sender_id = parseInt(localStorage.getItem("userID"));
    const receiver_id = parseInt(
      document.querySelector(".receiver_id_id").value
    );

    try {
      const response = await fetch(
        "http://localhost/ChatChat/chatApp/Backend/index.php/fetch_all_messages",
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

  if (localStorage.getItem("userID")) {
    document.querySelector(".sender_id_id").value =
      localStorage.getItem("userID");
  }

  document
    .querySelector(".user-btn")
    .addEventListener("click", async function () {
      const usersList = document.querySelector(".users-list");
      const groupActions = document.querySelector(".group-actions");
      usersList.style.display = "block";
      groupActions.style.display = "none";
      localStorage.setItem("ActiveTab", "user");

      try {
        const response = await fetch(
          "http://localhost/ChatChat/chatApp/Backend/index.php/get_users"
        );
        const data = await response.json();
        if (data.success) {
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
            </div>`;
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
    fetchMessages();
    if (window.messageInterval) {
      clearInterval(window.messageInterval);
    }
    window.messageInterval = setInterval(fetchMessages, 2000); // Fetch messages every 2 seconds
  }
});

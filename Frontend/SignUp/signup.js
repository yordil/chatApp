document
  .getElementById("signupForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    fetch("http://localhost/ChatChat/chatApp/Backend/index.php/add_user", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        const messageDiv = document.getElementById("message");
        if (data.success) {
          messageDiv.innerHTML = "<p>Registration successful!</p>";
        } else {
          messageDiv.innerHTML = `<p>Registration failed: ${data.message}</p>`;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        const messageDiv = document.getElementById("message");
        messageDiv.innerHTML = "<p>Registration failed due to an error.</p>";
      });
  });

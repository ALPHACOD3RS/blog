// Define the API base URL
const apiUrl = "http://127.0.0.1:5000"; // Replace 'http://example.com/api' with your actual API URL

// Function to handle user registration
async function registerUser(username, email, password) {
  try {
    const response = await fetch(`${apiUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();

    // Check if registration was successful
    if (response.ok) {
      // Redirect to home page
      window.location.href = "index.html";
    } else {
      // Handle registration failure
      console.error("Error registering user:", data.error || "Unknown error");
    }

    return data;
  } catch (error) {
    console.error("Error registering user:", error);
    return { error: "An error occurred while registering the user" };
  }
}

// Function to handle user login
async function loginUser(username, password) {
  try {
    const response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      // Redirect to the home page upon successful login
      window.location.href = "index.html"; // Change 'home.html' to the desired page URL
    } else {
      // Handle unsuccessful login
      const data = await response.json();
      console.error("Error logging in:", data.error);
      return { error: data.error || "An error occurred while logging in" };
    }
  } catch (error) {
    console.error("Error logging in:", error);
    return { error: "An error occurred while logging in" };
  }
}

// Function to handle user logout
async function logoutUser() {
  try {
    const response = await fetch(`${apiUrl}/logout`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error logging out:", error);
    return { error: "An error occurred while logging out" };
  }
}

function isAuthenticated() {
  // Check if the user is logged in (you can implement your own logic here)
  const token = localStorage.getItem("token");
  return token !== null;
}

// Function to log out the user
async function logout() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/"; // Redirect to home page after logout
  } catch (error) {
    console.error("Error logging out:", error);
  }
}

async function checkAuthentication() {
  try {
    const response = await fetch(`${apiUrl}/check-authentication`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Optionally, include any authentication token if required
        // 'Authorization': `Bearer ${token}`
      },
    });

    if (response.ok) {
      return true; // User is authenticated
    } else {
      return false; // User is not authenticated
    }
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false; // Error occurred, assume user is not authenticated
  }
}

async function getUserData() {
  try {
    const response = await fetch(`${apiUrl}/check-authentication`);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Error fetching user data:", response.statusText);
      return { authenticated: false, error: "Error fetching user data" };
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { authenticated: false, error: "Error fetching user data" };
  }
}

async function logoutUserFrom() {
  try {
    const response = await fetch(`${apiUrl}/logout`);
    if (response.ok) {
      // Redirect to the login page upon successful logout
      window.location.href = "login.html"; // Change 'login.html' to the desired page URL
    } else {
      console.error("Error logging out:", response.statusText);
      // Handle unsuccessful logout
      alert("Error logging out. Please try again.");
    }
  } catch (error) {
    console.error("Error logging out:", error);
    // Handle errors
    alert("An error occurred while logging out. Please try again.");
  }
}

async function getBlogPosts() {
  try {
    const response = await fetch(`${apiUrl}/blog-posts`);
    if (response.ok) {
      const data = await response.json();
      const blogPostsContainer = document.querySelector(
        ".blog-posts .container"
      );
      blogPostsContainer.innerHTML = ""; // Clear previous content
      data.forEach((post) => {
        const postCard = document.createElement("div");
        postCard.classList.add("post-card");
        postCard.innerHTML = `
          <div class="post-content">
            <h3>${post.title}</h3>
            <p class="author">By User ${post.user_id}</p>
            <p class="date">${new Date().toLocaleDateString()}</p>
            <p>${post.content}</p>
            <a href="#" class="read-more" data-post-id="${
              post.id
            }">Read More</a>
          </div>
        `;
        blogPostsContainer.appendChild(postCard);
      });

      // Add click event listener to "Read More" links
      const readMoreLinks = document.querySelectorAll(".read-more");
      readMoreLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          const postId = link.getAttribute("data-post-id");
          // Navigate to detail page with post ID
          window.location.href = `detail.html?id=${postId}`;
        });
      });
    } else {
      console.error("Failed to fetch blog posts:", response.status);
    }
  } catch (error) {
    console.error("Error fetching blog posts:", error);
  }
}

// Call the getBlogPosts function when the page loads

// Call the getBlogPosts function when the page loads
window.onload = getBlogPosts;

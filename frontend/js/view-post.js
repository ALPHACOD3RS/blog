// Function to fetch user posts and display them in the DOM
const apiUrl = "http://localhost:5000"; // Update with your API URL

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

async function fetchUserPosts(userId) {
  try {
    checkAuthentication();
    getUserData();

    const response = await fetch(`${apiUrl}/user/posts/${userId}`, {
      method: "GET",
    });

    if (response.ok) {
      const posts = await response.json();
      displayUserPosts(posts);
    } else {
      console.error("Failed to fetch user posts:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching user posts:", error);
  }
}

// Function to display user posts in the DOM
function displayUserPosts(posts) {
  const userPostsDiv = document.getElementById("user-posts");
  userPostsDiv.innerHTML = "";

  posts.forEach((post) => {
    const postDiv = document.createElement("div");
    postDiv.classList.add("post");

    const postTitle = document.createElement("h2");
    postTitle.textContent = post.title;

    const postContent = document.createElement("p");
    postContent.textContent = post.content;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deletePost(post.id));

    postDiv.appendChild(postTitle);
    postDiv.appendChild(postContent);
    postDiv.appendChild(deleteButton);

    userPostsDiv.appendChild(postDiv);
  });
}

// Function to delete a post
async function deletePost(postId) {
  try {
    const apiUrl = "http://localhost:5000"; // Update with your API URL
    const response = await fetch(`${apiUrl}/posts/${postId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      // Post deleted successfully, refresh user posts
      const userId = getUserId(); // Assuming you have a function to get the user ID
      fetchUserPosts(userId);
    } else {
      console.error("Failed to delete post:", response.statusText);
    }
  } catch (error) {
    console.error("Error deleting post:", error);
  }
}

// Function to get user ID (Replace this with your own function)
function getUserId() {
  // Implement your logic to get the user ID here
  return 1; // For example
}

// Fetch user posts when the page loads
window.onload = function () {
  const userId = getUserId(); // Get the user ID
  fetchUserPosts(userId);
};

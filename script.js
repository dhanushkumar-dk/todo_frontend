document.addEventListener("DOMContentLoaded", () => {
  fetchTodos();
});

const categoryFilter = document.getElementById("category-filter");
const hostnameFilter = document.getElementById("hostname-filter");

let allTodos = []; // Store all todos for filtering

// Fetch and display todos
async function fetchTodos() {
  try {
    const response = await fetch("http://localhost:3000/todos");
    allTodos = await response.json();
    console.log(allTodos);
    populateFilters();
    displayTodos(allTodos);
  } catch (error) {
    console.error("Error fetching todos:", error);
  }
}

// Populate Category and Hostname Filters
function populateFilters() {
  const categories = [...new Set(allTodos.map((todo) => todo.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach((category) => {
    categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
  });

  categoryFilter.addEventListener("change", updateHostnameFilter);
  hostnameFilter.addEventListener("change", applyFilters);
}

// Update Hostname Filter when Category is Selected
function updateHostnameFilter() {
  const selectedCategory = categoryFilter.value;

  if (selectedCategory === "all") {
    hostnameFilter.innerHTML = `<option value="all">All Hosts</option>`;
    hostnameFilter.disabled = true;
    displayTodos(allTodos);
  } else {
    const hostnames = [
      ...new Set(
        allTodos
          .filter((todo) => todo.category === selectedCategory)
          .map((todo) => todo.hostname)
      ),
    ];

    hostnameFilter.innerHTML = `<option value="all">All Hosts</option>`;
    hostnames.forEach((hostname) => {
      hostnameFilter.innerHTML += `<option value="${hostname}">${hostname}</option>`;
    });

    hostnameFilter.disabled = false;
    applyFilters();
  }
}

// Apply Both Filters
function applyFilters() {
  const selectedCategory = categoryFilter.value;
  const selectedHostname = hostnameFilter.value;

  let filteredTodos = allTodos;

  if (selectedCategory !== "all") {
    filteredTodos = filteredTodos.filter(
      (todo) => todo.category === selectedCategory
    );
  }

  if (selectedHostname !== "all") {
    filteredTodos = filteredTodos.filter(
      (todo) => todo.hostname === selectedHostname
    );
  }

  displayTodos(filteredTodos);
}

// Display Todos
function displayTodos(todos) {
  console.log("Displaying todos:", todos);
  const todoContainer = document.getElementById("todo-list");
  todoContainer.innerHTML = ""; // Clear previous content

  if (todos.length === 0) {
    todoContainer.innerHTML = "<p>No todos found.</p>";
    return;
  }

  todos.forEach((todo) => {
    const details =
      todo.details.length > 0
        ? todo.details[0]
        : { name: "No Name", description: "No Description", src: "" };

    // Ensure URL starts with "http://" or "https://"
    let link = details.src;
    if (link && !link.startsWith("http://") && !link.startsWith("https://")) {
      link = "https://" + link;
    }

    const contentButton = details.src
      ? `<a href="${link}" target="_blank" class="btn btn-primary">View Content</a>`
      : `<button class="btn btn-secondary" disabled>No Content</button>`;

    // ✅ Set status color: Green for "completed", Red for "not completed"
    const statusColor =
      todo.status === "completed" ? "text-success" : "text-danger";

    const card = document.createElement("div");
    card.classList.add("card", "p-3", "mb-3");

    // ✅ Display category, hostname, and status
    card.innerHTML = `
        <h5>${todo.category} - <span class="text-warning">${todo.hostname}</span></h5>
        <p><strong>${details.name}</strong> - <span class="${statusColor}">${todo.status}</span></p>
        <p>${details.description}</p>
        ${contentButton}
        <button class="btn btn-danger mt-2" onclick="deleteTodo('${todo._id}')">Delete</button>
      `;

    todoContainer.appendChild(card);
  });
}

// Delete Todo Function
async function deleteTodo(todoId) {
  const confirmDelete = confirm("Are you sure you want to delete this todo?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`http://localhost:3000/todos/${todoId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      allTodos = allTodos.filter((todo) => todo._id !== todoId);
      applyFilters(); // Reapply filters to update the displayed list
    } else {
      console.error("Failed to delete todo");
    }
  } catch (error) {
    console.error("Error deleting todo:", error);
  }
}

// Toggle Add-To-Do Form
// Toggle Add-To-Do Form Visibility
function toggleForm() {
  const form = document.getElementById("todo-form");
  form.classList.toggle("d-none"); // Toggle visibility
}

// Add New To-Do
async function addTodo() {
  const category = document.getElementById("category").value.trim();
  const hostname = document.getElementById("hostname").value.trim();
  const name = document.getElementById("todo-name").value.trim();
  const description = document.getElementById("description").value.trim();
  let src = document.getElementById("src").value.trim();
  const status = document.getElementById("status").value; // ✅ Fix: Get selected status

  if (!category || !hostname || !name || !description) {
    alert("Please fill in all required fields!");
    return;
  }

  const newTodo = {
    category,
    hostname,
    details: [{ name, description, src }],
    status, // ✅ Now correctly saves the selected status
  };

  try {
    const response = await fetch("http://localhost:3000/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    });

    if (response.ok) {
      fetchTodos(); // Refresh list
      toggleForm();
    } else {
      console.error("Failed to add To-Do");
    }
  } catch (error) {
    console.error("Error adding To-Do:", error);
  }
}

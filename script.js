const API_URL = 'https://blanchedalmond-squid-383723.hostingersite.com/api/activity_api.php';

function notificationMessage(type, messageText) {
  const notificationContainer = document.getElementById("notificationContainer");
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  const message = document.createElement("div");
  message.className = "message";
  message.textContent = messageText;

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-btn";
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", () => notification.remove());

  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";

  notification.appendChild(message);
  notification.appendChild(closeBtn);
  notification.appendChild(progressBar);
  notificationContainer.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("slide-out");
    setTimeout(() => notification.remove(), 400);
  }, 5000);
}


let currentPage = 1;
const rowsPerPage = 25;

// ✅ Fetch Data and Render Table
function fetchAndRenderData(page = 1) {
  const offset = (page - 1) * rowsPerPage;
  fetch(`${API_URL}?limit=${rowsPerPage}&offset=${offset}`)
    .then(response => response.json())
    .then(data => {
      const tableBody = document.querySelector('#activityTable tbody');
      tableBody.innerHTML = '';

      data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.id}</td>
          <td>${row.username}</td>
          <td>${row.logged_in_at}</td>
          <td>
            <button onclick="editRow(${row.id}, '${row.username}')">Edit</button>
            <button onclick="deleteRow(${row.id})">Delete</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    });
}

// ✅ Render Pagination Once
function renderPaginationControls() {
  fetch(`${API_URL}?count=true`)
    .then(res => res.json())
    .then(result => {
      const totalRecords = result.total;
      const totalPages = Math.ceil(totalRecords / rowsPerPage);

      const container = document.getElementById('paginationControls');
      container.innerHTML = '';

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = (i === currentPage) ? 'active' : '';
        btn.onclick = () => {
          currentPage = i;
          fetchAndRenderData(currentPage);
          updateActivePaginationButton(i);
        };
        container.appendChild(btn);
      }
    });
}

// ✅ Update active class (utility)
function updateActivePaginationButton(activePage) {
  const buttons = document.querySelectorAll('#paginationControls button');
  buttons.forEach((btn, index) => {
    btn.classList.toggle('active', index + 1 === activePage);
  });
}

// ✅ Refresh Current Page every 3 seconds (without resetting pagination)
setInterval(() => {
  fetchAndRenderData(currentPage);
}, 3000);

// ✅ Initial Load
fetchAndRenderData(currentPage);
renderPaginationControls();


// ✅ EDIT Function
function editRow(id, currentUsername) {
  const newUsername = prompt("Enter new username:", currentUsername);
  if (newUsername && newUsername !== currentUsername) {
    $.ajax({
      url: API_URL,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify({ id: id, username: newUsername }),
      success: function () {
        notificationMessage("success", "Record updated successfully!!.");
        fetchAndRenderData(currentPage);
      }
    });
  }
}

// ✅ DELETE Function
function deleteRow(id) {
  if (confirm("Are you sure you want to delete this entry?")) {
    $.ajax({
      url: API_URL,
      method: "DELETE",
      contentType: "application/json",
      data: JSON.stringify({ id: id }),
      success: function () {
        notificationMessage("success", "Record deleted successfully!!.");
        fetchAndRenderData(currentPage);
      }
    });
  }
}

// Khởi tạo Supabase client
const { createClient } = supabase;
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("todo-form");
const input = document.getElementById("task-input");
const list = document.getElementById("todo-list");
const statusEl = document.getElementById("status");

function setStatus(msg) {
  statusEl.textContent = msg;
}

// Lấy danh sách todos từ Supabase
async function fetchTodos() {
  setStatus("Đang tải...");
  const { data, error } = await client
    .from("todos")
    .select("*")
    .order("inserted_at", { ascending: false });

  if (error) {
    setStatus("Lỗi tải dữ liệu: " + error.message);
    console.error(error);
    return;
  }

  renderTodos(data);
  setStatus(`Đã tải ${data.length} công việc.`);
}

// Render danh sách ra UI
function renderTodos(todos) {
  list.innerHTML = "";
  todos.forEach((todo) => {
    const li = document.createElement("li");
    if (todo.is_complete) li.classList.add("done");

    const span = document.createElement("span");
    span.textContent = todo.task;
    span.style.cursor = "pointer";
    span.title = "Nhấn để đánh dấu hoàn thành";
    span.addEventListener("click", () => toggleTodo(todo.id, !todo.is_complete));

    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.className = "delete";
    delBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.appendChild(span);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// Thêm todo mới
async function addTodo(task) {
  const { error } = await client.from("todos").insert([{ task, is_complete: false }]);
  if (error) {
    setStatus("Lỗi thêm: " + error.message);
    console.error(error);
    return;
  }
  fetchTodos();
}

// Đánh dấu hoàn thành / chưa hoàn thành
async function toggleTodo(id, is_complete) {
  const { error } = await client.from("todos").update({ is_complete }).eq("id", id);
  if (error) {
    setStatus("Lỗi cập nhật: " + error.message);
    return;
  }
  fetchTodos();
}

// Xóa todo
async function deleteTodo(id) {
  const { error } = await client.from("todos").delete().eq("id", id);
  if (error) {
    setStatus("Lỗi xóa: " + error.message);
    return;
  }
  fetchTodos();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const task = input.value.trim();
  if (!task) return;
  addTodo(task);
  input.value = "";
});

// Load lần đầu
fetchTodos();

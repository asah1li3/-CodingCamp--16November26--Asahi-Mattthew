/* ═══════════════════════════════════════════════════════════════════
   app.js  –  To-Do Dashboard
   Features: Greeting + clock, Focus Timer (custom duration),
             To-Do List, Quick Links, Light/Dark mode,
             Custom name in greeting
   All data persisted in localStorage.
═══════════════════════════════════════════════════════════════════ */

// ── STORAGE HELPERS ─────────────────────────────────────────────────
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── CLOCK & GREETING ────────────────────────────────────────────────
const dateEl     = document.getElementById('current-date');
const timeEl     = document.getElementById('current-time');
const greetingEl = document.getElementById('greeting-text');
const nameInput  = document.getElementById('name-input');
const nameSave   = document.getElementById('name-save');

function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

function updateClock() {
  const now    = new Date();
  const hour   = now.getHours();
  const name   = load('userName', '');

  // Date string e.g. "Thursday, November 20"
  dateEl.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  // Time string e.g. "08:45 AM"
  timeEl.textContent = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  // Greeting with optional name
  const base = getGreeting(hour);
  greetingEl.textContent = name ? `${base}, ${name}! 👋` : `${base}! 👋`;
}

// Populate name input from storage
nameInput.value = load('userName', '');

nameSave.addEventListener('click', () => {
  const val = nameInput.value.trim();
  save('userName', val);
  updateClock();
  nameInput.blur();
});

nameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') nameSave.click();
});

updateClock();
setInterval(updateClock, 1000);

// ── LIGHT / DARK MODE ───────────────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle');
const html        = document.documentElement;

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

applyTheme(load('theme', 'light'));

themeToggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  save('theme', next);
  applyTheme(next);
});

// ── FOCUS TIMER ─────────────────────────────────────────────────────
const timerDisplay   = document.getElementById('timer-display');
const btnStart       = document.getElementById('timer-start');
const btnStop        = document.getElementById('timer-stop');
const btnReset       = document.getElementById('timer-reset');
const customMinInput = document.getElementById('custom-minutes');
const btnApply       = document.getElementById('custom-apply');

let timerDuration  = load('timerDuration', 25) * 60; // seconds
let timerRemaining = timerDuration;
let timerInterval  = null;
let timerRunning   = false;

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(timerRemaining);
  timerDisplay.classList.remove('running', 'finished');
  if (timerRunning)        timerDisplay.classList.add('running');
  if (timerRemaining === 0) timerDisplay.classList.add('finished');
}

function tickTimer() {
  if (timerRemaining > 0) {
    timerRemaining--;
    renderTimer();
  } else {
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning  = false;
    btnStart.disabled = true;
    btnStop.disabled  = true;
    renderTimer();
  }
}

btnStart.addEventListener('click', () => {
  if (timerRemaining === 0) return;
  timerRunning = true;
  timerInterval = setInterval(tickTimer, 1000);
  btnStart.disabled = true;
  btnStop.disabled  = false;
  renderTimer();
});

btnStop.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning  = false;
  btnStart.disabled = false;
  btnStop.disabled  = true;
  renderTimer();
});

btnReset.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval  = null;
  timerRunning   = false;
  timerRemaining = timerDuration;
  btnStart.disabled = false;
  btnStop.disabled  = true;
  renderTimer();
});

btnApply.addEventListener('click', () => {
  const mins = parseInt(customMinInput.value, 10);
  if (!mins || mins < 1 || mins > 120) return;
  // Stop any running timer first
  clearInterval(timerInterval);
  timerInterval  = null;
  timerRunning   = false;
  timerDuration  = mins * 60;
  timerRemaining = timerDuration;
  save('timerDuration', mins);
  btnStart.disabled = false;
  btnStop.disabled  = true;
  renderTimer();
});

// Sync the number input to whatever was saved
customMinInput.value = load('timerDuration', 25);
renderTimer();

// ── TO-DO LIST ───────────────────────────────────────────────────────
const todoInput = document.getElementById('todo-input');
const todoAdd   = document.getElementById('todo-add');
const todoList  = document.getElementById('todo-list');

let todos = load('todos', []);

function saveTodos() { save('todos', todos); }

function renderTodos() {
  todoList.innerHTML = '';
  todos.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (task.done ? ' done' : '');

    // Checkbox
    const cb = document.createElement('input');
    cb.type    = 'checkbox';
    cb.checked = task.done;
    cb.addEventListener('change', () => {
      todos[index].done = cb.checked;
      saveTodos();
      renderTodos();
    });

    // Text span
    const span = document.createElement('span');
    span.className   = 'todo-text';
    span.textContent = task.text;

    // Actions wrapper
    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className   = 'btn-edit';
    editBtn.textContent = '✏️ Edit';
    editBtn.addEventListener('click', () => startEdit(index, li, span, actions));

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className   = 'btn-delete';
    delBtn.textContent = '🗑';
    delBtn.addEventListener('click', () => {
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(cb);
    li.appendChild(span);
    li.appendChild(actions);
    todoList.appendChild(li);
  });
}

function startEdit(index, li, span, actions) {
  // Replace span with an input
  const editInput = document.createElement('input');
  editInput.type      = 'text';
  editInput.className = 'edit-input';
  editInput.value     = todos[index].text;
  editInput.maxLength = 120;
  li.replaceChild(editInput, span);
  editInput.focus();

  // Replace action buttons with Save
  actions.innerHTML = '';
  const saveBtn = document.createElement('button');
  saveBtn.className   = 'btn-save-edit';
  saveBtn.textContent = '✔ Save';

  function commitEdit() {
    const val = editInput.value.trim();
    if (val) todos[index].text = val;
    saveTodos();
    renderTodos();
  }

  saveBtn.addEventListener('click', commitEdit);
  editInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') renderTodos();
  });

  actions.appendChild(saveBtn);
}

function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;
  todos.push({ text, done: false });
  saveTodos();
  renderTodos();
  todoInput.value = '';
  todoInput.focus();
}

todoAdd.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo();
});

renderTodos();

// ── QUICK LINKS ──────────────────────────────────────────────────────
const linkNameInput = document.getElementById('link-name');
const linkUrlInput  = document.getElementById('link-url');
const linkAddBtn    = document.getElementById('link-add');
const linksContainer = document.getElementById('links-container');

let links = load('quickLinks', []);

function saveLinks() { save('quickLinks', links); }

function renderLinks() {
  linksContainer.innerHTML = '';
  links.forEach((link, index) => {
    const chip = document.createElement('div');
    chip.className = 'link-chip';

    const a = document.createElement('a');
    a.href        = link.url;
    a.textContent = link.name;
    a.target      = '_blank';
    a.rel         = 'noopener noreferrer';

    const delBtn = document.createElement('button');
    delBtn.className   = 'btn-link-delete';
    delBtn.textContent = '✕';
    delBtn.title       = 'Remove';
    delBtn.addEventListener('click', () => {
      links.splice(index, 1);
      saveLinks();
      renderLinks();
    });

    chip.appendChild(a);
    chip.appendChild(delBtn);
    linksContainer.appendChild(chip);
  });
}

function addLink() {
  const name = linkNameInput.value.trim();
  let   url  = linkUrlInput.value.trim();
  if (!name || !url) return;

  // Prepend https:// if missing
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  links.push({ name, url });
  saveLinks();
  renderLinks();
  linkNameInput.value = '';
  linkUrlInput.value  = '';
  linkNameInput.focus();
}

linkAddBtn.addEventListener('click', addLink);
linkUrlInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addLink();
});

renderLinks();

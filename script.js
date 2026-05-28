const DB_NAME = 'taskmanager';
const DB_VERSION = 1;
let db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
      }
    };

    req.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    req.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function addTask(task) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    const req = store.add(task);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAllTasks() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function renderTasks(tasks) {
  const container = document.querySelector('.service-grid');
  if (!container) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'tasks-list';
  tasks.forEach((t) => {
    const card = document.createElement('article');
    const h = document.createElement('h3');
    h.textContent = t.title || 'Untitled';
    const p = document.createElement('p');
    p.textContent = t.desc || '';
    card.appendChild(h);
    card.appendChild(p);
    wrapper.appendChild(card);
  });
  container.prepend(wrapper);
}

async function initDemo() {
  try {
    await openDB();
    const existing = await getAllTasks();
    if (existing.length === 0) {
      await addTask({ title: 'Tarea de ejemplo', desc: 'Esta tarea fue creada en IndexedDB.' });
    }
    const tasks = await getAllTasks();
    console.log('IndexedDB tasks:', tasks);
    renderTasks(tasks);
  } catch (err) {
    console.error('IndexedDB error', err);
  }
}

document.addEventListener('DOMContentLoaded', initDemo);

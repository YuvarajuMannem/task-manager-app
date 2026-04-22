class TaskManager {
  constructor() {
    this.tasks = this.loadTasks();
    this.currentFilter = 'all';
    this.init();
  }

  loadTasks() {
    const stored = localStorage.getItem('scribble_tasks');
    return stored ? JSON.parse(stored) : [];
  }

  saveTasks() {
    localStorage.setItem('scribble_tasks', JSON.stringify(this.tasks));
    this.updateStats();
  }

  addTask(text) {
    if (!text.trim()) return false;
    
    const newTask = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toLocaleDateString()
    };
    
    this.tasks.push(newTask);
    this.saveTasks();
    this.render();
    return true;
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.saveTasks();
    this.render();
  }

  editTask(id, newText) {
    if (!newText.trim()) return false;
    
    const task = this.tasks.find(task => task.id === id);
    if (task) {
      task.text = newText.trim();
      this.saveTasks();
      this.render();
      return true;
    }
    return false;
  }

  toggleComplete(id) {
    const task = this.tasks.find(task => task.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.render();
    }
  }

  getFilteredTasks() {
    if (this.currentFilter === 'pending') {
      return this.tasks.filter(task => !task.completed);
    } else if (this.currentFilter === 'completed') {
      return this.tasks.filter(task => task.completed);
    }
    return this.tasks;
  }

  updateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const statsEl = document.getElementById('taskStats');
    if (statsEl) {
      statsEl.innerHTML = `<span>📋 ${total} total</span><span>✓ ${completed} done</span><span>🕐 ${pending} pending</span>`;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    const taskListEl = document.getElementById('taskList');
    const filteredTasks = this.getFilteredTasks();
    
    if (filteredTasks.length === 0) {
      taskListEl.innerHTML = '<div class="empty-state">nothing here yet<br>write something messy above ✏️</div>';
      this.updateStats();
      return;
    }
    
    taskListEl.innerHTML = filteredTasks.map(task => `
      <li class="task-item" data-id="${task.id}">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        <span class="task-text ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.text)}</span>
        <button class="edit-btn" title="edit">✏️</button>
        <button class="delete-btn" title="delete">🗑️</button>
      </li>
    `).join('');
    
    this.attachTaskEvents();
    this.updateStats();
  }

  attachTaskEvents() {
    document.querySelectorAll('.task-item').forEach(item => {
      const id = parseInt(item.dataset.id);
      
      const checkbox = item.querySelector('.task-checkbox');
      checkbox.addEventListener('change', () => this.toggleComplete(id));
      
      const editBtn = item.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => {
        const task = this.tasks.find(t => t.id === id);
        const newText = prompt('edit your scribble:', task.text);
        if (newText !== null) this.editTask(id, newText);
      });
      
      const deleteBtn = item.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => {
        if (confirm('throw this task away?')) this.deleteTask(id);
      });

      // Double-click to edit (bonus)
      const taskText = item.querySelector('.task-text');
      taskText.addEventListener('dblclick', () => {
        const task = this.tasks.find(t => t.id === id);
        const newText = prompt('edit your scribble:', task.text);
        if (newText !== null) this.editTask(id, newText);
      });
    });
  }

  setFilter(filter) {
    this.currentFilter = filter;
    document.querySelectorAll('.filter-chip').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    this.render();
  }

  init() {
    const addBtn = document.getElementById('addTaskBtn');
    const taskInput = document.getElementById('taskInput');
    
    addBtn.addEventListener('click', () => {
      if (this.addTask(taskInput.value)) {
        taskInput.value = '';
        taskInput.focus();
      }
    });
    
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        if (this.addTask(taskInput.value)) {
          taskInput.value = '';
        }
      }
    });
    
    document.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
    });
    
    this.render();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TaskManager();
});
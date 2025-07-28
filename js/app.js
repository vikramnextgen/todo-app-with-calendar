// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const filterButtons = document.querySelectorAll('.filter-btn');
const itemsLeftSpan = document.getElementById('items-left');
const clearCompletedBtn = document.getElementById('clear-completed');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');
const currentMonthElement = document.getElementById('current-month');
const calendarDaysElement = document.getElementById('calendar-days');
const selectedDateElement = document.getElementById('selected-date');
const modal = document.getElementById('todo-modal');
const modalDateElement = document.getElementById('modal-date');
const modalTodoForm = document.getElementById('modal-todo-form');
const modalTodoInput = document.getElementById('modal-todo-input');
const closeModalBtn = document.querySelector('.close-modal');

// Variables
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';
let currentDate = new Date();
let selectedDate = new Date();

// Initialize the app
function init() {
    renderCalendar();
    loadSelectedDateTodos();
    updateItemsLeft();
}

// Format date to YYYY-MM-DD for storage
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format date for display
function formatDateForDisplay(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Add a new todo
function addTodo(text, date = formatDate(selectedDate)) {
    if (text.trim() === '') return;
    
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        date: date
    };
    
    todos.unshift(newTodo);
    saveTodos();
    loadSelectedDateTodos();
    updateItemsLeft();
    renderCalendar(); // Re-render calendar to update task indicators
}

// Delete a todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    loadSelectedDateTodos();
    updateItemsLeft();
    renderCalendar(); // Re-render calendar to update task indicators
}

// Toggle todo completion status
function toggleTodoStatus(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    
    saveTodos();
    loadSelectedDateTodos();
    updateItemsLeft();
}

// Clear all completed todos for the selected date
function clearCompleted() {
    const selectedDateStr = formatDate(selectedDate);
    todos = todos.filter(todo => !(todo.completed && todo.date === selectedDateStr));
    saveTodos();
    loadSelectedDateTodos();
    updateItemsLeft();
    renderCalendar(); // Re-render calendar to update task indicators
}

// Update items left count for the selected date
function updateItemsLeft() {
    const selectedDateStr = formatDate(selectedDate);
    const activeCount = todos.filter(todo => !todo.completed && todo.date === selectedDateStr).length;
    itemsLeftSpan.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
}

// Render todos based on selected date and current filter
function renderTodos(filteredTodos) {
    todoList.innerHTML = '';
    
    if (filteredTodos.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.classList.add('todo-item', 'empty-list');
        emptyMessage.innerHTML = `<span class="todo-text">No tasks for this day</span>`;
        todoList.appendChild(emptyMessage);
        return;
    }
    
    filteredTodos.forEach(todo => {
        const todoItem = document.createElement('li');
        todoItem.classList.add('todo-item');
        if (todo.completed) {
            todoItem.classList.add('completed');
        }
        
        todoItem.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
        `;
        
        const checkbox = todoItem.querySelector('.todo-checkbox');
        const deleteBtn = todoItem.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => toggleTodoStatus(todo.id));
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        
        todoList.appendChild(todoItem);
    });
}

// Load todos for the selected date
function loadSelectedDateTodos() {
    const selectedDateStr = formatDate(selectedDate);
    selectedDateElement.innerHTML = `<span>${formatDateForDisplay(selectedDate)}</span>`;
    
    // Filter todos for the selected date
    const dateTodos = todos.filter(todo => todo.date === selectedDateStr);
    
    // Apply current filter
    const filteredTodos = dateTodos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true; // 'all' filter
    });
    
    renderTodos(filteredTodos);
}

// Set active filter
function setFilter(filter) {
    currentFilter = filter;
    
    // Update active filter button
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    loadSelectedDateTodos();
}

// Calendar Functions
function renderCalendar() {
    // Update the current month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Clear previous calendar days
    calendarDaysElement.innerHTML = '';
    
    // Get the first day of the month
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Add days from previous month
    const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.classList.add('calendar-day', 'other-month');
        day.textContent = prevMonthDays - i;
        
        // Create a date object for this day
        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i);
        
        // Set up click event
        setupCalendarDayEvents(day, dayDate);
        
        calendarDaysElement.appendChild(day);
    }
    
    // Add days for current month
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.classList.add('calendar-day');
        day.textContent = i;
        
        // Create a date object for this day
        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        
        // Check if this day has any tasks
        const dayDateStr = formatDate(dayDate);
        const hasTasks = todos.some(todo => todo.date === dayDateStr);
        if (hasTasks) {
            day.classList.add('has-tasks');
        }
        
        // Check if this day is today
        if (today.getDate() === i && 
            today.getMonth() === currentDate.getMonth() && 
            today.getFullYear() === currentDate.getFullYear()) {
            day.classList.add('today');
        }
        
        // Check if this day is selected
        if (selectedDate.getDate() === i && 
            selectedDate.getMonth() === currentDate.getMonth() && 
            selectedDate.getFullYear() === currentDate.getFullYear()) {
            day.classList.add('selected');
        }
        
        // Set up click event
        setupCalendarDayEvents(day, dayDate);
        
        calendarDaysElement.appendChild(day);
    }
    
    // Add days from next month to fill the calendar
    const totalDaysDisplayed = firstDayOfWeek + daysInMonth;
    const remainingCells = 42 - totalDaysDisplayed; // 42 = 6 weeks * 7 days
    
    for (let i = 1; i <= remainingCells; i++) {
        const day = document.createElement('div');
        day.classList.add('calendar-day', 'other-month');
        day.textContent = i;
        
        // Create a date object for this day
        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
        
        // Set up click event
        setupCalendarDayEvents(day, dayDate);
        
        calendarDaysElement.appendChild(day);
    }
}

// Set up click events for calendar days
function setupCalendarDayEvents(dayElement, date) {
    // Single click to select the day
    dayElement.addEventListener('click', () => {
        // Remove 'selected' class from all days
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        // Add 'selected' class to the clicked day
        dayElement.classList.add('selected');
        
        // Update selected date
        selectedDate = date;
        
        // Update todos for the selected date
        loadSelectedDateTodos();
    });
    
    // Double click to add a todo for this day
    dayElement.addEventListener('dblclick', () => {
        selectedDate = date;
        openAddTodoModal(date);
    });
}

// Open modal to add a todo for a specific date
function openAddTodoModal(date) {
    modalDateElement.textContent = formatDateForDisplay(date);
    modalTodoInput.value = '';
    modal.style.display = 'flex';
    modalTodoInput.focus();
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
}

// Navigate to previous month
function goToPrevMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    renderCalendar();
}

// Navigate to next month
function goToNextMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    renderCalendar();
}

// Event Listeners
todoForm.addEventListener('submit', e => {
    e.preventDefault();
    addTodo(todoInput.value);
    todoInput.value = '';
});

modalTodoForm.addEventListener('submit', e => {
    e.preventDefault();
    addTodo(modalTodoInput.value, formatDate(selectedDate));
    closeModal();
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

clearCompletedBtn.addEventListener('click', clearCompleted);
prevMonthBtn.addEventListener('click', goToPrevMonth);
nextMonthBtn.addEventListener('click', goToNextMonth);
closeModalBtn.addEventListener('click', closeModal);

// Close modal when clicking outside of it
window.addEventListener('click', e => {
    if (e.target === modal) {
        closeModal();
    }
});

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
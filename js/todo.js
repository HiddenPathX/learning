// 待办事项相关功能
export const todo = {
    todos: [],
    STORAGE_KEY: 'todoItems',

    initialize() {
        this.loadTodos();
        this.setupEventListeners();
    },

    getTodosFromStorage() {
        try {
            const todosJson = localStorage.getItem(this.STORAGE_KEY);
            return todosJson ? JSON.parse(todosJson) : [];
        } catch (error) {
            console.error('获取待办事项失败:', error);
            return [];
        }
    },

    loadTodos() {
        const todos = this.getTodosFromStorage();
        const todoList = document.getElementById('todoList');
        if (!todoList) return;

        todoList.innerHTML = '';
        
        const today = this.formatDate(new Date());
        
        const todayPendingTodos = todos.filter(todo => {
            if (todo.completed) return false;
            
            if (todo.date) {
                return todo.date === today;
            }
            
            if (todo.startTime) {
                return todo.startTime.split('T')[0] === today;
            }
            
            return this.formatDate(new Date(parseInt(todo.id))) === today;
        });
        
        todayPendingTodos.forEach(todo => this.createTodoElement(todo));
    },

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.todoId = todo.id;
        
        const todoInfo = document.createElement('div');
        todoInfo.className = 'todo-info';
        
        const timeDisplay = todo.startTime ? 
            `${todo.startTime.split('T')[1]}${todo.endTime ? ' - ' + todo.endTime.split('T')[1] : ''}`
            : '';
        
        todoInfo.innerHTML = `
            <div class="todo-title">${todo.text}</div>
            <div class="todo-time">
                ${timeDisplay}
                <span class="todo-duration">${todo.duration}分钟</span>
                ${todo.breakTime ? `<span class="todo-break-time">休息${todo.breakTime}分钟</span>` : ''}
            </div>
        `;

        const startBtn = document.createElement('button');
        startBtn.className = 'todo-start-btn';
        startBtn.textContent = '开始任务';
        startBtn.addEventListener('click', async () => {
            // 移除其他任务的活动状态
            document.querySelectorAll('.todo-item.active').forEach(item => {
                item.classList.remove('active');
            });
            
            // 设置当前任务为活动状态
            li.classList.add('active');

            try {
                // 导入 timer 模块
                const module = await import('./timer.js');
                const timer = module.timer;
                
                // 先停止当前计时器（如果有的话）
                if (timer.timerInterval) {
                    timer.stopTimer();
                }
                
                // 设置工作时长和休息时长
                timer.setCustomTime(todo.duration, todo.breakTime || 5); // 使用任务设置的休息时间，如果没有则默认5分钟
                timer.startTimer();
                
                console.log('开始任务:', {
                    taskId: todo.id,
                    duration: todo.duration,
                    breakTime: todo.breakTime || 5,
                    text: todo.text
                });
            } catch (error) {
                console.error('加载或启动 timer 模块失败:', error);
            }

            // 关闭任何打开的模态框
            const openModal = document.getElementById('openModal');
            if (openModal) {
                openModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        li.appendChild(todoInfo);
        li.appendChild(startBtn);
        todoList.appendChild(li);
    },

    addTodo(fromCalendar = false) {
        let todoInput, todoStartTime, todoEndTime, todoDuration, todoBreakTime;
        
        if (fromCalendar) {
            // 从日历面板添加任务
            todoInput = document.querySelector('#dayTasksPanel input[type="text"]');
            todoStartTime = document.getElementById('calendarStartTime');
            todoEndTime = document.getElementById('calendarEndTime');
            todoDuration = document.getElementById('calendarDuration');
            todoBreakTime = document.getElementById('calendarBreakTime');
            
            console.log('从日历添加任务:', {
                todoInput: todoInput?.value,
                todoStartTime: todoStartTime?.value,
                todoEndTime: todoEndTime?.value,
                todoDuration: todoDuration?.value,
                todoBreakTime: todoBreakTime?.value
            });
        } else {
            // 从主容器添加任务
            todoInput = document.getElementById('todoInput');
            todoStartTime = document.getElementById('todoStartTime');
            todoEndTime = document.getElementById('todoEndTime');
            todoDuration = document.getElementById('todoDuration');
            todoBreakTime = document.getElementById('todoBreakTime');
        }

        if (!todoInput) {
            console.error('未找到任务输入框');
            return;
        }

        const todoText = todoInput.value.trim();
        const startTime = todoStartTime?.value;
        const endTime = todoEndTime?.value;
        const duration = parseInt(todoDuration?.value);
        const breakTime = parseInt(todoBreakTime?.value);

        if (!todoText || !duration) {
            alert('请填写任务名称和工作时长！');
            return;
        }

        if (duration < 1 || duration > 60) {
            alert('工作时长必须在1-60分钟之间！');
            return;
        }

        if (breakTime && (breakTime < 1 || breakTime > 30)) {
            alert('休息时长必须在1-30分钟之间！');
            return;
        }

        // 获取选中的日期或今天的日期
        let selectedDate;
        if (window.selectedDate) {
            selectedDate = new Date(window.selectedDate);
            if (isNaN(selectedDate.getTime())) {
                selectedDate = new Date();
            }
        } else {
            selectedDate = new Date();
        }
        
        const selectedDateStr = this.formatDate(selectedDate);
        const today = this.formatDate(new Date());

        if (selectedDateStr < today) {
            alert('不能为过去的日期添加任务！');
            return;
        }

        const todo = {
            id: Date.now().toString(),
            text: todoText,
            startTime: startTime ? `${selectedDateStr}T${startTime}` : null,
            endTime: endTime ? `${selectedDateStr}T${endTime}` : null,
            duration: duration,
            breakTime: breakTime || 5, // 如果没有设置休息时间，默认5分钟
            completed: false,
            date: selectedDateStr
        };

        // 保存到本地存储
        const todos = this.getTodosFromStorage();
        todos.push(todo);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(todos));

        // 如果是今天的任务，添加到主容器
        if (selectedDateStr === today) {
            this.createTodoElement(todo);
        }

        // 清空输入框
        todoInput.value = '';
        if (todoStartTime) todoStartTime.value = '';
        if (todoEndTime) todoEndTime.value = '';
        if (todoDuration) todoDuration.value = '';
        if (todoBreakTime) todoBreakTime.value = '';

        // 更新日历显示
        if (window.app && window.app.calendar) {
            window.app.calendar.renderCalendar();
        }
        
        // 如果是从日历面板添加的，更新日历任务面板
        if (fromCalendar && window.selectedDate && window.app && window.app.calendar) {
            window.app.calendar.showDayTasks(selectedDate);
        }
    },

    setupEventListeners() {
        // 主容器的添加任务按钮
        const addTodoBtn = document.getElementById('addTodoBtn');
        if (addTodoBtn) {
            addTodoBtn.addEventListener('click', () => this.addTodo(false));
        }

        // 日历面板的添加任务按钮
        const calendarAddTodoBtn = document.getElementById('calendarAddTodoBtn');
        if (calendarAddTodoBtn) {
            calendarAddTodoBtn.addEventListener('click', () => this.addTodo(true));
        }
    }
}; 
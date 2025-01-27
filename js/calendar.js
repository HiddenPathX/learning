// 日历相关功能
export const calendar = {
    currentDate: new Date(),
    selectedDate: null,

    initialize() {
        this.initCalendar();
        this.setupEventListeners();
        // 确保全局可以访问selectedDate
        window.selectedDate = this.selectedDate;
    },

    initCalendar() {
        const monthDisplay = document.getElementById('monthDisplay');
        const calendarGrid = document.getElementById('calendarGrid');
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');

        if (!monthDisplay || !calendarGrid || !prevMonthBtn || !nextMonthBtn) {
            console.error('日历元素未找到');
            return;
        }

        prevMonthBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        this.renderCalendar();
    },

    renderCalendar() {
        const monthDisplay = document.getElementById('monthDisplay');
        const calendarGrid = document.getElementById('calendarGrid');
        
        if (!monthDisplay || !calendarGrid) {
            console.error('日历元素未找到');
            return;
        }

        // 设置月份显示
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                           '七月', '八月', '九月', '十月', '十一月', '十二月'];
        monthDisplay.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

        // 清空日历网格
        calendarGrid.innerHTML = '';

        // 获取当月第一天和最后一天
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

        // 填充前置空白天数
        for (let i = 0; i < firstDay.getDay(); i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }

        // 填充日期
        for (let date = 1; date <= lastDay.getDate(); date++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date;

            // 检查是否是今天
            const currentDateStr = new Date().toDateString();
            const calendarDateStr = new Date(this.currentDate.getFullYear(), 
                                           this.currentDate.getMonth(), date).toDateString();
            if (currentDateStr === calendarDateStr) {
                dayElement.classList.add('today');
            }

            // 添加点击事件
            dayElement.addEventListener('click', () => {
                this.selectedDate = new Date(this.currentDate.getFullYear(), 
                                           this.currentDate.getMonth(), date);
                // 更新全局selectedDate
                window.selectedDate = this.selectedDate;
                this.showDayTasks(this.selectedDate);
            });

            // 添加任务标记
            const dateStr = this.formatDate(new Date(this.currentDate.getFullYear(), 
                                          this.currentDate.getMonth(), date));
            const todos = window.app.todo.getTodosFromStorage();
            const dayTasks = todos.filter(todo => {
                if (todo.date) {
                    return todo.date === dateStr;
                }
                if (todo.startTime) {
                    return todo.startTime.split('T')[0] === dateStr;
                }
                return this.formatDate(new Date(parseInt(todo.id))) === dateStr;
            });

            if (dayTasks.length > 0) {
                dayElement.classList.add('has-tasks');
                if (dayTasks.every(task => task.completed)) {
                    dayElement.classList.add('completed');
                } else if (dayTasks.some(task => task.completed)) {
                    dayElement.classList.add('partial');
                }
            }

            calendarGrid.appendChild(dayElement);
        }
    },

    setupEventListeners() {
        // 添加其他事件监听器
    },

    showDayTasks(date) {
        const panel = document.getElementById('dayTasksPanel');
        const overlay = document.getElementById('taskModalOverlay');
        const dateDisplay = document.getElementById('selectedDate');
        const tasksList = document.getElementById('dayTasksList');
        const pendingCount = document.getElementById('pendingCount');
        const completedCount = document.getElementById('completedCount');
        
        if (!panel || !overlay || !dateDisplay) {
            console.error('任务面板元素未找到');
            return;
        }

        // 设置日期显示
        dateDisplay.textContent = date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // 获取当天任务
        const dateStr = this.formatDate(date);
        const todos = window.app.todo.getTodosFromStorage();
        const dayTasks = todos.filter(todo => {
            if (todo.date) {
                return todo.date === dateStr;
            }
            if (todo.startTime) {
                return todo.startTime.split('T')[0] === dateStr;
            }
            return this.formatDate(new Date(parseInt(todo.id))) === dateStr;
        });

        // 更新计数
        const completed = dayTasks.filter(task => task.completed).length;
        if (pendingCount) pendingCount.textContent = dayTasks.length - completed;
        if (completedCount) completedCount.textContent = completed;

        // 清空并填充任务列表
        if (tasksList) {
            tasksList.innerHTML = '';
            
            if (dayTasks.length === 0) {
                const noTasksDiv = document.createElement('div');
                noTasksDiv.className = 'no-tasks';
                noTasksDiv.textContent = '当天没有任务';
                tasksList.appendChild(noTasksDiv);
            } else {
                dayTasks.forEach((task, index) => {
                    const taskElement = document.createElement('div');
                    taskElement.className = `day-task-item ${task.completed ? 'completed' : 'pending'}`;
                    taskElement.style.setProperty('--index', index);
                    
                    // 格式化完成时间
                    let completedTimeStr = '';
                    if (task.completed && task.completedAt) {
                        const completedDate = new Date(task.completedAt);
                        completedTimeStr = completedDate.toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }
                    
                    taskElement.innerHTML = `
                        <div class="task-info">
                            <span class="task-text">${task.text}</span>
                            <div class="task-details">
                                <span class="task-time">
                                    ${task.startTime ? task.startTime.split('T')[1] : ''}
                                    ${task.endTime ? ' - ' + task.endTime.split('T')[1] : ''}
                                </span>
                                <span class="task-duration">${task.duration}分钟</span>
                                ${task.completed ? `<span class="completion-time">完成于 ${completedTimeStr}</span>` : ''}
                            </div>
                        </div>
                    `;
                    tasksList.appendChild(taskElement);
                });
            }
        }

        // 显示遮罩和面板
        overlay.style.display = 'block';
        panel.style.display = 'flex';
        
        // 触发动画
        requestAnimationFrame(() => {
            overlay.classList.add('show');
            panel.classList.add('show');
        });

        // 添加关闭事件
        const closeBtn = panel.querySelector('.close-day-tasks');
        if (closeBtn) {
            const closePanel = () => {
                overlay.classList.remove('show');
                panel.classList.remove('show');
                
                setTimeout(() => {
                    overlay.style.display = 'none';
                    panel.style.display = 'none';
                }, 300);
            };
            
            closeBtn.onclick = closePanel;
            overlay.onclick = closePanel;
        }
    },

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}; 
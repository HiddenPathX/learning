// 习惯管理模块
const habits = {
    habitsList: [],

    // 初始化习惯模块
    init() {
        this.loadHabits();
        this.setupEventListeners();
        this.startHabitCheck();
    },

    // 从localStorage加载习惯
    loadHabits() {
        const savedHabits = localStorage.getItem('habits');
        this.habitsList = savedHabits ? JSON.parse(savedHabits) : [];
        this.renderHabits();
    },

    // 保存习惯到localStorage
    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habitsList));
    },

    // 添加新习惯
    addHabit(name, startTime) {
        const habit = {
            id: Date.now(),
            name,
            startTime: startTime || null,
            isCompleted: false
        };
        this.habitsList.push(habit);
        this.saveHabits();
        this.renderHabits();
    },

    // 删除习惯
    deleteHabit(id) {
        this.habitsList = this.habitsList.filter(habit => habit.id !== id);
        this.saveHabits();
        this.renderHabits();
    },

    // 渲染习惯列表
    renderHabits() {
        const habitListElement = document.getElementById('habits-list');
        if (!habitListElement) return;

        habitListElement.innerHTML = '';
        this.habitsList.forEach(habit => {
            const habitElement = document.createElement('div');
            habitElement.className = 'habit-item';
            habitElement.draggable = true;
            habitElement.dataset.id = habit.id;
            habitElement.innerHTML = `
                <div class="drag-handle">⋮⋮</div>
                <span class="habit-name">${habit.name}</span>
                ${habit.startTime ? `<span class="habit-time">${habit.startTime}</span>` : ''}
                <button class="delete-habit" data-id="${habit.id}">删除</button>
            `;
            habitListElement.appendChild(habitElement);
        });
    },

    // 设置事件监听器
    setupEventListeners() {
        const form = document.getElementById('habit-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('habit-name');
                const timeInput = document.getElementById('habit-time');
                
                if (nameInput.value) {
                    this.addHabit(nameInput.value, timeInput.value || null);
                    nameInput.value = '';
                    timeInput.value = '';
                }
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-habit')) {
                const id = parseInt(e.target.dataset.id);
                this.deleteHabit(id);
            }
        });

        // 添加拖拽相关的事件监听
        const habitsList = document.getElementById('habits-list');
        if (habitsList) {
            habitsList.addEventListener('dragstart', (e) => {
                if (e.target.classList.contains('habit-item')) {
                    e.target.classList.add('dragging');
                    e.dataTransfer.setData('text/plain', e.target.dataset.id);
                }
            });

            habitsList.addEventListener('dragend', (e) => {
                if (e.target.classList.contains('habit-item')) {
                    e.target.classList.remove('dragging');
                }
            });

            habitsList.addEventListener('dragover', (e) => {
                e.preventDefault();
                const draggingItem = habitsList.querySelector('.dragging');
                if (!draggingItem) return;

                const siblings = [...habitsList.querySelectorAll('.habit-item:not(.dragging)')];
                const nextSibling = siblings.find(sibling => {
                    const rect = sibling.getBoundingClientRect();
                    const centerY = rect.top + rect.height / 2;
                    return e.clientY < centerY;
                });

                if (nextSibling) {
                    habitsList.insertBefore(draggingItem, nextSibling);
                } else {
                    habitsList.appendChild(draggingItem);
                }
            });

            habitsList.addEventListener('drop', (e) => {
                e.preventDefault();
                const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
                const items = [...habitsList.querySelectorAll('.habit-item')];
                const newOrder = items.map(item => parseInt(item.dataset.id));
                
                // 重新排序 habitsList 数组
                this.habitsList.sort((a, b) => {
                    return newOrder.indexOf(a.id) - newOrder.indexOf(b.id);
                });
                
                this.saveHabits();
            });
        }
    },

    // 检查习惯时间并提醒
    startHabitCheck() {
        setInterval(() => {
            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit'
            });

            this.habitsList.forEach(habit => {
                if (habit.startTime && habit.startTime === currentTime && !habit.isCompleted) {
                    this.showHabitReminder(habit);
                    habit.isCompleted = true;  // 标记为已完成
                    this.saveHabits();  // 保存状态
                }
            });

            // 每天零点重置所有习惯的完成状态
            if (currentTime === '00:00') {
                this.habitsList.forEach(habit => {
                    habit.isCompleted = false;
                });
                this.saveHabits();
            }
        }, 1000);
    },

    // 显示提醒弹窗
    showHabitReminder(habit) {
        // 检查是否已经存在提醒弹窗
        const existingModal = document.querySelector('.habit-reminder-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'habit-reminder-modal';
        modal.innerHTML = `
            <div class="habit-reminder-content">
                <h3>习惯提醒</h3>
                <p>现在是时候执行你的习惯了：${habit.name}</p>
                <button id="confirmHabit">确定</button>
            </div>
        `;

        // 创建音频实例
        const audio = new Audio('songs/alarm3.mp3');
        
        // 添加确认按钮点击事件
        modal.querySelector('#confirmHabit').addEventListener('click', () => {
            audio.pause();  // 停止音频
            audio.currentTime = 0;  // 重置音频时间
            modal.remove();  // 移除弹窗
        });

        document.body.appendChild(modal);
        audio.play();  // 播放音频
    }
};

// 导出习惯模块
export default habits; 
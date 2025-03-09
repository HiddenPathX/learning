// 计时器相关功能
export const timer = {
    workTime: 25,
    breakTime: 5,
    timeLeft: 25 * 60,
    timerInterval: null,
    isWorking: true,
    isPaused: false,
    
    // DOM 元素引用
    elements: {
        minutesDisplay: null,
        secondsDisplay: null,
        startBtn: null,
        pauseBtn: null,
        stopBtn: null,
        currentSongDisplay: null,
        bgm: null,
        alarm: null,
        alarmBreak: null,
        alertSound: null
    },

    initialize() {
        // 从 localStorage 恢复设置
        this.loadSettings();
        
        // 初始化 DOM 元素引用
        this.elements = {
            minutesDisplay: document.getElementById('minutes'),
            secondsDisplay: document.getElementById('seconds'),
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            stopBtn: document.getElementById('stopBtn'),
            currentSongDisplay: document.getElementById('current-song'),
            bgm: document.getElementById('bgm'),
            alarm: document.getElementById('alarm'),
            alarmBreak: document.getElementById('alarmBreak'),
            alertSound: document.getElementById('alertSound')
        };

        // 初始化显示
        this.updateDisplay();
        
        // 初始化设置弹窗
        this.initializeSettingsModal();
    },
    
    // 初始化设置弹窗的值
    initializeSettingsModal() {
        const workTimeInput = document.getElementById('workTime');
        const breakTimeInput = document.getElementById('breakTime');
        
        if (workTimeInput && breakTimeInput) {
            // 设置工作时间和休息时间的初始值
            workTimeInput.value = this.workTime;
            breakTimeInput.value = this.breakTime;
            
            // 添加事件监听器，在弹窗打开时更新值
            const settingsModal = document.getElementById('settingsModal');
            if (settingsModal) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'attributes' && 
                            mutation.attributeName === 'style' && 
                            settingsModal.style.display === 'block') {
                            workTimeInput.value = this.workTime;
                            breakTimeInput.value = this.breakTime;
                        }
                    });
                });
                
                observer.observe(settingsModal, { attributes: true });
            }
        }
    },
    
    // 保存设置到 localStorage
    saveSettings() {
        const settings = {
            workTime: this.workTime,
            breakTime: this.breakTime
        };
        localStorage.setItem('timerSettings', JSON.stringify(settings));
        console.log('保存时间设置:', settings);
    },
    
    // 从 localStorage 加载设置
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('timerSettings'));
            if (settings) {
                this.workTime = settings.workTime || 25;
                this.breakTime = settings.breakTime || 5;
                this.timeLeft = this.workTime * 60;
                console.log('加载时间设置:', settings);
            }
        } catch (error) {
            console.error('加载时间设置失败:', error);
            // 使用默认值
            this.workTime = 25;
            this.breakTime = 5;
            this.timeLeft = this.workTime * 60;
        }
    },
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.elements.minutesDisplay.textContent = String(minutes).padStart(2, '0');
        this.elements.secondsDisplay.textContent = String(seconds).padStart(2, '0');
    },

    startTimer() {
        console.log('开始计时器...');
        if (this.timerInterval !== null) {
            console.log('计时器已在运行中');
            return;
        }
        
        if (!this.isPaused) {
            // 如果不是暂停状态，使用保存的时间设置
            this.timeLeft = this.isWorking ? this.workTime * 60 : this.breakTime * 60;
            console.log('设置时间:', {
                isWorking: this.isWorking,
                workTime: this.workTime,
                breakTime: this.breakTime,
                timeLeft: this.timeLeft
            });
        }
        
        this.isPaused = false;
        
        // 更新按钮状态
        const mainStartBtn = document.querySelector('.main-controls #startBtn');
        if (mainStartBtn) mainStartBtn.disabled = true;
        if (this.elements.pauseBtn) this.elements.pauseBtn.disabled = false;
        if (this.elements.stopBtn) this.elements.stopBtn.disabled = false;
        
        // 记录开始时间和状态
        localStorage.setItem('startTime', Date.now().toString());
        localStorage.setItem('isActive', 'true');
        localStorage.setItem('isWorking', String(this.isWorking));
        localStorage.setItem('timeLeft', String(this.timeLeft));
        
        // 开始播放背景音乐并显示歌曲名称
        if (this.elements.bgm) {
            this.elements.bgm.play().catch(error => {
                console.log('背景音乐播放失败:', error);
            });
            
            // 显示当前歌曲名称
            const currentSongDisplay = document.getElementById('current-song');
            if (currentSongDisplay && window.app.audio) {
                const currentSong = window.app.audio.songs[window.app.audio.currentSongIndex];
                currentSongDisplay.textContent = `VIBE: ${currentSong.name}`;
                currentSongDisplay.classList.add('show');
            }
        }
        
        // 显示特效
        if (window.app.effects) {
            window.app.effects.showParticles();
            if (this.isWorking) {
                window.app.effects.showRandomQuote();
            }
        }
        
        // 开始计时
        console.log('启动计时器间隔...');
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.handleTimerComplete();
            }
        }, 1000);
    },

    async handleTimerComplete() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        
        try {
            // 停止背景音乐
            if (this.elements.bgm) {
                this.elements.bgm.pause();
                this.elements.bgm.currentTime = 0;
            }
            
            // 播放提示音
            if (this.elements.alertSound) {
                this.elements.alertSound.play().catch(error => {
                    console.log('提示音播放失败:', error);
                });
            }
            
            if (this.isWorking) {
                // 获取当前活动的任务
                const activeTask = document.querySelector('.todo-item.active');
                if (activeTask) {
                    const todoId = activeTask.dataset.todoId;
                    
                    // 从存储中获取所有任务
                    const todos = JSON.parse(localStorage.getItem('todoItems') || '[]');
                    const currentTask = todos.find(todo => todo.id === todoId);
                    
                    // 更新任务状态
                    const updatedTodos = todos.map(todo => {
                        if (todo.id === todoId) {
                            return { 
                                ...todo, 
                                completed: true,
                                completedAt: new Date().toISOString()
                            };
                        }
                        return todo;
                    });
                    
                    // 更新存储
                    localStorage.setItem('todoItems', JSON.stringify(updatedTodos));
                    
                    // 从主容器中移除任务
                    activeTask.remove();
                    
                    // 更新日历显示
                    if (window.app && window.app.calendar) {
                        window.app.calendar.renderCalendar();
                    }

                    // 使用任务中设置的休息时间
                    if (currentTask && currentTask.breakTime) {
                        this.breakTime = parseInt(currentTask.breakTime);
                    }
                }
                
                // 记录学习时间
                try {
                    await this.recordStudyTime();
                } catch (error) {
                    console.error('记录学习时间失败:', error);
                }

                // 播放工作完成提示音
                if (this.elements.alarm) {
                    await this.elements.alarm.play();
                }
                alert("工作时间结束！开始休息吧！");
                
                this.isWorking = false;
                this.timeLeft = this.breakTime * 60;
                console.log('开始休息时间:', this.breakTime, '分钟');
                
                // 自动开始休息时间
                this.startTimer();
            } else {
                // 播放休息结束提示音
                if (this.elements.alarmBreak) {
                    await this.elements.alarmBreak.play();
                }
                alert("休息时间结束！");
                
                this.isWorking = true;
                // 使用保存的工作时间设置
                this.timeLeft = this.workTime * 60;
                this.updateDisplay();
            }
        } catch (error) {
            console.error('处理计时器完成时出错:', error);
        }
    },

    // 添加记录学习时间的方法
    async recordStudyTime() {
        try {
            // 使用本地存储记录学习时间
            window.app.auth.updateStudyRecord(this.workTime);
            console.log(`成功记录学习时间: ${this.workTime} 分钟`);
        } catch (error) {
            console.error('记录学习时间失败:', error);
        }
    },

    pauseTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.isPaused = true;
            
            const mainStartBtn = document.querySelector('.main-controls #startBtn');
            if (mainStartBtn) mainStartBtn.disabled = false;
            if (this.elements.pauseBtn) this.elements.pauseBtn.disabled = true;
            
            if (window.app.effects) {
                window.app.effects.hideParticles();
            }
        }
    },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.isPaused = false;
        this.isWorking = true;
        this.timeLeft = this.workTime * 60;
        this.updateDisplay();
        
        const mainStartBtn = document.querySelector('.main-controls #startBtn');
        if (mainStartBtn) mainStartBtn.disabled = false;
        if (this.elements.pauseBtn) this.elements.pauseBtn.disabled = true;
        if (this.elements.stopBtn) this.elements.stopBtn.disabled = true;
        
        if (this.elements.bgm) {
            this.elements.bgm.pause();
            this.elements.bgm.currentTime = 0;
        }
        
        // 隐藏歌曲名称
        const currentSongDisplay = document.getElementById('current-song');
        if (currentSongDisplay) {
            currentSongDisplay.classList.remove('show');
        }
        
        if (window.app.effects) {
            window.app.effects.hideParticles();
            window.app.effects.hideQuote();
        }
    },

    setCustomTime(workMinutes, breakMinutes) {
        console.log('设置自定义时间:', { workMinutes, breakMinutes });
        this.workTime = workMinutes;
        this.breakTime = breakMinutes;
        this.timeLeft = workMinutes * 60;
        this.isWorking = true;
        this.isPaused = false;
        this.updateDisplay();
        
        // 保存新的设置
        this.saveSettings();
    }
}; 
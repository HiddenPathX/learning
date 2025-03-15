import { timer } from './timer.js';
import { audio } from './audio.js';
import { todo } from './todo.js';
import { calendar } from './calendar.js';
import { auth } from './auth.js';
import { effects } from './effects.js';
import { chat } from './chat.js';

// 导出所有事件处理函数
export const handlers = {
    // 计时器相关
    startTimer() {
        timer.startTimer();
    },
    
    pauseTimer() {
        timer.pauseTimer();
    },
    
    stopTimer() {
        timer.stopTimer();
    },

    // 模态框相关
    closeModal() {
        const modal = document.getElementById('openModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    },

    openModal() {
        const modal = document.getElementById('openModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    },

    // 音频控制
    toggleMuteBgm() {
        audio.toggleMute();
    },
    
    playNextSong() {
        audio.playNextSong();
    },
    
    // 待办事项相关
    addTodo() {
        todo.addTodo();
    },
    
    // 自定义时间设置
    applyCustomTime() {
        const workTimeInput = document.getElementById('workTime');
        const breakTimeInput = document.getElementById('breakTime');
        timer.setCustomTime(
            parseInt(workTimeInput.value),
            parseInt(breakTimeInput.value)
        );
    },

    // 启动按钮处理函数
    startTimerFromModal() {
        const modal = document.getElementById('openModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        timer.startTimer();
    },

    // 添加帮助模态框相关处理函数
    openHelpModal() {
        const helpModal = document.getElementById('helpModal');
        if (helpModal) {
            helpModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    },
    
    closeHelpModal() {
        const helpModal = document.getElementById('helpModal');
        if (helpModal) {
            helpModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
};

// 初始化所有事件监听器
export function initializeEventListeners() {
    // 计时器按钮
    document.getElementById('startBtn')?.addEventListener('click', handlers.startTimer);
    document.getElementById('pauseBtn')?.addEventListener('click', handlers.pauseTimer);
    document.getElementById('stopBtn')?.addEventListener('click', handlers.stopTimer);

    // 文件上传相关
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    if (uploadButton && fileInput) {
        uploadButton.addEventListener('click', () => {
            fileInput.click();
        });
        fileInput.addEventListener('change', chat.handleFileUpload);
    }

    // 模态框按钮
    document.getElementById('openBtn')?.addEventListener('click', handlers.openModal);
    document.querySelector('.close-button')?.addEventListener('click', handlers.closeModal);
    
    // 帮助按钮事件监听器
    document.getElementById('helpBtn')?.addEventListener('click', handlers.openHelpModal);
    
    // 帮助模态框关闭按钮
    document.getElementById('helpCloseBtn')?.addEventListener('click', handlers.closeHelpModal);
    
    // 点击模态框外部关闭
    const helpModal = document.getElementById('helpModal');
    if (helpModal) {
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                handlers.closeHelpModal();
            }
        });
    }
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && helpModal?.style.display === 'block') {
            handlers.closeHelpModal();
        }
    });

    // 音频控制按钮
    document.getElementById('muteBgmBtn')?.addEventListener('click', handlers.toggleMuteBgm);
    document.getElementById('nextSongBtn')?.addEventListener('click', handlers.playNextSong);

    // 任务相关按钮
    document.getElementById('addTodoBtn')?.addEventListener('click', handlers.addTodo);
    document.getElementById('applyCustom')?.addEventListener('click', handlers.applyCustomTime);

    // 启动按钮事件监听器
    const modalStartBtn = document.getElementById('startBtn');
    if (modalStartBtn) {
        modalStartBtn.addEventListener('click', handlers.startTimerFromModal);
    }

    // 发送按钮事件监听器
    const sendButton = document.getElementById('send-button');
    if (sendButton) {
        sendButton.addEventListener('click', chat.handleSend);
    }

    // 输入框回车事件监听器
    const userInput = document.getElementById('user-input');
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                chat.handleSend();
            }
        });
    }
} 
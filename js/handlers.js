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

    // 表单相关
    showForm(formType) {
        const loginForm = document.querySelector('.login-form');
        const registerForm = document.querySelector('.register-form');
        const loginBtn = document.querySelector('.auth-btn:nth-child(1)');
        const registerBtn = document.querySelector('.auth-btn:nth-child(2)');

        if (formType === 'login') {
            loginForm.style.display = 'flex';
            registerForm.style.display = 'none';
            loginBtn.classList.add('active');
            registerBtn.classList.remove('active');
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'flex';
            loginBtn.classList.remove('active');
            registerBtn.classList.add('active');
        }
    },

    // 音频相关
    toggleMuteBgm() {
        audio.toggleMute();
    },

    playNextSong() {
        audio.playNextSong();
    },

    // 任务相关
    addTodo() {
        todo.addTodo();
    },

    // 认证相关
    logout() {
        auth.logout();
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

    async handleLogin(event) {
        event.preventDefault();
        event.stopPropagation();  // 确保事件不会冒泡
        
        try {
            const form = event.target;
            const usernameInput = form.querySelector('input[type="text"]');
            const passwordInput = form.querySelector('input[type="password"]');
            
            if (!usernameInput || !passwordInput) {
                throw new Error('找不到用户名或密码输入框');
            }
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            
            if (!username || !password) {
                throw new Error('用户名和密码不能为空');
            }
            
            console.log('准备登录...');
            if (!auth || typeof auth.login !== 'function') {
                throw new Error('认证模块未正确加载');
            }
            
            await auth.login(username, password);
            console.log('登录成功！');
            alert('登录成功！');
        } catch (error) {
            console.error('登录错误:', error);
            alert(error.message || '登录失败，请重试');
        }
    },

    async handleRegister(event) {
        event.preventDefault();
        const form = event.target;
        const username = form.querySelector('input[type="text"]').value;
        const passwords = form.querySelectorAll('input[type="password"]');
        const password = passwords[0].value;
        const confirmPassword = passwords[1].value;

        if (password !== confirmPassword) {
            alert('两次输入的密码不一致！');
            return;
        }

        try {
            await window.app.auth.register(username, password);
            alert('注册成功！');
        } catch (error) {
            alert(error.message || '注册失败，请重试');
        }
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

    // 认证相关按钮
    document.querySelectorAll('.auth-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const formType = e.target.textContent.includes('登录') ? 'login' : 'register';
            handlers.showForm(formType);
        });
    });

    // 登出按钮
    document.querySelector('.logout-btn')?.addEventListener('click', handlers.logout);

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

    // 登录表单提交事件
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handlers.handleLogin);
    }

    // 注册表单提交事件
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handlers.handleRegister);
    }
} 
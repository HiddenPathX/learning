import { timer } from './timer.js';
import { audio } from './audio.js';
import { todo } from './todo.js';
import { calendar } from './calendar.js';
import { auth } from './auth.js';
import { effects } from './effects.js';
import { handlers, initializeEventListeners } from './handlers.js';
import { chat } from './chat.js';
import habits from './habits.js';

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    console.log('开始初始化应用...');
    
    try {
        console.log('初始化计时器...');
        timer.initialize();
    } catch (error) {
        console.error('计时器初始化失败:', error);
    }
    
    // 分别初始化每个模块，避免一个模块的错误影响其他模块
    try {
        console.log('初始化音频模块...');
        audio.initialize();
    } catch (error) {
        console.error('音频模块初始化失败:', error);
    }
    
    try {
        console.log('初始化待办事项模块...');
        todo.initialize();
    } catch (error) {
        console.error('待办事项模块初始化失败:', error);
    }
    
    try {
        console.log('初始化日历模块...');
        calendar.initialize();
    } catch (error) {
        console.error('日历模块初始化失败:', error);
    }
    
    try {
        console.log('初始化特效模块...');
        effects.initialize();
    } catch (error) {
        console.error('特效模块初始化失败:', error);
    }
    
    try {
        // 初始化事件监听器
        console.log('初始化事件监听器...');
        initializeEventListeners();
    } catch (error) {
        console.error('事件监听器初始化失败:', error);
    }
    
    try {
        // 检查登录状态
        if (auth.checkLoginStatus()) {
            console.log('用户已登录，显示用户资料...');
            auth.showUserProfile();
        }
    } catch (error) {
        console.error('登录状态检查失败:', error);
    }
    
    try {
        habits.init();
    } catch (error) {
        console.error('习惯模块初始化失败:', error);
    }
    
    console.log('应用初始化完成');
});

// 导出所有模块供全局使用
window.app = {
    timer,
    audio,
    todo,
    calendar,
    auth,
    effects,
    handlers,
    chat
}; 
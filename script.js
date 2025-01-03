const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const workTimeInput = document.getElementById('workTime');
const breakTimeInput = document.getElementById('breakTime');
const applyCustomBtn = document.getElementById('applyCustom');
const rewardBtn = document.getElementById('rewardBtn');
const coinsDisplay = document.getElementById('coins');
const quoteDisplay = document.getElementById('quote');
const particlesContainer = document.getElementById('particles-container');
const bgm = document.getElementById('bgm');
const alarm = document.getElementById('alarm');
const muteBgmBtn = document.getElementById('muteBgmBtn');
const nextSongBtn = document.getElementById('nextSongBtn');
const currentTimeDisplay = document.getElementById('current-time');
const taskModal = document.getElementById('taskModal');
const songs = [
    'songs/m1.mp3',
    'songs/m2.mp3',
    'songs/m3.mp3'
];
const songNames = [
    '🎵 深渊的回声，深层思绪的对话',
    '🎼 漂浮在星云间,意识的涟漪在宇宙低语中荡漾',
    '🎹 雷雨中的避难所',
    
];
const studyDurationDisplay = document.getElementById('study-duration');
const currentSongDisplay = document.getElementById('current-song');
// localstorage存储
const STORAGE_KEY = {
    TIME_LEFT: 'timeLeft',
    IS_WORKING: 'isWorking',
    START_TIME: 'startTime',
    IS_ACTIVE: 'isActive',
    COINS: 'coins',
    IS_PAUSED: 'isPaused',
    TODO_ITEMS: 'todoItems',
    WORK_TIME: 'workTime',     // 新增工作时长存储
    BREAK_TIME: 'breakTime',    // 新增休息时长存储
    DAILY_STUDY_TIME: 'dailyStudyTime',
    LAST_STUDY_DATE: 'lastStudyDate'
};

let currentSongIndex = 0;

let workTime = 60; // 默认工作时间 60 分钟
let breakTime = 20; // 默认休息时间 20 分钟
let timeLeft = workTime * 60;
let timerInterval = null; // 明确表示计时器未运行
let isWorking = true;
let isPaused = false;
let coins = 0;
let gameTimeActive = false;

const motivationalQuotes = [
    "努力是一颗种子，终会开出梦想之花! 🌱🌸", // 用种子和开花象征努力的结果
    "每一步都算数，汗水是成功的垫脚石! 💧📈", // 强调坚持的价值
    "未来属于不放弃的人，现在拼才有明天! 🌟", // 激励持续努力
    "话少一点，做多一点，行动是最好的证明! 👣✨", // 简洁直白，强调行动
    "今天的坚持，明天的奇迹! 🌅✨", // 强调努力的延续性
    "别怕路远，努力是最好的捷径! 🛤️🚀", // 生动比喻
    "潜力无限，坚持挖掘，光芒必现! 💎✨", // 用坚持挖掘潜力
    "汗水不会骗人，坚持就有答案! 💪✅", // 直接鼓励坚持
    "正确的方向加上努力，成功就是必然! 🎯🚶‍♂️", // 方向和努力的结合
    "攀登的路上，每一步都在靠近星空! ⛰️🌌", // 激励坚持走下去
];


const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');

// 鼓励语句数组
const encouragements = [
    "太棒了！继续保持！",
    "又完成一个任务，你真厉害！",
    "一步一个脚印，你做得很好！",
    "坚持就是胜利，继续加油！",
    "完成一个任务，离目标更近一步！"
];

// 添加任务的函数
function addTodo() {
    const todoText = todoInput.value.trim();
    if (todoText === '') return;

    const li = document.createElement('li');
    li.className = 'todo-item';
    li.textContent = todoText;
    
    // 点击完成任务
    li.addEventListener('click', () => {
        li.classList.add('completed');
        const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
        setTimeout(() => {
            // 从存储中移除该任务
            removeTodoFromStorage(todoText);
            alert(randomEncouragement);
            li.remove();
        }, 300);
    });

    todoList.appendChild(li);
    todoInput.value = '';

    // 保存到本地存储
    saveTodoToStorage(todoText);
}

// 添加保存任务到存储的函数
function saveTodoToStorage(todoText) {
    const todos = getTodosFromStorage();
    todos.push(todoText);
    localStorage.setItem(STORAGE_KEY.TODO_ITEMS, JSON.stringify(todos));
}

// 添加从存储中移除任务的函数
function removeTodoFromStorage(todoText) {
    const todos = getTodosFromStorage();
    const index = todos.indexOf(todoText);
    if (index > -1) {
        todos.splice(index, 1);
        localStorage.setItem(STORAGE_KEY.TODO_ITEMS, JSON.stringify(todos));
    }
}

// 添加获取存储中所有任务的函数
function getTodosFromStorage() {
    const todos = localStorage.getItem(STORAGE_KEY.TODO_ITEMS);
    return todos ? JSON.parse(todos) : [];
}

// 添加加载任务的函数
function loadTodos() {
    const todos = getTodosFromStorage();
    todos.forEach(todoText => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.textContent = todoText;
        
        li.addEventListener('click', () => {
            li.classList.add('completed');
            const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
            setTimeout(() => {
                removeTodoFromStorage(todoText);
                alert(randomEncouragement);
                li.remove();
            }, 300);
        });

        todoList.appendChild(li);
    });
}

// 在页面加载时初始化待办事项
document.addEventListener('DOMContentLoaded', loadTodos);

// 定义更新时间显示的函数
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);//timeLeft是剩余的秒数
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = String(minutes).padStart(2, '0');//将分钟数转换为字符串，并确保长度为2，不足时用0填充
    secondsDisplay.textContent = String(seconds).padStart(2, '0');//将秒数转换为字符串，并确保长度为2，不足时用0填充
}

// 替换原来的 beforeunload 事件监听器，添加多个事件来处理页面关闭/隐藏
function saveTimerState() {
    if (timerInterval) {
        // 如果计时器正在运行，自动暂停
        clearInterval(timerInterval);
        timerInterval = null;
        isPaused = true;

        // 保存暂停状态和当前时间
        localStorage.setItem(STORAGE_KEY.IS_PAUSED, 'true');
        localStorage.setItem(STORAGE_KEY.TIME_LEFT, timeLeft);
        localStorage.setItem(STORAGE_KEY.IS_WORKING, isWorking);
        localStorage.setItem(STORAGE_KEY.IS_ACTIVE, 'true');
        localStorage.setItem(STORAGE_KEY.COINS, coins);
        
        // 清除开始时间，因为已暂停
        localStorage.removeItem(STORAGE_KEY.START_TIME);
    }
}

// 只在页面关闭时保存状态，移除 visibilitychange 事件
window.addEventListener('beforeunload', saveTimerState);
window.addEventListener('pagehide', saveTimerState);

function startTimer() {
    // 判断timerInterval是否为null，即未启动，如果是，则往下执行
    if (!timerInterval) {
        isPaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
        bgm.play();
        showParticles();
        showRandomQuote();
        // 显示音乐名称
        currentSongDisplay.textContent = `VIBE: ${songNames[currentSongIndex]}`;
        currentSongDisplay.classList.add('show');

        // 清除暂停状态
        localStorage.removeItem(STORAGE_KEY.IS_PAUSED);
        // 保存新的开始时间和状态
       
        // 保存计时器的开始时间戳，用于恢复时计算经过的时间
        localStorage.setItem(STORAGE_KEY.START_TIME, Date.now());
        // 保存当前剩余的时间（秒数），用于恢复计时器状态
        localStorage.setItem(STORAGE_KEY.TIME_LEFT, timeLeft);
        // 保存当前是工作时间还是休息时间的状态（true为工作时间，false为休息时间）
        localStorage.setItem(STORAGE_KEY.IS_WORKING, isWorking);
        // 保存计时器是否处于活动状态的标志
        localStorage.setItem(STORAGE_KEY.IS_ACTIVE, 'true');
        // 保存用户当前累积的番茄币数量
        localStorage.setItem(STORAGE_KEY.COINS, coins);



        
        timerInterval = setInterval(() => {
            timeLeft--;
            updateDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                bgm.pause();
                bgm.currentTime = 0;//将音频播放位置重置到开始处（0秒位置）
                alarm.play();//播放闹钟声音

                // 在工作时间结束时记录学习时长
                if (isWorking) {
                    // 更新总学习时长
                    const currentDailyStudyTime = parseInt(localStorage.getItem(STORAGE_KEY.DAILY_STUDY_TIME) || '0');
                    const newDailyStudyTime = currentDailyStudyTime + workTime; // 添加整个工作时长
                    
                    // 保存新的学习时长
                    localStorage.setItem(STORAGE_KEY.DAILY_STUDY_TIME, newDailyStudyTime.toString());
                    
                    // 更新显示
                    updateStudyDurationDisplay(newDailyStudyTime);

                    // 增加番茄数
                    coins++;
                    coinsDisplay.textContent = `番茄: ${coins}`;
                    
                    updateRewardButton();//更新奖励按钮的状态
                    alert("工作时间结束！开始休息吧！");
                    timeLeft = breakTime * 60;
                    isWorking = false;
                    startTimer(); // 自动开始休息时间

                } else {
                    alert("休息时间结束！准备开始新的工作！");
                    timeLeft = workTime * 60;
                    isWorking = true;//切换为工作状态
                    
                    updateDisplay();//在文件中定义的函数，用于更新番茄钟的时间显示。
                    startBtn.disabled = false;
                    pauseBtn.disabled = true;
                    stopBtn.disabled = true;
                }
            }
        }, 1000);
        // 每隔 1000 毫秒（即1秒）执行一次箭头内的函数
    }
}

function pauseTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        isPaused = true;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        bgm.pause();
        hideParticles();
        // 隐藏音乐名称
        currentSongDisplay.classList.remove('show');

        // 保存暂停状态和当前剩余时间
        localStorage.setItem(STORAGE_KEY.IS_PAUSED, 'true');
        localStorage.setItem(STORAGE_KEY.TIME_LEFT, timeLeft);
        // 清除开始时间，因为已暂停
        localStorage.removeItem(STORAGE_KEY.START_TIME);
    }
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isPaused = false;
    isWorking = true;
    timeLeft = workTime * 60;
    updateDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    bgm.pause();
    bgm.currentTime = 0;
    hideParticles();
    hideQuote();
    // 隐藏音乐名称
    currentSongDisplay.classList.remove('show');

    // 清除存储的状态
    localStorage.removeItem(STORAGE_KEY.START_TIME);
    localStorage.removeItem(STORAGE_KEY.TIME_LEFT);
    localStorage.removeItem(STORAGE_KEY.IS_WORKING);
    localStorage.removeItem(STORAGE_KEY.IS_ACTIVE);
}


// 添加初始化函数，在页面加载时检查并恢复状态
function initializeTimer() {
    // 恢复保存的工作和休息时长
    const savedWorkTime = localStorage.getItem(STORAGE_KEY.WORK_TIME);
    const savedBreakTime = localStorage.getItem(STORAGE_KEY.BREAK_TIME);
    
    if (savedWorkTime) {
        workTime = parseInt(savedWorkTime);
        workTimeInput.value = workTime;
    }
    
    if (savedBreakTime) {
        breakTime = parseInt(savedBreakTime);
        breakTimeInput.value = breakTime;
    }

    // 恢复硬币数
    const savedCoins = localStorage.getItem(STORAGE_KEY.COINS);
    // 如果存在保存的番茄币数量
if (savedCoins) {
    // 将字符串转换为数字并赋值给 coins 变量
    coins = parseInt(savedCoins);
    // 更新页面上显示的番茄币数量
    coinsDisplay.textContent = `番茄: ${coins}`;
}

    // 检查是否有正在进行的计时
    const isActive = localStorage.getItem(STORAGE_KEY.IS_ACTIVE);
    if (isActive === 'true') {
        const isPaused = localStorage.getItem(STORAGE_KEY.IS_PAUSED) === 'true';
        const savedTimeLeft = parseInt(localStorage.getItem(STORAGE_KEY.TIME_LEFT));
        const savedIsWorking = localStorage.getItem(STORAGE_KEY.IS_WORKING) === 'true';

        isWorking = savedIsWorking;

        

        if (isPaused) {
            // 如果是暂停状态，直接恢复保存的时间
            timeLeft = savedTimeLeft;
            updateDisplay();
            // 设置按钮状态
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = false;
        } else {
            // 如果是运行状态，计算经过的时间
            const savedStartTime = parseInt(localStorage.getItem(STORAGE_KEY.START_TIME));
            const elapsedSeconds = Math.floor((Date.now() - savedStartTime) / 1000);
            timeLeft = Math.max(0, savedTimeLeft - elapsedSeconds);

            if (timeLeft > 0) {
                startTimer();
            } else {
                stopTimer();
            }
        }
    }
  

    // 检查并初始化今日学习时长
    checkAndInitDailyStudyTime();
}

// 添加检查和初始化每日学习时长的函数
function checkAndInitDailyStudyTime() {
    const today = new Date().toDateString();
    const lastStudyDate = localStorage.getItem(STORAGE_KEY.LAST_STUDY_DATE);
    
    if (lastStudyDate !== today) {
        // 如果是新的一天，重置学习时长
        localStorage.setItem(STORAGE_KEY.DAILY_STUDY_TIME, '0');
        localStorage.setItem(STORAGE_KEY.LAST_STUDY_DATE, today);
    }
    
    // 显示保存的学习时长
    const dailyStudyTime = parseInt(localStorage.getItem(STORAGE_KEY.DAILY_STUDY_TIME) || '0');
    updateStudyDurationDisplay(dailyStudyTime);
}

// 添加更新学习时长显示的函数
function updateStudyDurationDisplay(minutes) {
    const displayMinutes = Math.max(0, minutes); // 确保显示的是非负数
    studyDurationDisplay.textContent = `${displayMinutes}分钟`;
}

function applyCustomTime() {
    const newWorkTime = parseInt(workTimeInput.value);
    const newBreakTime = parseInt(breakTimeInput.value);

    if (isNaN(newWorkTime) || newWorkTime < 25) {
        alert("请勿偷懒!工作时长不能少于25分钟！");
        return;
    }

    if (isNaN(newBreakTime) || newBreakTime <= 0) {
        alert("休息时长必须大于0分钟！");
        return;
    }

    workTime = newWorkTime;
    breakTime = newBreakTime;
    isWorking = true;
    timeLeft = workTime * 60;
    updateDisplay();
    stopTimer(); // 应用新设置后停止计时器

    // 保存新的时间设置到 localStorage
    localStorage.setItem(STORAGE_KEY.WORK_TIME, workTime);
    localStorage.setItem(STORAGE_KEY.BREAK_TIME, breakTime);
}

function updateRewardButton() {
    rewardBtn.disabled = coins < 2;
}

function claimReward() {
    if (coins >= 2) {
        coins -= 2;
        coinsDisplay.textContent = `番茄: ${coins}`;
        updateRewardButton();

        // 更新 localStorage 中的番茄数
        localStorage.setItem(STORAGE_KEY.COINS, coins);
        
        alert("恭喜你，成功解锁娱乐时间啦！");
        gameTimeActive = true;
        stopTimer(); // 停止番茄钟
        // 在新标签页中打开 bilibili
        window.open('https://www.bilibili.com', '_blank');
        // 这里可以添加一些视觉提示，表明用户进入了奖励时间
    } else {
        alert("你拥有的番茄不足，无法领取奖励。");
    }
}

// 显示粒子效果
function showParticles() {
    particlesContainer.innerHTML = ''; // 清空之前的粒子
    const numParticles = 150;

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = `hsl(${Math.random() * 360}, 70%, 50%)`;
        particle.style.opacity = Math.random();
        particle.style.position = 'absolute';
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animation = `float ${Math.random() * 2 + 1}s linear infinite,
                                   drift ${Math.random() * 3 + 2}s ease-in-out infinite alternate`;
        particlesContainer.appendChild(particle);
    }
}

// 隐藏粒子效果
function hideParticles() {
    particlesContainer.innerHTML = '';
}

// 显示随机鼓励语句 
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    quoteDisplay.textContent = motivationalQuotes[randomIndex];
    quoteDisplay.classList.add('show');
}
// 隐藏随机鼓励语句
function hideQuote() {
    quoteDisplay.classList.remove('show');
}

// 切换背景音乐静音状态
function toggleMuteBgm() {
    bgm.muted = !bgm.muted;
    // 可选：更新按钮的文本或图标来指示静音状态
    if (bgm.muted) {
        muteBgmBtn.textContent = "取消静音";
    } else {
        muteBgmBtn.textContent = "静音";
    }
}

// 播放下一首歌曲
function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    const wasPlaying = !bgm.paused;
    bgm.src = songs[currentSongIndex];
    
    // 只在计时器运行时更新并显示音乐名称
    if (timerInterval) {
        currentSongDisplay.textContent = `VIBE: ${songNames[currentSongIndex]}`;
        currentSongDisplay.classList.add('show');
    }
    
    if (wasPlaying) {
        bgm.play();
    }
}

// 事件监听器
muteBgmBtn.addEventListener('click', toggleMuteBgm);//当用户点击静音按钮时，调用toggleMuteBgm函数
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
stopBtn.addEventListener('click', stopTimer);
applyCustomBtn.addEventListener('click', applyCustomTime);
rewardBtn.addEventListener('click', claimReward);
nextSongBtn.addEventListener('click', playNextSong);
taskModal.addEventListener('click', toggleTaskModal);

// 初始化
updateDisplay();
updateRewardButton();
initializeTimer();

function updateCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    currentTimeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
}

// 初始化时间显示并每秒更新
updateCurrentTime();
setInterval(updateCurrentTime, 1000);

// 添加事件监听器
addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// 在初始化时设置初始音乐名称
document.addEventListener('DOMContentLoaded', () => {
    // 移除默认显示音乐名称的代码
    // 保留其他可能需要的初始化代码
});


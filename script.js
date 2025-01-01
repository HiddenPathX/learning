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
const songs = [
    'songs/m1.mp3',
    'songs/m2.mp3'
];
// localstorage存储
const STORAGE_KEY = {
    TIME_LEFT: 'timeLeft',
    IS_WORKING: 'isWorking',
    START_TIME: 'startTime',
    IS_ACTIVE: 'isActive',
    COINS: 'coins',
    IS_PAUSED: 'isPaused',
    TODO_ITEMS: 'todoItems'  // 新增待办事项存储
};

let currentSongIndex = 0;

let workTime = 60; // 默认工作时间 60 分钟
let breakTime = 20; // 默认休息时间 20 分钟
let timeLeft = workTime * 60;
let timerInterval;
let isWorking = true;
let isPaused = false;
let coins = 0;
let gameTimeActive = false;

const motivationalQuotes = [
    "成功不硬拼，巧思如有神! 😉", //  用更常见的“巧思”代替“开挂”
    "无效努力，纯属浪费电 ⚡，换个姿势！", // 比喻更生活化
    "未来不候场，即刻就登场! 🎬", //  用“登场”和电影元素更形象
    "少说漂亮话，实力露一手 💪，别藏着!", //  更直接地鼓励行动
    "今日能量积攒 🔋，明日目标轻松斩!", //  用“能量”和“斩”更积极
    "借口已屏蔽 🚫，遇难题就解它!", //  更简洁有力
    "潜力如宝藏 💎，挖掘必有光芒! ✨", //  用“宝藏”和“光芒”更经典
    "舒适区拜拜 👋，拼搏才精彩! 🌈", //  更积极阳光
    "坚持固可贵，方向对了才不累 🎯!", //  更强调方向的重要性
    "进步不停歇，向上攀登不设限 🚀!", //  用“攀登”和“不设限”更有气势
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

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = String(minutes).padStart(2, '0');
    secondsDisplay.textContent = String(seconds).padStart(2, '0');
}

// 在页面关闭时自动暂停并保存状态
window.addEventListener('beforeunload', () => {
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
});


function startTimer() {
    if (!timerInterval) {
        isPaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
        bgm.play();
        showParticles();
        showRandomQuote();

        // 清除暂停状态
        localStorage.removeItem(STORAGE_KEY.IS_PAUSED);
        // 保存新的开始时间和状态
        localStorage.setItem(STORAGE_KEY.START_TIME, Date.now());
        localStorage.setItem(STORAGE_KEY.TIME_LEFT, timeLeft);
        localStorage.setItem(STORAGE_KEY.IS_WORKING, isWorking);
        localStorage.setItem(STORAGE_KEY.IS_ACTIVE, 'true');
        localStorage.setItem(STORAGE_KEY.COINS, coins);

        timerInterval = setInterval(() => {
            timeLeft--;
            updateDisplay();
           


            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                bgm.pause();
                bgm.currentTime = 0;
                alarm.play();

                // 只在工作时间结束时增加番茄
                if (isWorking) {
                    coins++;
                    coinsDisplay.textContent = `番茄: ${coins}`;
                    updateRewardButton();
                    alert("工作时间结束！开始休息吧！");
                    timeLeft = breakTime * 60;
                    isWorking = false;
                    startTimer();
                } else {
                    alert("休息时间结束！准备开始新的工作！");
                    timeLeft = workTime * 60;
                    isWorking = true;
                    updateDisplay();
                    startBtn.disabled = false;
                    pauseBtn.disabled = true;
                    stopBtn.disabled = true;
                }
            }
        }, 1000);
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

    // 清除存储的状态
    localStorage.removeItem(STORAGE_KEY.START_TIME);
    localStorage.removeItem(STORAGE_KEY.TIME_LEFT);
    localStorage.removeItem(STORAGE_KEY.IS_WORKING);
    localStorage.removeItem(STORAGE_KEY.IS_ACTIVE);
}


// 添加初始化函数，在页面加载时检查并恢复状态
function initializeTimer() {
    // 恢复硬币数
    const savedCoins = localStorage.getItem(STORAGE_KEY.COINS);
    if (savedCoins) {
        coins = parseInt(savedCoins);
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

function showParticles() {
    particlesContainer.innerHTML = ''; // 清空之前的粒子
    const numParticles = 100;

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
        particle.style.animation = `float ${Math.random() * 3 + 2}s linear infinite,
                                   drift ${Math.random() * 5 + 3}s ease-in-out infinite alternate`;
        particlesContainer.appendChild(particle);
    }
}

function hideParticles() {
    particlesContainer.innerHTML = '';
}

function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    quoteDisplay.textContent = motivationalQuotes[randomIndex];
    quoteDisplay.classList.add('show');
}

function hideQuote() {
    quoteDisplay.classList.remove('show');
}


function toggleMuteBgm() {
    bgm.muted = !bgm.muted;
    // 可选：更新按钮的文本或图标来指示静音状态
    if (bgm.muted) {
        muteBgmBtn.textContent = "取消静音";
    } else {
        muteBgmBtn.textContent = "静音";
    }
}

function playNextSong() {
    console.log("当前歌曲索引:", currentSongIndex);
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    console.log("切换到索引:", currentSongIndex);
    console.log("切换到歌曲:", songs[currentSongIndex]);
    
    const wasPlaying = !bgm.paused;
    bgm.src = songs[currentSongIndex];
    
    if (wasPlaying) {
        bgm.play().catch(error => {
            console.log("播放失败:", error);
        });
    }
}

// 添加音频加载错误处理
bgm.addEventListener('error', function(e) {
    console.log("音频加载错误:", e);
});

// 事件监听器
muteBgmBtn.addEventListener('click', toggleMuteBgm);
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
stopBtn.addEventListener('click', stopTimer);
applyCustomBtn.addEventListener('click', applyCustomTime);
rewardBtn.addEventListener('click', claimReward);
nextSongBtn.addEventListener('click', playNextSong);

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
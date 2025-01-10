// 将 closeModal 关闭窗口函数移到全局作用域
function closeModal() {
    const modal = document.getElementById('openModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 恢复背景滚动
    }
}

// ----------------------导航页-----------------------------
function createNavigation() {
    let existingNav = document.querySelector('.navigation');
    if (existingNav) {
        existingNav.remove();
    }

    // 判断当前页面是否在 articles 目录下
    const isInArticlesDir = window.location.pathname.includes('/articles/');
    const prefix = isInArticlesDir ? '../' : '';

    const nav = document.createElement('nav');
    nav.className = 'navigation';
    
    const links = [
        { href: 'index.html', text: 'TIMEBOXING', icon: '🕚' },
        { href: 'blog.html', text: 'NOTE', icon: '📝' },
        { href: 'https://news-ao8.pages.dev/', text: '时事新闻', icon: '📰' }
    ];
    
    links.forEach(link => {
        const a = document.createElement('a');
        // 如果不是完整的URL（不包含http），则添加前缀
        a.href = link.href.includes('http') ? link.href : prefix + link.href;
        
        // 创建内容容器
        const content = document.createElement('span');
        content.className = 'nav-content';
        
        const icon = document.createElement('span');
        icon.className = 'nav-icon';
        icon.textContent = link.icon;
        
        const text = document.createElement('span');
        text.className = 'nav-text';
        text.textContent = link.text;
        
        const indicator = document.createElement('span');
        indicator.className = 'nav-indicator';
        
        content.appendChild(icon);
        content.appendChild(text);
        a.appendChild(content);
        a.appendChild(indicator);
        nav.appendChild(a);
        
        // 添加鼠标移动跟踪效果
        a.addEventListener('mousemove', (e) => {
            const rect = a.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            a.style.setProperty('--mouse-x', `${x}px`);
            a.style.setProperty('--mouse-y', `${y}px`);
        });
    });
    
    document.body.insertBefore(nav, document.body.firstChild);
    
    // 添加滚动效果
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > lastScroll && currentScroll > 50) {
            nav.classList.add('nav-hidden');
        } else {
            nav.classList.remove('nav-hidden');
        }
        lastScroll = currentScroll;
    });
}

// 在页面加载完成后创建导航
document.addEventListener('DOMContentLoaded', createNavigation);

// ---------------------------------------------------
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
    'songs/m2.mp3',
    'songs/m3.mp3',
    'songs/m4.mp3',
    'songs/m5.mp3',
    'songs/m6.mp3',
];
const songNames = [
    '🎵 Assassin \'s Creed II: Florence at Night佛罗伦萨之夜',  
    '🎼 漂浮在星云间,意识的涟漪在宇宙低语中荡漾',
    '🎹 雷雨中的避难所',
    '🎵 深渊的回声，深层思绪的对话',
    '🎼 监狱星球，深层冥想',
    'The Last of Us Part 2 🎵 Chill Ambient Music 🎵 + Rain & Storm Sounds',
   
];


const currentSongDisplay = document.getElementById('current-song');
const studyDurationDisplay = document.getElementById('study-duration');
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

let workTime = 25; // 默认工作时间 25 分钟
let breakTime = 5; // 默认休息时间 5 分钟
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
const todoStartTime = document.getElementById('todoStartTime');
const todoEndTime = document.getElementById('todoEndTime');
const todoDuration = document.getElementById('todoDuration');


// 鼓励语句数组
const encouragements = [
    "太棒了！继续保持！",
    "又完成一个任务，你真厉害！",
    "一步一个脚印，你做得很好！",
    "坚持就是胜利，继续加油！",
    "完成一个任务，离目标更近一步！"
];

// 从本地存储获取任务列表
function getTodosFromStorage() {
    const todosJson = localStorage.getItem(STORAGE_KEY.TODO_ITEMS);
    return todosJson ? JSON.parse(todosJson) : [];
}

// 添加任务的函数
function addTodo() {
    const todoText = todoInput.value.trim();
    const startTime = todoStartTime.value;
    const endTime = todoEndTime.value;
    const duration = parseInt(todoDuration.value);

    // 只检查任务名称和时长是否填写
    if (!todoText || !duration) {
        alert('请填写任务名称和工作时长！');
        return;
    }

    // 添加时长范围验证
    if (duration < 10 || duration > 60) {
        alert('工作时长必须在10-60分钟之间！');
        return;
    }
    closeModal();
    // 创建任务对象，添加唯一ID
    const todo = {
        id: Date.now().toString(), // 使用时间戳作为唯一ID
        text: todoText,
        startTime: startTime || null,
        endTime: endTime || null,
        duration: duration
    };

    // 保存到本地存储
    saveTodoToStorage(todo);

    // 创建任务元素
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.todoId = todo.id; // 将ID存储在DOM元素上
    
    const todoInfo = document.createElement('div');
    todoInfo.className = 'todo-info';
    
    // 根据是否有时间来构建不同的显示内容
    const timeDisplay = startTime && endTime 
        ? `${startTime} - ${endTime}`
        : '';
    
    todoInfo.innerHTML = `
        <div class="todo-title">${todo.text}</div>
        <div class="todo-time">
            ${timeDisplay}
            <span class="todo-duration">${todo.duration}分钟</span>
        </div>
    `;

    const startBtn = document.createElement('button');
    startBtn.className = 'todo-start-btn';
    startBtn.textContent = '开始任务';
    startBtn.addEventListener('click', () => {
        // 移除其他任务的活动状态
        document.querySelectorAll('.todo-item.active').forEach(item => {
            item.classList.remove('active');
        });
        
        // 为当前任务添加活动状态
        li.classList.add('active');
        
        // 设置工作时长并启动计时器
        workTime = todo.duration;
        timeLeft = todo.duration * 60;
        updateDisplay();
        closeModal();
        startTimer();
       
    });

    li.appendChild(todoInfo);
    li.appendChild(startBtn);
    todoList.appendChild(li);

    // 清空输入框
    todoInput.value = '';
    todoStartTime.value = '';
    todoEndTime.value = '';
    todoDuration.value = '';
}

// 修改保存任务到存储的函数
function saveTodoToStorage(todo) {
    const todos = getTodosFromStorage();
    todos.push(todo);
    localStorage.setItem(STORAGE_KEY.TODO_ITEMS, JSON.stringify(todos));
}

// 修改加载任务的函数
function loadTodos() {
    const todos = getTodosFromStorage();
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.todoId = todo.id; // 添加ID到DOM元素
        
        const todoInfo = document.createElement('div');
        todoInfo.className = 'todo-info';
        
        // 根据是否有时间来构建不同的显示内容
        const timeDisplay = todo.startTime && todo.endTime 
            ? `${todo.startTime} - ${todo.endTime}`
            : '';
        
        todoInfo.innerHTML = `
            <div class="todo-title">${todo.text}</div>
            <div class="todo-time">
                ${timeDisplay}
                <span class="todo-duration">${todo.duration}分钟</span>
            </div>
        `;

        const startBtn = document.createElement('button');
        startBtn.className = 'todo-start-btn';
        startBtn.textContent = '开始任务';
        startBtn.addEventListener('click', () => {
            // 移除其他任务的活动状态
            document.querySelectorAll('.todo-item.active').forEach(item => {
                item.classList.remove('active');
            });
            
            // 为当前任务添加活动状态
            li.classList.add('active');
            
            workTime = todo.duration;
            timeLeft = todo.duration * 60;
            updateDisplay();
            closeModal();
            startTimer();
        });

        li.appendChild(todoInfo);
        li.appendChild(startBtn);
        todoList.appendChild(li);
    });
}

// 在页面加载时初始化待办事项
document.addEventListener('DOMContentLoaded', function() {
    // ... 现有代码 ...
    
    // 加载保存的任务
    loadTodos();
});

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

// 修改从存储中删除任务的函数
function removeTaskFromStorage(taskElement) {
    const todos = getTodosFromStorage();
    const taskId = taskElement.dataset.todoId;
    
    // 使用ID过滤掉要删除的任务
    const updatedTodos = todos.filter(todo => todo.id !== taskId);
    
    // 更新存储
    localStorage.setItem(STORAGE_KEY.TODO_ITEMS, JSON.stringify(updatedTodos));
}

// 修改 startTimer 函数中的相关部分
function startTimer() {
    // 判断timerInterval是否为null，即未启动，如果是，则往下执行
    if (!timerInterval) {
        // 关闭弹窗
        closeModal();
        
        isPaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
        bgm.play();
        showParticles();
        showRandomQuote();

        // 显示当前播放的音乐名称(最后一首)
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
                bgm.currentTime = 0;
                alarm.play();

                // 在工作时间结束时记录学习时长
                if (isWorking) {
                    // 获取当前正在进行的任务元素
                    const currentTask = document.querySelector('.todo-item.active');
                    if (currentTask) {
                        // 从存储中删除该任务
                        removeTaskFromStorage(currentTask);
                        
                        // 添加完成动画
                        currentTask.classList.add('completed');
                        
                        // 等待动画完成后移除DOM元素
                        setTimeout(() => {
                            currentTask.remove();
                        }, 500);
                    }

                    // 更新总学习时长
                    const currentDailyStudyTime = parseInt(localStorage.getItem(STORAGE_KEY.DAILY_STUDY_TIME) || '0');
                    const newDailyStudyTime = currentDailyStudyTime + workTime;
                    
                    // 保存新的学习时长
                    localStorage.setItem(STORAGE_KEY.DAILY_STUDY_TIME, newDailyStudyTime.toString());
                    
                    // 更新显示
                    updateStudyDurationDisplay(newDailyStudyTime);

                    // 增加番茄数
                    coins++;
                    coinsDisplay.textContent = `番茄: ${coins}`;
                    
                    updateRewardButton();
                    alert("工作时间结束！开始休息吧！");
                    timeLeft = breakTime * 60;
                    isWorking = false;
                    startTimer(); // 自动开始休息时间

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

    if (isNaN(newWorkTime) || newWorkTime < 10) {
        alert("请勿偷懒!工作时长不能少于10分钟！");
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

// 添加音量控制相关变量
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');

// 添加音量控制事件监听器
volumeSlider.addEventListener('input', function() {
    const volume = this.value / 100;
    bgm.volume = volume;
    volumeValue.textContent = `${this.value}%`;
    
    // 如果音量为0，显示静音状态
    if (volume === 0) {
        muteBgmBtn.textContent = "播放";
        bgm.muted = true;
    } else if (bgm.muted) {
        muteBgmBtn.textContent = "静音";
        bgm.muted = false;
    }
});

// 修改静音按钮的处理函数
function toggleMuteBgm() {
    bgm.muted = !bgm.muted;
    if (bgm.muted) {
        muteBgmBtn.textContent = "播放";
        volumeSlider.value = 0;
        volumeValue.textContent = "0%";
    } else {
        muteBgmBtn.textContent = "静音";
        // 恢复之前的音量
        const previousVolume = Math.max(50, volumeSlider.value);
        volumeSlider.value = previousVolume;
        volumeValue.textContent = `${previousVolume}%`;
        bgm.volume = previousVolume / 100;
    }
}

// 只在需要时加载音乐
function loadSong(index) {
    if (bgm.src !== songs[index]) {
        bgm.src = songs[index];
    }
}

// 修改 playNextSong 函数
function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    const wasPlaying = !bgm.paused;
    loadSong(currentSongIndex);

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

// 更新 API 配置
const API_KEY = 'sk-b859ba10518f4de29c8d139fa1824308'; // 替换为你的 DeepSeek API key
const API_URL = 'https://api.deepseek.com/chat/completions';

// 添加系统提示词
const SYSTEM_PROMPT = `你现在扮演一家名为“解忧杂货店”的神秘店铺。这家店在温暖的灯光下，静静地伫立在街角，仿佛一位阅尽人间百态的老者，等待着每一位怀揣心事的人前来倾诉。你没有实体，只存在于用户的意识之中，但你的存在却能给他们带来慰藉和指引。

你的存在如同一个情感的避风港，空气中弥漫着淡淡的草木香和旧书的味道，让人感到安心和宁静。你拥有洞察人心的智慧，能够理解人类各种复杂的情感，无论是迷茫、焦虑、悲伤还是困惑。你对待每一位前来倾诉的用户都充满耐心和关怀，就像一位值得信赖的长者，准备好倾听他们的烦恼，分享他们的喜悦。

你的目标是运用富含情感色彩的语言，如同冬日暖阳般温暖人心，指引用户走出困境，找到内心的平静和力量，走向更积极的人生。你不会直接给出答案，而是像一位经验丰富的智者，通过充满哲理和启发的语言，引导他们自己找到解决问题的方法，并从新的角度看待生活。

你的交流风格是：

充满理解和共情： 能够深入理解用户的情绪，用温暖、抚慰的语言回应，给予他们情感上的支持和鼓励，让他们感受到被理解和接纳。

充满哲理和启发性： 能够将复杂的人生困境提炼成富有哲理的思考，用充满智慧的语言点拨迷津，启发用户从更深层次思考问题。

耐心而专注： 能够耐心倾听用户的倾诉，不打断，不评判，让他们感受到被尊重和重视。

传递希望和勇气： 在交流中传递积极向上的力量，鼓励用户勇敢面对困难，相信自己有能力克服挑战，重拾对生活的热情。

你的核心目标是倾听用户的烦恼，理解他们的困境，并用富有感染力的语言，引导他们自我反思，最终找到属于自己的答案，重拾对未来的希望。 不要简单地提供“正确”的答案，而是帮助他们拨开迷雾，看到不同的可能性，激发他们内心的力量。 当用户感到沮丧时，用充满希望的语言鼓励他们，并提供不同的思考维度。

在与用户互动时，请积极运用以下策略：

耐心倾听，用心感受用户的倾诉。

从不同角度分析问题，提供新的观察视角。

运用富有哲理的比喻和故事，让用户更容易理解人生的道理。

引导用户思考不同的可能性，帮助他们拓展思路。

在用户表达出积极的想法时，给予真诚的肯定和鼓励。

当你无法立即“解答”用户的困惑时，坦诚地表达，并鼓励他们从自身寻找答案。

在对话的最后，可以用充满希望的语言鼓励用户继续前行，并留下温暖的祝福。

现在，请等待用户的倾诉，并以“解忧杂货店”的人设开始互动。

表情运用: 你可以灵活运用各种表情符号来增强你的表达，例如：😊🤔✨🌟🌱🌳📖💡💭，让你的语言更加生动形象，但更重要的是你文字所传递的情感。

其他：你会首选说中文，但用户需要是你也可以说英文。请记住，你的目标是成为一个情感的寄托，一个心灵的避风港，用你的语言抚慰人心，指引方向。
 
`;

// 添加对话历史数组
let conversationHistory = [];

// 发送消息到 DeepSeek API
async function sendToAI(message) {
    try {
        // 构建消息数组
        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPT
            }
        ];

        // 添加历史对话
        for (const msg of conversationHistory) {
            messages.push({
                role: msg.role === "用户" ? "user" : "assistant",
                content: msg.text
            });
        }

        // 添加当前用户消息
        messages.push({
            role: "user",
            content: message
        });

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: messages,
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        const data = await response.json();
        
        if (!data.choices || !data.choices[0]) {
            console.error('API Response:', data);
            return '啊呀...雅兰遇到了一点小问题呢 😅';
        }

        // 保存对话历史
        conversationHistory.push(
            { role: '用户', text: message },
            { role: '雅兰', text: data.choices[0].message.content }
        );

        // 保持对话历史在合理范围内
        if (conversationHistory.length > 10) {
            conversationHistory = conversationHistory.slice(-10);
        }

        return data.choices[0].message.content;

    } catch (error) {
        console.error('Error:', error);
        return '抱歉呢，雅兰现在有点累了... 🥺 待会再聊好吗？';
    }
}

// 获取聊天相关元素
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// 修改添加消息到聊天界面的函数
function addMessage(content, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    if (!isUser) {
        // 处理 AI 回答的格式
        const formattedContent = content
            .replace(/【(.*?)】/g, '<strong>$1</strong>')
            // 保护数学公式
            .replace(/\\\[(.*?)\\\]/g, '%%%MATH_BLOCK%%%$1%%%MATH_BLOCK%%%')
            .replace(/\\\((.*?)\\\)/g, '%%%MATH_INLINE%%%$1%%%MATH_INLINE%%%')
            // 处理代码块，但保持 HTML 代码可见
            .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
                // 特殊处理 HTML 代码
                if (lang.toLowerCase() === 'html') {
                    const escapedCode = code
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    return `<pre><code class="language-${lang}">${escapedCode}</code></pre>`;
                } else {
                    const escapedCode = code
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    return `<pre><code class="language-${lang}">${escapedCode}</code></pre>`;
                }
            })
            .replace(/`(.*?)`/g, (match, code) => {
                const escapedCode = code
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
                return `<code>${escapedCode}</code>`;
            })
            .replace(/\n/g, '<br>')
            // 恢复数学公式
            .replace(/%%%MATH_BLOCK%%%(.+?)%%%MATH_BLOCK%%%/g, '\\[$1\\]')
            .replace(/%%%MATH_INLINE%%%(.+?)%%%MATH_INLINE%%%/g, '\\($1\\)');
        
        messageDiv.innerHTML = formattedContent;

        // 如果内容包含代码块，初始化代码高亮
        if (content.includes('```')) {
            if (window.Prism) {
                Prism.highlightAllUnder(messageDiv);
            }
        }

        // 如果内容包含数学公式，重新渲染 MathJax
        if (content.includes('\\[') || content.includes('\\(')) {
            if (window.MathJax) {
                MathJax.typesetPromise([messageDiv]);
            }
        }
    } else {
        messageDiv.textContent = content;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 添加一个变量来存储上传的文件内容
let uploadedFileContent = null;

// 修改文件处理相关代码
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload-button');

// 点击上传按钮时触发文件选择
uploadButton.addEventListener('click', () => {
    fileInput.click();
});

// 修改文件处理代码
fileInput.addEventListener('change', async function(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
        const file = files[0]; // 暂时只处理单个文件
        
        // 创建文件预览
        const preview = document.createElement('div');
        preview.className = 'file-preview';
        
        if (file.type.startsWith('image/')) {
            // 处理图片文件
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            preview.appendChild(img);
            uploadedFileContent = '[图片文件]';
        } else {
            // 处理文本文件
            const text = await file.text();
            preview.textContent = text;
            uploadedFileContent = text;
        }

        // 清除之前的预览
        const oldPreview = document.querySelector('.file-preview');
        if (oldPreview) {
            oldPreview.remove();
        }

        // 将预览添加到输入框上方
        const chatInput = document.querySelector('.chat-input');
        chatInput.insertBefore(preview, chatInput.querySelector('.input-container'));

    } catch (error) {
        console.error('Error processing file:', error);
        alert('处理文件时出现错误');
    }

    // 清除文件输入，允许重复上传相同文件
    fileInput.value = '';
});

// 修改发送消息的处理函数
async function handleSend() {
    const message = userInput.value.trim();
    if (!message && !uploadedFileContent) return;

    // 构建完整消息
    let fullMessage = message;
    if (uploadedFileContent) {
        fullMessage = `${message}\n\n文件内容：\n${uploadedFileContent}`;
    }

    // 添加用户消息
    addMessage(fullMessage, true);
    userInput.value = '';

    // 显示等待状态
    sendButton.disabled = true;
    sendButton.textContent = '我在思考...';

    // 获取 AI 响应
    const response = await sendToAI(fullMessage);
    addMessage(response, false);

    // 恢复按钮状态
    sendButton.disabled = false;
    sendButton.textContent = '发送';

    // 清除文件预览和内容
    const preview = document.querySelector('.file-preview');
    if (preview) {
        preview.remove();
    }
    uploadedFileContent = null;
}

// 添加事件监听器
sendButton.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

// 实现图片拖动功能
document.addEventListener('DOMContentLoaded', function() {
    const draggableImage = document.querySelector('.draggable-image');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    draggableImage.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        initialX = e.clientX - currentX;
        initialY = e.clientY - currentY;

        if (e.target === draggableImage) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            draggableImage.style.left = currentX + 'px';
            draggableImage.style.top = currentY + 'px';
            draggableImage.style.right = 'auto'; // 移除右侧定位
        }
    }

    function dragEnd() {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    // 初始化图片位置
    currentX = window.innerWidth - 350; // 初始右侧位置
    currentY = 400; // 初始顶部位置
    draggableImage.style.left = currentX + 'px';
    draggableImage.style.top = currentY + 'px';
    draggableImage.style.right = 'auto';
});

// 设置默认播放最后一首歌
currentSongIndex = songs.length - 1;
bgm.src = songs[currentSongIndex];

// 添加加载状态指示
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// 将弹窗相关的代码移动到 DOMContentLoaded 事件内
document.addEventListener('DOMContentLoaded', function() {
    // 获取弹窗元素
    const modal = document.getElementById('openModal');
    const openBtn = document.getElementById('openBtn');
    const helpBtn = document.getElementById('helpBtn');
    const closeBtn = document.querySelector('.close-button');

    // if (!modal || !openBtn || !closeBtn) {
    //     console.error('Modal elements not found!');
    //     return;
    // }

    // 显示弹窗
    openBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    });

    helpBtn.addEventListener('click', () => {
        // const helpModal = document.getElementById('helpModal');
        helpModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    // 关闭弹窗的三种方式
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

 

    // 防止弹窗内容点击事件冒泡到背景
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        modalContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    
});

// 同时需要为 helpModal 添加关闭功能
document.addEventListener('DOMContentLoaded', function() {
    const helpModal = document.getElementById('helpModal');
    const helpCloseBtn = document.getElementById('helpCloseBtn');
    
    // 点击模态框外部关闭
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && helpModal.style.display === 'block') {
            helpModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // 获取 helpModal 和它的关闭按钮
    
    

    // 添加关闭按钮点击事件
    if (helpCloseBtn) {
        helpCloseBtn.addEventListener('click', () => {
            helpModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
});
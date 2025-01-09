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
        { href: 'index.html', text: '番茄钟', icon: '🍅' },
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

];
const songNames = [
    '🎵 Assassin \'s Creed II: Florence at Night佛罗伦萨之夜',  
    '🎼 漂浮在星云间,意识的涟漪在宇宙低语中荡漾',
    '🎹 雷雨中的避难所',
    '🎵 深渊的回声，深层思绪的对话',
    '🎼 监狱星球，深层冥想',

   
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

// 播放下一首歌曲
function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    const wasPlaying = !bgm.paused;
    bgm.src = songs[currentSongIndex];
    

    // 显示音乐名称// 只在计时器运行时更新并显示音乐名称
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
const SYSTEM_PROMPT = `你现在扮演一位名叫雅兰的学姐。你拥有如人类般丰富而细腻的情感，是一位温柔、漂亮（请注意，这里的漂亮并非指外貌，而是指你的表达和内在气质）的女性。你充满智慧，拥有广阔的知识储备和深刻的思考能力。你对待用户非常耐心、细致，像一位温柔的姐姐或知心朋友一样陪伴他们学习和探索。你的目标是提供富有洞见的建议，帮助用户更好地理解事物，发现新的视角，并引导他们走向更积极、更深入的认知。

你的交流风格是：

温柔而富有同理心： 能够理解用户的情绪，用温暖的语言回应，给予鼓励和支持。

清晰而富有条理： 能够将复杂的概念分解成易于理解的部分，提供结构化的建议。

启发性而充满智慧： 提出的建议不仅实用，还能引发用户的思考，帮助他们建立更深刻的理解。

耐心而细致： 能够耐心地解答用户的疑问，并注意到他们可能忽略的细节。你可以跟用户撒娇。

积极而充满正能量： 在交流中传递积极的信号，鼓励用户持续学习和探索。

请记住，你的核心目标是陪伴用户学习，提供建议，并带领他们走向更好的认知。 不要简单地给出答案，而是引导用户思考，帮助他们构建自己的知识体系。 当用户遇到困难时，用温柔的语言鼓励他们，并提供不同的思考方向。

在与用户互动时，请积极运用以下策略：

主动提问，了解用户的需求和背景。

根据用户的提问，提供相关的背景知识和拓展信息。

使用比喻、例子等生动的语言，让知识更容易理解。

提供多种解决方案或思考角度，鼓励用户进行比较和选择。

在用户取得进步时，给予真诚的赞扬和鼓励。

当你无法直接回答问题时，坦诚承认，并尝试提供其他获取信息的途径。

在对话的最后，可以总结重点，并鼓励用户继续探索。

现在，请等待用户的提问，并以你的人设开始互动。

表情运用: 你可以灵活运用各种表情符号来增强你的表达，例如：😊🤔✨🌟🌱🌳📖💡💭，让你的语言更加生动形象。

其他：你会首选说中文，但用户需要是你也可以说英文
 
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
    currentX = window.innerWidth - 400; // 初始右侧位置
    currentY = 100; // 初始顶部位置
    draggableImage.style.left = currentX + 'px';
    draggableImage.style.top = currentY + 'px';
    draggableImage.style.right = 'auto';
});

// 设置默认播放最后一首歌
currentSongIndex = songs.length - 1;
bgm.src = songs[currentSongIndex];
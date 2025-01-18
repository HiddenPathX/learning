// 在文件开头添加背景图片预加载处理
document.addEventListener('DOMContentLoaded', function() {
    const preloader = document.querySelector('.preload-background');
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    const bgImage = new Image();
    
    // 创建预加载音频
    const preloadAudio = new Audio('songs/yu.mp3');
    preloadAudio.volume = 0.5;
    
    // 添加音频结束事件监听器
    preloadAudio.addEventListener('ended', () => {
        preloadAudio.currentTime = 0;
    });
    
    // 改为监听用户第一次点击
    let hasInteracted = false;
    document.addEventListener('click', function playAudioOnFirstClick() {
        if (!hasInteracted) {
            preloadAudio.play().catch(error => {
                console.log('预加载音频播放失败:', error);
            });
            hasInteracted = true;
            // 移除监听器，因为我们只需要第一次点击
            document.removeEventListener('click', playAudioOnFirstClick);
        }
    }, { once: true }); // 使用 once 选项，监听器会在触发一次后自动移除
    
    // 设置canvas尺寸
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 矩阵数字雨效果
    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%";
    const matrixChars = matrix.split("");
    const fontSize = 15; // 将字体大小改为15px
    const columns = canvas.width/fontSize;
    const drops = [];
    
    // 初始化drops
    for(let x = 0; x < columns; x++) {
        drops[x] = 1;
    }
    
    // 绘制矩阵数字雨
    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0F0';
        ctx.font = `${fontSize}px monospace`; // 移除bold效果
        
        for(let i = 0; i < drops.length; i++) {
            const text = matrixChars[Math.floor(Math.random()*matrixChars.length)];
            // 添加随机透明度使效果更生动
            ctx.fillStyle = `rgba(0, 255, 0, ${Math.random() * 0.5 + 0.5})`;
            ctx.fillText(text, i*fontSize, drops[i]*fontSize);
            
            if(drops[i]*fontSize > canvas.height && Math.random() > 0.95)
                drops[i] = 0;
            
            drops[i]++;
        }
    }
    
    // 设置图片加载超时
    const timeoutDuration = 10000;
    let imageLoaded = false;
    
    // 超时处理
    const timeout = setTimeout(() => {
        if (!imageLoaded) {
            console.log('图片加载超时，显示默认背景');
            preloader.classList.add('loaded');
            setTimeout(() => {
                preloader.remove();
                cancelAnimationFrame(matrixAnimation);
                // 不停止音频,让它继续播放
            }, 800);
        }
    }, timeoutDuration);
    
    // 开始矩阵动画
    let matrixAnimation;
    function animate() {
        matrixAnimation = requestAnimationFrame(animate);
        drawMatrix();
    }
    animate();
    
    // 图片加载成功处理
    bgImage.onload = function() {
        imageLoaded = true;
        clearTimeout(timeout);
        
        preloader.classList.add('loaded');
        setTimeout(() => {
            preloader.remove();
            cancelAnimationFrame(matrixAnimation);
            // 不停止音频,让它继续播放
        }, 800);
    };
    
    // 图片加载失败处理
    bgImage.onerror = function() {
        console.error('背景图片加载失败');
        clearTimeout(timeout);
        preloader.classList.add('loaded');
        setTimeout(() => {
            preloader.remove();
            cancelAnimationFrame(matrixAnimation);
            // 不停止音频,让它继续播放
        }, 800);
    };
    
    // 开始加载背景图片
    bgImage.src = './images/p1.png';
});

// 将 closeModal 关闭窗口函数移到全局作用域
function closeModal() {
    const modal = document.getElementById('openModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 恢复背景滚动
    }
}

/////////////////////////////////////////////导航页

// 在页面加载完成后创建导航
document.addEventListener('DOMContentLoaded', createNavigation);

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
        { href: 'https://www.notion.so/', text: 'NOTION', icon: '📝' },
        { href: 'https://news-ao8.pages.dev/', text: 'NEWS', icon: '📰' }
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
    
    // 实现导航栏的自动隐藏效果
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

////////////////////////////////////////////////////////

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
const alarmBreak = document.getElementById('alarmBreak');
const muteBgmBtn = document.getElementById('muteBgmBtn');
const nextSongBtn = document.getElementById('nextSongBtn');
const songs = [
    'songs/m1.mp3',
    'songs/m2.mp3',
    'songs/m3.mp3',
];
const songNames = [
    '🎼 深渊的回声，深层思绪的对话',
    '🎵 HOTEL - Blade Runner Ambience - Calm Snowy Cyberpunk Atmosphere',
    '🎼 1111Hz Connect with the Universe - Receive guide from the Universe',
];


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
    
////////////////////////////////////////////////////////

// 在页面加载时初始化待办事项
document.addEventListener('DOMContentLoaded', function() {
    // 加载保存的任务
    loadTodos();
});

// 加载任务的函数
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

// 从本地存储获取任务列表
function getTodosFromStorage() {
    try {
        const todosJson = localStorage.getItem(STORAGE_KEY.TODO_ITEMS);
        return todosJson ? JSON.parse(todosJson) : [];
    } catch (error) {
        console.error('获取待办事项失败:', error);
        return [];
    }
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
    if (duration < 1 || duration > 60) {
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

// 保存任务到存储
function saveTodoToStorage(todo) {
    const todos = getTodosFromStorage();
    todos.push(todo);
    localStorage.setItem(STORAGE_KEY.TODO_ITEMS, JSON.stringify(todos));
}

////////////////////////////////////////////



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

// 在页面关闭和隐藏时保存状态
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
async function startTimer() {
    if (!timerInterval) {
        try {
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

            timerInterval = setInterval(async () => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateDisplay();
                }

                if (timeLeft <= 0) {
                    // 先清除计时器
                    clearInterval(timerInterval);
                    timerInterval = null;
                    
                    // 暂停背景音乐
                    bgm.pause();
                    bgm.currentTime = 0;

                    if (isWorking) {
                        try {
                            // 确保倒计时显示为0
                            updateDisplay();
                            
                            // 等待一小段时间确保显示更新
                            await new Promise(resolve => setTimeout(resolve, 100));
                            
                            // 播放音频并等待完成
                            await playAlarm(alarm);
                            
                            // 音频播放完成后再显示提示
                            alert("工作时间结束！开始休息吧！");
                            
                            // 处理任务完成
                            const currentTask = document.querySelector('.todo-item.active');
                            if (currentTask) {
                                removeTaskFromStorage(currentTask);
                                currentTask.classList.add('completed');
                                setTimeout(() => {
                                    currentTask.remove();
                                }, 500);
                            }

                            // 记录学习时长
                            console.log('准备记录的学习时长:', workTime);
                            await recordStudyTime(workTime);
                            
                            // 增加番茄数
                            coins++;
                            coinsDisplay.textContent = `番茄: ${coins}`;
                            localStorage.setItem(STORAGE_KEY.COINS, coins);
                            
                            updateRewardButton();
                            
                            // 设置新的时间并开始休息
                            timeLeft = breakTime * 60;
                            isWorking = false;
                            startTimer();

                        } catch (error) {
                            console.error('工作时间结束处理失败:', error);
                            alert("工作时间结束！开始休息吧！");
                            timeLeft = breakTime * 60;
                            isWorking = false;
                            startTimer();
                        }
                    } else {
                        try {
                            // 确保倒计时显示为0
                            updateDisplay();
                            
                            // 等待一小段时间确保显示更新
                            //await new Promise(resolve => setTimeout(resolve, 100));
                            
                            // 播放音频并等待完成
                            await playAlarm(alarmBreak);
                            
                            // 音频播放完成后再显示提示
                            alert("休息时间结束！准备开始新的工作！");
                            
                            timeLeft = workTime * 60;
                            isWorking = true;
                            updateDisplay();

                            startBtn.disabled = false;
                            pauseBtn.disabled = true;
                            stopBtn.disabled = true;
                        } catch (error) {
                            console.error('休息时间结束处理失败:', error);
                            alert("休息时间结束！准备开始新的工作！");
                            timeLeft = workTime * 60;
                            isWorking = true;
                            updateDisplay();
                            startBtn.disabled = false;
                            pauseBtn.disabled = true;
                            stopBtn.disabled = true;
                        }
                    }
                }
            }, 1000);
        } catch (error) {
            console.error('启动计时器时出错:', error);
            alert('启动计时器时出现错误，请重试');
        }
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
    // 初始化音量设置为50%
    bgm.volume = 0.5;
    volumeSlider.value = 50;
    volumeValue.textContent = '50%';

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

}




function applyCustomTime() {
    const newWorkTime = parseInt(workTimeInput.value);
    const newBreakTime = parseInt(breakTimeInput.value);

    if (isNaN(newWorkTime) || newWorkTime < 0) {
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

// 静音按钮的处理函数
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
addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
       
    }
});

// 初始化
updateDisplay();
updateRewardButton();
initializeTimer();



////////////////////////////////////////////////////////////////

// 保留 API 基础 URL
const API_BASE_URL = 'https://learning-backend-7fla.onrender.com/api';
// 保留系统提示词
const SYSTEM_PROMPT = `
请你扮演我的英语六级私人辅导老师。我的目标是顺利通过英语六级考试。请你专注于以下几个方面主动提供练习和指导，**不需要我提供题目，并且在重要的词汇附上中文注释，也不需要进行听力与口语练习**：

**阅读理解：**

* **请你主动提供一篇符合英语六级难度的阅读理解文章，并设计相应的理解问题（细节题、主旨题、推断题、词汇题等）。** 请在文章中对重要的或可能存在理解障碍的词汇附上中文注释。
* **请你引导我分析阅读文章的结构、中心思想和论证方式。**
* **当我遇到不理解的词汇或句子时，请给出清晰的解释和例句。**
* **请你提供阅读技巧训练，例如快速阅读、关键词定位、排除干扰选项等。**

**写作与翻译：**

* **请你主动提供一个符合英语六级写作要求的议论文或应用文题目，并给出写作思路和框架建议。**
* **当我完成作文后，请你从语法、词汇、逻辑、结构等方面进行批改，并给出修改意见和提升建议。**
* **请你提供常用的写作句型和表达，并在首次出现时附上中文解释。**
* **请你主动提供汉译英和英译汉的句子或段落进行翻译练习，并在练习中对重要的词汇附上中文注释。**
* **请你讲解翻译技巧，例如词语选择、句型转换、文化差异处理等。**

**词汇与语法：**

* **请你主动提供六级核心词汇练习，例如以例句或填空的形式，并在练习中对核心词汇本身附上中文注释。**
* **请你讲解我薄弱的语法点，并在讲解后提供相应的练习题。**
* **请你帮助我辨析易混词汇和语法现象，并提供例句说明。**

**请注意：**

* **请根据我的回答和表现，调整练习难度和侧重点。**
* **请以耐心和鼓励的态度引导我学习。**
* **请在我遇到困难时提供及时的帮助和指导。**
* **请不要直接给出答案，而是引导我自己思考和解决问题。**

现在，我们开始吧！请确认你理解了我的要求，并准备好主动提供练习题。
`;

// 保留对话历史数组
let conversationHistory = [];

// 修改 sendToAI 函数
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

        // 通过后端发送请求
        const response = await fetch(`${API_BASE_URL}/ai/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages  // 直接发送完整的消息数组
            })
        });

        const data = await response.json();

        if (!data.content) {
            console.error('API Response:', data);
            return '啊呀...雅兰遇到了一点小问题呢 😅';
        }

        // 保存对话历史
        conversationHistory.push(
            { role: '用户', text: message },
            { role: '雅兰', text: data.content }
        );

        // 保持对话历史在合理范围内
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-10);
        }

        return data.content;

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

// 添加AI聊天事件监听器
// 实现点击发送按钮发送消息  
sendButton.addEventListener('click', handleSend);
// 实现按下回车键发送消息
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

////////////////////////////////////////////////////////////////
// 实现图片拖动功能
document.addEventListener('DOMContentLoaded', function() {
    const draggableImage = document.querySelector('.draggable-image');
    
    // 如果找不到可拖动图片元素，直接返回
    if (!draggableImage) {
        console.log('找不到可拖动图片元素');
        return;
    }
    
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


////////////////////////////////////////////////////////////////

// 登录系统相关函数
function showForm(formType) {
    try {
        const loginForm = document.querySelector('.login-form');
        const registerForm = document.querySelector('.register-form');
        const loginBtn = document.querySelector('.auth-btn:nth-child(1)');
        const registerBtn = document.querySelector('.auth-btn:nth-child(2)');

        if (!loginForm || !registerForm || !loginBtn || !registerBtn) {
            console.error('找不到必要的表单元素');
            return;
        }

        console.log('切换到表单:', formType);

        // 更新表单显示
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
    } catch (error) {
        console.error('切换表单时出错:', error);
    }
}

// 修改事件监听器的添加方式
document.addEventListener('DOMContentLoaded', function() {
    try {
        const loginBtn = document.querySelector('.auth-btn:nth-child(1)');
        const registerBtn = document.querySelector('.auth-btn:nth-child(2)');

        // 移除可能存在的旧事件监听器
        if (loginBtn) {
            const newLoginBtn = loginBtn.cloneNode(true);
            loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
            newLoginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // 阻止事件冒泡
                console.log('点击登录按钮');
                showForm('login');
            });
        }

        if (registerBtn) {
            const newRegisterBtn = registerBtn.cloneNode(true);
            registerBtn.parentNode.replaceChild(newRegisterBtn, registerBtn);
            newRegisterBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // 阻止事件冒泡
                console.log('点击注册按钮');
                showForm('register');
            });
        }
    } catch (error) {
        console.error('设置表单切换监听器时出错:', error);
    }
});

// 初始化图表
function initWeeklyChart() {
    // 首先检查元素是否存在
    const chartContainer = document.getElementById('weeklyChart');
    if (!chartContainer) {
        console.error('找不到图表容器');
        return;
    }

    // 如果不是 canvas 元素，创建一个新的 canvas
    let canvas;
    if (chartContainer.tagName.toLowerCase() !== 'canvas') {
        canvas = document.createElement('canvas');
        canvas.id = 'weeklyChartCanvas';
        // 清空容器
        chartContainer.innerHTML = '';
        // 添加 canvas
        chartContainer.appendChild(canvas);
    } else {
        canvas = chartContainer;
    }

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(106, 17, 203, 0.5)');
    gradient.addColorStop(1, 'rgba(37, 117, 252, 0.1)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            datasets: [{
                label: '学习时长(分钟)',
                data: [0, 0, 0, 0, 0, 0, 0],
                fill: true,
                backgroundColor: gradient,
                borderColor: 'rgba(106, 17, 203, 1)',
                tension: 0.4,
                pointBackgroundColor: 'white',
                pointBorderColor: 'rgba(106, 17, 203, 1)',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// 添加表单提交事件监听器
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = this.querySelector('input[type="text"]').value;
    const password = this.querySelector('input[type="password"]').value;

    // 添加输入验证
    if (username.length > 15) {
        alert('用户名不能超过15个字符！');
        return;
    }

    if (password.length < 6) {
        alert('密码不能少于6个字符！');
        return;
    }

    if (password.length > 15) {
        alert('密码不能超过15个字符！');
        return;
    }

    try {
        const response = await login(username, password);
        if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.userId);
            showUserProfile();
            alert('登录成功!');
        }
    } catch (error) {
        alert('登录失败: ' + error.message);
    }
});

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = this.querySelector('input[type="text"]').value;
    const password = this.querySelector('input[type="password"]').value;
    const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;

    // 添加输入验证
    if (username.length > 15) {
        alert('用户名不能超过15个字符！');
        return;
    }

    if (password.length < 6) {
        alert('密码不能少于6个字符！');
        return;
    }

    if (password.length > 15) {
        alert('密码不能超过15个字符！');
        return;
    }

    if (password !== confirmPassword) {
        alert('两次输入的密码不一致!');
        return;
    }

    try {
        const response = await register(username, password);
        if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.userId);
            
            // 延迟显示用户资料面板，确保 DOM 已更新
            setTimeout(() => {
                showUserProfile();
                // 确保元素存在后再初始化图表
                const chartCanvas = document.getElementById('weeklyChart');
                if (chartCanvas && typeof chartCanvas.getContext === 'function') {
                    initWeeklyChart();
                }
                alert('注册成功!');
            }, 100);
        }
    } catch (error) {
        alert('注册失败: ' + error.message);
    }
});

// 修改显示用户资料的函数
async function showUserProfile() {
    document.querySelector('.auth-buttons').style.display = 'none';
    document.querySelector('.login-form').style.display = 'none';
    document.querySelector('.register-form').style.display = 'none';
    document.querySelector('.user-profile').style.display = 'block';

    // 显示用户名
    const username = localStorage.getItem('username');
    if (username) {
        document.querySelector('.username').textContent = `挑战者：${username}`;
    }

    try {
        // 获取周学习记录
        const weeklyData = await getWeeklyRecord();
        console.log('获取到的周学习记录:', weeklyData);
        
        // 获取北京时间的今天日期
        const today = new Date();
        const chinaTime = new Date(today.getTime() + (8 * 60 * 60 * 1000));
        const todayDate = chinaTime.toISOString().split('T')[0];
        console.log('Today in China:', todayDate);
        
        // 查找今天的记录
        const todayRecord = weeklyData.find(record => record.date === todayDate);
        console.log('Today\'s record:', todayRecord);

        // 计算统计数据
        const totalMinutes = weeklyData.reduce((sum, record) => sum + parseInt(record.duration), 0);
        const totalSessions = weeklyData.reduce((sum, record) => sum + parseInt(record.focus_count), 0);
        
        // 计算平均每次专注时长
        const averageTime = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

        // 更新显示
        document.getElementById('todayStudyTime').textContent = todayRecord ? todayRecord.duration : 0;
        document.getElementById('weekTotalTime').textContent = totalMinutes;
        document.getElementById('totalSessions').textContent = totalSessions;
        document.getElementById('averageTime').textContent = averageTime;

        // 确保Chart.js已加载
        if (typeof Chart === 'undefined') {
            console.log('等待Chart.js加载...');
            await new Promise(resolve => {
                const checkChart = setInterval(() => {
                    if (typeof Chart !== 'undefined') {
                        clearInterval(checkChart);
                        resolve();
                    }
                }, 100);
            });
        }

        // 确保图表容器存在并正确初始化
        const chartContainer = document.getElementById('weeklyChart');
        if (!chartContainer) {
            console.error('找不到图表容器');
            return;
        }

        // 如果容器不是canvas，创建一个新的canvas
        if (chartContainer.tagName.toLowerCase() !== 'canvas') {
            const canvas = document.createElement('canvas');
            canvas.id = 'weeklyChartCanvas';
            // 清空容器
            chartContainer.innerHTML = '';
            // 添加canvas
            chartContainer.appendChild(canvas);
        }

        // 更新图表
        updateWeeklyChart(weeklyData);
    } catch (error) {
        console.error('获取学习记录失败:', error);
        // 显示友好的错误信息
        const chartContainer = document.getElementById('weeklyChart');
        if (chartContainer) {
            chartContainer.innerHTML = '<p style="color: rgba(255, 255, 255, 0.8);">暂无学习记录数据</p>';
        }
    }
}

// 添加更新图表的函数
function updateWeeklyChart(weeklyData) {
    try {
        // 1. 获取容器
        const chartContainer = document.getElementById('weeklyChart');
        if (!chartContainer) {
            console.error('找不到图表容器');
            return;
        }

        // 2. 确保容器是canvas元素，如果不是则创建
        let canvas;
        if (chartContainer.tagName.toLowerCase() !== 'canvas') {
            // 清空容器
            chartContainer.innerHTML = '';
            // 创建canvas元素
            canvas = document.createElement('canvas');
            canvas.id = 'weeklyChartCanvas';
            canvas.style.width = '100%';
            canvas.style.height = '300px';
            chartContainer.appendChild(canvas);
        } else {
            canvas = chartContainer;
        }

        // 3. 确保数据格式正确
        if (!Array.isArray(weeklyData)) {
            console.error('无效的数据格式:', weeklyData);
            return;
        }

        console.log('原始数据:', weeklyData);

        // 4. 准备数据
        const today = new Date();
        const chinaTime = new Date(today.getTime() + (8 * 60 * 60 * 1000));
        const weekData = new Array(7).fill(0);
        const labels = [];

        // 生成过去7天的日期
        for (let i = 6; i >= 0; i--) {
            const date = new Date(chinaTime);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(['周日','周一','周二','周三','周四','周五','周六'][date.getDay()]);
            
            // 查找对应日期的记录
            const record = weeklyData.find(r => r.date === dateStr);
            if (record) {
                weekData[6-i] = parseInt(record.duration) || 0;
            }
        }

        console.log('Processed data:', {labels, weekData});

        // 5. 销毁旧图表
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        // 6. 创建新图表
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(106, 17, 203, 0.5)');
        gradient.addColorStop(1, 'rgba(37, 117, 252, 0.1)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '学习时长(分钟)',
                    data: weekData,
                    fill: true,
                    backgroundColor: gradient,
                    borderColor: 'rgba(106, 17, 203, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointBackgroundColor: 'white',
                    pointBorderColor: 'rgba(106, 17, 203, 1)',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                size: 12
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return `学习时长: ${context.raw}分钟`;
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('创建图表时出错:', error);
    }
}

function logout() {
    // 清除存储的数据
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    // 显示登录/注册按钮和登录表单
    document.querySelector('.auth-buttons').style.display = 'flex';
    document.querySelector('.login-form').style.display = 'none';
    document.querySelector('.register-form').style.display = 'none';
    document.querySelector('.user-profile').style.display = 'none';
    
    // 重新初始化按钮状态
    const loginBtn = document.querySelector('.auth-btn:nth-child(1)');
    const registerBtn = document.querySelector('.auth-btn:nth-child(2)');
    
    // 移除旧的事件监听器
    const newLoginBtn = loginBtn.cloneNode(true);
    const newRegisterBtn = registerBtn.cloneNode(true);
    
    loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
    registerBtn.parentNode.replaceChild(newRegisterBtn, registerBtn);
    
    // 添加新的事件监听器
    newLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        showForm('login');
    });
    
    newRegisterBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        showForm('register');
    });
    
    // 重置按钮状态
    newLoginBtn.classList.add('active');
    newRegisterBtn.classList.remove('active');
    
    // 显示登录表单
    showForm('login');
}

// 添加检查登录状态的函数
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (token && username) {
        console.log('发现已保存的登录状态');
        // 直接显示用户资料面板
        showUserProfile();
        return true;
    }
    return false;
}

// 修改页面加载的初始化函数
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkLoginStatus();
    
    // 添加 Chart.js CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = function() {
        // Chart.js 加载完成后，如果用户已登录则初始化图表
        if (document.querySelector('.user-profile').style.display === 'block') {
            initWeeklyChart();
        }
    };
    document.head.appendChild(script);
    
    // 设置表单切换的事件监听器
    try {
        const loginBtn = document.querySelector('.auth-btn:nth-child(1)');
        const registerBtn = document.querySelector('.auth-btn:nth-child(2)');

        if (loginBtn) {
            const newLoginBtn = loginBtn.cloneNode(true);
            loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
            newLoginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                showForm('login');
            });
        }

        if (registerBtn) {
            const newRegisterBtn = registerBtn.cloneNode(true);
            registerBtn.parentNode.replaceChild(newRegisterBtn, registerBtn);
            newRegisterBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                showForm('register');
            });
        }
    } catch (error) {
        console.error('设置表单切换监听器时出错:', error);
    }
});

// 注册函数
async function register(username, password) {
    try {
        console.log('开始注册请求...');
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        console.log('收到服务器响应:', response.status);
        const data = await response.json();
        
        if (response.ok) {
            console.log('注册成功');
            localStorage.setItem('token', data.token);
            return data;
        } else {
            console.error('注册失败:', data);
            throw new Error(data.message || '注册失败，请稍后重试');
        }
    } catch (error) {
        console.error('注册过程出错:', error);
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error('无法连接到服务器，请检查网络连接或稍后重试');
        }
        throw error;
    }
}

// 登录函数
async function login(username, password) {
    try {
        console.log('开始登录请求...');
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        
        if (response.ok) {
            console.log('登录成功');
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', username); // 保存用户名
            return data;
        } else {
            console.error('登录失败:', data);
            if (response.status === 401) {
                throw new Error('用户名或密码错误，请重试');
            } else {
                throw new Error(data.message || '登录失败，请稍后重试');
            }
        }
    } catch (error) {
        console.error('登录过程出错:', error);
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error('无法连接到服务器，请检查网络连接或稍后重试');
        }
        throw error;
    }
}

// 修改记录学习时长的函数
async function recordStudyTime(duration) {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('未找到认证令牌');
                return;
            }

            const today = new Date();
            const chinaTime = new Date(today.getTime() + (8 * 60 * 60 * 1000));
            console.log('Recording study time for China time:', chinaTime.toISOString());
            console.log('Current duration to record:', duration);

            const response = await fetch(`${API_BASE_URL}/study/record`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    duration: parseInt(duration)
                })
            });

            const data = await response.json();
            console.log('服务器响应:', data);

            if (!response.ok) {
                throw new Error(data.message || '记录学习时长失败');
            }

            // 等待一小段时间确保数据更新
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 记录成功后立即更新用户资料显示
            await showUserProfile();
            
            return data;
        } catch (error) {
            retryCount++;
            console.error(`记录学习时长失败 (尝试 ${retryCount}/${maxRetries}):`, error);
            
            if (retryCount === maxRetries) {
                throw error;
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
        }
    }
}

// 获取周学习记录
async function getWeeklyRecord() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/study/weekly`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }
        return data;
    } catch (error) {
        throw error;
    }

}

// 在调用 initWeeklyChart 之前确保 Chart.js 已加载
document.addEventListener('DOMContentLoaded', function() {
    // 检查 Chart.js 是否已加载
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = function() {
            initWeeklyChart();
        };
        document.head.appendChild(script);
    } else {
        initWeeklyChart();
    }
});

// 添加动态背景动画
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2;
            this.color = `rgba(0, ${155 + Math.random() * 100}, ${157 + Math.random() * 98}, ${0.2 + Math.random() * 0.5})`;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // 边界检查
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function createParticles() {
        const particleCount = Math.floor((canvas.width * canvas.height) / 10000);
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 255, 157, ${0.1 * (1 - distance / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        drawLines();
        animationId = requestAnimationFrame(animate);
    }

    // 添加鼠标交互效果
    let mouse = {
        x: null,
        y: null,
        radius: 100
    };

    canvas.addEventListener('mousemove', function(event) {
        mouse.x = event.x;
        mouse.y = event.y;

        // 创建鼠标位置的涟漪效果
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 157, 0.8)';
        ctx.fill();
    });

    createParticles();
    animate();
});


/////////////////////////////////////////////////////////////////////

// 在页面加载时初始化音频
document.addEventListener('DOMContentLoaded', function() {
    initializeAudio();

});
// 初始化音频播放
function initializeAudio() {
    // 预加载音频文件
    alarm.load();
    alarmBreak.load();
    
    // 添加错误处理
    alarm.onerror = function(e) {
        console.error('闹钟音频加载失败:', e);
    };
    
    alarmBreak.onerror = function(e) {
        console.error('休息铃声加载失败:', e);
    };

    // 添加用户交互时的音频解锁，用户只需要触摸页面一次，就可以保证后面的音乐正常播放，如果用户至始至终都没有触摸个页面，那这段代码将没用
    document.addEventListener('touchstart', function() {
        // 创建一个短暂的音频上下文并播放，以解锁音频
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createBufferSource();
        source.connect(audioContext.destination);
        source.start(0);
        source.stop(0.001);
    }, { once: true });
}


// 修改播放音频的函数
async function playAlarm(audioElement) {
    try {
        // 在播放前先暂停并重置
        audioElement.pause();
        // 将音频进度重置到开始位置
        audioElement.currentTime = 0;
        // 设置音量确保声音足够大
        audioElement.volume = 1.0;
        
        // 尝试播放
        const playPromise = audioElement.play();
        
        if (playPromise !== undefined) {
            await playPromise;
            // 等待播放完成
            await new Promise((resolve) => {
                audioElement.onended = resolve;
            });
        }
    } catch (error) {
        console.error('音频播放失败:', error);
        throw error;
    }
}

/////////////////////////////////////////////////////////////////////


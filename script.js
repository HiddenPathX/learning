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

let workTime = 60; // 默认工作时间 60 分钟
let breakTime = 20; // 默认休息时间 20 分钟
let timeLeft = workTime * 60;
let timerInterval;
let isWorking = true;
let isPaused = false;
let coins = 0;
let gameTimeActive = false;

const motivationalQuotes = [
    "成功的秘诀在于坚持不懈。",
    "每一次努力都不会白费。",
    "专注当下，成就未来。",
    "相信自己，你能做到。",
    "今天多一份努力，明天多一份成功。",
    "不要为失败找借口，要为成功找方法。",
    "你的潜力远比你想象的更大。",
    "行动是成功的阶梯。",
    "坚持下去，直到成功。",
    "每一次进步，都是新的开始。"
];

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = String(minutes).padStart(2, '0');
    secondsDisplay.textContent = String(seconds).padStart(2, '0');
}

function startTimer() {
    if (!timerInterval) {
        isPaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
        bgm.play();
        showParticles();
        showRandomQuote();

        timerInterval = setInterval(() => {
            timeLeft--;
            updateDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                bgm.pause();
                bgm.currentTime = 0;
                alarm.play();
                coins++;
                coinsDisplay.textContent = `金币: ${coins}`;
                updateRewardButton();

                if (isWorking) {
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
}

function applyCustomTime() {
    const newWorkTime = parseInt(workTimeInput.value);
    const newBreakTime = parseInt(breakTimeInput.value);

    if (isNaN(newWorkTime) || newWorkTime <= 0 || isNaN(newBreakTime) || newBreakTime <= 0) {
        alert("请输入有效的时长！");
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
        coinsDisplay.textContent = `金币: ${coins}`;
        updateRewardButton();
        alert("恭喜你，已被允许玩 1 小时游戏啦！");
        gameTimeActive = true;
        stopTimer(); // 停止番茄钟
        // 这里可以添加一些视觉提示，表明用户进入了奖励时间
    } else {
        alert("金币不足，无法领取奖励。");
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

// 事件监听器
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
stopBtn.addEventListener('click', stopTimer);
applyCustomBtn.addEventListener('click', applyCustomTime);
rewardBtn.addEventListener('click', claimReward);

// 初始化
updateDisplay();
updateRewardButton();
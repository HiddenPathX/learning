// 认证相关功能
export const auth = {
    API_BASE_URL: 'https://learning-backend-7fla.onrender.com/api',

    checkLoginStatus() {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        return !!(token && username);
    },

    async showUserProfile() {
        try {
            // 获取周学习记录
            const weeklyData = await this.getWeeklyRecord();
            console.log('获取到的周学习记录:', weeklyData);
            
            // 获取北京时间的今天日期
            const today = new Date();
            const chinaTime = new Date(today.getTime() + (8 * 60 * 60 * 1000));
            const todayDate = chinaTime.toISOString().split('T')[0];
            
            // 计算本周一的日期
            let currentDay = chinaTime.getDay();
            if (currentDay === 0) currentDay = 7;  // 如果是周日，将0转换为7
            const monday = new Date(chinaTime);
            monday.setDate(chinaTime.getDate() - (currentDay - 1));
            
            // 生成本周的日期数组并计算总时长
            let totalMinutes = 0;
            let totalSessions = 0;
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(monday);
                date.setDate(monday.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                
                // 查找对应日期的记录
                const record = weeklyData.find(r => r.date === dateStr);
                if (record) {
                    totalMinutes += parseInt(record.duration) || 0;
                    totalSessions += parseInt(record.focus_count) || 0;
                }
            }
            
            // 查找今天的记录
            const todayRecord = weeklyData.find(record => record.date === todayDate);
            
            // 计算平均每次专注时长
            const averageTime = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

            // 更新显示
            document.getElementById('todayStudyTime').textContent = todayRecord ? todayRecord.duration : 0;
            document.getElementById('weekTotalTime').textContent = totalMinutes;
            document.getElementById('totalSessions').textContent = totalSessions;
            document.getElementById('averageTime').textContent = averageTime;

            // 更新图表
            this.updateWeeklyChart(weeklyData);

            // 更新界面显示
            document.querySelector('.auth-buttons').style.display = 'none';
            document.querySelector('.login-form').style.display = 'none';
            document.querySelector('.register-form').style.display = 'none';
            document.querySelector('.user-profile').style.display = 'block';

            // 显示用户名
            const username = localStorage.getItem('username');
            if (username) {
                document.querySelector('.username').textContent = `${username} 的学习数据`;
            }
        } catch (error) {
            console.error('显示用户资料失败:', error);
            alert('获取学习数据失败，请重试');
        }
    },

    async login(username, password) {
        try {
            console.log('开始登录请求...');
            const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
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
                localStorage.setItem('username', username);
                localStorage.setItem('userId', data.userId);
                await this.showUserProfile();
                return data;
            } else {
                console.error('登录失败:', data);
                throw new Error(data.message || '登录失败，请稍后重试');
            }
        } catch (error) {
            console.error('登录过程出错:', error);
            throw error;
        }
    },

    async register(username, password) {
        try {
            console.log('开始注册请求...');
            const response = await fetch(`${this.API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                console.log('注册成功');
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', username);
                localStorage.setItem('userId', data.userId);
                await this.showUserProfile();
                return data;
            } else {
                console.error('注册失败:', data);
                throw new Error(data.message || '注册失败，请稍后重试');
            }
        } catch (error) {
            console.error('注册过程出错:', error);
            throw error;
        }
    },

    async getWeeklyRecord() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('请先登录');
            }

            const response = await fetch(`${this.API_BASE_URL}/study/weekly`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('认证失败，请重新登录');
                }
                const data = await response.json();
                throw new Error(data.message || '获取数据失败');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取周学习记录失败:', error);
            throw error;
        }
    },

    updateWeeklyChart(weeklyData) {
        try {
            const chartCanvas = document.getElementById('weeklyChart');
            if (!chartCanvas) {
                console.error('找不到图表画布');
                return;
            }

            // 设置画布大小
            chartCanvas.style.width = '100%';
            chartCanvas.style.height = '300px';

            // 获取上下文
            const ctx = chartCanvas.getContext('2d');
            if (!ctx) {
                console.error('无法获取画布上下文');
                return;
            }

            // 销毁旧图表
            const existingChart = Chart.getChart(chartCanvas);
            if (existingChart) {
                existingChart.destroy();
            }

            // 准备数据
            const today = new Date();
            const chinaTime = new Date(today.getTime() + (8 * 60 * 60 * 1000));
            const weekData = new Array(7).fill(0);
            const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            const dates = [];

            // 获取本周一的日期
            let currentDay = chinaTime.getDay();
            if (currentDay === 0) currentDay = 7;  // 如果是周日，将0转换为7
            const monday = new Date(chinaTime);
            monday.setDate(chinaTime.getDate() - (currentDay - 1));

            // 生成本周的日期数组
            for (let i = 0; i < 7; i++) {
                const date = new Date(monday);
                date.setDate(monday.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                dates.push(dateStr);
                
                // 查找对应日期的记录
                const record = weeklyData.find(r => r.date === dateStr);
                if (record) {
                    weekData[i] = parseInt(record.duration) || 0;
                }
            }

            console.log('处理后的数据:', {
                dates,      // 输出日期数组用于调试
                labels,     // 输出标签数组
                weekData,   // 输出数据数组
                weeklyData  // 输出原始数据
            });

            // 创建渐变
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(106, 17, 203, 0.5)');
            gradient.addColorStop(1, 'rgba(37, 117, 252, 0.1)');

            // 创建新图表
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
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: 'white',
                        pointHoverBorderColor: 'rgba(106, 17, 203, 1)',
                        pointHoverBorderWidth: 2,
                        hoverBorderWidth: 2,
                        hoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 1000
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: false
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
                            enabled: true,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'rgba(255, 255, 255, 0.9)',
                            bodyColor: 'rgba(255, 255, 255, 0.9)',
                            titleFont: {
                                size: 14,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 13
                            },
                            padding: 10,
                            displayColors: false,
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                title: function(context) {
                                    const index = context[0].dataIndex;
                                    return `${labels[index]} (${dates[index]})`;
                                },
                                label: function(context) {
                                    const value = context.raw || 0;
                                    return `学习时长: ${value} 分钟`;
                                }
                            }
                        }
                    },
                    onHover: (event, elements) => {
                        const canvas = event.native.target;
                        canvas.style.cursor = elements.length ? 'pointer' : 'default';
                    },
                    onClick: (event, elements) => {
                        if (elements && elements.length > 0) {
                            const index = elements[0].index;
                            const value = weekData[index];
                            alert(`${labels[index]} (${dates[index]})\n学习时长: ${value} 分钟`);
                        }
                    }
                }
            });

        } catch (error) {
            console.error('创建图表时出错:', error);
        }
    },

    logout() {
        // 清除本地存储的认证信息
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');

        // 重置界面显示
        document.querySelector('.auth-buttons').style.display = 'block';
        document.querySelector('.login-form').style.display = 'block';
        document.querySelector('.register-form').style.display = 'none';
        document.querySelector('.user-profile').style.display = 'none';

        // 重置表单
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();

        // 激活登录按钮
        const authButtons = document.querySelectorAll('.auth-btn');
        authButtons.forEach(btn => btn.classList.remove('active'));
        authButtons[0].classList.add('active');
    }
};

// 添加重试函数
async function fetchWithRetry(url, options, maxRetries = 3, delay = 2000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
            // 如果是401错误（未授权），直接返回不重试
            if (response.status === 401) {
                return response;
            }
        } catch (error) {
            console.log(`尝试 ${i + 1}/${maxRetries} 失败，${delay/1000}秒后重试...`);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// 修改获取用户数据的函数
async function fetchUserData() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/user/data`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateUIWithUserData(data);
        } else if (response.status === 401) {
            // 处理未授权情况
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            showLoginForm();
        }
    } catch (error) {
        console.error('获取用户数据失败:', error);
        showError('获取学习数据失败，正在重试...');
    }
}

// 修改登录函数
async function login(username, password) {
    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', username);
            localStorage.setItem('userId', data.userId);
            
            showSuccess('登录成功！');
            hideLoginForm();
            showUserProfile();
            await fetchUserData();
        } else {
            showError(data.message || '登录失败，请重试');
        }
    } catch (error) {
        console.error('登录错误:', error);
        showError('登录失败，请检查网络连接');
    }
}

// 添加错误提示函数
function showError(message) {
    // 如果已经存在错误提示，则更新文本
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        document.querySelector('.container').insertBefore(
            errorDiv,
            document.querySelector('.auth-buttons')
        );
    }
    errorDiv.textContent = message;
    
    // 如果消息不包含"重试"，3秒后自动消失
    if (!message.includes('重试')) {
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
}

// ... rest of the existing code ... 
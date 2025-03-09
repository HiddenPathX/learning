// 学习记录功能 - 本地存储版本
export const auth = {
    // 初始化用户数据
    initialize() {
        // 如果本地没有学习记录，创建初始数据
        if (!localStorage.getItem('studyRecords')) {
            this.initializeStudyRecords();
        }
        
        // 显示用户资料面板
        this.showUserProfile();
    },
    
    // 初始化学习记录
    initializeStudyRecords() {
        // 创建过去7天的空记录
        const records = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            records.push({
                date: dateStr,
                duration: 0,
                focus_count: 0
            });
        }
        
        localStorage.setItem('studyRecords', JSON.stringify(records));
    },
    
    // 显示用户资料面板
    async showUserProfile() {
        try {
            // 获取周学习记录
            const weeklyData = this.getWeeklyRecord();
            
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

            // 确保用户资料面板显示
            const userProfile = document.querySelector('.user-profile');
            if (userProfile) {
                userProfile.style.display = 'block';
            }
        } catch (error) {
            console.error('显示用户资料失败:', error);
        }
    },

    // 获取周学习记录
    getWeeklyRecord() {
        // 从本地存储获取学习记录
        const records = JSON.parse(localStorage.getItem('studyRecords') || '[]');
        return records;
    },

    // 更新学习记录
    updateStudyRecord(duration) {
        try {
            // 获取今天的日期
            const today = new Date();
            const chinaTime = new Date(today.getTime() + (8 * 60 * 60 * 1000));
            const todayDate = chinaTime.toISOString().split('T')[0];
            
            // 获取现有记录
            const records = JSON.parse(localStorage.getItem('studyRecords') || '[]');
            
            // 查找今天的记录
            let todayRecord = records.find(record => record.date === todayDate);
            
            if (todayRecord) {
                // 更新今天的记录
                todayRecord.duration = parseInt(todayRecord.duration) + duration;
                todayRecord.focus_count = parseInt(todayRecord.focus_count) + 1;
            } else {
                // 创建今天的记录
                todayRecord = {
                    date: todayDate,
                    duration: duration,
                    focus_count: 1
                };
                records.push(todayRecord);
                
                // 保持只有7天的记录
                if (records.length > 7) {
                    records.shift();
                }
            }
            
            // 保存更新后的记录
            localStorage.setItem('studyRecords', JSON.stringify(records));
            
            // 更新显示
            this.showUserProfile();
        } catch (error) {
            console.error('更新学习记录失败:', error);
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
    }
}; 
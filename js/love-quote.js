// 获取每日一句
function fetchLoveQuote() {
    fetch('https://api.suyanw.cn/api/love.php')
        .then(response => response.text())
        .then(data => {
            document.getElementById('love-quote').innerHTML = data;
        })
        .catch(error => {
            console.error('获取每日一句失败:', error);
            document.getElementById('love-quote').innerHTML = '今天也要加油哦！';
        });
}

// 页面加载时获取一次
fetchLoveQuote();

// 每隔一分钟更新一次
setInterval(fetchLoveQuote, 10000); 
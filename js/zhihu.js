// 知乎热搜API地址
const ZHIHU_API = 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=20&desktop=true';

// 多个公共CORS代理服务
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://proxy.cors.sh/',
    'https://cors-anywhere.herokuapp.com/'
];

class ZhihuHot {
    constructor() {
        this.container = document.getElementById('zhihuList');
        this.updateTimeEl = document.getElementById('updateTime');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.lastUpdateTime = null;
        this.currentProxyIndex = 0;

        // 绑定事件
        this.refreshBtn.addEventListener('click', () => this.fetchData());
        
        // 初始化
        this.init();
    }

    async init() {
        await this.fetchData();
        // 每5分钟自动刷新一次
        setInterval(() => this.fetchData(), 5 * 60 * 1000);
    }

    async fetchWithRetry(url, options = {}, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const proxy = CORS_PROXIES[this.currentProxyIndex];
                const response = await fetch(proxy + encodeURIComponent(url), {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Origin': window.location.origin
                    }
                });
                
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.warn(`尝试使用代理 ${this.currentProxyIndex + 1} 失败:`, error);
                this.currentProxyIndex = (this.currentProxyIndex + 1) % CORS_PROXIES.length;
                if (i === retries - 1) throw error;
            }
        }
    }

    async fetchData() {
        try {
            this.setLoading(true);
            const data = await this.fetchWithRetry(ZHIHU_API);
            
            // 更新数据
            this.updateList(data.data);
            this.updateTime();
            
        } catch (error) {
            console.error('获取知乎热搜失败:', error);
            this.container.innerHTML = `
                <div class="loading">
                    获取数据失败，请稍后重试...<br>
                    <small style="color: rgba(255,255,255,0.6);">
                        如果持续失败，请访问
                        <a href="https://cors-anywhere.herokuapp.com/corsdemo" 
                           target="_blank" 
                           style="color: #3498db;">
                            这里
                        </a>
                        获取临时访问权限
                    </small>
                </div>`;
        } finally {
            this.setLoading(false);
        }
    }

    updateList(items) {
        // 清空现有内容
        this.container.innerHTML = '';
        
        // 创建新的列表
        items.forEach((item, index) => {
            const hotItem = document.createElement('a');
            hotItem.href = `https://www.zhihu.com/question/${item.target.id}`;
            hotItem.target = '_blank';
            hotItem.className = 'hot-item';
            
            const indexClass = index < 3 ? 'hot-index top-3' : 'hot-index';
            
            hotItem.innerHTML = `
                <span class="${indexClass}">${index + 1}</span>
                <span class="hot-title">${item.target.title}</span>
            `;
            
            this.container.appendChild(hotItem);
        });
    }

    updateTime() {
        this.lastUpdateTime = new Date();
        this.updateTimeEl.textContent = `更新时间: ${this.formatTime(this.lastUpdateTime)}`;
    }

    formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.refreshBtn.classList.add('loading');
            this.refreshBtn.disabled = true;
        } else {
            this.refreshBtn.classList.remove('loading');
            this.refreshBtn.disabled = false;
        }
    }
}

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ZhihuHot();
});
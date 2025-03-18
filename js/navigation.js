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
        { href: 'index.html', text: 'TIMEBOXING', icon: '🕚', newTab: false },
        { href: '6.html', text: '六小时挑战', icon: '⏱️', newTab: false },
        { href: 'https://www.notion.so/', text: 'NOTION', icon: '📝', newTab: true },
        { href: 'https://news-ao8.pages.dev/', text: 'NEWS', icon: '📰', newTab: true }
    ];
    
    links.forEach(link => {
        const a = document.createElement('a');
        // 如果不是完整的URL（不包含http），则添加前缀
        a.href = link.href.includes('http') ? link.href : prefix + link.href;
        
        // 只为需要新标签页打开的链接添加属性
        if (link.newTab) {
            a.target = "_blank";
            a.rel = "noopener noreferrer";
        }
        
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
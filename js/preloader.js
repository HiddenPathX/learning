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
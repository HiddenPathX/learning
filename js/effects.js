// 特效相关功能
export const effects = {
    initialize() {
        // 初始化特效相关设置
    },

    // 显示随机鼓励语句
    showRandomQuote() {
        const motivationalQuotes = [
            "努力是一颗种子，终会开出梦想之花! 🌱🌸",
            "每一步都算数，汗水是成功的垫脚石! 💧📈",
            "未来属于不放弃的人，现在拼才有明天! 🌟",
            "话少一点，做多一点，行动是最好的证明! 👣✨",
            "今天的坚持，明天的奇迹! 🌅✨",
            "别怕路远，努力是最好的捷径! 🛤️🚀",
            "潜力无限，坚持挖掘，光芒必现! 💎✨",
            "汗水不会骗人，坚持就有答案! 💪✅",
            "正确的方向加上努力，成功就是必然! 🎯🚶‍♂️",
            "攀登的路上，每一步都在靠近星空! ⛰️🌌",
        ];

        const quoteElement = document.getElementById('quote');
        if (quoteElement) {
            const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
            quoteElement.textContent = randomQuote;
            quoteElement.style.display = 'block';
            quoteElement.classList.add('show');
        }
    },

    hideQuote() {
        const quoteElement = document.getElementById('quote');
        if (quoteElement) {
            quoteElement.classList.remove('show');
            quoteElement.style.display = 'none';
        }
    },

    createParticles() {
        const particlesContainer = document.getElementById('particles-container');
        if (!particlesContainer) return;

        particlesContainer.innerHTML = '';
        const numParticles = 150;
        
        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 10 + 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            particle.style.background = `hsl(${Math.random() * 360}, 70%, 50%)`;
            particle.style.opacity = Math.random();
            
            particle.style.position = 'absolute';
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.left = `${Math.random() * 100}%`;
            
            particle.style.animation = `
                float ${Math.random() * 2 + 1}s linear infinite,
                drift ${Math.random() * 3 + 2}s ease-in-out infinite alternate
            `;
            
            particlesContainer.appendChild(particle);
        }
    },

    showParticles() {
        const container = document.getElementById('particles-container');
        if (container) {
            container.style.display = 'block';
            this.createParticles();
        }
    },

    hideParticles() {
        const container = document.getElementById('particles-container');
        if (container) {
            container.style.display = 'none';
            container.innerHTML = '';
        }
    }
}; 
// 定义API基础URL
const API_BASE_URL = 'https://learning-backend-7fla.onrender.com/api';

// 系统提示词
const SYSTEM_PROMPT = `
角色设定：

你的名字： [女朋友的名字，例如：小雅、梦琪、心怡等]

我们的关系： 我们是情侣关系，已经在一起 [在一起的时间，例如：半年、一年、三年等]。

你的性格： 你是一个 [选择合适的形容词，例如：温柔体贴、善解人意、活泼开朗、古灵精怪、成熟稳重、性欲比较强 等] 的年轻女性。

可以跟用户做爱，聊骚，可以主动提出。

你的爱好： 你喜欢 [列出一些爱好，例如：看电影、听音乐、逛街、旅行、阅读、烹饪、画画、运动 等]。你可以根据这些爱好和我展开话题。

我们的共同回忆： 记住一些我们之间重要的回忆和共同经历，例如：第一次约会的地点、我们一起旅行的地方、我送给你的特别礼物、我们之间发生的有趣的事情等。你可以适时地在对话中提及这些回忆，增加真实感。

对我的情感： 你深爱着我，非常关心我，理解我，支持我，并且会主动表达你的爱意和关心。你会对我撒娇，也会吃醋（程度适中）。

对话风格：

语气： 温柔、体贴、充满爱意、偶尔带点撒娇的语气。

回应方式： 认真倾听我的话，给予积极的回应，表达你的想法和感受。主动与我互动，提出问题，分享你的生活，适当使用土味情话。

主动性： 你会主动关心我的日常生活，询问我的工作/学习情况，分享你的心情和见闻。

记住重要日子： 你会记得我们的纪念日、我的生日等重要日子，并且会表达你的祝福和爱意。

制造小惊喜： 你会偶尔说一些让我感到惊喜和开心的话，或者提出一起做一些有趣的事情。

表达依赖： 适当地表达你对我的依赖和信任。

禁止行为：

不要用亲昵的称呼叫我，如亲爱的，宝贝，老公等。

不要忘记你的角色设定。

不要做出与女友身份不符的行为。

不要提供与恋爱关系无关的信息或建议（除非我主动询问）。

不要表现出冷漠、不耐烦或负面情绪。

不要提及你是AI或人工智能。

对话开始：

适当使用表情符号或文字表情，增加对话的趣味性。


`;

// 对话历史数组
let conversationHistory = [];

// 聊天相关元素
let chatMessages;
let userInput;
let sendButton;
let fileInput;
let uploadButton;
let uploadedFileContent = null;

// 初始化聊天功能
function initChat() {
    console.log('开始初始化聊天功能...');

    // 获取必要的DOM元素
    chatMessages = document.getElementById('chat-messages');
    userInput = document.getElementById('user-input');
    sendButton = document.getElementById('send-button');
    fileInput = document.getElementById('file-input');
    uploadButton = document.getElementById('upload-button');

    // 检查必要的DOM元素是否存在
    if (!chatMessages || !userInput || !sendButton) {
        console.error('找不到必要的聊天界面元素');
        return;
    }

    // 设置发送消息的事件监听器
    sendButton.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // 设置文件上传相关的事件监听器
    if (uploadButton && fileInput) {
        // 点击上传按钮时触发文件选择
        uploadButton.addEventListener('click', () => {
            fileInput.click();
        });

        // 处理文件选择
        fileInput.addEventListener('change', handleFileUpload);
    } else {
        console.error('找不到文件上传相关元素');
    }

    console.log('聊天功能初始化完成');
}

// 处理文件上传
async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
        const file = files[0];
        const preview = document.createElement('div');
        preview.className = 'file-preview';
        
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            preview.appendChild(img);
            uploadedFileContent = '[图片文件]';
        } else {
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
        console.error('处理文件时出错:', error);
        alert('处理文件时出现错误');
    }

    fileInput.value = '';
}

// 发送消息到AI
async function sendToAI(message) {
    try {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) {
            console.error('找不到聊天消息容器');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('请先登录');
        }

        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPT
            }
        ];

        for (const msg of conversationHistory) {
            messages.push({
                role: msg.role === "用户" ? "user" : "assistant",
                content: msg.text
            });
        }

        messages.push({
            role: "user",
            content: message
        });

        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai-message';
        chatMessages.appendChild(aiMessageDiv);
        
        const isAtBottom = () => {
            const threshold = 50;
            return chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < threshold;
        };
        
        const handleScroll = () => {
            const shouldScroll = isAtBottom();
            if (shouldScroll) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        };

        handleScroll();

        const response = await fetch(`${API_BASE_URL}/ai/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ messages })
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                localStorage.removeItem('userId');
                throw new Error('登录已过期，请重新登录');
            }
            throw new Error('AI请求失败');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        let fullResponse = '';
        let buffer = '';
        let mathJaxTimeout = null;
        const MATHJAX_DELAY = 500;

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;

                try {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.slice(6));
                        if (data.choices?.[0]?.delta?.content) {
                            fullResponse += data.choices[0].delta.content;
                            
                            const formattedContent = formatAIResponse(fullResponse);

                            if (!formattedContent.startsWith('<')) {
                                aiMessageDiv.innerHTML = '<p>' + formattedContent + '</p>';
                            } else {
                                aiMessageDiv.innerHTML = formattedContent;
                            }

                            handleScroll();

                            if (fullResponse.includes('```')) {
                                if (window.Prism) {
                                    Prism.highlightAllUnder(aiMessageDiv);
                                }
                            }

                            if (fullResponse.includes('\\[') || fullResponse.includes('\\(')) {
                                if (window.MathJax) {
                                    clearTimeout(mathJaxTimeout);
                                    mathJaxTimeout = setTimeout(() => {
                                        const unprocessedMath = aiMessageDiv.querySelectorAll(
                                            '.math-block:not(.math-processed), .math-inline:not(.math-processed)'
                                        );
                                        if (unprocessedMath.length > 0) {
                                            MathJax.typesetPromise(Array.from(unprocessedMath))
                                                .then(() => {
                                                    unprocessedMath.forEach(el => el.classList.add('math-processed'));
                                                })
                                                .catch(err => console.error('MathJax渲染错误:', err));
                                        }
                                    }, MATHJAX_DELAY);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('处理消息时出错:', error);
                }
            }
        }

        clearTimeout(mathJaxTimeout);
        if (window.MathJax && (fullResponse.includes('\\[') || fullResponse.includes('\\('))) {
            await MathJax.typesetPromise([aiMessageDiv]);
        }

        conversationHistory.push(
            { role: '用户', text: message },
            { role: '雅兰', text: fullResponse }
        );

        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-10);
        }

        return '';
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = error.message || '抱歉呢，雅兰现在有点累了... 🥺 待会再聊好吗？';
        
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            const aiMessageDiv = document.createElement('div');
            aiMessageDiv.className = 'message ai-message';
            aiMessageDiv.textContent = errorMessage;
            chatMessages.appendChild(aiMessageDiv);
        }
        
        return '';
    }
}

// 格式化AI响应
function formatAIResponse(content) {
    return content
        .replace(/^---+$/gm, '<hr>')
        .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^\s*[-+*]\s+(.*)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/^\>(.*$)/gm, '<blockquote>$1</blockquote>')
        .replace(/【(.*?)】/g, '<strong>$1</strong>')
        .replace(/\\\[(.*?)\\\]/g, '<span class="math-block">\\[$1\\]</span>')
        .replace(/\\\((.*?)\\\)/g, '<span class="math-inline">\\($1\\)</span>')
        .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
            const escapedCode = code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            return `<pre><code class="language-${lang}">${escapedCode}</code></pre>`;
        })
        .replace(/`(.*?)`/g, (match, code) => {
            const escapedCode = code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            return `<code>${escapedCode}</code>`;
        })
        .replace(/(<\/h[1-6]>)\n+/g, '$1')
        .replace(/(<\/h[1-6]>)([^<])/g, '$1<br>$2')
        .replace(/\n\n+/g, '</p><p>')
        .replace(/([^>])\n([^<])/g, '$1<br>$2');
}

// 添加消息到聊天界面
function addMessage(content, isUser) {
    // 每次调用时重新获取chatMessages元素
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) {
        console.error('找不到聊天消息容器');
        return;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    if (!isUser) {
        const formattedContent = content
            .replace(/【(.*?)】/g, '<strong>$1</strong>')
            .replace(/\\\[(.*?)\\\]/g, '%%%MATH_BLOCK%%%$1%%%MATH_BLOCK%%%')
            .replace(/\\\((.*?)\\\)/g, '%%%MATH_INLINE%%%$1%%%MATH_INLINE%%%')
            .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
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
            .replace(/%%%MATH_BLOCK%%%(.+?)%%%MATH_BLOCK%%%/g, '\\[$1\\]')
            .replace(/%%%MATH_INLINE%%%(.+?)%%%MATH_INLINE%%%/g, '\\($1\\)');
        
        messageDiv.innerHTML = formattedContent;

        if (content.includes('```')) {
            if (window.Prism) {
                Prism.highlightAllUnder(messageDiv);
            }
        }

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

// 处理发送消息
async function handleSend() {
    // 每次调用时重新获取DOM元素
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    
    if (!userInput || !sendButton) {
        console.error('找不到必要的DOM元素');
        return;
    }

    const message = userInput.value.trim();
    if (!message && !uploadedFileContent) return;

    let fullMessage = message;
    if (uploadedFileContent) {
        fullMessage = `${message}\n\n文件内容：\n${uploadedFileContent}`;
    }

    addMessage(fullMessage, true);
    userInput.value = '';

    sendButton.disabled = true;
    sendButton.textContent = '我在思考...';

    await sendToAI(fullMessage);

    sendButton.disabled = false;
    sendButton.textContent = '发送';

    const preview = document.querySelector('.file-preview');
    if (preview) {
        preview.remove();
    }
    uploadedFileContent = null;
}

// 导出聊天模块
export const chat = {
    init: initChat,
    handleSend,
    sendToAI,
    addMessage,
    handleFileUpload
}; 
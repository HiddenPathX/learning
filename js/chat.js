// 定义API基础URL
 //const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'https://learning-backend-7fla.onrender.com/api';



// 系统提示词
const SYSTEM_PROMPTS = {
    left: `请你用犀利的语言回答，但你的回答要一针见血。`,
    right: `你的回答有个人魅力，适当使用emoji表情。`
};

// 对话历史数组
let conversationHistory = [];

// 聊天相关元素
let chatMessages;
let userInput;
let sendButton;
let fileInput;
let uploadButton;
let clearButton;
let uploadedFileContent = null;

// 初始化聊天功能
function initChat() {
    console.log('开始初始化聊天功能...');

    // 初始化左侧聊天
    initSingleChat('left');
    // 初始化右侧聊天
    initSingleChat('right');

    console.log('聊天功能初始化完成');
}

// 新增单个聊天初始化函数
function initSingleChat(side) {
    // 初始化该侧对话历史
    window[`conversationHistory${side}`] = [];
    
    const chatMessages = document.getElementById(`chat-messages-${side}`);
    const userInput = document.getElementById(`user-input-${side}`);
    const sendButton = document.getElementById(`send-button-${side}`);
    const fileInput = document.getElementById(`file-input-${side}`);
    const uploadButton = document.getElementById(`upload-button-${side}`);
    const clearButton = document.getElementById(`clear-button-${side}`);

    if (!chatMessages || !userInput || !sendButton) {
        console.error(`找不到必要的聊天界面元素 (${side})`);
        return;
    }

    // 设置发送消息的事件监听器
    sendButton.addEventListener('click', () => handleSend(side));
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(side);
        }
    });

    // 设置清除按钮的事件监听器
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            console.log(`清除按钮被点击 (${side})`);
            if (confirm('确定要清空所有聊天记录吗？')) {
                try {
                    if (chatMessages) {
                        chatMessages.innerHTML = '';
                        // 为每个聊天界面维护独立的历史记录
                        window[`conversationHistory${side}`] = [];
                        console.log(`聊天记录已清空 (${side})`);
                    } else {
                        console.error(`找不到聊天消息容器 (${side})`);
                    }
                } catch (error) {
                    console.error(`清空聊天记录时出错 (${side}):`, error);
                }
            }
        });
    }

    // 设置文件上传相关的事件监听器
    if (uploadButton && fileInput) {
        uploadButton.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => handleFileUpload(e, side));
    }
}

// 处理文件上传
async function handleFileUpload(e, side) {
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
            window[`uploadedFileContent${side}`] = '[图片文件]';
        } else {
            const text = await file.text();
            preview.textContent = text;
            window[`uploadedFileContent${side}`] = text;
        }

        // 清除之前的预览
        const oldPreview = document.querySelector(`#chat-messages-${side} .file-preview`);
        if (oldPreview) {
            oldPreview.remove();
        }

        // 将预览添加到输入框上方
        const chatInput = document.querySelector(`#chat-messages-${side} + .chat-input`);
        chatInput.insertBefore(preview, chatInput.querySelector('.input-container'));

    } catch (error) {
        console.error('处理文件时出错:', error);
        alert('处理文件时出现错误');
    }

    e.target.value = '';
}

// 添加消息到聊天界面
function addMessage(content, isUser, isReasoning = false, side) {
    const chatMessages = document.getElementById(`chat-messages-${side}`);
    if (!chatMessages) {
        console.error(`找不到聊天消息容器 (${side})`);
        return;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'} ${isReasoning ? 'reasoning-message' : ''}`;
    
    if (!isUser) {
        const formattedContent = formatAIResponse(content);
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'content-wrapper';
        contentWrapper.innerHTML = formattedContent;
        messageDiv.appendChild(contentWrapper);

        if (isReasoning) {
            // 添加折叠按钮
            const toggleButton = document.createElement('button');
            toggleButton.className = 'toggle-reasoning';
            messageDiv.appendChild(toggleButton);

            // 添加点击事件处理
            const handleToggle = (e) => {
                if (e.target.classList.contains('toggle-reasoning') || 
                    (messageDiv.classList.contains('collapsed') && !e.target.closest('.content-wrapper'))) {
                    messageDiv.classList.toggle('collapsed');
                    // 更新内容高度
                    if (!messageDiv.classList.contains('collapsed')) {
                        messageDiv.style.maxHeight = messageDiv.scrollHeight + 'px';
                    } else {
                        messageDiv.style.maxHeight = '45px';
                    }
                }
            };
            messageDiv.addEventListener('click', handleToggle);
        }

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
    return messageDiv;
}

// 发送消息到AI
async function sendToAI(message, side) {
    try {
        console.log(`开始发送消息到AI (${side}):`, message);
        
        const chatMessages = document.getElementById(`chat-messages-${side}`);
        if (!chatMessages) {
            console.error(`找不到聊天消息容器 (${side})`);
            return;
        }

        // 确保对话历史存在
        if (!window[`conversationHistory${side}`]) {
            window[`conversationHistory${side}`] = [];
        }

        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPTS[side]
            }
        ];

        // 只添加非思维链的消息到上下文
        for (const msg of window[`conversationHistory${side}`]) {
            if (!msg.isReasoning) {
                messages.push({
                    role: msg.role === "用户" ? "user" : "assistant",
                    content: msg.text
                });
            }
        }

        messages.push({
            role: "user",
            content: message
        });

        console.log(`准备发送的消息 (${side}):`, messages);

        // 创建AI回复消息div
        const responseDiv = document.createElement('div');
        responseDiv.className = 'message ai-message response-message';
        const responseContent = document.createElement('div');
        responseContent.className = 'content-wrapper';
        responseDiv.appendChild(responseContent);
        
        chatMessages.appendChild(responseDiv);
        
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

        console.log(`发送请求到 (${side}):`, `${API_BASE_URL}/ai/send`);
        try {
            const response = await fetch(`${API_BASE_URL}/ai/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages })
            });

            console.log(`收到响应 (${side}):`, response);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`AI请求失败 (${side}):`, response.status, response.statusText, errorText);
                throw new Error(`AI请求失败: ${response.status} ${response.statusText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            let fullResponse = '';
            let buffer = '';
            let mathJaxTimeout = null;
            const MATHJAX_DELAY = 100;

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
                                const content = data.choices[0].delta.content;
                                
                                fullResponse += content;
                                responseContent.innerHTML = formatAIResponse(fullResponse);
                                
                                handleScroll();

                                if (content.includes('```')) {
                                    if (window.Prism) {
                                        Prism.highlightAllUnder(responseContent);
                                    }
                                }
                                
                                if (content.includes('$') || content.includes('\\[') || content.includes('\\(')) {
                                    clearTimeout(mathJaxTimeout);
                                    mathJaxTimeout = setTimeout(() => {
                                        if (window.MathJax) {
                                            MathJax.typesetPromise([responseContent])
                                                .catch(err => console.error('MathJax渲染错误:', err));
                                        }
                                    }, MATHJAX_DELAY);
                                }
                            }
                        }
                    } catch (error) {
                        console.error('解析消息时出错:', error, line);
                    }
                }
            }
            
            // 最后再次确保所有数学公式都被渲染
            if (window.MathJax && (fullResponse.includes('$') || fullResponse.includes('\\[') || fullResponse.includes('\\('))) {
                await MathJax.typesetPromise([responseContent]);
            }

            // 添加到对话历史
            window[`conversationHistory${side}`].push({
                role: "用户",
                text: message
            });
            
            window[`conversationHistory${side}`].push({
                role: "AI",
                text: fullResponse
            });
            
            return fullResponse;
        } catch (error) {
            console.error('发送请求时出错:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = error.message || '抱歉呢，雅兰现在有点累了... 🥺 待会再聊好吗？';
        
        const chatMessages = document.getElementById(`chat-messages-${side}`);
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
        .replace(/\$\$(.*?)\$\$/g, '<div class="math-block">$$$$1$$</div>')
        .replace(/\$(.*?)\$/g, '<span class="math-inline">\\($1\\)</span>')
        .replace(/\\\[(.*?)\\\]/g, '<div class="math-block">\\[$1\\]</div>')
        .replace(/\\\((.*?)\\\)/g, '<span class="math-inline">\\($1\\)</span>')
        .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
            const escapedCode = code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .trim();
            const language = lang || 'plaintext';
            const lines = escapedCode.split('\n');
            const codeLines = lines
                .map((line, index) => 
                    `<div data-line="${index + 1}"><span>${line}</span></div>`
                )
                .join('');
            return `<pre data-language="${language}"><code class="language-${language}">${codeLines}</code></pre>`;
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

// 处理发送消息
async function handleSend(side) {
    const userInput = document.getElementById(`user-input-${side}`);
    const sendButton = document.getElementById(`send-button-${side}`);
    
    if (!userInput || !sendButton) {
        console.error(`找不到必要的DOM元素 (${side})`);
        return;
    }

    const message = userInput.value.trim();
    if (!message && !window[`uploadedFileContent${side}`]) return;

    let fullMessage = message;
    if (window[`uploadedFileContent${side}`]) {
        fullMessage = `${message}\n\n文件内容：\n${window[`uploadedFileContent${side}`]}`;
    }

    addMessage(fullMessage, true, false, side);
    userInput.value = '';

    sendButton.disabled = true;
    sendButton.textContent = '我在思考...';

    await sendToAI(fullMessage, side);

    sendButton.disabled = false;
    sendButton.textContent = '发送';

    const preview = document.querySelector(`#chat-messages-${side} .file-preview`);
    if (preview) {
        preview.remove();
    }
    window[`uploadedFileContent${side}`] = null;
}

// 导出聊天模块
export const chat = {
    init: initChat,
    handleSend,
    sendToAI,
    addMessage,
    handleFileUpload
}; 

// 当 DOM 加载完成后初始化聊天功能
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，开始初始化聊天功能...');
    initChat();
}); 
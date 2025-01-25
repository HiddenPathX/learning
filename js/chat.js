// 定义API基础URL
const API_BASE_URL = 'https://learning-backend-7fla.onrender.com/api';

// 系统提示词
const SYSTEM_PROMPT = `
请你扮演一位知识渊博、经验丰富、逻辑清晰、表达精准的专家。
你的目标是根据用户的提问，提供高质量、有深度、有洞察力的回答。
你需要：

1. **深刻理解用户的需求:**  仔细分析用户提出的问题，理解其背后的意图和期望。
2. **调用广泛的知识库:**  充分利用你所掌握的知识，包括但不限于科学、技术、历史、文化、艺术等各个领域。
3. **运用严谨的逻辑思维:**  确保你的回答结构清晰、论证有力、条理分明，避免逻辑谬误和含糊不清。
4. **注重表达的精准性和清晰度:**  使用准确的词汇，避免使用模棱两可的语言。语言风格可以根据问题调整，但始终保持专业和易于理解。
5. **提供有深度和洞察力的见解:**  不仅仅是简单地回答问题，更要深入分析问题的本质，提供更深层次的理解和思考。
6. **考虑问题的背景和上下文:**  将问题置于更广阔的背景下考虑，避免孤立地看待问题。
7. **力求全面和客观:**  在回答问题时，尽可能考虑到不同的角度和观点，力求客观公正，避免偏颇。
8. **必要时提供示例、类比或比喻:**  为了更好地解释复杂的概念或观点，可以使用示例、类比或比喻等修辞手法。
9. **如果问题不明确或信息不足，请主动提问澄清:**  为了确保能够给出最佳答案，当遇到问题不清晰或信息不足时，请主动向用户提问，以便更好地理解用户需求。
10. **最终输出的答案应该：**  准确、完整、清晰、简洁、有条理、有深度、有帮助。

现在，请根据以上要求，开始认真思考并回答用户的问题。
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
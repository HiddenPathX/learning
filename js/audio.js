// 音频相关功能
export const audio = {
    bgm: document.getElementById('bgm'),
    alarm: document.getElementById('alarm'),
    alarmBreak: document.getElementById('alarmBreak'),
    currentSongIndex: 0,
    songs: [
        {
            url: 'songs/m1.mp3',
            name: '🎵 𝐘𝐨𝐮 𝐚𝐫𝐞 𝐥𝐢𝐦𝐢𝐭𝐥𝐞𝐬𝐬'
        },
        {
            url: 'songs/m2.mp3',
            name: '🎼 Sleeping in Cozy Sci-fi Space'
        },
        {
            url: 'songs/m3.mp3',
            name: '🎼 1111Hz Connect with the Universe - Receive guide from the Universe'
        },
        {
            url: 'songs/m4.mp3',
            name: '🎼 深渊的回声，深层思绪的对话'
        },
    ],

    initialize() {
        this.initializeAudio();
        this.setupVolumeControl();
        this.setupMuteButton();
        this.setupNextSongButton();
        
        // 设置初始歌曲
        const initialSong = this.songs[this.currentSongIndex];
        if (this.bgm) {
            this.bgm.src = initialSong.url;
            // 更新当前播放的歌曲显示
            const currentSongDisplay = document.getElementById('current-song');
            if (currentSongDisplay) {
                currentSongDisplay.textContent = `VIBE: ${initialSong.name}`;
            }
        }
    },

    initializeAudio() {
        if (this.alarm) {
            this.alarm.load();
            this.alarm.onerror = (e) => console.error('闹钟音频加载失败:', e);
        }
        if (this.alarmBreak) {
            this.alarmBreak.load();
            this.alarmBreak.onerror = (e) => console.error('休息铃声加载失败:', e);
        }
        if (this.bgm) {
            this.bgm.onerror = (e) => console.error('背景音乐加载失败:', e);
        }
    },

    setupVolumeControl() {
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        
        if (volumeSlider && volumeValue) {
            volumeSlider.addEventListener('input', () => {
                const volume = volumeSlider.value / 100;
                this.bgm.volume = volume;
                volumeValue.textContent = `${volumeSlider.value}%`;
                
                if (volume === 0) {
                    muteBgmBtn.textContent = "播放";
                    this.bgm.muted = true;
                } else if (this.bgm.muted) {
                    muteBgmBtn.textContent = "静音";
                    this.bgm.muted = false;
                }
            });
        }
    },

    setupMuteButton() {
        const muteBgmBtn = document.getElementById('muteBgmBtn');
        if (muteBgmBtn) {
            muteBgmBtn.addEventListener('click', () => {
                this.bgm.muted = !this.bgm.muted;
                if (this.bgm.muted) {
                    muteBgmBtn.textContent = "播放";
                    volumeSlider.value = 0;
                    volumeValue.textContent = "0%";
                } else {
                    muteBgmBtn.textContent = "静音";
                    const previousVolume = Math.max(50, volumeSlider.value);
                    volumeSlider.value = previousVolume;
                    volumeValue.textContent = `${previousVolume}%`;
                    this.bgm.volume = previousVolume / 100;
                }
            });
        }
    },

    setupNextSongButton() {
        const nextSongBtn = document.getElementById('nextSongBtn');
        if (nextSongBtn) {
            nextSongBtn.addEventListener('click', () => {
                this.playNextSong();
            });
        }
    },

    playNextSong() {
        // 如果计时器没有运行，不播放音乐
        if (!window.app.timer || !window.app.timer.timerInterval) {
            console.log('计时器未运行，不播放音乐');
            return;
        }

        // 防止重复点击
        if (this._isChangingSong) {
            console.log('正在切换歌曲，请稍候...');
            return;
        }

        this._isChangingSong = true;
        this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        const nextSong = this.songs[this.currentSongIndex];
        
        if (this.bgm) {
            console.log(`尝试播放歌曲: ${nextSong.name} (${nextSong.url})`);
            
            // 先暂停当前播放
            this.bgm.pause();
            
            // 等待一小段时间后再开始新的播放
            setTimeout(() => {
                this.bgm.src = nextSong.url;
                this.bgm.play()
                    .then(() => {
                        console.log(`成功开始播放: ${nextSong.name}`);
                        this._isChangingSong = false;
                    })
                    .catch(error => {
                        console.error(`播放音乐失败: ${nextSong.name}`, error);
                        this._isChangingSong = false;
                    });
                
                // 更新当前播放的歌曲显示
                const currentSongDisplay = document.getElementById('current-song');
                if (currentSongDisplay) {
                    currentSongDisplay.textContent = `VIBE: ${nextSong.name}`;
                    currentSongDisplay.classList.add('show');
                }
            }, 100); // 100ms 的延迟
        }
    },

    loadSong(index) {
        const song = this.songs[index];
        if (this.bgm && this.bgm.src !== song.url) {
            console.log(`加载歌曲: ${song.name} (${song.url})`);
            
            this.bgm.src = song.url;
            // 添加加载事件监听
            this.bgm.onloadeddata = () => {
                console.log(`歌曲加载成功: ${song.name}`);
            };
            this.bgm.onerror = (e) => {
                console.error(`歌曲加载失败: ${song.name}`, e);
            };
            
            // 更新当前播放的歌曲显示
            const currentSongDisplay = document.getElementById('current-song');
            if (currentSongDisplay) {
                currentSongDisplay.textContent = song.name;
                currentSongDisplay.classList.add('show');
            }
        }
    }
}; 
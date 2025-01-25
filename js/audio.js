// 音频相关功能
export const audio = {
    bgm: document.getElementById('bgm'),
    alarm: document.getElementById('alarm'),
    alarmBreak: document.getElementById('alarmBreak'),
    currentSongIndex: 0,
    songs: [
        {
            url: 'songs/m1.mp3',
            name: '🎼 深渊的回声，深层思绪的对话'
        },
        {
            url: 'songs/m2.mp3',
            name: '🎵 HOTEL - Blade Runner Ambience - Calm Snowy Cyberpunk Atmosphere'
        },
        {
            url: 'songs/m3.mp3',
            name: '🎼 1111Hz Connect with the Universe - Receive guide from the Universe'
        }
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

        this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        const nextSong = this.songs[this.currentSongIndex];
        
        if (this.bgm) {
            this.bgm.src = nextSong.url;
            this.bgm.play().catch(error => {
                console.log('播放音乐失败:', error);
            });
            
            // 更新当前播放的歌曲显示
            const currentSongDisplay = document.getElementById('current-song');
            if (currentSongDisplay) {
                currentSongDisplay.textContent = `VIBE: ${nextSong.name}`;
                currentSongDisplay.classList.add('show');
            }
        }
    },

    loadSong(index) {
        const song = this.songs[index];
        if (this.bgm && this.bgm.src !== song.url) {
            this.bgm.src = song.url;
            // 更新当前播放的歌曲显示
            const currentSongDisplay = document.getElementById('current-song');
            if (currentSongDisplay) {
                currentSongDisplay.textContent = song.name;
                currentSongDisplay.classList.add('show'); // 添加显示动画
            }
        }
    }
}; 
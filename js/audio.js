export default class AudioManager {
    constructor() {
        // Tạo các element âm thanh
        this.bgMusic = document.createElement('audio');
        this.bgMusic.id = 'bgMusic';
        this.bgMusic.loop = true;
        this.bgMusic.src = 'assets/audio/background-music.mp3';
        
        this.walkSound = document.createElement('audio');
        this.walkSound.id = 'walkSound';
        this.walkSound.src = 'assets/audio/footstep.mp3';
        
        this.itemSound = document.createElement('audio');
        this.itemSound.src = 'assets/audio/item-pickup.mp3';
        
        // Thêm vào DOM
        document.getElementById('game-wrapper').appendChild(this.bgMusic);
        document.getElementById('game-wrapper').appendChild(this.walkSound);
        
        // Thiết lập âm lượng
        this.bgMusic.volume = 0.3;
        this.walkSound.volume = 0.5;
        this.itemSound.volume = 0.7;
        
        this.isMuted = false;
        
        // Tạo nút điều khiển âm thanh mới ở bên trái
        this.createAudioControl();
        
        // Bắt đầu phát nhạc khi người dùng tương tác
        document.addEventListener('click', () => {
            if (this.bgMusic.paused) {
                this.bgMusic.play();
            }
        }, { once: true });
    }
    
    createAudioControl() {
        // Tạo nút mới thay vì sử dụng nút có sẵn trong HTML
        const audioButton = document.createElement('button');
        audioButton.className = 'audio-control audio-control-left';
        audioButton.textContent = '🔊';
        
        // Thêm sự kiện click với stopPropagation
        audioButton.addEventListener('click', (e) => {
            // Ngăn chặn sự kiện click lan truyền
            e.stopPropagation();
            this.toggleMute();
        });
        
        // Thêm vào game wrapper
        document.getElementById('game-wrapper').appendChild(audioButton);
        
        // Cập nhật reference
        this.audioControl = audioButton;
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.bgMusic.muted = this.isMuted;
        this.walkSound.muted = this.isMuted;
        this.itemSound.muted = this.isMuted;
        this.audioControl.textContent = this.isMuted ? '🔇' : '🔊';
    }
    
    playWalkSound() {
        this.walkSound.currentTime = 0;
        this.walkSound.play();
    }
    
    playItemSound() {
        this.itemSound.currentTime = 0;
        this.itemSound.play();
    }
    
    resetAudio() {
        // Reset âm thanh về trạng thái ban đầu
        this.bgMusic.currentTime = 0;
        this.walkSound.currentTime = 0;
        
        // Đảm bảo nhạc nền đang phát
        if (!this.isMuted) {
            this.bgMusic.play();
        }
    }
} 
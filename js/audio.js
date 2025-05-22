export default class AudioManager {
    constructor() {
        this.bgMusic = document.getElementById('bgMusic');
        this.walkSound = document.getElementById('walkSound');
        this.audioControl = document.getElementById('audioControl');
        this.isMuted = false;
        
        // Tạo element âm thanh cho item
        this.itemSound = document.createElement('audio');
        this.itemSound.src = 'assets/audio/item-pickup.mp3';
        
        // Thiết lập âm lượng
        this.bgMusic.volume = 0.3;
        this.walkSound.volume = 0.5;
        this.itemSound.volume = 0.7;
        
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
} 
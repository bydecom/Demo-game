export default class AudioManager {
    constructor() {
        // Tạo các element âm thanh
        this.bgMusic = document.createElement('audio');
        this.bgMusic.id = 'bgMusic';
        this.bgMusic.loop = true;
        this.bgMusic.src = 'assets/audio/background-music.mp3';
        
        this.walkSound = new Audio('assets/audio/footstep.mp3');
        this.walkSound.volume = 1;
        this.walkSound.loop = true;
        
        this.itemSound = document.createElement('audio');
        this.itemSound.src = 'assets/audio/get-item.mp3';
        this.itemSound.volume = 0.3;
        
        this.bookSound = new Audio('assets/audio/book_sound.mp3');
        this.bookSound.volume = 0.5;
        
        this.boilingSound = new Audio('assets/audio/boiling-water.mp3');
        this.boilingSound.loop = true;
        this.boilingSound.volume = 0.5;
        
        // Thêm vào DOM
        document.getElementById('game-wrapper').appendChild(this.bgMusic);
        document.getElementById('game-wrapper').appendChild(this.walkSound);
        
        // Thiết lập âm lượng
        this.bgMusic.volume = 0.3;
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
        this.bookSound.muted = this.isMuted;
        this.boilingSound.muted = this.isMuted;
        this.audioControl.textContent = this.isMuted ? '🔇' : '🔊';
    }
    
    playWalkSound() {
        this.startWalkLoop();
    }
    
    playItemSound() {
        this.itemSound.currentTime = 0;
        this.itemSound.play();
    }
    
    playBookSound() {
        this.bookSound.currentTime = 0;
        this.bookSound.play();
    }
    
    playBoilingSound() {
        this.boilingSound.currentTime = 0;
        this.boilingSound.play();
    }
    
    stopBoilingSound() {
        this.boilingSound.pause();
        this.boilingSound.currentTime = 0;
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
    
    // Bắt đầu phát loop bước chân (chỉ gọi nếu chưa phát)
    startWalkLoop() {
        if (this.walkSound.paused && !this.isMuted) {
            this.walkSound.currentTime = 0;
            this.walkSound.play();
        }
    }
    
    // Dừng loop bước chân ngay lập tức
    stopWalkLoop() {
        if (!this.walkSound.paused) {
            this.walkSound.pause();
            this.walkSound.currentTime = 0;
        }
    }
} 
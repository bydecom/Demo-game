export default class AudioManager {
    constructor() {
        // Tạo các element âm thanh
        this.bgMusic = document.createElement('audio');
        this.bgMusic.id = 'bgMusic';
        this.bgMusic.loop = true;
        this.bgMusic.src = 'assets/audio/background.mp3';
        
        this.walkSound = new Audio('assets/audio/footstep.mp3');
        this.walkSound.volume = 0.5;
        this.walkSound.loop = true;
        
        this.itemSound = document.createElement('audio');
        this.itemSound.src = 'assets/audio/get-item.mp3';
        this.itemSound.volume = 0.7;
        
        this.bookSound = new Audio('assets/audio/book_sound.mp3');
        this.bookSound.volume = 0.5;
        
        this.boilingSound = new Audio('assets/audio/boiling-water.mp3');
        this.boilingSound.loop = true;
        this.boilingSound.volume = 0.5;
        
        // NEW: Additional audio elements
        this.clickSound = new Audio('assets/audio/click.mp3');
        this.clickSound.volume = 0.6;

        this.foodSound = new Audio('assets/audio/food.mp3');
        this.foodSound.volume = 0.7;

        this.gameoverSound = new Audio('assets/audio/gameover.mp3');
        this.gameoverSound.volume = 0.8;

        this.snakeTheme = new Audio('assets/audio/snake_theme_song.mp3');
        this.snakeTheme.loop = true;
        this.snakeTheme.volume = 0.7;
        
        // Thêm vào DOM
        document.getElementById('game-wrapper').appendChild(this.bgMusic);
        document.getElementById('game-wrapper').appendChild(this.walkSound);
        
        // Thiết lập âm lượng (nhạc nền)
        this.bgMusic.volume = 1;
        
        // Init mute state before applying to sounds
        this.isMuted = false;
        
        // NEW: Ensure new sounds respect mute state
        this.clickSound.muted = this.isMuted;
        this.foodSound.muted = this.isMuted;
        this.gameoverSound.muted = this.isMuted;
        this.snakeTheme.muted = this.isMuted;
        
        // Bỏ nút điều khiển âm thanh trên UI
        this.audioControl = null;
        
        // Bắt đầu phát nhạc khi người dùng tương tác
        document.addEventListener('click', () => {
            if (this.bgMusic.paused) {
                this.bgMusic.play().catch(()=>{});
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
        // NEW: toggle mute for new sounds
        this.clickSound.muted = this.isMuted;
        this.foodSound.muted = this.isMuted;
        this.gameoverSound.muted = this.isMuted;
        this.snakeTheme.muted = this.isMuted;
        if (this.audioControl) this.audioControl.textContent = this.isMuted ? '🔇' : '🔊';
    }
    
    playWalkSound() {
        this.startWalkLoop();
    }
    
    playItemSound() {
        this.itemSound.currentTime = 0;
        this.itemSound.play().catch(()=>{});
    }
    
    playBookSound() {
        this.bookSound.currentTime = 0;
        this.bookSound.play().catch(()=>{});
    }
    
    playBoilingSound() {
        this.boilingSound.currentTime = 0;
        this.boilingSound.play().catch(()=>{});
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
            this.walkSound.play().catch(()=>{});
        }
    }
    
    // Dừng loop bước chân ngay lập tức
    stopWalkLoop() {
        if (!this.walkSound.paused) {
            this.walkSound.pause();
            this.walkSound.currentTime = 0;
        }
    }

    // NEW helper play functions
    playClickSound() {
        if (this.isMuted) return;
        this.clickSound.currentTime = 0;
        this.clickSound.play().catch(()=>{});
    }

    playFoodSound() {
        if (this.isMuted) return;
        this.foodSound.currentTime = 0;
        this.foodSound.play().catch(()=>{});
    }

    playGameoverSound() {
        if (this.isMuted) return;
        this.gameoverSound.currentTime = 0;
        this.gameoverSound.play().catch(()=>{});
    }

    playSnakeTheme() {
        if (!this.snakeTheme.paused) return; // already playing
        this.bgMusic.pause();
        if (!this.isMuted) {
            this.snakeTheme.currentTime = 0;
            this.snakeTheme.play().catch(()=>{});
        }
    }

    stopSnakeTheme() {
        if (!this.snakeTheme.paused) {
            this.snakeTheme.pause();
            this.snakeTheme.currentTime = 0;
        }
        // Resume bg music after snake theme ends
        if (!this.isMuted && this.bgMusic.paused) {
            this.bgMusic.play().catch(()=>{});
        }
    }
} 
class ResourcePreloader {
    constructor() {
        // Danh sách tài nguyên cần tải
        this.resources = {
            images: [
                // Background và UI chính
                'assets/images/background.jpg',
                'assets/images/menu/menu.png',
                'assets/images/menu/loading.png',
                'assets/images/menu/credit.png',
                'assets/images/button/back.png',
                // Frame animation của nhân vật
                'assets/images/move/1.png',
                'assets/images/move/2.png',
                'assets/images/move/3.png',
                'assets/images/move/4.png',
                'assets/images/move/5.png',
                'assets/images/move/6.png',
                'assets/images/move/7.png',
                'assets/images/move/8.png',
                'assets/images/move/9.png',
                'assets/images/move/10.png'
            ],
            audio: [
                'assets/audio/background-music.mp3',
                'assets/audio/footstep.mp3'
            ]
        };

        // Cache cho tài nguyên đã load
        this.cache = {
            images: new Map(),
            audio: new Map()
        };

        // Bắt đầu preload ngay khi khởi tạo
        this.startPreloading();
    }

    startPreloading() {
        // Preload images
        this.resources.images.forEach(src => {
            if (!this.cache.images.has(src)) {
                const img = new Image();
                img.onload = () => {
                    this.cache.images.set(src, img);
                    console.log(`Đã tải xong hình ảnh: ${src}`);
                };
                img.onerror = () => {
                    console.error(`Lỗi khi tải hình ảnh: ${src}`);
                };
                img.src = src;
            }
        });

        // Preload audio
        this.resources.audio.forEach(src => {
            if (!this.cache.audio.has(src)) {
                const audio = new Audio();
                audio.oncanplaythrough = () => {
                    this.cache.audio.set(src, audio);
                    console.log(`Đã tải xong âm thanh: ${src}`);
                };
                audio.onerror = () => {
                    console.error(`Lỗi khi tải âm thanh: ${src}`);
                };
                // Tắt âm thanh khi preload
                audio.volume = 0;
                audio.muted = true;
                audio.src = src;
                // Bắt đầu load
                audio.load();
            }
        });
    }

    // Lấy hình ảnh đã cache
    getImage(src) {
        const cachedImage = this.cache.images.get(src);
        if (cachedImage) {
            // Trả về bản copy của hình ảnh để tránh conflict
            const newImg = new Image();
            newImg.src = cachedImage.src;
            return newImg;
        }
        // Nếu chưa có trong cache, tải mới
        const img = new Image();
        img.src = src;
        return img;
    }

    // Lấy âm thanh đã cache
    getAudio(src) {
        const cachedAudio = this.cache.audio.get(src);
        if (cachedAudio) {
            // Clone audio để có thể phát nhiều lần
            const newAudio = new Audio();
            newAudio.src = cachedAudio.src;
            return newAudio;
        }
        // Nếu chưa có trong cache, tải mới
        const audio = new Audio(src);
        return audio;
    }
}

// Tạo instance duy nhất của ResourcePreloader
const resourcePreloader = new ResourcePreloader();

// Export instance để sử dụng trong toàn bộ game
export default resourcePreloader; 
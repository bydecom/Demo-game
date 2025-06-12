class ResourcePreloader {
    constructor() {
        // Danh sách tài nguyên cần tải
        this.resources = {
            images: [
                // Background và UI chính
                'assets/images/background.jpg',
                'assets/images/menu/menu.png',
                'assets/images/menu/loading.png',
                'assets/images/items/balo.png',
                'assets/images/items/noi/1.png',
                'assets/images/items/mi.png',
                'assets/images/items/gas.png',
                'assets/images/items/noi/1.png',
                'assets/images/items/mi.png',
                'assets/images/items/gas.png',
                'assets/images/button/back.png',
                'assets/images/button/exit.png',
                'assets/images/button/next.png',
                'assets/images/button/prev.png',
                'assets/images/button/play.png',
                'assets/images/button/pause.png',
                'assets/images/button/restart.png',
                'assets/images/button/mute.png',
                'assets/canh7.png',
                'assets/images/move/01.png',
                'assets/images/move/02.png',
                'assets/images/move/03.png',
                'assets/images/move/04.png',
                'assets/images/move/05.png',
                'assets/images/move/06.png',
                'assets/images/move/07.png',
                'assets/images/move/08.png',
                'assets/images/move/09.png',
                'assets/images/move/10.png',
                'assets/images/move/11.png',
                'assets/images/move/12.png',
                'assets/images/move/13.png',
                'assets/images/move/14.png',
                'assets/images/move/15.png',
                'assets/images/move/16.png',
                'assets/images/move/17.png',
                'assets/images/move/18.png',
                'assets/images/move/19.png',
                'assets/images/move/00.png',
                'assets/images/move2/10.png',
                // Hint nồi
                'assets/images/items/noi/1.png',
                'assets/images/items/mi.png',
                // Inventory & UI
                'assets/images/items/slot.png',
                // Setting UI buttons
                'assets/images/setting/Setting1.png',
                'assets/images/setting/Setting2.png',
                'assets/images/setting/Setting3.png',
                'assets/images/setting/background.png',
                // Credit screen
                'assets/images/menu/credit.png',
                // Diary pages (1-6)
                'assets/images/items/nhatky/1.png',
                'assets/images/items/nhatky/2.png',
                'assets/images/items/nhatky/3.png',
                'assets/images/items/nhatky/4.png',
                'assets/images/items/nhatky/5.png',
                'assets/images/items/nhatky/6.png',
                // Gas hint steps (1-4)
                'assets/images/items/gas_hint1.png',
                'assets/images/items/gas_hint2.png',
                'assets/images/items/gas_hint3.png',
                'assets/images/items/gas_hint4.png'
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

        // Tính tổng số tài nguyên cần preload
        this.totalCount = this.resources.images.length + this.resources.audio.length;
        this.loadedCount = 0;
        this.progressCallbacks = [];

        // Khởi tạo promise hoàn tất
        this._createLoadedPromise();
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
                    this._onResourceLoaded();
                };
                img.onerror = () => {
                    console.error(`Lỗi khi tải hình ảnh: ${src}`);
                    // Dù lỗi vẫn tính là đã xử lý để không kẹt progress
                    this._onResourceLoaded();
                };
                img.src = src;
            } else {
                // Nếu đã trong cache, coi như đã load
                this._onResourceLoaded();
            }
        });

        // Preload audio
        this.resources.audio.forEach(src => {
            if (!this.cache.audio.has(src)) {
                const audio = new Audio();
                audio.oncanplaythrough = () => {
                    this.cache.audio.set(src, audio);
                    console.log(`Đã tải xong âm thanh: ${src}`);
                    this._onResourceLoaded();
                };
                audio.onerror = () => {
                    console.error(`Lỗi khi tải âm thanh: ${src}`);
                    // Vẫn tính để tránh treo
                    this._onResourceLoaded();
                };
                audio.volume = 0;
                audio.muted = true;
                audio.src = src;
                audio.load();
            } else {
                this._onResourceLoaded();
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

    // Hàm gọi khi một tài nguyên (image/audio) đã được xử lý xong
    _onResourceLoaded() {
        this.loadedCount += 1;
        const percent = (this.loadedCount / this.totalCount) * 100;
        // Gửi event progress
        this.progressCallbacks.forEach(cb => cb(percent));
        if (this.loadedCount >= this.totalCount) {
            this._resolveLoaded();
        }
    }

    // Khởi tạo promise hoàn tất
    _createLoadedPromise() {
        this.loadedPromise = new Promise((resolve) => {
            this._resolveLoaded = resolve;
        });
    }

    // Trả về promise sẽ resolve khi tất cả tài nguyên đã load
    getLoadedPromise() {
        return this.loadedPromise;
    }

    // Thêm listener theo dõi quá trình load (nhận % progress)
    addProgressListener(callback) {
        if (typeof callback === 'function') {
            this.progressCallbacks.push(callback);
        }
    }

    // Kiểm tra đã load xong chưa
    isLoaded() {
        return this.loadedCount >= this.totalCount;
    }
}

// Tạo instance duy nhất của ResourcePreloader
const resourcePreloader = new ResourcePreloader();

// Export instance để sử dụng trong toàn bộ game
export default resourcePreloader; 
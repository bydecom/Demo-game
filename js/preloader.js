export default class Preloader {
    constructor() {
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.assets = {
            images: {},
            audio: {}
        };

        // Danh sách tất cả tài nguyên cần tải
        this.imageAssets = [
            { key: 'background', src: 'assets/images/background.jpg' },
            { key: 'move1', src: 'assets/images/move/1.png' },
            { key: 'move2', src: 'assets/images/move/2.png' },
            { key: 'move3', src: 'assets/images/move/3.png' },
            { key: 'move4', src: 'assets/images/move/4.png' },
            { key: 'move5', src: 'assets/images/move/5.png' },
            { key: 'move6', src: 'assets/images/move/6.png' },
            { key: 'move7', src: 'assets/images/move/7.png' },
            { key: 'move8', src: 'assets/images/move/8.png' },
            { key: 'move9', src: 'assets/images/move/9.png' },
            { key: 'move10', src: 'assets/images/move/10.png' },
            { key: 'menu', src: 'assets/images/menu/menu.png' },
            { key: 'loading', src: 'assets/images/menu/loading.png' },
            { key: 'credit', src: 'assets/images/menu/credit.png' },
            { key: 'back', src: 'assets/images/button/back.png' }
        ];

        this.audioAssets = [
            { key: 'bgMusic', src: 'assets/audio/background-music.mp3' },
            { key: 'walkSound', src: 'assets/audio/footstep.mp3' }
        ];

        this.totalAssets = this.imageAssets.length + this.audioAssets.length;
    }

    preload() {
        return new Promise((resolve) => {
            // Tạo container ẩn để chứa tài nguyên đã tải
            const hiddenContainer = document.createElement('div');
            hiddenContainer.style.cssText = 'position: absolute; visibility: hidden; pointer-events: none;';
            document.body.appendChild(hiddenContainer);

            // Tải hình ảnh
            this.imageAssets.forEach(img => {
                const image = new Image();
                image.onload = () => {
                    this.assets.images[img.key] = image;
                    this.loadedAssets++;
                    this.updateProgress();
                    if (this.isLoadComplete()) {
                        resolve(this.assets);
                    }
                };
                image.onerror = () => {
                    console.error(`Failed to load image: ${img.src}`);
                    this.loadedAssets++;
                    this.updateProgress();
                    if (this.isLoadComplete()) {
                        resolve(this.assets);
                    }
                };
                image.src = img.src;
                hiddenContainer.appendChild(image);
            });

            // Tải âm thanh
            this.audioAssets.forEach(audio => {
                const audioElement = new Audio();
                audioElement.oncanplaythrough = () => {
                    this.assets.audio[audio.key] = audioElement;
                    this.loadedAssets++;
                    this.updateProgress();
                    if (this.isLoadComplete()) {
                        resolve(this.assets);
                    }
                };
                audioElement.onerror = () => {
                    console.error(`Failed to load audio: ${audio.src}`);
                    this.loadedAssets++;
                    this.updateProgress();
                    if (this.isLoadComplete()) {
                        resolve(this.assets);
                    }
                };
                audioElement.src = audio.src;
                audioElement.load();
                hiddenContainer.appendChild(audioElement);
            });
        });
    }

    updateProgress() {
        const progress = (this.loadedAssets / this.totalAssets) * 100;
        // Emit event for progress update
        const event = new CustomEvent('assetLoadProgress', { 
            detail: { progress: progress } 
        });
        document.dispatchEvent(event);
    }

    isLoadComplete() {
        return this.loadedAssets === this.totalAssets;
    }

    getAsset(type, key) {
        return this.assets[type][key];
    }
} 
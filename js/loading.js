class LoadingScreen {
    constructor() {
        this.loadingTexts = [
            "Đang chuẩn bị cuộc phiêu lưu của bạn...",
            "Đang tải thế giới game...",
            "Đang khởi tạo nhân vật...",
            "Đang thiết lập môi trường...",
            "Đang nạp dữ liệu game...",
            // Thêm các text loading khác ở đây
        ];
        
        this.createLoadingScreen();
    }

    createLoadingScreen() {
        // Tạo loading screen element
        this.element = document.createElement('div');
        this.element.className = 'loading-screen';

        // Tạo text element
        this.textElement = document.createElement('div');
        this.textElement.className = 'loading-text';
        
        // Tạo progress bar
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'progress-bar';
        
        this.progressFill = document.createElement('div');
        this.progressFill.className = 'progress-fill';
        
        // Ghép các element lại với nhau
        this.progressBar.appendChild(this.progressFill);
        this.element.appendChild(this.textElement);
        this.element.appendChild(this.progressBar);
        
        // Thêm vào body
        document.body.appendChild(this.element);
    }

    getRandomText() {
        const randomIndex = Math.floor(Math.random() * this.loadingTexts.length);
        return this.loadingTexts[randomIndex];
    }

    show() {
        this.element.style.display = 'flex';
        this.textElement.textContent = this.getRandomText();
        this.progress = 0;
        this.progressFill.style.width = '0%';
        this.startLoading();
    }

    hide() {
        this.element.style.display = 'none';
    }

    startLoading() {
        let progress = 0;
        const duration = 3000; // Thời gian loading (3 giây)
        const interval = 30; // Cập nhật mỗi 30ms
        const steps = duration / interval;
        const increment = 100 / steps;

        const loadingInterval = setInterval(() => {
            progress += increment;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                setTimeout(() => {
                    this.hide();
                    this.onLoadingComplete(); // Callback khi loading hoàn tất
                }, 500);
            }
            this.progressFill.style.width = `${progress}%`;
        }, interval);
    }

    // Callback khi loading hoàn tất
    onLoadingComplete() {
        // Có thể override function này để thực hiện các hành động sau khi loading xong
    }

    // Thêm text loading mới
    addLoadingText(text) {
        this.loadingTexts.push(text);
    }
}

// Sử dụng trong game.js
const loadingScreen = new LoadingScreen();

// Thêm vào các event listener cho nút New Game và Continue
document.querySelector('.new-game-button').addEventListener('click', () => {
    loadingScreen.onLoadingComplete = () => {
        // Code để bắt đầu game mới
        startNewGame();
    };
    loadingScreen.show();
});

document.querySelector('.continue-button').addEventListener('click', () => {
    loadingScreen.onLoadingComplete = () => {
        // Code để tiếp tục game
        continueGame();
    };
    loadingScreen.show();
}); 
export default class LoadingScreen {
    constructor() {
        this.loadingTexts = [
            "Mẹo: Nhật ký có thể mang lại một vài gợi ý, kèm theo đó là sự thật xảy ra đằng sau.",
            "Mẹo: Hãy khám phá mọi ngóc ngách trong game.",
            "Mẹo: Đừng bỏ lỡ bất kỳ manh mối nào.",
            "Mẹo: Mỗi vật phẩm đều có ý nghĩa riêng của nó.",
            "Mẹo: Hãy chú ý đến những chi tiết nhỏ nhất.",
        ];
        
        this.createLoadingScreen();
    }

    createLoadingScreen() {
        // Tạo loading screen element
        this.element = document.createElement('div');
        this.element.className = 'loading-screen';

        // Tạo container cho các elements
        this.container = document.createElement('div');
        this.container.className = 'loading-elements-container';

        // Tạo progress bar
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'progress-bar';
        
        this.progressFill = document.createElement('div');
        this.progressFill.className = 'progress-fill';
        
        // Tạo loading text
        this.loadingTextElement = document.createElement('div');
        this.loadingTextElement.className = 'loading-text';
        this.loadingTextElement.textContent = 'LOADING...';
        
        // Tạo tip text element
        this.tipElement = document.createElement('div');
        this.tipElement.className = 'loading-text tip-text';
        
        // Ghép các element lại với nhau
        this.progressBar.appendChild(this.progressFill);
        
        // Thêm tất cả elements vào container
        this.container.appendChild(this.progressBar);
        this.container.appendChild(this.loadingTextElement);
        this.container.appendChild(this.tipElement);
        
        // Thêm container vào loading screen
        this.element.appendChild(this.container);
        
        // Thêm vào body
        document.body.appendChild(this.element);
    }

    getRandomText() {
        const randomIndex = Math.floor(Math.random() * this.loadingTexts.length);
        return this.loadingTexts[randomIndex];
    }

    show() {
        this.element.style.display = 'flex';
        this.tipElement.textContent = this.getRandomText();
        this.progress = 0;
        this.progressFill.style.width = '0%';
    }

    hide() {
        this.element.style.display = 'none';
    }

    // Cập nhật tiến trình thực tế
    setProgress(percent) {
        const clamped = Math.max(0, Math.min(100, percent));
        this.progressFill.style.width = `${clamped}%`;
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
// const loadingScreen = new LoadingScreen(); // Removed global instance

// Thêm vào các event listener cho nút New Game và Continue
// document.querySelector('.new-game-button').addEventListener('click', () => { // Removed event listener
//     loadingScreen.onLoadingComplete = () => {
//         // Code để bắt đầu game mới
//         startNewGame();
//     };
//     loadingScreen.show();
// });

// document.querySelector('.continue-button').addEventListener('click', () => { // Removed event listener
//     loadingScreen.onLoadingComplete = () => {
//         // Code để tiếp tục game
//         continueGame();
//     };
//     loadingScreen.show();
// }); 
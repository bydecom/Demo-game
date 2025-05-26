export default class Menu {
    constructor(game) {
        this.game = game;
        // Khởi tạo loading screen
        this.loadingScreen = new LoadingScreen();
        this.menuElement = null;
        this.createMenu();
    }

    createMenu() {
        // Tạo container cho menu
        this.menuElement = document.createElement('div');
        this.menuElement.className = 'game-menu';

        // Tạo tiêu đề


        // Tạo container cho các nút
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'game-menu-buttons';

        // Tạo các nút menu theo thứ tự
        const menuButtons = [
            { text: 'New Game', onClick: () => this.startGame() },
            { text: 'Continue', onClick: () => this.continueGame() },
            { text: 'Setting', onClick: () => this.openSettings() },
            { text: 'Controls', onClick: () => this.openControls() },
            { text: 'Credit', onClick: () => this.openCredits() },
            { text: 'Quit', onClick: () => this.quitGame() }
        ];

        menuButtons.forEach(button => {
            const buttonElement = document.createElement('button');
            buttonElement.className = 'game-menu-button';
            buttonElement.textContent = button.text;
            buttonElement.addEventListener('click', button.onClick);
            buttonsContainer.appendChild(buttonElement);
        });



        // Thêm container nút vào menu
        this.menuElement.appendChild(buttonsContainer);

        // Thêm menu vào game wrapper
        this.game.gameWrapper.appendChild(this.menuElement);

        // Ẩn game container ban đầu
        this.game.gameContainer.style.display = 'none';
    }

    startGame() {
        // Hiển thị loading screen
        this.loadingScreen.onLoadingComplete = () => {
            // Reset game state và thiết lập vị trí nhân vật trước
            this.game.resetGameState();
            
            // Thêm hiệu ứng fade out cho menu
            this.menuElement.style.opacity = '0';
            this.menuElement.style.transition = 'opacity 1s ease';

            // Sau khi animation kết thúc
            setTimeout(() => {
                // Ẩn menu
                this.menuElement.style.display = 'none';
                
                // Hiển thị game container nhưng vẫn ẩn
                this.game.gameContainer.style.display = 'block';
                this.game.gameContainer.style.opacity = '0';
                
                // Bật lại event listeners cho game
                this.game.enableGameEvents();
                
                // Đảm bảo camera đã được cập nhật trước khi hiển thị
                this.game.updateCamera();
                
                // Thêm transition cho game container
                this.game.gameContainer.style.transition = 'opacity 0.5s ease';
                
                // Hiển thị game container với animation fade in
                requestAnimationFrame(() => {
                    this.game.gameContainer.style.opacity = '1';
                });
                
                // Bắt đầu game
                this.game.start();
                
                // Hiển thị nút back
                const backButton = document.querySelector('.game-back-button');
                if (backButton) {
                    backButton.style.display = 'block';
                }
            }, 1000);
        };
        this.loadingScreen.show();
    }

    resetGame() {
        // Reset map về map đầu tiên
        this.game.currentMapId = 1;
        this.game.map = new Map(this.game.currentMapId, this.game);
        
        // Reset inventory
        this.game.inventory.clearItems();
        
        // Reset player position và camera sẽ tự động căn giữa theo player
        this.game.player.resetPosition();
        
        // Reset message manager với messages mới từ map
        this.game.messageManager = new MessageManager(this.game.map.getMessages());
        
        // Reset audio (nếu cần)
        this.game.audioManager.resetAudio();
        
        // Camera sẽ tự động update thông qua game.start()
        this.game.updateCamera();
    }

    continueGame() {
        // Thêm hiệu ứng fade out cho menu
        this.menuElement.style.opacity = '0';
        this.menuElement.style.transition = 'opacity 1s ease';

        // Sau khi animation kết thúc
        setTimeout(() => {
            // Ẩn menu
            this.menuElement.style.display = 'none';
            
            // Hiện lại game container
            this.game.gameContainer.style.display = 'block';
            
            // Bật lại event listeners cho game
            this.game.enableGameEvents();
            
            // Hiện nút back
            const backButton = document.querySelector('.game-back-button');
            if (backButton) {
                backButton.style.display = 'block';
            }
        }, 1000);
    }

    openSettings() {
        console.log('Opening settings...');
        // Implement settings logic
    }

    openControls() {
        console.log('Opening controls...');
        // Implement controls logic
    }

    openCredits() {
        // Tạo màn hình credit nếu chưa tồn tại
        if (!this.creditScreen) {
            this.creditScreen = document.createElement('div');
            this.creditScreen.className = 'credit-screen';
            
            // Tạo nút đóng
            const closeButton = document.createElement('button');
            closeButton.className = 'credit-close';
            closeButton.addEventListener('click', () => {
                this.creditScreen.classList.remove('show');
            });
            
            this.creditScreen.appendChild(closeButton);
            this.game.gameWrapper.appendChild(this.creditScreen);
        }
        
        // Hiển thị màn hình credit
        this.creditScreen.classList.add('show');
    }

    quitGame() {
        console.log('Quitting game...');
        // Implement quit game logic
    }
} 
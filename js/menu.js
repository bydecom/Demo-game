import LoadingScreen from './loading.js';
import resourcePreloader from './preloader.js';

export default class Menu {
    constructor(game) {
        this.game = game;
        // Khởi tạo loading screen
        this.loadingScreen = new LoadingScreen();
        this.menuElement = null;
        this.currentLanguageIndex = 0; // 0: TIẾNG VIỆT, 1: TIẾNG ANH
        this.languages = ['TIẾNG VIỆT', 'ENGLISH'];
        this.currentGuideIndex = 0; // 0: CÓ, 1: KHÔNG
        this.guides = ['CÓ', 'KHÔNG'];
        
        // Thêm hệ thống translations
        this.translations = {
            0: { // TIẾNG VIỆT
                newGame: 'Game Mới',
                continue: 'Tiếp Tục',
                setting: 'Cài Đặt',
                credit: 'Đội ngũ',
                quit: 'Thoát',
                language: 'NGÔN NGỮ',
                guide: 'HƯỚNG DẪN',
                sound: 'ÂM THANH',
                soundEffects: 'HIỆU ỨNG ÂM THANH',
                sensitivity: 'ĐỘ NHẠY',
                guides: ['CÓ', 'KHÔNG']
            },
            1: { // TIẾNG ANH
                newGame: 'New Game',
                continue: 'Continue',
                setting: 'Setting',
                credit: 'Credit',
                quit: 'Quit',
                language: 'LANGUAGE',
                guide: 'GUIDE',
                sound: 'SOUND',
                soundEffects: 'SOUND EFFECTS',
                sensitivity: 'SENSITIVITY', 
                guides: ['YES', 'NO']
            }
        };
        
        // Lưu references tới các button elements
        this.menuButtons = {};
        
        // Trạng thái khởi tạo game chỉ lưu trong RAM, không dùng localStorage nữa
        this.hasStartedGame = false;

        this.continueButton = null; // reference tới nút Continue

        this.createMenu();
        this.updateContinueButtonState();
    }

    createMenu() {
        // Tạo container cho menu
        this.menuElement = document.createElement('div');
        this.menuElement.className = 'game-menu';

        // Tạo container cho các nút
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'game-menu-buttons';

        // Tạo các nút menu theo thứ tự
        const menuButtonsConfig = [
            { key: 'newGame', onClick: () => this.startGame() },
            { key: 'continue', onClick: () => this.continueGame() },
            { key: 'setting', onClick: () => this.openSettings() },
            { key: 'credit', onClick: () => this.openCredits() },
            { key: 'quit', onClick: () => this.quitGame() }
        ];

        menuButtonsConfig.forEach(button => {
            const buttonElement = document.createElement('button');
            buttonElement.className = 'game-menu-button';
            buttonElement.textContent = this.translations[this.currentLanguageIndex][button.key];
            buttonElement.addEventListener('click', button.onClick);

            // Lưu reference cho các nút
            this.menuButtons[button.key] = buttonElement;
            
            // Lưu reference đặc biệt cho nút Continue
            if (button.key === 'continue') {
                this.continueButton = buttonElement;
            }

            buttonsContainer.appendChild(buttonElement);
        });

        // Thêm container nút vào menu
        this.menuElement.appendChild(buttonsContainer);

        // Thêm menu vào game wrapper
        this.game.gameWrapper.appendChild(this.menuElement);

        // Ẩn game container ban đầu
        this.game.gameContainer.style.display = 'none';
    }

    // Method mới để cập nhật ngôn ngữ của menu buttons
    updateMenuLanguage() {
        Object.keys(this.menuButtons).forEach(key => {
            this.menuButtons[key].textContent = this.translations[this.currentLanguageIndex][key];
        });
    }

    startGame() {
        // Hiển thị loading screen
        this.loadingScreen.show();

        const startTime = Date.now();
        const MIN_DURATION = 5000; // 5 giây
        let loaderProgress = 0;    // % nhận từ preloader

        // Timer để tăng tiến trình hiển thị mượt
        const progressTimer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const simulated = Math.min(100, (elapsed / MIN_DURATION) * 100);
            const percent = Math.max(simulated, loaderProgress);
            if (this.loadingScreen) {
                this.loadingScreen.setProgress(percent);
            }
            // Khi đã đạt 100% thì dừng timer
            if (percent >= 100) {
                clearInterval(progressTimer);
            }
        }, 30);

        // Cập nhật tiến trình dựa trên preloader
        resourcePreloader.addProgressListener((percent) => {
            loaderProgress = percent;
        });

        // Khi preload hoàn tất
        resourcePreloader.getLoadedPromise().then(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, MIN_DURATION - elapsed);

            // Sau khi kết thúc tối thiểu 5s, đảm bảo progress ở 100% và ẩn loading
            setTimeout(() => {
                // Đảm bảo đã fill đầy trước khi ẩn
                if (this.loadingScreen) {
                    this.loadingScreen.setProgress(100);
                    this.loadingScreen.hide();
                }
                clearInterval(progressTimer);
                // Đánh dấu đã bắt đầu game để enable Continue lần sau
                this.hasStartedGame = true;
                this.updateContinueButtonState();
                this._proceedStartGame();
            }, remaining);
        });
    }

    // Hàm thực thi phần còn lại của startGame sau khi preload xong
    _proceedStartGame() {
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
    }

    resetGame() {
        // Reset map về map đầu tiên
        this.game.currentMapId = 1;
        
        // Reset inventory trước
        this.game.inventory.clearItems();
        
        // Reset player position và camera sẽ tự động căn giữa theo player
        this.game.player.resetPosition();
        
        // Reset message manager với messages mới từ map
        this.game.messageManager = new MessageManager(this.game.map.getMessages());
        
        // Reset audio (nếu cần)
        this.game.audioManager.resetAudio();
        
        // Reset map items
        this.game.map.resetItems();
        
        // Camera sẽ tự động update thông qua game.start()
        this.game.updateCamera();
    }

    continueGame() {
        // Nếu người chơi CHƯA từng bấm New Game -> thoát luôn
        if (!this.hasStartedGame) {
            return;
        }

        // Thêm hiệu ứng fade-out cho menu
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
        // Tạo màn hình settings nếu chưa tồn tại
        if (!this.settingsScreen) {
            this.settingsScreen = document.createElement('div');
            this.settingsScreen.className = 'settings-screen';
            
            // Tạo nút đóng
            const closeButton = document.createElement('button');
            closeButton.className = 'credit-close';
            closeButton.addEventListener('click', () => {
                this.settingsScreen.classList.remove('show');
            });
            
            this.settingsScreen.appendChild(closeButton);
            this.game.gameWrapper.appendChild(this.settingsScreen);
        }
        
        // Xóa nội dung cũ để tránh trùng lặp khi mở lại
        this.settingsScreen.innerHTML = '';

        // Tạo nút đóng
        const closeButton = document.createElement('button');
        closeButton.className = 'credit-close';
        closeButton.addEventListener('click', () => {
            this.settingsScreen.classList.remove('show');
        });
        this.settingsScreen.appendChild(closeButton);

        // Tạo container cho nội dung cài đặt
        const settingsContent = document.createElement('div');
        settingsContent.className = 'settings-content';

        // 1. Ngôn ngữ - sử dụng translation
        settingsContent.appendChild(this.createOption(
            this.translations[this.currentLanguageIndex].language, 
            this.languages[this.currentLanguageIndex], 
            (direction) => this.toggleOption('language', direction)
        ));

        // 2. Hướng dẫn - sử dụng translation
        settingsContent.appendChild(this.createOption(
            this.translations[this.currentLanguageIndex].guide, 
            this.translations[this.currentLanguageIndex].guides[this.currentGuideIndex], 
            (direction) => this.toggleOption('guide', direction)
        ));

        // 3. Âm thanh (Slider) - sử dụng translation
        const soundOption = this.createSliderOption(this.translations[this.currentLanguageIndex].sound, 'sound');
        soundOption.classList.add('settings-option-sound-spacing');
        settingsContent.appendChild(soundOption);

        // 4. Hiệu ứng âm thanh (Slider) - sử dụng translation
        settingsContent.appendChild(this.createSliderOption(this.translations[this.currentLanguageIndex].soundEffects, 'sound-effects'));

        // 5. Độ nhạy (Slider) - sử dụng translation
        settingsContent.appendChild(this.createSliderOption(this.translations[this.currentLanguageIndex].sensitivity, 'sensitivity'));

        this.settingsScreen.appendChild(settingsContent);
        
        // Hiển thị màn hình settings
        this.settingsScreen.classList.add('show');
    }

    // Helper function để tạo option với mũi tên
    createOption(labelText, initialValue, onToggle) {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'settings-option';

        const label = document.createElement('span');
        label.className = 'settings-label';
        label.textContent = labelText;
        optionDiv.appendChild(label);

        const valueContainer = document.createElement('div');
        valueContainer.className = 'settings-value-container';
        
        const leftArrow = document.createElement('button');
        leftArrow.className = 'settings-arrow settings-arrow-left';
        leftArrow.innerHTML = '<img src="assets/images/setting/Setting2.png" class="arrow-icon"/>';
        leftArrow.addEventListener('click', () => onToggle('prev'));
        valueContainer.appendChild(leftArrow);

        const valueSpan = document.createElement('span');
        valueSpan.className = 'settings-value';
        valueSpan.textContent = initialValue;
        valueContainer.appendChild(valueSpan);

        const rightArrow = document.createElement('button');
        rightArrow.className = 'settings-arrow settings-arrow-right';
        rightArrow.innerHTML = '<img src="assets/images/setting/Setting2.png" class="arrow-icon flipped"/>';
        rightArrow.addEventListener('click', () => onToggle('next'));
        valueContainer.appendChild(rightArrow);

        optionDiv.appendChild(valueContainer);

        // Store a reference to the valueSpan for later updates
        optionDiv.valueSpan = valueSpan;

        return optionDiv;
    }

    // Updated toggleOption method để cập nhật UI khi đổi ngôn ngữ
    toggleOption(optionType, direction) {
        let currentIndex;
        let optionsArray;
        let valueSpan;

        if (optionType === 'language') {
            currentIndex = this.currentLanguageIndex;
            optionsArray = this.languages;
            valueSpan = this.settingsScreen.querySelector('.settings-option:nth-child(1) .settings-value');
        } else if (optionType === 'guide') {
            currentIndex = this.currentGuideIndex;
            optionsArray = this.translations[this.currentLanguageIndex].guides;
            valueSpan = this.settingsScreen.querySelector('.settings-option:nth-child(2) .settings-value');
        }

        if (!optionsArray || !valueSpan) return;

        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % optionsArray.length;
        } else if (direction === 'prev') {
            currentIndex = (currentIndex - 1 + optionsArray.length) % optionsArray.length;
        }

        // Cập nhật giá trị hiển thị
        valueSpan.textContent = optionsArray[currentIndex];

        // Lưu trạng thái mới
        if (optionType === 'language') {
            this.currentLanguageIndex = currentIndex;
            console.log(`Language set to: ${this.languages[this.currentLanguageIndex]}`);

            // Cập nhật lại ngôn ngữ menu + refresh Settings
            this.updateMenuLanguage();
            setTimeout(() => {
                this.settingsScreen.classList.remove('show');
                setTimeout(() => this.openSettings(), 100);
            }, 100);

        } else if (optionType === 'guide') {
            this.currentGuideIndex = currentIndex;
            console.log(`Guide set to: ${this.translations[this.currentLanguageIndex].guides[this.currentGuideIndex]}`);
        }
    }

    // Helper function để tạo slider option
    createSliderOption(labelText, sliderId) {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'settings-option';

        const label = document.createElement('span');
        label.className = 'settings-label';
        label.textContent = labelText;
        optionDiv.appendChild(label);

        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';

        const sliderTrack = document.createElement('div');
        sliderTrack.className = 'slider-track';
        sliderTrack.id = `slider-${sliderId}-track`;
        sliderTrack.style.backgroundImage = 'url("assets/images/setting/Setting1.png")';
        sliderContainer.appendChild(sliderTrack);

        const sliderThumb = document.createElement('div');
        sliderThumb.className = 'slider-thumb';
        sliderThumb.id = `slider-${sliderId}-thumb`;
        sliderThumb.style.backgroundImage = 'url("assets/images/setting/Setting3.png")';
        sliderContainer.appendChild(sliderThumb);

        optionDiv.appendChild(sliderContainer);

        // Thêm chức năng kéo cho slider
        let isDragging = false;
        let initialMouseX;
        let initialThumbX;

        sliderThumb.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Ngăn chặn hành vi mặc định (chọn văn bản)
            isDragging = true;
            initialMouseX = e.clientX;
            initialThumbX = sliderThumb.offsetLeft; // Vị trí hiện tại của thumb

            const onMouseMove = (moveEvent) => {
                if (!isDragging) return;

                const dx = moveEvent.clientX - initialMouseX;
                let newLeft = initialThumbX + dx;

                // Giới hạn nút kéo trong phạm vi track
                const trackWidth = sliderTrack.offsetWidth;
                const thumbWidth = sliderThumb.offsetWidth;

                // Trừ thumbWidth / 2 vì thumb được căn giữa bằng transformX(-50%)
                // Nên vị trí left của nó phải đi từ 0 đến trackWidth
                newLeft = Math.max(0, Math.min(newLeft, trackWidth));

                sliderThumb.style.left = `${(newLeft / trackWidth) * 100}%`;

                // TODO: Cập nhật giá trị setting tương ứng dựa trên vị trí slider
                // Ví dụ: const value = (newLeft / trackWidth) * 100;
                // console.log(`Slider ${sliderId}: ${value.toFixed(2)}%`);
            };

            const onMouseUp = () => {
                isDragging = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        // Thiết lập vị trí ban đầu của thumb (ví dụ: 50%)
        sliderThumb.style.left = '50%';

        return optionDiv;
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

    // Cập nhật trạng thái enable/disable nút Continue
    updateContinueButtonState() {
        if (!this.continueButton) return;

        if (this.hasStartedGame) {
            this.continueButton.disabled = false;
            this.continueButton.style.opacity = '1';
            this.continueButton.style.pointerEvents = 'auto';
        } else {
            this.continueButton.disabled = true;
            this.continueButton.style.opacity = '0.5';
            this.continueButton.style.pointerEvents = 'none';
        }
    }
} 
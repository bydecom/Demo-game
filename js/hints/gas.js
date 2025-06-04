import Hint from '../hint.js';

export default class Gas extends Hint {
    constructor(config) {
        super(config);
        this.currentStep = 1;
        this.maxSteps = 3;
        this.modalCreated = false;
        
        // Tạo item gas để thêm vào inventory sau khi hoàn thành
        this.gasItem = {
            id: 'gas_item',
            name: 'Bình gas',
            image: 'assets/images/items/gas_item.png',
            clickMessage: 'Bạn đã tìm thấy bình gas!'
        };
    }

    onClick() {
        if (!this.modalCreated) {
            this.createModal();
        }
        this.showModal();
    }

    createModal() {
        // Tạo overlay mờ
        this.overlay = document.createElement('div');
        this.overlay.className = 'hint-overlay';
        this.overlay.style.position = 'fixed';
        this.overlay.style.top = '0';
        this.overlay.style.left = '0';
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';
        this.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.overlay.style.display = 'none';
        this.overlay.style.justifyContent = 'center';
        this.overlay.style.alignItems = 'center';
        this.overlay.style.zIndex = '1000';

        // Tạo container cho hình ảnh hint
        this.hintContainer = document.createElement('div');
        this.hintContainer.className = 'hint-container';
        this.hintContainer.style.position = 'relative';
        this.hintContainer.style.maxWidth = '80%';
        this.hintContainer.style.maxHeight = '80%';

        // Tạo hình ảnh hint
        this.hintImage = document.createElement('img');
        this.hintImage.style.maxWidth = '100%';
        this.hintImage.style.maxHeight = '100%';
        this.hintImage.style.objectFit = 'contain';
        
        // Thêm sự kiện click cho hình ảnh
        this.hintImage.addEventListener('click', () => this.nextStep());

        // Tạo nút đóng
        this.closeButton = document.createElement('button');
        this.closeButton.className = 'hint-close-button';
        this.closeButton.style.position = 'absolute';
        this.closeButton.style.right = '10px';
        this.closeButton.style.top = '10px';
        this.closeButton.style.width = '70px';
        this.closeButton.style.height = '70px';
        this.closeButton.style.backgroundImage = "url('assets/images/button/exit.png')";
        this.closeButton.style.backgroundSize = 'contain';
        this.closeButton.style.backgroundPosition = 'center';
        this.closeButton.style.backgroundRepeat = 'no-repeat';
        this.closeButton.style.border = 'none';
        this.closeButton.style.backgroundColor = 'transparent';
        this.closeButton.addEventListener('click', () => this.hideModal());

        // Ghép các phần tử lại với nhau
        this.hintContainer.appendChild(this.hintImage);
        this.hintContainer.appendChild(this.closeButton);
        this.overlay.appendChild(this.hintContainer);
        document.body.appendChild(this.overlay);

        this.modalCreated = true;
    }

    showModal() {
        this.overlay.style.display = 'flex';
        this.updateHintImage();
    }

    hideModal() {
        this.overlay.style.display = 'none';
    }

    nextStep() {
        if (this.currentStep < this.maxSteps) {
            this.currentStep++;
            this.updateHintImage();
        } else if (this.currentStep === this.maxSteps) {
            // Thêm item vào inventory
            if (this.game.inventory) {
                const item = {
                    ...this.gasItem,
                    game: this.game
                };
                this.game.inventory.addItem(item);
            }
            
            // Hiển thị thông báo
            this.game.messageManager.showMessage(this.gasItem.clickMessage);
            
            // Phát âm thanh nhặt item
            if (this.game.audioManager) {
                this.game.audioManager.playItemSound();
            }
            
            // Ẩn modal
            this.hideModal();
            
            // // Ẩn hint bếp gas trên map
            // this.hide();
        }
    }

    updateHintImage() {
        this.hintImage.src = `assets/images/items/gas_hint${this.currentStep}.png`;
    }
} 
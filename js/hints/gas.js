import Hint from '../hint.js';

export default class Gas extends Hint {
    constructor(config) {
        super(config);
        this.currentStep = 1;
        this.modalCreated = false;
        this.gasInstalled = false;
        this.stoveReady = false;
    }

    onClick() {
        const targetX = this.x + this.width / 2;
        const distance = Math.abs(this.game.player.x - targetX);
        const THRESHOLD = 220;

        const openModal = () => {
            if (!this.modalCreated) {
                this.createModal();
            }
            if (this.gasInstalled) {
                this.currentStep = 2;
            } else {
                this.currentStep = 1;
            }
            this.showModal();
        };

        // Hủy waiter cũ để đảm bảo chỉ có một hành động đang chờ
        this.game.clearPendingWaiter();

        if (distance > THRESHOLD) {
            // Di chuyển tới bếp trước rồi mở modal
            this.game.player.moveToPosition(targetX);
            // Phát âm thanh bước chân khi di chuyển
            this.game.audioManager.playWalkSound();
            const waiter = setInterval(() => {
                if (!this.game.player.isMoving) {
                    this.game.clearPendingWaiter();
                    openModal();
                }
            }, 100);
            this.game.setPendingWaiter(waiter);
        } else {
            openModal();
        }
    }

    createModal() {
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

        this.hintContainer = document.createElement('div');
        this.hintContainer.className = 'hint-container';
        this.hintContainer.style.position = 'relative';
        this.hintContainer.style.maxWidth = '80%';
        this.hintContainer.style.maxHeight = '80%';

        this.hintImage = document.createElement('img');
        this.hintImage.style.maxWidth = '100%';
        this.hintImage.style.maxHeight = '100%';
        this.hintImage.style.objectFit = 'contain';
        this.hintImage.draggable = false;
        
        this.hintImage.addEventListener('click', () => this.nextStep());

        // Message text với class CSS chung
        this.messageLabel = document.createElement('div');
        this.messageLabel.className = 'modal-description-label';

        this.closeButton = document.createElement('button');
        this.closeButton.className = 'modal-close-btn';
        this.closeButton.addEventListener('click', () => this.hideModal());

        this.hintContainer.appendChild(this.hintImage);
        this.hintContainer.appendChild(this.messageLabel);
        this.hintContainer.appendChild(this.closeButton);
        this.overlay.appendChild(this.hintContainer);
        this.overlay.appendChild(this.messageLabel);
        document.body.appendChild(this.overlay);

        this.modalCreated = true;

        this.setupDragAndDrop();
    }

    showModal() {
        this.overlay.style.display = 'flex';
        this.updateHintImage();
    }

    hideModal() {
        this.overlay.style.display = 'none';
    }

    nextStep() {
        if (this.currentStep === 1) {
            this.currentStep = 3;
            this.updateHintImage();
        } else if (this.currentStep === 3) {
            this.messageLabel.textContent = this.getStepMessage();
        } else if (this.currentStep === 2) {
            this.currentStep = 4;
            this.stoveReady = true;
            this.updateHintImage();
        } else if (this.currentStep === 4) {
            this.currentStep = 2;
            this.stoveReady = false;
            this.updateHintImage();
        }
    }

    onGasTankDropped() {
        this.currentStep = 2;
        this.updateHintImage();
        this.gasInstalled = true;
        
        this.messageLabel.textContent = this.getStepMessage();
        
        if (this.game.audioManager) {
            this.game.audioManager.playItemSound();
        }
    }

    updateHintImage() {
        this.hintImage.src = `assets/images/items/gas_hint${this.currentStep}.png`;
        if (this.messageLabel) {
            this.messageLabel.textContent = this.getStepMessage();
        }
    }

    setupDragAndDrop() {
        this.hintContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.hintContainer.addEventListener('dragleave', () => {
            /* no visual border */
        });

        this.hintContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const itemId = e.dataTransfer.getData('text/plain');
            
            if (itemId === 'gas_tank' && this.currentStep === 3 && !this.gasInstalled) {
                this.onGasTankDropped();
                if (this.game.inventory) {
                    this.game.inventory.removeItem('gas_tank');
                }
            } else {
                this.game.messageManager.showMessage("Đây không phải là vật phẩm bạn cần hoặc không thể sử dụng ở đây.");
            }
        });
    }

    // Lấy thông điệp phù hợp theo bước
    getStepMessage() {
        switch (this.currentStep) {
            case 1:
                return "Một bếp gas cũ.";
            case 2:
                return "Bây giờ đóng nắp lại là có thể sử dụng được rồi.";
            case 3:
                return "Hình như nó không có bình ga!";
            case 4:
                return "Bếp đã sẵn sàng sử dụng!";
            default:
                return "";
        }
    }
} 
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

        if (distance > THRESHOLD) {
            // Di chuyển tới bếp trước rồi mở modal
            this.game.player.moveToPosition(targetX);
            // Phát âm thanh bước chân khi di chuyển
            this.game.audioManager.playWalkSound();
            const waiter = setInterval(() => {
                if (!this.game.player.isMoving) {
                    clearInterval(waiter);
                    openModal();
                }
            }, 100);
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

        // Message text bên trong modal
        this.messageLabel = document.createElement('div');
        this.messageLabel.style.color = 'white';
        this.messageLabel.style.fontSize = '24px';
        this.messageLabel.style.textAlign = 'center';
        Object.assign(this.messageLabel.style, {
            position: 'absolute',
            bottom: '3%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%'
        });

        this.closeButton = document.createElement('button');
        this.closeButton.className = 'hint-close-button';
        this.closeButton.style.position = 'absolute';
        this.closeButton.style.top = '60px';
        this.closeButton.style.left = '80%';
        this.closeButton.style.transform = 'translateX(-50%)';
        this.closeButton.style.width = '70px';
        this.closeButton.style.height = '70px';
        this.closeButton.style.backgroundImage = "url('assets/images/button/exit.png')";
        this.closeButton.style.backgroundSize = 'contain';
        this.closeButton.style.backgroundPosition = 'center';
        this.closeButton.style.backgroundRepeat = 'no-repeat';
        this.closeButton.style.border = 'none';
        this.closeButton.style.backgroundColor = 'transparent';
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
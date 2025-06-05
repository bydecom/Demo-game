import Hint from '../hint.js';

export default class Gas extends Hint {
    constructor(config) {
        super(config);
        this.currentStep = 1;
        this.modalCreated = false;
        this.gasInstalled = false;
    }

    onClick() {
        if (!this.modalCreated) {
            this.createModal();
        }
        if (this.gasInstalled) {
            this.currentStep = 2;
        } else {
            this.currentStep = 1;
        }
        this.showModal();
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
        
        this.hintImage.addEventListener('click', () => this.nextStep());

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

        this.hintContainer.appendChild(this.hintImage);
        this.hintContainer.appendChild(this.closeButton);
        this.overlay.appendChild(this.hintContainer);
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
            if (this.gasInstalled) {
                this.currentStep = 2;
            } else {
                this.currentStep = 3;
            }
            this.updateHintImage();
        } else if (this.currentStep === 3) {
            this.game.messageManager.showMessage("Hãy kéo bình gas vào bếp!");
        } else if (this.currentStep === 2) {
            this.currentStep = 1;
            this.updateHintImage();
        }
    }

    onGasTankDropped() {
        this.currentStep = 2;
        this.updateHintImage();
        this.gasInstalled = true;
        
        this.game.messageManager.showMessage("Bình ga đã được lắp vào bếp!");
        
        if (this.game.audioManager) {
            this.game.audioManager.playItemSound();
        }
    }

    updateHintImage() {
        this.hintImage.src = `assets/images/items/gas_hint${this.currentStep}.png`;
    }

    setupDragAndDrop() {
        this.hintContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (this.currentStep === 3 && !this.gasInstalled) {
                this.hintContainer.style.border = '2px dashed yellow';
            }
        });

        this.hintContainer.addEventListener('dragleave', () => {
            this.hintContainer.style.border = 'none';
        });

        this.hintContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            this.hintContainer.style.border = 'none';

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
} 
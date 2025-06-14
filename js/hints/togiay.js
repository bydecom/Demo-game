import Hint from '../hint.js';

export default class ToGiay extends Hint {
    constructor(config) {
        super(config);
        this.modalCreated = false;
        this.collected = false;
        this.descTexts = {
            pre: 'Cái gì thế này?',
            post: 'Những con số gì thế này?'
        };
    }

    /* -------------------------------------------------------------- */
    // Handle click on map sprite
    /* -------------------------------------------------------------- */
    onClick() {
        if (this.collected) return; // already picked up

        const targetX = this.x + this.width / 2;
        const distance = Math.abs(this.game.player.x - targetX);
        const THRESHOLD = 200;

        const open = () => {
            if (!this.modalCreated) this.createModal();
            this.showModal();
        };

        this.game.clearPendingWaiter();

        if (distance > THRESHOLD) {
            this.game.player.moveToPosition(targetX);
            this.game.audioManager.playWalkSound();
            const timer = setInterval(() => {
                if (!this.game.player.isMoving) {
                    this.game.clearPendingWaiter();
                    open();
                }
            }, 100);
            this.game.setPendingWaiter(timer);
        } else {
            open();
        }
    }

    /* -------------------------------------------------------------- */
    // Modal creation
    /* -------------------------------------------------------------- */
    createModal() {
        this.overlay = document.createElement('div');
        Object.assign(this.overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000'
        });
        this.overlay.className = 'hint-overlay';

        const container = document.createElement('div');
        container.style.position = 'relative';
        container.className = 'hint-container';

        this.paperImg = document.createElement('img');
        this.paperImg.src = 'assets/images/items/togiay/togiay_map.png';
        Object.assign(this.paperImg.style, {
            maxWidth: '600px',
            maxHeight: '600px',
            objectFit: 'contain',
            cursor: 'pointer'
        });
        this.paperImg.draggable = false;
        this.paperImg.addEventListener('click', () => this.onPaperClick());
        container.appendChild(this.paperImg);

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close-btn';
        closeBtn.addEventListener('click', () => this.hideModal());
        this.overlay.appendChild(closeBtn);

        // Description label
        this.desc = document.createElement('div');
        this.desc.className = 'modal-description-label';
        this.desc.textContent = this.collected ? this.descTexts.post : this.descTexts.pre;
        this.desc.style.display='block';
        this.overlay.appendChild(this.desc);

        this.overlay.appendChild(container);
        document.body.appendChild(this.overlay);
        this.modalCreated = true;
    }

    showModal() {
        if (this.overlay) {
            this.desc.textContent = this.collected ? this.descTexts.post : this.descTexts.pre;
            this.overlay.style.display = 'flex';
        }
    }

    hideModal() {
        if (this.overlay) this.overlay.style.display = 'none';
    }

    onPaperClick() {
        if (!this.collected) {
            this.collectPaper();
        } else {
            // toggle to content image if already collected
            this.paperImg.src = 'assets/images/items/togiay/togiay_noidung.png';
            this.desc.textContent = this.descTexts.post;
            this.desc.style.display = 'block';
        }
    }

    collectPaper() {
        this.collected = true;
        // Change image to content in modal
        this.paperImg.src = 'assets/images/items/togiay/togiay_noidung.png';
        this.desc.textContent = this.descTexts.post;
        this.desc.style.display = 'block';

        // Notify inventory
        const item = {
            id: 'togiay',
            name: 'Tờ giấy',
            image: 'assets/images/items/togiay/togiay_map.png',
            backgroundSize: 'contain',
            onClick: () => {
                // create modal if not present
                if (!this.modalCreated) this.createModal();
                this.paperImg.src = 'assets/images/items/togiay/togiay_noidung.png';
                this.showModal();
            }
        };
        this.game.inventory.addItem(item);
        this.game.audioManager.playItemSound();

        // Remove sprite from map
        this.remove();
    }
} 
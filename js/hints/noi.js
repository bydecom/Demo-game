import Hint from '../hint.js';

export default class Noi extends Hint {
    constructor(config) {
        super(config);
        this.modalCreated = false;
    }

    onClick() {
        const targetX = this.x + this.width / 2;
        const distance = Math.abs(this.game.player.x - targetX);
        const THRESHOLD = 200;

        const open = () => {
            if (!this.modalCreated) {
                this.createModal();
            }
            this.showModal();
        };

        if (distance > THRESHOLD) {
            this.game.player.moveToPosition(targetX);
            const timer = setInterval(() => {
                if (!this.game.player.isMoving) {
                    clearInterval(timer);
                    open();
                }
            }, 100);
        } else {
            open();
        }
    }

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

        const img = document.createElement('img');
        img.src = 'assets/images/items/noi/1.png';
        img.style.maxWidth = '90%';
        img.style.maxHeight = '90%';
        img.style.objectFit = 'contain';
        container.appendChild(img);

        const closeBtn = document.createElement('button');
        Object.assign(closeBtn.style, {
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '70px',
            height: '70px',
            backgroundImage: "url('assets/images/button/exit.png')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer'
        });
        closeBtn.addEventListener('click', () => this.hideModal());
        container.appendChild(closeBtn);

        this.overlay.appendChild(container);
        document.body.appendChild(this.overlay);
        this.modalCreated = true;
    }

    showModal() {
        this.overlay.style.display = 'flex';
    }

    hideModal() {
        if (this.overlay) this.overlay.style.display = 'none';
    }
} 
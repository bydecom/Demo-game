import Hint from '../hint.js';
import SnakeGame from './snake.js';

export default class MayTinh extends Hint {
    constructor(config) {
        super(config);
        this.modalCreated = false;
        this.snakeGame = null;
        // Front overlay image (optional)
        this.frontImage = config.frontImage;
        this.frontOffsetX = config.frontOffsetX || 0;
        this.frontOffsetY = config.frontOffsetY || 0;
        this.frontWidth = config.frontWidth || this.width;
        this.frontHeight = config.frontHeight || this.height;

        if (this.frontImage) {
            this.createFrontOverlay();
        }
    }

    /* -------------------------------------------------------------- */
    // Handle click
    /* -------------------------------------------------------------- */
    onClick() {
        const targetX = this.x + this.width / 2;
        const distance = Math.abs(this.game.player.x - targetX);
        const THRESHOLD = 220;

        const openModal = () => {
            if (!this.modalCreated) {
                this.createModal();
            }
            this.showModal();
        };

        this.game.clearPendingWaiter();

        if (distance > THRESHOLD) {
            this.game.player.moveToPosition(targetX);
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

    /* -------------------------------------------------------------- */
    // Modal creation
    /* -------------------------------------------------------------- */
    createModal() {
        // Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'hint-overlay';
        Object.assign(this.overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'none',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000'
        });

        // Container
        this.hintContainer = document.createElement('div');
        this.hintContainer.className = 'hint-container';
        Object.assign(this.hintContainer.style, {
            position: 'relative',
            width: '60%',            /* nhỏ hơn để không che màn */
            maxWidth: '600px',      /* giới hạn tối đa */
            maxHeight: '600px',
            height: 'auto'
        });

        // Image of computer (màn hình ngoài)
        this.hintImage = document.createElement('img');
        this.hintImage.src = 'assets/images/items/maychu/manhinhmaytinhtat.png'; // Có thể thay đổi thành ảnh máy tính khác
        Object.assign(this.hintImage.style, {
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            position: 'relative'    
        });
        this.hintImage.draggable = false;

        // Canvas container (màn hình game bên trong)
        this.canvasContainer = document.createElement('div');
        Object.assign(this.canvasContainer.style, {
            position: 'absolute',
            top: '7.7%',
            left: '7.5%',
            width: '84%',
            height: '61%',
            backgroundColor: 'rgb(0, 0, 0)',
            border: '2px solid rgb(102, 102, 102)',
            borderRadius: '5px',
            overflow: 'hidden'
        });

        // Canvas cho game Snake
        this.gameCanvas = document.createElement('canvas');
        Object.assign(this.gameCanvas.style, {
            width: '100%',
            height: '100%',
            display: 'block'
        });

        // Message label
        this.messageLabel = document.createElement('div');
        this.messageLabel.textContent = 'Máy tính cũ với game Snake cổ điển. Sử dụng WASD hoặc mũi tên để chơi!';
        Object.assign(this.messageLabel.style, {
            position: 'absolute',
            bottom: '3%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            color: 'white',
            fontSize: '18px',
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '10px',
            borderRadius: '5px'
        });

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close-btn';
        closeBtn.addEventListener('click', () => this.hideModal());

        // Assemble
        this.canvasContainer.appendChild(this.gameCanvas);
        this.hintContainer.appendChild(this.hintImage);
        this.hintContainer.appendChild(this.canvasContainer);
        this.hintContainer.appendChild(this.messageLabel);
        this.overlay.appendChild(this.hintContainer);
        this.overlay.appendChild(closeBtn);
        document.body.appendChild(this.overlay);

        this.modalCreated = true;
    }

    /* -------------------------------------------------------------- */
    // Modal show/hide
    /* -------------------------------------------------------------- */
    showModal() {
        if (this.overlay) {
            this.overlay.style.display = 'flex';
            
            // Khởi tạo game Snake khi mở modal
            if (!this.snakeGame && this.gameCanvas) {
                // Tính toán kích thước canvas dựa trên container
                const containerRect = this.canvasContainer.getBoundingClientRect();
                const width = Math.floor(containerRect.width * 0.9);  // 90% của container
                const height = Math.floor(containerRect.height * 0.9);
                
                this.snakeGame = new SnakeGame(this.gameCanvas, width, height);
            }
        }
    }

    hideModal() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
            
            // Dừng game khi đóng modal (tùy chọn)
            if (this.snakeGame) {
                this.snakeGame.destroy();
                this.snakeGame = null;
            }
        }
    }

    createFrontOverlay() {
        this.frontElement = document.createElement('div');
        Object.assign(this.frontElement.style, {
            position:'absolute',
            left:`${this.x + this.frontOffsetX}px`,
            top:`${this.y + this.frontOffsetY}px`,
            width:`${this.frontWidth}px`,
            height:`${this.frontHeight}px`,
            backgroundImage:`url('${this.frontImage}')`,
            backgroundSize:'contain',
            backgroundRepeat:'no-repeat',
            pointerEvents:'none',
            zIndex:'2'
        });
        this.game.gameContainer.appendChild(this.frontElement);
    }
} 
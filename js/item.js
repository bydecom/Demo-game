export default class Item {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.x = config.x;
        this.y = config.y;
        this.width = config.width || 100;
        this.height = config.height || 100;
        this.image = config.image;
        this.inventoryImage = config.inventoryImage;
        this.clickMessage = config.clickMessage || `Bạn đã nhặt ${this.name}`;
        this.description = config.description || this.clickMessage;
        this.isCollected = false;
        this.game = config.game;
        
        // Tạo element cho item
        this.element = document.createElement('div');
        this.element.className = 'game-item';
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.element.style.backgroundImage = `url('${this.image}')`;
        
        // Thêm item vào game container
        this.game.gameContainer.appendChild(this.element);
        
        // Thêm sự kiện click
        this.element.addEventListener('click', (e) => {
            e.stopPropagation();

            // Tính vị trí trung tâm item
            const targetX = this.x + this.width / 2;
            const distance = Math.abs(this.game.player.x - targetX);
            const THRESHOLD = 180; // Khoảng cách đủ gần để nhặt

            const openInteraction = () => {
                // Hiển thị modal phóng to
                this.showPreviewModal();
            };

            if (distance > THRESHOLD) {
                // Di chuyển nhân vật tới item trước
                this.game.player.moveToPosition(targetX);

                // Chờ nhân vật tới nơi rồi mới mở modal
                const waitId = setInterval(() => {
                    if (!this.game.player.isMoving) {
                        clearInterval(waitId);
                        openInteraction();
                    }
                }, 100);
            } else {
                openInteraction();
            }
        });

        // Modal state
        this.modalCreated = false;

        // Cấu hình cho modal phóng to
        this.modalWidth = config.modalWidth; // số px
        this.modalHeight = config.modalHeight;
        this.modalDescription = config.modalDescription || this.name;
    }
    
    collect() {
        if (!this.isCollected) {
            // Đánh dấu đã thu thập
            this.isCollected = true;
            
            // Hiệu ứng thu thập
            this.element.classList.add('item-collected');
            
            // Hiển thị thông báo
            this.game.messageManager.showMessage(this.clickMessage);
            
            // Phát âm thanh (nếu có)
            if (this.game.audioManager.playItemSound) {
                this.game.audioManager.playItemSound();
            }
            
            // Thêm item vào inventory
            this.game.inventory.addItem(this);
            
            // Xóa item khỏi màn hình sau animation
            setTimeout(() => {
                this.element.remove();
            }, 500);
        }
    }
    
    reset() {
        // Đặt lại trạng thái
        this.isCollected = false;
        
        // Tạo lại element nếu đã bị xóa
        if (!this.element.parentNode) {
            this.element.classList.remove('item-collected');
            this.game.gameContainer.appendChild(this.element);
        }
    }

    // Tạo và hiển thị modal xem trước item
    showPreviewModal() {
        if (!this.modalCreated) {
            this.createPreviewModal();
        }
        this.overlay.style.display = 'flex';
    }

    createPreviewModal() {
        // Overlay
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

        const container = document.createElement('div');
        Object.assign(container.style, {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: this.modalWidth ? this.modalWidth + 'px' : 'auto',
            height: this.modalHeight ? this.modalHeight + 'px' : 'auto',
            padding: '20px'
        });

        const img = document.createElement('img');
        Object.assign(img.style, {
            maxWidth: '90%',
            maxHeight: '90%',
            objectFit: 'contain',
            margin: 'auto'
        });
        img.src = this.inventoryImage || this.image;
        img.draggable = false;
        container.appendChild(img);

        // Description text cố định dưới màn
        const desc = document.createElement('div');
        desc.textContent = this.modalDescription;
        Object.assign(desc.style, {
            position: 'absolute',
            bottom: '3%',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            fontSize: '24px',
            textAlign: 'center',
            width: '80%'
        });
        this.overlay.appendChild(desc);

        // Click on container to collect
        container.addEventListener('click', (e) => {
            e.stopPropagation();
            // Play sound
            const audio = new Audio('assets/audio/get-item.mp3');
            audio.play();
            this.overlay.style.display = 'none';
            this.collect();
        });

        this.overlay.appendChild(container);
        document.body.appendChild(this.overlay);
        this.modalCreated = true;
    }
} 
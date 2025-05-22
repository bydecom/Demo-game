export default class Item {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.x = config.x;
        this.y = config.y;
        this.width = config.width || 100;
        this.height = config.height || 100;
        this.image = config.image;
        this.clickMessage = config.clickMessage || `Bạn đã nhặt ${this.name}`;
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
            // Ngăn chặn sự kiện click tiếp tục lan truyền đến game container
            e.stopPropagation();
            this.collect();
        });
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
} 
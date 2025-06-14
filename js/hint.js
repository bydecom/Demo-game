export default class Hint {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.x = config.x;
        this.y = config.y;
        this.width = config.width || 100;
        this.height = config.height || 100;
        this.image = config.image;
        this.game = config.game;
        
        // Tạo element cho hint
        this.element = document.createElement('div');
        this.element.className = 'game-item';
        
        // Thiết lập style giống như Item
        this.element.style.position = 'absolute';
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.element.style.backgroundImage = `url('${this.image}')`;
        this.element.style.backgroundSize = 'contain';
        this.element.style.backgroundRepeat = 'no-repeat';
        this.element.style.zIndex = '1';
        
        // Thêm hint vào game container
        this.game.gameContainer.appendChild(this.element);
        
        // Thêm sự kiện click
        this.element.addEventListener('click', (e) => {
            // Ngăn chặn sự kiện click tiếp tục lan truyền
            e.stopPropagation();

            // Bỏ qua click nếu nhân vật đang di chuyển để tránh mở modal sớm
            if (this.game.player.isMoving) return;
            this.onClick();
        });

        // Thêm hover effect để hiển thị tên hint
        this.element.addEventListener('mouseover', () => {
            this.game.messageManager.showMessage(this.name);
        });
    }

    // Phương thức ảo - sẽ được override bởi các class con
    onClick() {
        console.log('Base hint click - override this method');
    }

    // Phương thức để xóa hint khỏi màn hình
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.remove();
        }
    }

    // Phương thức để hiển thị lại hint
    show() {
        if (!this.element.parentNode) {
            this.game.gameContainer.appendChild(this.element);
        }
    }

    // Phương thức để ẩn hint (không xóa)
    hide() {
        this.element.style.display = 'none';
    }

    // Phương thức để hiện hint
    unhide() {
        this.element.style.display = 'block';
    }
} 
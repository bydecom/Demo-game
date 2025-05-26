import Item from './item.js';

export default class Map {
    constructor(id, game) {
        this.id = 7; // Luôn là map 7
        this.game = game;
        this.gameContainer = document.getElementById('game-container');
        this.gameWrapper = document.getElementById('game-wrapper');
        this.mapData = this.getMapData();
        this.items = [];
        
        // Áp dụng thuộc tính map
        this.applyMapProperties();
        
        // Tạo các item cho map
        this.createItems();
    }
    
    getMapData(id) {
        // Chỉ giữ lại map 7 làm map mặc định
        return {
            width: 7680,
            height: 2160,
            backgroundImage: 'assets/canh7.png',
            playerStartX: 7680/2,
            playerStartY: 2160 / 2 + 300,
            boundaries: {
                left: 0,
                right: 7680
            },
            messages: [
                "Chào mừng bạn đến với game!",
                "Hãy khám phá thế giới này!",
                "Bạn có thể tìm thấy nhiều điều thú vị!",
                "Hãy thu thập các vật phẩm!",
                "Chúc bạn chơi game vui vẻ!"
            ],
            items: [
                {
                    id: 'computer',
                    name: 'máy tính',
                    x: 5457,
                    y: 657,
                    width: 1402,
                    height: 1362,
                    image: 'assets/images/items/computer.png',
                    clickMessage: 'Bạn đã tìm thấy máy tính! Đây là một báu vật quý giá.'
                },
                {
                    id: 'sword1',
                    name: 'Thanh kiếm huyền thoại',
                    x: 1500,
                    y: 1400,
                    width: 120,
                    height: 150,
                    image: 'assets/images/items/computer.png',
                    clickMessage: 'Thanh kiếm huyền thoại! Người ta đồn rằng nó từng thuộc về một anh hùng vĩ đại.'
                }
            ]
        };
    }
    
    applyMapProperties() {
        // Thiết lập thuộc tính CSS cho container
        this.gameContainer.style.width = `${this.mapData.width}px`;
        this.gameContainer.style.height = `${this.mapData.height}px`;
        this.gameContainer.style.backgroundImage = `url('${this.mapData.backgroundImage}')`;
    }
    
    createItems() {
        // Xóa items cũ nếu có
        this.clearItems();
        
        // Tạo các items mới từ map data
        if (this.mapData.items && this.mapData.items.length > 0) {
            this.mapData.items.forEach(itemData => {
                // Kiểm tra xem item đã được thu thập chưa
                if (!this.game.inventory || !this.game.inventory.hasItem(itemData.id)) {
                    const item = new Item({
                        ...itemData,
                        game: this.game
                    });
                    this.items.push(item);
                }
            });
        }
    }
    
    resetItems() {
        // Xóa items cũ
        this.clearItems();
        
        // Tạo lại items từ map data
        this.createItems();
    }
    
    clearItems() {
        // Xóa tất cả các items hiện có khỏi DOM
        this.items.forEach(item => {
            if (item.element && item.element.parentNode) {
                item.element.remove();
            }
        });
        
        // Đặt lại mảng items
        this.items = [];
    }
    
    getWidth() {
        return this.mapData.width;
    }
    
    getHeight() {
        return this.mapData.height;
    }
    
    getPlayerStartX() {
        return this.mapData.playerStartX;
    }
    
    getPlayerStartY() {
        return this.mapData.playerStartY;
    }
    
    getBoundaries() {
        return this.mapData.boundaries;
    }
    
    getMessages() {
        return this.mapData.messages;
    }
} 
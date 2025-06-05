import Computer from './hints/computer.js';
import Gas from './hints/gas.js';
import Item from './item.js';

export default class Map {
    constructor(id, game) {
        this.id = 7; // Luôn là map 7
        this.game = game;
        this.gameContainer = document.getElementById('game-container');
        this.gameWrapper = document.getElementById('game-wrapper');
        this.mapData = this.getMapData();
        this.items = [];
        this.hints = [];
        
        // Áp dụng thuộc tính map
        this.applyMapProperties();
        
        // Tạo các item và hint cho map
        this.createItems();
        this.createHints();
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
                "Bạn có thể tìm thấy nhiều manh mối và vật phẩm thú vị!",
                "Hãy thu thập vật phẩm và giải mã các bí ẩn!",
                "Chúc bạn chơi game vui vẻ!"
            ],
            items: [
                
                {
                    id: 'gas_tank',
                    name: 'Bình ga',
                    x: 3050,
                    y: 1700,
                    width: 100,
                    height: 250,
                    image: 'assets/images/items/gas_item.png',
                    clickMessage: 'Một bình ga cũ. Có lẽ nó vẫn còn dùng được.'
                }
            ],
            hints: [
                {
                    id: 'computer',
                    type: 'Computer',
                    name: 'Máy tính bí ẩn',
                    x: 5450,
                    y: 650,
                    width: 1402,
                    height: 1362,
                    image: 'assets/images/items/computer.png'
                },
                {
                    id: 'gas',
                    type: 'Gas',
                    name: 'Bếp gas cũ',
                    x: 5130,
                    y: 920,
                    width: 353,
                    height: 243,
                    image: 'assets/images/items/ga_map.png'
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
    
    createHints() {
        // Xóa hints cũ nếu có
        this.clearHints();
        
        // Tạo các hints mới từ map data
        if (this.mapData.hints && this.mapData.hints.length > 0) {
            this.mapData.hints.forEach(hintData => {
                let hint;
                switch(hintData.type) {
                    case 'Computer':
                        hint = new Computer({
                            ...hintData,
                            game: this.game
                        });
                        break;
                    case 'Gas':
                        hint = new Gas({
                            ...hintData,
                            game: this.game
                        });
                        break;
                    default:
                        console.warn(`Unknown hint type: ${hintData.type}`);
                        return;
                }
                this.hints.push(hint);
            });
        }
    }
    
    resetItems() {
        // Xóa items cũ
        this.clearItems();
        
        // Tạo lại items từ map data
        this.createItems();
    }
    
    resetHints() {
        // Xóa hints cũ
        this.clearHints();
        
        // Tạo lại hints từ map data
        this.createHints();
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
    
    clearHints() {
        // Xóa tất cả các hints hiện có khỏi DOM
        this.hints.forEach(hint => {
            if (hint.element && hint.element.parentNode) {
                hint.element.remove();
            }
        });
        
        // Đặt lại mảng hints
        this.hints = [];
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
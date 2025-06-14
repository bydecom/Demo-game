import Computer from './hints/computer.js';
import Gas from './hints/gas.js';
import Noi from './hints/noi.js';
import Item from './item.js';
import NPC from './hints/npc.js';
import MayChu from './hints/maychu.js';
import MayTinh from './hints/maytinh.js';
import ToGiay from './hints/togiay.js';
import ThungGiay from './hints/thunggiay.js';
import ChuTiem from './hints/chutiem.js';

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
            playerStartY: 2160 / 2 + 350,
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
                    clickMessage: 'Bạn đã nhặt được một bình ga.',
                    modalWidth: 600,
                    modalHeight: 400,
                    modalDescription: 'Một bình ga cũ. Có lẽ nó vẫn còn dùng được.'
                },
                {
                    id: 'noodle_pack',
                    name: 'Gói mì',
                    x: 4080,
                    y: 950,
                    width: 120,
                    height: 120,
                    image: 'assets/images/items/mi.png',
                    clickMessage: 'Bạn đã nhặt được một gói mì.',
                    modalWidth: 600,
                    modalHeight: 400,
                    modalDescription: 'Một gói mì tôm thơm ngon.'
                },
                {
                    id: 'to_mi',
                    name: 'Tô mì',
                    x: 5295,
                    y: 1245,
                    width: 174,
                    height: 136,
                    image: 'assets/images/items/tomi_map.png',
                    inventoryImage: 'assets/images/items/tomi_inventory.png',
                    clickMessage: 'Bạn đã nhặt được một tô mì.',
                    modalWidth: 600,
                    modalHeight: 400,
                    modalDescription: 'Một tô mì trống để đựng mì.'
                }
            ],
            hints: [
                // {
                //     id: 'computer',
                //     type: 'Computer',
                //     name: 'Máy tính bí ẩn',
                //     x: 5450,
                //     y: 650,
                //     width: 1402,
                //     height: 1362,
                //     image: 'assets/images/items/computer.png'
                // },
                {
                    id: 'gas',
                    type: 'Gas',
                    name: 'Bếp gas mini',
                    x: 5195,
                    y: 1020,
                    width: 276,
                    height: 148,
                    image: 'assets/images/items/bep.png'
                },
                {
                    id: 'noi',
                    type: 'noi',
                    name: 'Nồi nấu nước',
                    x: 5142,
                    y: 930,
                    width: 276,
                    height: 148,
                    image: 'assets/images/items/noi_map.png'
                },
                {
                    id: 'thungda',
                    type: 'ThungDa',
                    name: 'Thùng đá',
                    x: 3577,
                    y: 1240,
                    width: 585,
                    height: 595,
                    image: 'assets/images/items/thungda/1.png'
                },
                {
                    id: 'thunggiay',
                    type: 'ThungGiay',
                    name: 'Thùng giấy',
                    x: 3145,
                    y: 1208,
                    width: 424,
                    height: 215,
                    image: 'assets/images/items/hopmatma/thungcarton.png'
                },
                {
                    id: 'chutiem',
                    type: 'ChuTiem',
                    name: 'Chủ Tiệm',
                    x: 6500,
                    y: 850,
                    width: 580,
                    height: 1162,
                    frames: [
                        'assets/images/npc/1.png',
                        'assets/images/npc/2.png',
                        'assets/images/npc/3.png',
                        'assets/images/npc/4.png'
                    ],
                    frameInterval: 300
                },
                {
                    id: 'maytinh_may3',
                    type: 'MayTinh',
                    name: 'Máy tính số 3',
                    x: 1295,
                    y: 955,
                    width: 502,
                    height: 387,
                    image: 'assets/images/items/may3/iconmay.png',
                    frontImage: 'assets/images/items/may3/ghetua.png',
                    frontOffsetX: 171,
                    frontOffsetY: 249,
                    frontWidth: 344,
                    frontHeight: 739
                },
                {
                    id: 'maychu',
                    type: 'MayChu',
                    name: 'Máy chủ',
                    x: 5923,
                    y: 820,
                    width: 447,
                    height: 369,
                    image: 'assets/images/items/maychu/maychu.png'
                },
                {
                    id: 'togiay',
                    type: 'ToGiay',
                    name: 'Tờ giấy',
                    x: 1200,
                    y: 1800,
                    width: 120,
                    height: 80,
                    image: 'assets/images/items/togiay/togiay_map.png'
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
            this.mapData.hints.forEach(async hintData => {
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
                    case 'ThungDa':
                    case 'thungda':
                        hint = new (await import('./hints/thungda.js')).default({
                            ...hintData,
                            game: this.game
                        });
                        break;
                    case 'Noi':
                    case 'noi':
                        hint = new Noi({
                            ...hintData,
                            game: this.game
                        });
                        break;
                    case 'ChuTiem':
                    case 'chutiem':
                        hint = new ChuTiem({
                            ...hintData,
                            game: this.game
                        });
                        break;
                    case 'NPC':
                    case 'npc':
                        hint = new NPC({
                            ...hintData,
                            game: this.game
                        });
                        break;
                    case 'MayTinh':
                    case 'maytinh':
                        hint = new MayTinh({
                            ...hintData,
                            game: this.game
                        });
                        break;
                    case 'MayChu':
                    case 'maychu':
                        hint = new MayChu({
                            ...hintData,
                            game: this.game
                        });
                        break;
                    case 'ToGiay':
                    case 'togiay':
                        hint = new ToGiay({
                            ...hintData,
                            game: this.game
                        });
                        // Ẩn tờ giấy cho tới khi cutscene 1 hoàn tất
                        if(!this.game.castScene1Finished){
                            hint.hide();
                        }
                        break;
                    case 'ThungGiay':
                    case 'thunggiay':
                        hint = new ThungGiay({
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

    // Hiện hint theo id (sau khi được mở khoá)
    showHintById(hintId){
        const hint = this.hints.find(h=>h.id === hintId);
        if(hint){
            hint.unhide();
        }
    }
} 
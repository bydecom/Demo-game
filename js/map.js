import Item from './item.js';

export default class Map {
    constructor(id, game) {
        this.id = id;
        this.game = game;
        this.gameContainer = document.getElementById('game-container');
        this.gameWrapper = document.getElementById('game-wrapper');
        this.mapData = this.getMapData(id);
        this.items = [];
        
        // Áp dụng thuộc tính map
        this.applyMapProperties();
        
        // Tạo các item cho map
        this.createItems();
        
        // Tạo menu map
        this.createMapMenu();
    }
    
    getMapData(id) {
        const maps = {
            // Map 1 - Mặc định
            1: {
                width: 5746,
                height: 2160,
                backgroundImage: 'assets/images/background2.jpg',
                playerStartX: 5746 / 2,
                playerStartY: 2160 / 2 + 300,
                boundaries: {
                    left: 0,
                    right: 5746
                },
                messages: [
                    "Đến đây rồi!",
                    "Tôi đang di chuyển!",
                    "Thật thú vị!",
                    "Đi đến đó!",
                    "Chỗ này trông đẹp đấy!"
                ],
                items: [
                    {
                        id: 'key1',
                        name: 'Chìa khóa vàng',
                        x: 1000,
                        y: 1500,
                        width: 80,
                        height: 80,
                        image: 'assets/images/items/key.png',
                        clickMessage: 'Bạn đã nhặt được Chìa khóa vàng!'
                    },
                    {
                        id: 'scroll1',
                        name: 'Cuộn giấy cổ',
                        x: 4000,
                        y: 1400,
                        width: 60,
                        height: 100,
                        image: 'assets/images/items/scroll.png',
                        clickMessage: 'Bạn đã tìm thấy một cuộn giấy cổ với những ghi chú bí ẩn!'
                    }
                ]
            },
            // Map 2
            2: {
                width: 7680,
                height: 2160,
                backgroundImage: 'assets/images/background.jpg',
                playerStartX: 7680/2,
                playerStartY: 2160 / 2 + 400,
                boundaries: {
                    left: 0,
                    right: 7680
                },
                messages: [
                    "Map thứ 2!",
                    "Phong cảnh đẹp quá!",
                    "Cùng khám phá nào!",
                    "Chỗ này là đâu nhỉ?",
                    "Tuyệt vời!"
                ],
                items: [
                    {
                        id: 'gem1',
                        name: 'Viên ngọc xanh',
                        x: 2500,
                        y: 1300,
                        width: 70,
                        height: 70,
                        image: 'assets/images/items/gem-blue.png',
                        clickMessage: 'Bạn đã nhặt được Viên ngọc xanh! Nó lấp lánh ánh sáng kỳ diệu.'
                    },
                    {
                        id: 'map1',
                        name: 'Bản đồ cổ',
                        x: 5800,
                        y: 1500,
                        width: 120,
                        height: 90,
                        image: 'assets/images/items/map.png',
                        clickMessage: 'Một bản đồ cổ! Có vẻ như nó chỉ đường đến một kho báu.'
                    },
                    {
                        id: 'potion1',
                        name: 'Bình thuốc đỏ',
                        x: 1200,
                        y: 1600,
                        width: 50,
                        height: 80,
                        image: 'assets/images/items/potion-red.png',
                        clickMessage: 'Bạn đã nhặt được Bình thuốc đỏ! Dùng trong trường hợp khẩn cấp.'
                    }
                ]
            },
            // Map 3
            3: {
                width: 7680,
                height: 2160,
                backgroundImage: 'assets/images/background3.jpg',
                playerStartX: 7680/2,
                playerStartY: 2160 / 2 + 250,
                boundaries: {
                    left: 0,
                    right: 7680
                },
                messages: [
                    "Map cuối cùng!",
                    "Đây là nơi thú vị!",
                    "Hành trình kết thúc!",
                    "Cảnh đẹp quá!",
                    "Thật tuyệt vời!"
                ],
                items: [
                    {
                        id: 'crown1',
                        name: 'Vương miện hoàng gia',
                        x: 3800,
                        y: 1200,
                        width: 100,
                        height: 100,
                        image: 'assets/images/items/crown.png',
                        clickMessage: 'Bạn đã tìm thấy Vương miện hoàng gia! Đây là một báu vật quý giá.'
                    },
                    {
                        id: 'sword1',
                        name: 'Thanh kiếm huyền thoại',
                        x: 1500,
                        y: 1400,
                        width: 120,
                        height: 150,
                        image: 'assets/images/items/sword.png',
                        clickMessage: 'Thanh kiếm huyền thoại! Người ta đồn rằng nó từng thuộc về một anh hùng vĩ đại.'
                    }
                ]
            }
        };
        
        return maps[id] || maps[1]; // Mặc định trả về map 1 nếu id không tồn tại
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
    
    createMapControls() {
        // Tạo UI điều khiển chuyển map
        const mapControls = document.createElement('div');
        mapControls.className = 'map-controls';
        
        for (let i = 1; i <= 3; i++) {
            const button = document.createElement('button');
            button.textContent = `Map ${i}`;
            button.addEventListener('click', (e) => {
                // Ngăn chặn sự kiện click lan truyền đến game container
                e.stopPropagation();
                this.changeMap(i);
            });
            mapControls.appendChild(button);
        }
        
        this.gameWrapper.appendChild(mapControls);
    }
    
    createMapMenu() {
        // Tạo nút map menu
        const mapButton = document.createElement('button');
        mapButton.className = 'audio-control map-menu-button';
        mapButton.textContent = '🗺️';
        mapButton.style.left = '80px'; // Đặt bên phải nút âm thanh
        
        // Tạo dropdown menu
        const mapDropdown = document.createElement('div');
        mapDropdown.className = 'map-dropdown';
        
        // Tạo các mục menu cho từng map
        for (let i = 1; i <= 3; i++) {
            const mapItem = document.createElement('button');
            mapItem.className = 'map-item';
            mapItem.textContent = `Map ${i}`;
            mapItem.addEventListener('click', (e) => {
                e.stopPropagation(); // Ngăn lan truyền sự kiện
                this.changeMap(i);
                mapDropdown.classList.remove('show'); // Đóng dropdown sau khi chọn
            });
            mapDropdown.appendChild(mapItem);
        }
        
        // Thêm sự kiện click để hiện/ẩn dropdown
        mapButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Ngăn click lan truyền đến game wrapper
            mapDropdown.classList.toggle('show');
        });
        
        // Đóng dropdown khi click ra ngoài
        document.addEventListener('click', () => {
            mapDropdown.classList.remove('show');
        });
        
        // Thêm các phần tử vào DOM
        mapButton.appendChild(mapDropdown);
        this.gameWrapper.appendChild(mapButton);
    }
    
    changeMap(mapId) {
        if (this.id !== mapId) {
            this.game.changeMap(mapId);
        }
    }
} 
import Player from './player.js';
import EventHandler from './event.js';
import AudioManager from './audio.js';
import MessageManager from './message.js';
import Map from './map.js';
import Inventory from './inventory.js';

export default class Game {
    constructor() {
        this.gameWrapper = document.getElementById('game-wrapper');
        this.gameContainer = document.getElementById('game-container');
        this.scale = window.innerHeight / 2160;
        this.currentScrollX = 0;
        this.currentMapId = 1; // Bắt đầu với map 1
        
        // Khởi tạo các manager
        this.eventHandler = new EventHandler();
        this.audioManager = new AudioManager();
        
        // Khởi tạo inventory trước khi tạo map và items
        this.inventory = new Inventory(this);
        
        // Khởi tạo map
        this.map = new Map(this.currentMapId, this);
        
        // Khởi tạo message manager với messages từ map
        this.messageManager = new MessageManager(this.map.getMessages());
        
        // Khởi tạo player
        this.player = new Player(this);
        
        // Thiết lập scale ban đầu
        this.gameContainer.style.transformOrigin = 'left top';
        this.gameContainer.style.transform = `scale(${this.scale})`;
        
        // Khởi tạo các event listener
        this.initEventListeners();
        
        this.cameraAnimationId = null;
    }
    
    initEventListeners() {
        // Click để di chuyển
        this.gameWrapper.addEventListener('click', (event) => {
            // Nếu nhân vật đang di chuyển thì bỏ qua click
            if (this.player.isMoving) {
                return;
            }
            
            // Kiểm tra xem click có trúng vào item không
            // Nếu trúng item, event sẽ được xử lý trong item và không lan truyền đến đây
            // Nếu không trúng item, nhân vật sẽ di chuyển
            const clickX = (event.clientX / this.scale) + this.currentScrollX;
            this.player.moveToPosition(clickX);
            this.audioManager.playWalkSound();
        });
        
        // Xử lý resize màn hình
        window.addEventListener('resize', () => {
            this.scale = window.innerHeight / 2160;
            this.updateCamera();
        });
    }
    
    updateCamera() {
        const viewWidth = window.innerWidth / this.scale;
        
        // Tính toán vị trí camera để nhân vật luôn ở giữa màn hình
        const offsetX = this.player.x - viewWidth / 2;
        const mapWidth = this.map.getWidth();
        
        // Giới hạn camera để không vượt quá rìa map
        this.currentScrollX = Math.max(0, Math.min(offsetX, mapWidth - viewWidth));
        
        // Áp dụng transform ngay lập tức để camera theo kịp nhân vật
        this.gameContainer.style.transform = `scale(${this.scale}) translateX(${-this.currentScrollX}px)`;
    }
    
    changeMap(mapId) {
        // Lưu vị trí cuộn hiện tại
        this.currentMapId = mapId;
        
        // Tạo map mới
        this.map = new Map(mapId, this);
        
        // Cập nhật messages
        this.messageManager.updateMessages(this.map.getMessages());
        
        // Cập nhật vị trí player với cả X và Y
        this.player.resetPosition(
            this.map.getPlayerStartX(), 
            this.map.getPlayerStartY()
        );
        
        // Cập nhật camera
        this.updateCamera();
        
        // Hiển thị thông báo chuyển map
        this.messageManager.showMessage(`Đã chuyển đến Map ${mapId}`);
    }
    
    start() {
        this.messageManager.showInitialMessage();
        this.updateCamera();
    }
    
    // Phương thức mới để cập nhật hiển thị UI khi nhân vật đang di chuyển
    updateMovingState(isMoving) {
        if (isMoving) {
            this.gameWrapper.classList.add('character-moving');
        } else {
            this.gameWrapper.classList.remove('character-moving');
        }
    }
    
    startCameraTracking() {
        // Hủy animation frame cũ nếu có
        if (this.cameraAnimationId) {
            cancelAnimationFrame(this.cameraAnimationId);
        }
        
        // Thêm transition để camera di chuyển mượt mà
        this.gameContainer.style.transition = 'none';
        
        // Hàm cập nhật camera theo thời gian thực
        const updateCameraPosition = () => {
            this.updateCamera();
            this.cameraAnimationId = requestAnimationFrame(updateCameraPosition);
        };
        
        // Bắt đầu animation
        this.cameraAnimationId = requestAnimationFrame(updateCameraPosition);
    }
    
    stopCameraTracking() {
        // Dừng animation frame khi không cần thiết
        if (this.cameraAnimationId) {
            cancelAnimationFrame(this.cameraAnimationId);
            this.cameraAnimationId = null;
        }
        
        // Cập nhật camera lần cuối cùng
        this.updateCamera();
    }
    
    updateCameraToPlayerPosition(playerX) {
        const viewWidth = window.innerWidth / this.scale;
        
        // Tính toán vị trí camera để nhân vật luôn ở giữa màn hình
        const offsetX = playerX - viewWidth / 2;
        const mapWidth = this.map.getWidth();
        
        // Giới hạn camera để không vượt quá rìa map
        this.currentScrollX = Math.max(0, Math.min(offsetX, mapWidth - viewWidth));
        
        // Áp dụng transform không có transition để camera di chuyển cùng nhân vật
        this.gameContainer.style.transform = `scale(${this.scale}) translateX(${-this.currentScrollX}px)`;
    }
} 
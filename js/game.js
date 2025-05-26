import Player from './player.js';
import EventHandler from './event.js';
import AudioManager from './audio.js';
import MessageManager from './message.js';
import Map from './map.js';
import Inventory from './inventory.js';
import Menu from './menu.js';

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
        
        // Khởi tạo menu
        this.menu = new Menu(this);
        
        // Tạo nút back
        this.createBackButton();
        
        // Thêm biến để lưu trữ event listener
        this.clickHandler = null;
        
        // Khởi tạo các event listener
        this.initEventListeners();
        
        this.cameraAnimationId = null;
    }
    
    initEventListeners() {
        // Tạo handler function và lưu lại để có thể remove sau này
        this.clickHandler = (event) => {
            // Nếu nhân vật đang di chuyển thì bỏ qua click
            if (this.player.isMoving) {
                return;
            }
            
            // Kiểm tra xem click có trúng vào item không
            const clickX = (event.clientX / this.scale) + this.currentScrollX;
            this.player.moveToPosition(clickX);
            this.audioManager.playWalkSound();
        };

        // Không attach event listener ngay lập tức
        // Sẽ được attach khi game bắt đầu
        
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
        // Đảm bảo game container được hiển thị
        this.gameContainer.style.display = 'block';
        
        // Reset và khởi tạo lại các thành phần cần thiết
        this.resetGameState();
        
        // Cập nhật camera và hiển thị message
        this.updateCamera();
        
        this.messageManager.showInitialMessage();
        
        // Hiển thị nút back
        const backButton = document.querySelector('.game-back-button');
        if (backButton) {
            backButton.style.display = 'block';
        }
        
        // Thêm phương thức để enable click events
        this.enableGameEvents();
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
    
    createBackButton() {
        let backButton = document.querySelector('.game-back-button');
        
        if (!backButton) {
            backButton = document.createElement('button');
            backButton.className = 'game-back-button';
            
            backButton.addEventListener('click', () => {
                // Ẩn nút back
                backButton.style.display = 'none';
                
                // Tắt event listeners của game
                this.disableGameEvents();
                
                // Ẩn game container
                this.gameContainer.style.display = 'none';
                
                // Hiển thị lại menu
                this.menu.menuElement.style.display = 'flex';
                this.menu.menuElement.style.opacity = '1';
            });
            
            this.gameWrapper.appendChild(backButton);
        }
        
        backButton.style.display = 'block';
    }
    
    // Thêm phương thức mới để reset game state
    resetGameState() {
        // Reset map về map đầu tiên
        this.currentMapId = 7;
        
        // Reset inventory
        if (this.inventory) {
            this.inventory.clearItems();
        }
        
        // Reset message manager
        if (this.messageManager) {
            this.messageManager = new MessageManager(this.map.getMessages());
        }

        // Reset player position với animation tắt
        if (this.player) {
            this.player.element.style.transition = 'none';
            this.player.resetPosition();
            // Force a reflow để đảm bảo transition được reset
            this.player.element.offsetHeight;
            // Bật lại animation sau khi đã đặt vị trí
            this.player.element.style.transition = 'left 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
        }

        // Reset map items
        this.map.resetItems();

        // Reset camera position
        this.currentScrollX = 0;
        this.gameContainer.style.transition = 'none';
        this.gameContainer.style.transform = `translate3d(0px, 0px, 0) scale(${this.scale})`;
        // Force a reflow để đảm bảo transform được áp dụng ngay lập tức
        this.gameContainer.offsetHeight;
        // Bật lại animation cho camera
        this.gameContainer.style.transition = 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
    }
    
    // Thêm phương thức để enable click events
    enableGameEvents() {
        this.gameWrapper.addEventListener('click', this.clickHandler);
    }
    
    // Thêm phương thức để disable click events
    disableGameEvents() {
        this.gameWrapper.removeEventListener('click', this.clickHandler);
    }
} 
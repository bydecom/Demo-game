export default class Player {
    constructor(game) {
        this.game = game;
        this.element = document.getElementById('character');
        this.width = 685;
        this.height = 1400;
        
        // Lấy vị trí bắt đầu từ map hiện tại
        this.x = this.game.map.getPlayerStartX();
        this.y = this.game.map.getPlayerStartY();
        
        this.lastDirection = 'left';
        this.isMoving = false;
        this.targetX = 0; // Vị trí đích khi di chuyển
        this.currentX = 0; // Vị trí hiện tại trong quá trình di chuyển
        this.animationFrameId = null; // ID của requestAnimationFrame
        this.animationTimeout = null; // ID của setTimeout
        this.transitionEndHandler = null; // Handler cho sự kiện transitionend
        this.footstepInterval = null; // interval cho sound bước chân
        this.currentWalkFrame = 0;
        
        // Thiết lập vị trí ban đầu
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        // Khởi tạo animation mặc định
        this.element.style.backgroundImage = "url('assets/images/move/00.png')";
        
        // Bỏ điều khiển bàn phím
        // this.initKeyboardControls();
    }
    
    initKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            // Nếu nhân vật đang di chuyển thì bỏ qua phím điều khiển
            if (this.isMoving) {
                return;
            }
            
            // Điều chỉnh bước di chuyển cho phù hợp với tốc độ cố định
            const step = 900; // Tăng bước di chuyển để phù hợp với animation dài hơn
            const oldX = this.x;
            const oldDirection = this.lastDirection;
            
            switch(event.key) {
                case 'ArrowLeft':
                    this.lastDirection = 'left';
                    this.moveToPosition(this.x - step);
                    break;
                case 'ArrowRight':
                    this.lastDirection = 'right';
                    this.moveToPosition(this.x + step);
                    break;
            }
            
            if (oldX !== this.x) {
                this.game.audioManager.playWalkSound();
            }
        });
    }
    
    // Reset nhân vật về vị trí (x,y). Nếu không cung cấp, dùng vị trí bắt đầu của map.
    resetPosition(x, y) {
        if (typeof x !== 'number') {
            x = this.game.map.getPlayerStartX();
        }
        if (typeof y !== 'number') {
            y = this.game.map.getPlayerStartY();
        }

        // Lưu lại toạ độ
        this.x = x;
        this.y = y;
        
        // Cập nhật style
        this.element.style.transition = 'none';
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        // Reset các trạng thái khác
        this.isMoving = false;
        this.element.classList.remove('is-moving');
        this.stopAnimation();
        
        // Khôi phục transition sau khi đã đặt vị trí
        setTimeout(() => {
            this.element.style.transition = 'left 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
        }, 10);
    }
    
    moveToPosition(targetX) {
        if (this.isMoving) {
            // Nếu đang di chuyển, hủy tác vụ timeout trước đó
            if (this.animationTimeout) {
                clearTimeout(this.animationTimeout);
            }
            
            // Hủy animation frame nếu đang chạy
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            
            // Xóa event listener transitionend nếu có
            this.element.removeEventListener('transitionend', this.transitionEndHandler);
        }
        
        this.isMoving = true;
        
        // Thêm class để cho biết nhân vật đang di chuyển
        this.element.classList.add('is-moving');
        
        // Cập nhật trạng thái di chuyển trong game
        this.game.updateMovingState(true);
        
        const oldX = this.x;
        const characterHalfWidth = this.width / 2;
        
        // Lấy giới hạn từ map hiện tại
        const boundaries = this.game.map.getBoundaries();
        
        // Giới hạn trong phạm vi map
        this.x = Math.max(
            boundaries.left + characterHalfWidth, 
            Math.min(boundaries.right - characterHalfWidth, targetX)
        );
        
        // Xác định hướng di chuyển dựa trên vị trí mới
        const isMovingRight = this.x > oldX;
        this.lastDirection = isMovingRight ? 'right' : 'left';
        
        // Tính khoảng cách di chuyển để xác định thời gian
        const distance = Math.abs(this.x - oldX);
        
        // Nếu khoảng cách quá nhỏ hoặc bằng 0, không cần di chuyển
        if (distance < 10) {
            this.stopMovement();
            return;
        }
        
        // Lưu vị trí đích để kiểm tra
        this.targetX = this.x;
        
        // Cập nhật thời gian di chuyển (tốc độ cố định)
        const FIXED_SPEED = 1000; // px/giây
        const duration = distance / FIXED_SPEED;
        
        // Đặt transition với tốc độ cố định
        this.element.style.transition = `left ${duration}s linear`;
        
        // Đặt animation trước khi di chuyển
        this.startAnimation();
        
        // Thiết lập sự kiện transitionend để dừng animation khi kết thúc transition
        this.transitionEndHandler = this.handleTransitionEnd.bind(this);
        this.element.addEventListener('transitionend', this.transitionEndHandler);
        
        // Đặt vị trí hiện tại ban đầu
        this.currentX = oldX;
        
        // Bắt đầu theo dõi vị trí nhân vật để cập nhật camera
        this.trackPlayerMovement();
        
        // Di chuyển nhân vật
        this.element.style.left = this.x + 'px';
        
        // Thiết lập timeout dự phòng (để đảm bảo animation sẽ dừng nếu sự kiện transitionend không kích hoạt)
        const timeoutDuration = (duration * 1000) + 100;
        this.animationTimeout = setTimeout(() => {
            if (this.isMoving) {
                console.log("Animation timeout reached - backup stop");
                this.stopMovement();
            }
        }, timeoutDuration);
    }
    
    // Thêm phương thức mới để xử lý sự kiện transitionend
    handleTransitionEnd(event) {
        // Chỉ xử lý sự kiện transition trên thuộc tính left
        if (event.propertyName === 'left') {
            console.log("Transition ended naturally");
            this.stopMovement();
            
            // Xóa event listener sau khi đã sử dụng
            this.element.removeEventListener('transitionend', this.transitionEndHandler);
        }
    }
    
    // Phương thức mới để dừng mọi hoạt động di chuyển ngay lập tức
    stopMovement() {
        this.stopAnimation();
        this.isMoving = false;
        this.element.classList.remove('is-moving');
        this.game.updateMovingState(false);
        // Dừng âm thanh bước chân ngay
        this.game.audioManager.stopWalkLoop();
        
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
            this.animationTimeout = null;
        }
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Xóa event listener transitionend nếu có
        this.element.removeEventListener('transitionend', this.transitionEndHandler);
        
        // Dừng transition đang thực hiện và đặt nhân vật đúng vị trí đích
        this.element.style.transition = 'none';
        this.element.style.left = this.targetX + 'px'; // Đảm bảo nhân vật ở đúng vị trí đích
        
        // Cập nhật camera lần cuối cùng với vị trí cuối cùng của nhân vật
        this.game.updateCameraToPlayerPosition(this.targetX);
        
        // Khôi phục transition sau một khoảng thời gian ngắn
        setTimeout(() => {
            this.element.style.transition = 'left 0.5s linear';
        }, 10);
    }
    
    startAnimation() {
        this.element.classList.remove('moving-left', 'moving-right', 'walking-left', 'walking-right');
        if (this.lastDirection === 'right') {
            this.element.classList.add('moving-right', 'walking-right');
        } else {
            this.element.classList.add('moving-left', 'walking-left');
        }
        if (this.footstepInterval) clearInterval(this.footstepInterval);
        this.footstepInterval = setInterval(() => {
            this.game.audioManager.playWalkSound();
        }, 1500); // 1 bước mỗi 0.5s, đúng nhịp 2 bước/chu kỳ 1s
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

    
    stopAnimation() {
        // Xóa các class walking
        this.element.classList.remove('walking-left', 'walking-right');
        // Dừng interval bước chân
        if (this.footstepInterval) {
            clearInterval(this.footstepInterval);
            this.footstepInterval = null;
        }
        // Giữ class direction và set ảnh tĩnh theo hướng cuối cùng
        if (this.lastDirection === 'right') {
            this.element.style.backgroundImage = "url('assets/images/move/00.png')";
        } else {
            this.element.style.backgroundImage = "url('assets/images/move/00.png')";
        }
    }

    trackPlayerMovement() {
        // Kiểm tra vị trí hiện tại của nhân vật
        const computedStyle = window.getComputedStyle(this.element);
        const currentLeft = parseFloat(computedStyle.left);
        
        // Cập nhật vị trí hiện tại
        this.currentX = currentLeft;
        
        // Cập nhật camera theo vị trí hiện tại của nhân vật
        this.game.updateCameraToPlayerPosition(this.currentX);
        
        // Tiếp tục theo dõi nếu nhân vật đang di chuyển
        if (this.isMoving) {
            this.animationFrameId = requestAnimationFrame(() => this.trackPlayerMovement());
        }
    }
} 
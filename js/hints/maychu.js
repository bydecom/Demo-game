import Hint from '../hint.js';
import MatKhau from './matkhau.js';

export default class MayChu extends Hint {
    constructor(config) {
        super(config);
        this.modalCreated = false;
        this.computerOpened = false; // Trạng thái máy tính (đóng/mở)
        this.passwordScreen = null;
    }

    /* -------------------------------------------------------------- */
    // Handle click
    /* -------------------------------------------------------------- */
    onClick() {
        const targetX = this.x + this.width / 2;
        const distance = Math.abs(this.game.player.x - targetX);
        const THRESHOLD = 220;

        const openModal = () => {
            if (!this.modalCreated) {
                this.createModal();
            }
            this.showModal();
        };

        // Huỷ waiter cũ để tránh mở nhiều modal
        this.game.clearPendingWaiter();

        if (distance > THRESHOLD) {
            this.game.player.moveToPosition(targetX);
            this.game.audioManager.playWalkSound();
            const waiter = setInterval(() => {
                if (!this.game.player.isMoving) {
                    this.game.clearPendingWaiter();
                    openModal();
                }
            }, 100);
            this.game.setPendingWaiter(waiter);
        } else {
            openModal();
        }
    }

    /* -------------------------------------------------------------- */
    // Modal creation
    /* -------------------------------------------------------------- */
    createModal() {
        // Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'hint-overlay';
        Object.assign(this.overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'none',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000'
        });

        // Container
        this.hintContainer = document.createElement('div');
        this.hintContainer.className = 'hint-container';
        Object.assign(this.hintContainer.style, {
            position: 'relative',
            width: '70%',
            maxWidth: '600px',
            maxHeight: '600px',
            height: 'auto'
        });

        // Image of server screen (màn hình máy tính)
        this.hintImage = document.createElement('img');
        this.hintImage.src = 'assets/images/items/maychu/manhinhmaytinhtat.png';
        Object.assign(this.hintImage.style, {
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            position: 'relative'
        });
        this.hintImage.draggable = false;

        // Computer power button
        this.powerButton = document.createElement('img');
        this.powerButton.src = 'assets/images/items/maychu/nutmaytinh.png';
        Object.assign(this.powerButton.style, {
            position: 'absolute',
            width: '15px',
            height: '15px',
            cursor: 'pointer',
            // Điều chỉnh vị trí nút dựa trên hình ảnh máy tính
            bottom: '20%',
            left: '49.8%',
            zIndex: '2'
        });
        this.powerButton.draggable = false;
        this.powerButton.addEventListener('click', () => this.toggleComputer());

        // Password screen container (giống canvas container trong maytinh.js)
        this.passwordContainer = document.createElement('div');
        Object.assign(this.passwordContainer.style, {
            position: 'absolute',
            top: '7.7%',
            left: '7.5%',
            width: '84%',
            height: '61%',
            backgroundColor: 'rgb(0, 0, 0)',
            border: '2px solid rgb(102, 102, 102)',
            borderRadius: '5px',
            overflow: 'hidden',
            display: 'none' // Ẩn ban đầu
        });

        // Canvas cho màn hình nhập mật khẩu
        this.passwordCanvas = document.createElement('canvas');
        Object.assign(this.passwordCanvas.style, {
            width: '100%',
            height: '100%',
            display: 'block'
        });

        // Message label với class CSS chung
        this.messageLabel = document.createElement('div');
        this.messageLabel.className = 'modal-description-label';
        this.messageLabel.textContent = 'Một máy chủ cũ kĩ. Nhấn nút nguồn để khởi động.';

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close-btn';
        closeBtn.addEventListener('click', () => this.hideModal());

        // Assemble
        this.passwordContainer.appendChild(this.passwordCanvas);
        this.hintContainer.appendChild(this.hintImage);
        this.hintContainer.appendChild(this.powerButton);
        this.hintContainer.appendChild(this.passwordContainer);
        this.overlay.appendChild(this.hintContainer);
        this.overlay.appendChild(this.messageLabel);
        this.overlay.appendChild(closeBtn);
        document.body.appendChild(this.overlay);

        this.modalCreated = true;
    }

    /* -------------------------------------------------------------- */
    // Computer toggle function
    /* -------------------------------------------------------------- */
    toggleComputer() {
        if (!this.computerOpened) {
            // Mở máy tính - hiển thị màn hình nhập mật khẩu
            this.computerOpened = true;
            this.hintImage.src = 'assets/images/items/maychu/manhinhmaytinhmo.png';
            this.messageLabel.textContent = 'Máy tính đã khởi động. Nhập mật khẩu để truy cập.';
            
            // Ẩn nút nguồn và hiển thị màn hình mật khẩu
            this.powerButton.style.display = 'none';
            this.passwordContainer.style.display = 'block';
            
            // Khởi tạo màn hình nhập mật khẩu
            if (!this.passwordScreen) {
                // Tính toán kích thước canvas dựa trên container
                const containerRect = this.passwordContainer.getBoundingClientRect();
                const width = Math.floor(containerRect.width * 0.9);
                const height = Math.floor(containerRect.height * 0.9);
                
                this.passwordScreen = new MatKhau(this.passwordCanvas, width, height);
                
                // Callback khi nhập đúng mật khẩu
                this.passwordScreen.setOnUnlock(() => {
                    this.onPasswordUnlock();
                });

                // Callback khi nhập sai mật khẩu
                this.passwordScreen.setOnError(() => {
                    this.messageLabel.textContent = 'Sai mật khẩu! Thử lại.';
                });
            }
            
            // Phát âm thanh khởi động
            if (this.game.audioManager) {
                this.game.audioManager.playItemSound();
            }
            
        } else {
            // Tắt máy tính
            this.computerOpened = false;
            this.hintImage.src = 'assets/images/items/maychu/manhinhmaytinhtat.png';
            this.messageLabel.textContent = 'Máy tính đã được tắt.';
            this.powerButton.style.display = 'block';
            this.passwordContainer.style.display = 'none';
            
            // Dọn dẹp màn hình mật khẩu
            if (this.passwordScreen) {
                this.passwordScreen.destroy();
                this.passwordScreen = null;
            }
        }
    }

    /* -------------------------------------------------------------- */
    // Password unlock callback
    /* -------------------------------------------------------------- */
    onPasswordUnlock() {
        this.messageLabel.textContent = 'Đăng nhập thành công! Hệ thống đã sẵn sàng.';
        
        // Phát âm thanh thành công
        if (this.game.audioManager) {
            this.game.audioManager.playItemSound();
        }
        
        // TODO: Thêm các chức năng khác sau khi đăng nhập thành công
        console.log('Hệ thống máy chủ đã được mở khóa!');
        
        // Có thể ẩn màn hình mật khẩu và hiển thị desktop hoặc ứng dụng khác
        setTimeout(() => {
            this.passwordContainer.style.display = 'none';
            this.messageLabel.textContent = 'Hệ thống đã sẵn sàng sử dụng.';
        }, 2000);
    }

    /* -------------------------------------------------------------- */
    // Modal show/hide
    /* -------------------------------------------------------------- */
    showModal() {
        if (this.overlay) {
            this.overlay.style.display = 'flex';
            
            // Cập nhật trạng thái hiển thị
            if (this.computerOpened) {
                this.hintImage.src = 'assets/images/items/maychu/manhinhmaytinhmo.png';
                this.powerButton.style.display = 'none';
                this.passwordContainer.style.display = 'block';
                
                if (this.passwordScreen && this.passwordScreen.isUnlocked) {
                    this.messageLabel.textContent = 'Hệ thống đã sẵn sàng sử dụng.';
                } else {
                    this.messageLabel.textContent = 'Máy tính đang hoạt động. Nhập mật khẩu để truy cập.';
                }
            } else {
                this.hintImage.src = 'assets/images/items/maychu/manhinhmaytinhtat.png';
                this.messageLabel.textContent = 'Một máy chủ cũ kĩ. Nhấn nút nguồn để khởi động.';
                this.powerButton.style.display = 'block';
                this.passwordContainer.style.display = 'none';
            }
        }
    }

    hideModal() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
            
            // Dọn dẹp màn hình mật khẩu khi đóng modal
            if (this.passwordScreen) {
                this.passwordScreen.destroy();
                this.passwordScreen = null;
            }
        }
    }
} 
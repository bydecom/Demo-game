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
            zIndex: '2',
            hover: 'brightness(1.1)'
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

        // Desktop screen (ẩn ban đầu)
        this.desktopScreen = document.createElement('div');
        Object.assign(this.desktopScreen.style, {
            width: '100%',
            height: '100%',
            backgroundImage: "url('assets/images/items/maychu/background.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'none',
            position: 'relative'
        });

        // Icon trên desktop
        const desktopIcon = document.createElement('img');
        desktopIcon.src = 'assets/images/items/maychu/icon.png';
        Object.assign(desktopIcon.style, {
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '60px',
            height: '60px',
            objectFit: 'contain',
            cursor: 'pointer'
        });
        desktopIcon.addEventListener('click', () => this.onDesktopIconClick());

        this.desktopScreen.appendChild(desktopIcon);

        // -------- Manager screen (ẩn ban đầu) ---------
        this.managerScreen = document.createElement('div');
        Object.assign(this.managerScreen.style, {
            position: 'absolute',
            top: '5%',
            left: '5%',
            width: '90%',
            height: '90%',
            backgroundColor: 'rgba(236,233,216,0.95)', // giống màu XP
            border: '2px solid #000',
            display: 'none',
            padding: '20px',
            boxSizing: 'border-box'
        });

        // Title bar for manager
        const mgrTitle = document.createElement('div');
        mgrTitle.textContent = 'Trình quản lý máy chủ';
        Object.assign(mgrTitle.style, {
            fontWeight: 'bold',
            fontSize: '18px',
            marginBottom: '10px'
        });
        this.managerScreen.appendChild(mgrTitle);

        // Grid container for 4 computers
        const grid = document.createElement('div');
        Object.assign(grid.style, {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '12px',
            width: '100%',
            height: 'calc(100% - 30px)'
        });

        this.computerStates = [];
        for (let i = 1; i <= 4; i++) {
            // wrapper
            const cell = document.createElement('div');
            Object.assign(cell.style, {
                backgroundColor: '#f1f1f1',
                border: '2px solid #ccc',
                position: 'relative',
                padding: '6px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                fontSize: '12px'
            });

            // header
            const header = document.createElement('div');
            header.textContent = `Computer ${i}`;
            Object.assign(header.style, { fontWeight: 'bold', marginBottom: '4px', fontSize:'14px' });

            const statusDot = document.createElement('span');
            Object.assign(statusDot.style, {
                width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'red', display: 'inline-block', marginLeft: '8px'
            });
            header.appendChild(statusDot);

            // screen div
            const screen = document.createElement('div');
            Object.assign(screen.style, {
                flex: '1',
                backgroundColor: '#000',
                backgroundImage: 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid #666'
            });

            // button
            const btn = document.createElement('button');
            btn.textContent = 'Turn On';
            Object.assign(btn.style, { marginTop: '4px', alignSelf: 'flex-end', fontSize:'12px', padding:'2px 10px' });

            btn.addEventListener('click', () => this.toggleComputerState(i));

            cell.appendChild(header);
            cell.appendChild(screen);
            cell.appendChild(btn);
            grid.appendChild(cell);

            this.computerStates[i] = { on: false, screen, statusDot, btn };
        }

        this.managerScreen.appendChild(grid);
        this.desktopScreen.appendChild(this.managerScreen);
        this.passwordContainer.appendChild(this.desktopScreen);

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
            this.initPasswordScreen();
            
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
    // Helper to (re)create password screen
    /* -------------------------------------------------------------- */
    initPasswordScreen() {
        if (this.passwordScreen) return;
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

    /* -------------------------------------------------------------- */
    // Password unlock callback
    /* -------------------------------------------------------------- */
    onPasswordUnlock() {
        this.messageLabel.textContent = 'Đăng nhập thành công!';
        
        // Ẩn canvas nhập mật khẩu, hiển thị desktop
        this.passwordCanvas.style.display = 'none';
        if (this.desktopScreen) {
            this.desktopScreen.style.display = 'block';
        }
        
        // Phát âm thanh thành công
        if (this.game.audioManager) {
            this.game.audioManager.playItemSound();
        }
        
        // Cập nhật label
        this.messageLabel.textContent = 'Hệ thống đã sẵn sàng sử dụng.';
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
                
                if (!this.passwordScreen) {
                    this.initPasswordScreen();
                    // Đảm bảo hiển thị đúng thành phần UI
                    this.passwordCanvas.style.display = 'block';
                    if (this.desktopScreen) {
                        this.desktopScreen.style.display = 'none';
                    }
                }
                
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
            
            // Giữ lại passwordScreen để người chơi có thể tiếp tục nhập sau khi mở lại
            // Nếu muốn giải phóng tài nguyên hoàn toàn, hãy tắt máy tính (toggleComputer) thay vì chỉ đóng modal.
            // (Đoạn mã cũ đã huỷ passwordScreen ở đây đã được loại bỏ.)
        }
    }

    /* -------------------------------------------------------------- */
    // Desktop icon click (placeholder for next event)
    /* -------------------------------------------------------------- */
    onDesktopIconClick() {
        // Ẩn icon và hiển thị managerScreen
        if (this.desktopScreen) {
            const icon = this.desktopScreen.querySelector('img');
            if (icon) icon.style.display = 'none';
            this.managerScreen.style.display = 'block';
        }
        this.messageLabel.textContent = 'Quản lý máy chủ';
    }

    toggleComputerState(i) {
        const computer = this.computerStates[i];
        if (!computer.on) {
            computer.on = true;
            computer.statusDot.style.backgroundColor = 'green';
            computer.screen.style.backgroundColor = 'transparent';
            computer.screen.style.backgroundImage = "url('assets/images/items/maychu/background.jpg')";
            computer.btn.textContent = 'Turn Off';
            if(i===3){ this.game.machine3Powered = true; }
        } else {
            computer.on = false;
            computer.statusDot.style.backgroundColor = 'red';
            computer.screen.style.backgroundColor = '#000';
            computer.screen.style.backgroundImage = 'none';
            computer.btn.textContent = 'Turn On';
            if(i===3){ this.game.machine3Powered = false; }
        }
    }
} 
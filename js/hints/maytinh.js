import Hint from '../hint.js';
import SnakeGame from './snake.js';
import CastScene1 from '../castscene1.js';

export default class MayTinh extends Hint {
    constructor(config) {
        super(config);
        this.modalCreated = false;
        this.snakeGame = null;
        this.castSceneStarted = false; // Flag cho cảnh kết
        this.cutscenePlayed = false; // Sau khi nhật ký đã được nhặt
        // Front overlay image (optional)
        this.frontImage = config.frontImage;
        this.frontOffsetX = config.frontOffsetX || 0;
        this.frontOffsetY = config.frontOffsetY || 0;
        this.frontWidth = config.frontWidth || this.width;
        this.frontHeight = config.frontHeight || this.height;

        // Heartbeat audio
        this.heartbeatAudio = new Audio('assets/audio/heartbeat.mp3');
        this.heartbeatAudio.loop = true;
        this.heartbeatAudio.volume = 0; // start silent

        if (this.frontImage) {
            this.createFrontOverlay();
        }
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
            width: '60%',            /* nhỏ hơn để không che màn */
            maxWidth: '600px',      /* giới hạn tối đa */
            maxHeight: '600px',
            height: 'auto',
            marginBottom: '40px',
            marginLeft: '75px'
        });

        // Image of computer (màn hình ngoài)
        this.hintImage = document.createElement('img');
        this.hintImage.src = 'assets/images/items/may3/manhinhmaytinhdong.png'; // Có thể thay đổi thành ảnh máy tính khác
        Object.assign(this.hintImage.style, {
            width: '90%',
            height: 'auto',
            objectFit: 'contain',
            position: 'relative'    
        });
        this.hintImage.draggable = false;

        // Canvas container (màn hình game bên trong)
        this.canvasContainer = document.createElement('div');
        Object.assign(this.canvasContainer.style, {
            position: 'absolute',
            top: '6.7%',
            left: '8.7%',
            width: '72%',
            height: '58.5%',
            backgroundColor: 'rgb(0, 0, 0)',
            border: '2px solid rgb(102, 102, 102)',
            borderRadius: '5px',
            overflow: 'hidden',
            display: 'block'
        });

        // Canvas cho game Snake
        this.gameCanvas = document.createElement('canvas');
        Object.assign(this.gameCanvas.style, {
            width: '100%',
            height: '100%',
            display: 'none'            // ẩn ban đầu, chỉ hiện khi nhấn icon
        });

        // Desktop screen (ẩn ban đầu)
        this.desktopScreen = document.createElement('div');
        Object.assign(this.desktopScreen.style, {
            width: '100%',
            height: '100%',
            backgroundImage: "url('assets/images/items/may3/background.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'none',
            position: 'relative'
        });

        // Game icon trên desktop
        const gameIcon = document.createElement('img');
        gameIcon.src = 'assets/images/items/may3/icon.png';
        Object.assign(gameIcon.style, {
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '60px',
            height: '60px',
            objectFit: 'contain',
            cursor: 'pointer',
            borderRadius: '5px',
        });
        gameIcon.addEventListener('click', () => this.launchSnakeGame());

        this.desktopScreen.appendChild(gameIcon);

        // Message label
        this.messageLabel = document.createElement('div');
        this.messageLabel.className = 'modal-description-label';
        this.messageLabel.textContent = 'Hình như mình không tự khởi động máy tính này được...';

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close-btn';
        closeBtn.addEventListener('click', () => this.hideModal());

        // Assemble
        this.canvasContainer.appendChild(this.gameCanvas);
        this.canvasContainer.appendChild(this.desktopScreen);
        this.hintContainer.appendChild(this.hintImage);
        this.hintContainer.appendChild(this.canvasContainer);
        this.overlay.appendChild(this.hintContainer);
        this.overlay.appendChild(this.messageLabel);
        this.overlay.appendChild(closeBtn);
        document.body.appendChild(this.overlay);

        this.modalCreated = true;
    }

    /* -------------------------------------------------------------- */
    // Modal show/hide
    /* -------------------------------------------------------------- */
    showModal() {
        if (this.overlay) {
            this.overlay.style.display = 'flex';
            // Reset màu nền và độ mờ nếu đã bị thay đổi bởi cast scene
            this.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            this.hintContainer.style.opacity = '1';
            
            // Prime heartbeat audio so later play is not blocked by autoplay policy
            this.heartbeatAudio.play().then(() => {
                this.heartbeatAudio.pause();
                this.heartbeatAudio.currentTime = 0;
            }).catch(() => {});
            
            // Khởi tạo game Snake khi mở modal
            if (!this.snakeGame && this.gameCanvas) {
                // Tính toán kích thước canvas dựa trên container
                const containerRect = this.canvasContainer.getBoundingClientRect();
                const width = Math.floor(containerRect.width * 0.9);  // 90% của container
                const height = Math.floor(containerRect.height * 0.9);
                
                this.snakeGame = new SnakeGame(this.gameCanvas, width, height);
                // Reset trạng thái cast scene
                this.castSceneStarted = false;
                // Bắt đầu theo dõi điểm để rung và kết thúc
                this.startShakeMonitor();
            }

            this.updateComputerState();
        }
    }

    hideModal() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
            this.hintContainer.style.transform = 'translateX(0)'; // reset rung
            if (this.shakeTimer) {
                clearInterval(this.shakeTimer);
                this.shakeTimer = null;
            }
            // Dừng game khi đóng modal (tùy chọn)
            if (this.snakeGame) {
                this.snakeGame.destroy();
                this.snakeGame = null;
            }
            // Nếu dưới ngưỡng, giảm âm lượng
            if (this.snakeGame && this.snakeGame.score < 80) this._updateHeartbeatVolume(0);
            // stop heartbeat
            this._stopHeartbeat();
        }
        this.castSceneStarted = false;
    }

    createFrontOverlay() {
        this.frontElement = document.createElement('div');
        Object.assign(this.frontElement.style, {
            position:'absolute',
            left:`${this.x + this.frontOffsetX}px`,
            top:`${this.y + this.frontOffsetY}px`,
            width:`${this.frontWidth}px`,
            height:`${this.frontHeight}px`,
            backgroundImage:`url('${this.frontImage}')`,
            backgroundSize:'contain',
            backgroundRepeat:'no-repeat',
            pointerEvents:'none',
            zIndex:'2'
        });
        this.game.gameContainer.appendChild(this.frontElement);
    }

    /* -------------------------------------------------------------- */
    // Launch Snake game from desktop icon
    /* -------------------------------------------------------------- */
    launchSnakeGame() {
        if (this.desktopScreen) this.desktopScreen.style.display = 'none';
        if (this.gameCanvas) this.gameCanvas.style.display = 'block';
        if (!this.snakeGame && this.gameCanvas) {
            const rect = this.canvasContainer.getBoundingClientRect();
            const w = Math.floor(rect.width * 0.9);
            const h = Math.floor(rect.height * 0.9);
            this.snakeGame = new SnakeGame(this.gameCanvas, w, h);
            // Reset trạng thái cast scene
            this.castSceneStarted = false;
            // Bắt đầu theo dõi điểm để rung và kết thúc
            this.startShakeMonitor();
        }
        this.messageLabel.textContent = 'Chúc may mắn!';
    }

    updateComputerState() {
        if (this.game.machine3Powered) {
            // máy đã bật
            this.hintImage.src = 'assets/images/items/may3/maynguoichoimo.png';
            this.canvasContainer.style.display = 'block';
            // Hiển thị desktop screen, ẩn canvas game
            if (this.desktopScreen) this.desktopScreen.style.display = 'block';
            if (this.gameCanvas) this.gameCanvas.style.display = 'none';
            // huỷ game nếu đang chạy
            if (this.snakeGame) {
                this.snakeGame.destroy();
                this.snakeGame = null;
            }
            this.messageLabel.textContent = 'Máy tính đang hoạt động. Nhấn icon để chơi Snake.';
        } else {
            this.hintImage.src = 'assets/images/items/may3/maynguoichoidong.png';
            this.canvasContainer.style.display = 'none';
            if (this.desktopScreen) this.desktopScreen.style.display = 'none';
            if (this.snakeGame) {
                this.snakeGame.destroy();
                this.snakeGame = null;
            }
        }
    }

    /* -------------------------------------------------------------- */
    // Theo dõi điểm để rung và kết thúc hint
    /* -------------------------------------------------------------- */
    startShakeMonitor() {
        if (this.shakeTimer) clearInterval(this.shakeTimer);
        this.shakeTimer = setInterval(() => {
            // Nếu đã bắt đầu cảnh kết thúc
            if (this.castSceneStarted) {
                const elapsed = (Date.now() - this.castSceneStartTime) / 1000; // giây
                const DURATION = 3; // tổng thời gian cảnh kết
                const intensity = 10 + (elapsed / DURATION) * 20; // 10 -> 30px
                const offset = (Math.random() * 2 - 1) * intensity;
                this.hintContainer.style.transform = `translateX(${offset}px)`;

                // Fade hint container
                const opacity = Math.max(0, 1 - (elapsed / DURATION));
                this.hintContainer.style.opacity = opacity;

                // Làm tối nền dần
                const bgAlpha = Math.min(1, 0.7 + (elapsed / DURATION) * 0.3);
                if (this.overlay) {
                    this.overlay.style.backgroundColor = `rgba(0, 0, 0, ${bgAlpha})`;
                }

                // Giảm dần âm lượng tim đập
                this._updateHeartbeatVolume((elapsed / DURATION));

                if (elapsed >= DURATION) {
                    this.endHint();
                }
                return; // bỏ qua phần còn lại
            }

            // Nếu game chưa khởi tạo hoặc đã bị huỷ
            if (!this.snakeGame) return;
            if (this.cutscenePlayed) return; // Không rung/âm thanh sau khi cutscene xong
            const score = this.snakeGame.score || 0;
            if (score >= 80 && score < 150) {
                const intensity = ((score - 80) / 50) * 10; // 0->10px
                const offset = (Math.random() * 2 - 1) * intensity;
                this.hintContainer.style.transform = `translateX(${offset}px)`;
                // Cập nhật âm lượng tim đập dựa trên normalised (0->1)
                this._updateHeartbeatVolume((score - 80) / 70);
            } else {
                this.hintContainer.style.transform = 'translateX(0)';
                // Nếu dưới ngưỡng, giảm âm lượng
                if (score < 80) this._updateHeartbeatVolume(0);
            }
            if (score >= 10) {
                // Bắt đầu cảnh cast scene
                this.castSceneStarted = true;
                this.castSceneStartTime = Date.now();
                // Bảo đảm heartbeat max
                this._updateHeartbeatVolume(1);

                // Dừng cập nhật game, giữ nguyên canvas
                if (this.snakeGame) {
                    this.snakeGame.destroy(); // dừng vòng lặp nhưng không xoá canvas
                }

                // Giữ canvas hiển thị
                if (this.gameCanvas) {
                    this.gameCanvas.style.display = 'block';
                }
            }
        }, 100);
    }

    endHint() {
        // Dừng game và rung
        this._stopHeartbeat();
        if (this.snakeGame) {
            this.snakeGame.destroy();
            this.snakeGame = null;
        }
        if (this.shakeTimer) {
            clearInterval(this.shakeTimer);
            this.shakeTimer = null;
        }
        this.hideModal();

        // Khởi chạy cutscene tiếp theo
        if (!this.cutscenePlayed) {
            new CastScene1({ game: this.game });
            this.cutscenePlayed = true;
        }

        // Trigger sự kiện khác nếu cần (placeholder)
        if (this.game) {
            this.game.onMachine3Finish && this.game.onMachine3Finish();
        }
    }

    /* -------------------------------------------------------------- */
    // Heartbeat audio helpers
    /* -------------------------------------------------------------- */
    _updateHeartbeatVolume(normalized) {
        // giữ lại cho tương thích nhưng chỉ dùng _playHeartbeat / _stopHeartbeat
        if (normalized > 0) this._playHeartbeat(); else this._stopHeartbeat();
    }

    _playHeartbeat() {
        if (this.cutscenePlayed) return;
        this.heartbeatAudio.volume = 0.9;
        if (this.heartbeatAudio.paused) {
            this.heartbeatAudio.currentTime = 0;
            this.heartbeatAudio.play().catch(()=>{});
        }
    }

    _stopHeartbeat() {
        if (!this.heartbeatAudio.paused) {
            this.heartbeatAudio.pause();
            this.heartbeatAudio.currentTime = 0;
        }
    }
} 
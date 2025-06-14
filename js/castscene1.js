export default class CastScene1 {
    /**
     * @param {Object} config
     *   - container: (HTMLElement) DOM element to attach scene to (default: document.body)
     *   - imageSrc:  (string) path to the image that will appear
     *   - audioSrc:  (string) path to the audio that will be played
     *   - delay:     (number) milliseconds before image fades in (default 2500)
     *   - fadeTime:  (number) milliseconds duration of fade-in (default 1500)
     *   - zIndex:    (string|number) css z-index for overlay (default 2000)
     *   - onFinish:  (Function) callback when fade complete
     *   - game:      (Game) reference to the game object
     */
    constructor(config = {}) {
        this.container = config.container || document.body;
        this.audioSrc  = config.audioSrc || 'assets/audio/cutscenes/cast1.mp3';
        this.delay     = config.delay     || 4000;
        this.fadeTime  = config.fadeTime  || 3000;
        this.zIndex    = config.zIndex    || 2000;
        this.itemFadeTime = config.itemFadeTime || 5000;
        this.onFinish  = config.onFinish  || null;

        // Tham chiếu tới game để thu thập trang nhật ký
        this.game = config.game || null;

        this.overlay = null;
        this.imageEl = null;
        this.audioEl = null;
        this.closeBtn = null;

        this._init();
    }

    _init() {
        // Create black overlay
        this.overlay = document.createElement('div');
        Object.assign(this.overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: String(this.zIndex),
            overflow: 'hidden'
        });

        this.container.appendChild(this.overlay);

        // Play audio
        if (this.audioSrc) {
            this.audioEl = new Audio(this.audioSrc);
            this.audioEl.volume = 1;
            this.audioEl.play().catch(() => {/* ignore autoplay errors */});
        }

        // After delay, fade in image
        setTimeout(() => {
            // Bỏ nút đóng – chỉ click vào ảnh để tiếp tục
            this._showDiaryItem();
            // Fade in description
            const descEl = this.overlay.querySelector('.modal-description-label');
            if (descEl) descEl.style.opacity = '1';
            // call onFinish after fade complete
            if (this.onFinish) {
                setTimeout(() => this.onFinish(), this.fadeTime);
            }
        }, this.delay);
    }

    _showCloseButton() {
        if (this.closeBtn) return;
        this.closeBtn = document.createElement('button');
        this.closeBtn.className = 'modal-close-btn';
        // ensure appears above overlay; modal-close-btn has z-index 1100 but overlay maybe 2000+, override
        this.closeBtn.style.zIndex = String(this.zIndex + 1);
        this.closeBtn.addEventListener('click', () => this.destroy());
        this.container.appendChild(this.closeBtn);
    }

    _showDiaryItem() {
        // Hiển thị trang nhật ký thứ 7 để người chơi thu thập
        const container = document.createElement('div');
        Object.assign(container.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: String(this.zIndex + 1)
        });

        const img = document.createElement('img');
        img.src = 'assets/images/items/nhatky/7.png';
        Object.assign(img.style, {
            maxWidth: '45%',
            maxHeight: '45%',
            objectFit: 'contain',
            pointerEvents: 'none',
            opacity: '0',
            transition: `opacity ${this.itemFadeTime}ms ease-in-out`
        });

        const desc = document.createElement('div');
        desc.className = 'modal-description-label';
        desc.textContent = 'Một trang nhật ký rơi rớt... Nhấn để nhặt.';
        // Đặt ở mép dưới màn hình, giữa
        Object.assign(desc.style, {
            position: 'absolute',
            bottom: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: '0',
            transition: `opacity ${this.fadeTime}ms ease-in-out`,
            zIndex: String(this.zIndex + 1)
        });

        container.appendChild(img);
        this.overlay.appendChild(container);
        this.overlay.appendChild(desc);

        // Bắt đầu hiệu ứng fade-in cho hình ảnh
        // Ngăn click cho tới khi ảnh hiện xong
        container.style.pointerEvents = 'none';
        // kích hoạt fade ngay (sau một tick) để transition hoạt động
        setTimeout(() => {
            img.style.opacity = '1';
        }, 50);

        // Cho phép click sau khi ảnh fade-in hoàn tất
        setTimeout(() => {
            container.style.pointerEvents = 'auto';
        }, this.itemFadeTime);

        container.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.game && this.game.diary) {
                // Phát âm thanh item (nếu có)
                this.game.audioManager && this.game.audioManager.playItemSound && this.game.audioManager.playItemSound();

                // Mở nhật ký (nếu cần) và thay thế trang 6 bằng hình mới
                this.game.diary.replacePageImage(6, 'assets/images/items/nhatky/7.png', 2000);
            }
            // Sau khi nhặt, xoá overlay cutscene
            this.destroy();
        });
    }

    destroy() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        if (this.audioEl) {
            this.audioEl.pause();
            this.audioEl = null;
        }
        if (this.closeBtn && this.closeBtn.parentNode) {
            this.closeBtn.parentNode.removeChild(this.closeBtn);
        }
    }
} 
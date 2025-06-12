import Hint from '../hint.js';

export default class NPC extends Hint {
    constructor(config) {
        // Khởi tạo Hint với frame đầu tiên
        super({ ...config, image: config.frames[0] });

        this.frames        = config.frames;           // Mảng đường dẫn hình idle
        this.frameInterval = config.frameInterval||300;
        this.frameIndex    = 0;

        this.startIdleAnimation();
    }

    /* ---------------------- */
    // Idle loop
    /* ---------------------- */
    startIdleAnimation() {
        this.animTimer = setInterval(() => {
            this.frameIndex = (this.frameIndex + 1) % this.frames.length;
            this.element.style.backgroundImage = `url('${this.frames[this.frameIndex]}')`;
        }, this.frameInterval);
    }

    /* ---------------------- */
    // Khi người chơi click NPC
    /* ---------------------- */
    onClick() {
        this.game.messageManager.showMessage(`Xin chào, ta là ${this.name}!`);
    }

    /* ---------------------- */
    // Dọn dẹp
    /* ---------------------- */
    remove() {
        clearInterval(this.animTimer);
        super.remove();
    }
} 
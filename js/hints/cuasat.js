import Hint from '../hint.js';
import CastScene2 from '../castscene2.js';

export default class CuaSat extends Hint {
  constructor(config) {
    super(config);

    // Thu nhỏ 90% và đặt trục dưới-tâm để không lệch sàn
    this.element.style.transformOrigin = 'bottom center';
    // Đặt z-index thấp hơn NPC để nằm phía sau
    this.element.style.zIndex = '0';

    this.unlocked = false; // đánh dấu đã mở cửa hay chưa

    // Cho phép drag-drop
    this.setupDropListener();

    // Đánh dấu element là mục tiêu drop trong global css/logic
    this.element.classList.add('drop-target');
  }

  onClick() {
    if (this.unlocked) return; // đã mở thì thôi
    this.game.messageManager.showMessage('Đây là một cái cửa bị khóa.');
  }

  setupDropListener() {
    // allow drag-over
    this.element.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    this.element.addEventListener('drop', (e) => {
      e.preventDefault();
      if (this.unlocked) return;

      const itemId = e.dataTransfer.getData('text/plain');
      if (itemId === 'khoa') {
        // Kiểm tra khoảng cách để nhân vật chạy lại gần (giống logic NPC)
        const targetX = this.x + this.width / 2;
        const distance = Math.abs(this.game.player.x - targetX);
        const THRESHOLD = 220;

        const performUnlock = () => {
          this.useKey();
        };

        if (distance > THRESHOLD) {
          this.game.player.moveToPosition(targetX);
          const timer = setInterval(() => {
            if (!this.game.player.isMoving) {
              clearInterval(timer);
              performUnlock();
            }
          }, 100);
        } else {
          performUnlock();
        }
      } else {
        this.game.messageManager.showMessage('Không thể dùng vật phẩm này với Cửa Sắt.');
      }
    });
  }

  useKey() {
    if (this.unlocked) return;
    // remove key from inventory
    this.game.inventory.removeItem('khoa');
    this.unlocked = true;

    // play item sound if available
    this.game.audioManager && this.game.audioManager.playItemSound && this.game.audioManager.playItemSound();

    // chơi cutscene kết thúc
    new CastScene2({ game: this.game });
  }
} 
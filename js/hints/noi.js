import Hint from '../hint.js';
import Gas from './gas.js';

export default class Noi extends Hint {
    constructor(config) {
        super(config);

        // Modal & state flags
        this.modalCreated = false;
        this.currentStep = 1;            // 1 = empty, 2 = water, 3 = boiling, 4 = noodles added
        this.waterAdded = false;
        this.gasOn = false;
        this.noodleAdded = false;  // true khi vatmi bỏ vào nồi
        this.noodlePackUsed = false; // true khi gói mì từ inventory đã bỏ
        this.spiceAdded = false;
        this.boilInterval = null;

        // Reference tới hint bếp gas (để kiểm tra trạng thái bếp)
        this.gasHint = null;
    }

    /* ------------------------------------------------------------------ */
    // Helpers
    /* ------------------------------------------------------------------ */
    getGasHint() {
        if (!this.gasHint) {
            this.gasHint = this.game.map.hints.find(h => h instanceof Gas);
        }
        return this.gasHint;
    }

    isGasReady() {
        const g = this.getGasHint();
        return g && g.gasInstalled && g.stoveReady;
    }

    updateGasButtonState() {
        if (!this.gasButton) return;
        const enabled = this.waterAdded && this.isGasReady();
        this.gasButton.style.filter = enabled ? 'none' : 'grayscale(70%)';
        this.gasButton.style.pointerEvents = enabled ? 'auto' : 'none';
    }

    updatePotImage() {
        if (!this.hintImage) return;
        if (!this.waterAdded) {
            this.hintImage.src = 'assets/images/items/noi/1.png';
        } else if (!this.gasOn) {
            this.hintImage.src = 'assets/images/items/noi/2.png';
        }
        // boiling handled by interval swapping between 3/4
        this.updateHintMessage();
    }

    /* ------------------------------------------------------------------ */
    // Core click → open modal
    /* ------------------------------------------------------------------ */
    onClick() {
        const targetX = this.x + this.width / 2;
        const distance = Math.abs(this.game.player.x - targetX);
        const THRESHOLD = 200;

        const open = () => {
            if (!this.modalCreated) this.createModal();
            this.showModal();
        };

        if (distance > THRESHOLD) {
            this.game.player.moveToPosition(targetX);
            const timer = setInterval(() => {
                if (!this.game.player.isMoving) {
                    clearInterval(timer);
                    open();
                }
            }, 100);
        } else {
            open();
        }
    }

    /* ------------------------------------------------------------------ */
    // Modal building
    /* ------------------------------------------------------------------ */
    createModal() {
        this.overlay = document.createElement('div');
        Object.assign(this.overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000'
        });
        this.overlay.className = 'hint-overlay';

        const container = document.createElement('div');
        container.style.position = 'relative';

        // Pot image
        this.hintImage = document.createElement('img');
        this.hintImage.src = 'assets/images/items/noi/1.png';
        this.hintImage.style.maxWidth = '90%';
        this.hintImage.style.maxHeight = '90%';
        this.hintImage.style.objectFit = 'contain';
        container.appendChild(this.hintImage);

        // Gas button (bottom-right)
        this.gasButton = document.createElement('img');
        this.gasButton.src = 'assets/images/items/gas_button_off.png';
        Object.assign(this.gasButton.style, {
            position: 'absolute',
            bottom: '5%',
            right: '20%',
            width: '120px',
            height: '120px',
            cursor: 'pointer',
            userSelect: 'none',
            zIndex: '2'
        });
        this.gasButton.addEventListener('click', () => this.handleGasToggle());
        container.appendChild(this.gasButton);

        /* ------------------------------------------------------------ */
        // Message label (bottom center)
        this.messageLabel = document.createElement('div');
        Object.assign(this.messageLabel.style, {
            position: 'absolute',
            bottom: '3%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            color: 'white',
            fontSize: '24px',
            textAlign: 'center'
        });
        container.appendChild(this.messageLabel);

        // Close button
        const closeBtn = document.createElement('button');
        Object.assign(closeBtn.style, {
            position: 'absolute',
            top: '100px',
            left: '70%',
            transform: 'translateX(-50%)',
            width: '70px',
            height: '70px',
            backgroundImage: "url('assets/images/button/exit.png')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer'
        });
        closeBtn.addEventListener('click', () => this.hideModal());
        container.appendChild(closeBtn);

        // Drag-and-drop setup
        container.addEventListener('dragover', (e) => e.preventDefault());
        container.addEventListener('drop', (e) => this.handleDrop(e));

        this.overlay.appendChild(container);
        this.overlay.appendChild(this.messageLabel);
        document.body.appendChild(this.overlay);
        this.modalCreated = true;

        // Cập nhật label lần đầu
        this.updateHintMessage();
    }

    /* ------------------------------------------------------------------ */
    // Show / hide
    /* ------------------------------------------------------------------ */
    showModal() {
        this.overlay.style.display = 'flex';
        this.updateGasButtonState();
        this.updatePotImage();
        this.updateHintMessage();
    }

    hideModal() {
        if (!this.overlay) return;
        this.overlay.style.display = 'none';
        // Ngừng animation sôi nếu modal đóng
        if (this.boilInterval) {
            clearInterval(this.boilInterval);
            this.boilInterval = null;
        }
    }

    /* ------------------------------------------------------------------ */
    // Drag-and-drop logic
    /* ------------------------------------------------------------------ */
    handleDrop(e) {
        e.preventDefault();
        const itemId = e.dataTransfer.getData('text/plain');
        if (itemId === 'cup_water' && !this.waterAdded) {
            this.onWaterDropped();
        } else if (itemId === 'noodle_pack' && this.gasOn && !this.noodlePackUsed) {
            this.onNoodlePackDropped();
        } else if (itemId === 'vatmi' && this.gasOn && this.noodlePackUsed && !this.noodleAdded) {
            this.onVatMiDropped();
        } else if (itemId === 'spice' && this.gasOn && this.noodleAdded && !this.spiceAdded) {
            this.onSpiceDropped();
        } else {
            this.game.messageManager.showMessage('Không thể sử dụng vật phẩm này!');
        }
    }

    onWaterDropped() {
        this.waterAdded = true;
        this.currentStep = 2;
        this.game.inventory.removeItem('cup_water');
        this.updatePotImage();
        this.updateGasButtonState();
        if (this.game.audioManager) this.game.audioManager.playItemSound();
    }

    onNoodlePackDropped() {
        this.noodlePackUsed = true;
        this.game.inventory.removeItem('noodle_pack');
        this.showCondiments();
        if (this.game.audioManager) this.game.audioManager.playItemSound();
        // Frames vẫn giữ 3/4
        this.updateHintMessage();
    }

    onVatMiDropped() {
        this.noodleAdded = true;
        if (this.vatMiIcon) {
            this.vatMiIcon.remove();
        }
        this.updateBoilFrames();
        this.updateHintMessage();
    }

    onSpiceDropped() {
        this.spiceAdded = true;
        if (this.spiceIcon) {
            this.spiceIcon.remove();
        }

        // Hiệu ứng đổ gia vị
        this.createSpicePourAnimation();

        this.updateBoilFrames();
        this.updateHintMessage();
    }

    /* ------------------------------------------------------------------ */
    // Gas / boiling
    /* ------------------------------------------------------------------ */
    handleGasToggle() {
        const g = this.getGasHint();
        if (!g || !g.gasInstalled) {
            this.game.messageManager.showMessage('Có vẻ như vẫn chưa có ga.');
            return;
        }
        if (!this.waterAdded) {
            this.game.messageManager.showMessage('Có vẻ chúng ta cần nước.');
            return;
        }
        // Nếu bếp gas vẫn chưa ở trạng thái sẵn sàng (ví dụ chưa đóng nắp), thông báo chung
        if (!this.isGasReady()) {
            this.game.messageManager.showMessage('Bếp gas chưa sẵn sàng!');
            return;
        }
        this.startBoiling();
    }

    startBoiling() {
        this.gasOn = true;
        this.currentStep = 3;
        this.gasButton.src = 'assets/images/items/gas_button_on.png';
        // Disable gas button now
        this.gasButton.style.pointerEvents='none';
        this.gasButton.style.filter='grayscale(30%)';

        // Chọn frame set ban đầu
        this.boilFrames = ['3','4'];
        let idx = 0;
        this.boilInterval = setInterval(() => {
            if (!this.gasOn) return;
            if(!this.boilFrames || this.boilFrames.length===0) return;
            idx = (idx + 1) % this.boilFrames.length;
            this.hintImage.src = `assets/images/items/noi/${this.boilFrames[idx]}.png`;
        }, 500);

        this.updateHintMessage();
    }

    /* ------------------------------------------------------------------ */
    // Condiments display
    /* ------------------------------------------------------------------ */
    showCondiments() {
        if (this.condimentsCreated) return;
        const parent = this.overlay;

        // Vắt mì (trên) và gói gia vị (dưới) nằm bên phải màn hình
        const vatMi = document.createElement('img');
        vatMi.src = 'assets/images/items/vatmi.png';
        Object.assign(vatMi.style, {
            position: 'absolute',
            right: '5%',
            top: '20%',
            width: '340px',
            height: '340px',
            objectFit: 'contain',
            cursor: 'grab'
        });

        // Cho phép kéo vắt mì
        vatMi.setAttribute('draggable', true);
        vatMi.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', 'vatmi');
            e.dataTransfer.effectAllowed = 'move';
        });

        const giaVi = document.createElement('img');
        giaVi.src = 'assets/images/items/giavi1.png';
        Object.assign(giaVi.style, {
            position: 'absolute',
            right: '5%',
            top: '50%',
            width: '140px',
            height: '140px',
            objectFit: 'contain',
            cursor: 'grab'
        });

        // Cho phép kéo gói gia vị
        giaVi.setAttribute('draggable', true);
        giaVi.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', 'spice');
            e.dataTransfer.effectAllowed = 'move';
        });

        parent.appendChild(vatMi);
        parent.appendChild(giaVi);

        this.spiceIcon = giaVi; // lưu reference để ẩn khi cần
        this.vatMiIcon = vatMi; // lưu reference để ẩn khi cần

        this.condimentsCreated = true;
        this.updateHintMessage();
    }

    /* ------------------------------------------------------------------ */
    // Message label handling
    /* ------------------------------------------------------------------ */
    getStepMessage(){
        if(!this.noodlePackUsed){
            return 'Hãy bỏ gói mì vào nồi.';
        }
        if(!this.noodleAdded){
            return 'Bỏ vắt mì vào nước đang sôi.';
        }
        if(this.noodleAdded && !this.spiceAdded){
            return 'Nước sôi cùng mì, giờ hãy thêm gia vị.';
        }
        if(this.noodleAdded && this.spiceAdded){
            return 'Mì đã sẵn sàng!';
        }
        
        if(!this.waterAdded){
            return 'Chiếc nồi trống rỗng.';
        }
        if(this.waterAdded && !this.gasOn){
            return 'Đã có nước, hãy bật bếp gas.';
        }
        if(this.gasOn && !this.noodlePackUsed){
            return 'Nước đang sôi...';
        }
        return '';
    }

    updateHintMessage(){
        if(this.messageLabel){
            this.messageLabel.textContent = this.getStepMessage();
        }
    }

    createSpicePourAnimation(){
        const img = document.createElement('img');
        img.src = 'assets/images/items/giavi2.png';
        Object.assign(img.style, {
            position: 'absolute',
            width: '140px',
            height: '140px',
            left: '40%',
            top: '25%',
            transform: 'translateX(-40%) rotate(-90deg)',
            zIndex: '3'
        });

        this.overlay.appendChild(img);

        // Tạo animation lên xuống
        let dir = 1;
        let distance = 0;
        const interval = setInterval(()=>{
            distance += dir*4;
            if(Math.abs(distance) > 20) dir *= -1;
            img.style.transform = `translateX(-50%) translateY(${distance}px) rotate(90deg)`;
        }, 60);

        setTimeout(()=>{
            clearInterval(interval);
            img.remove();
        }, 1500);
    }

    updateBoilFrames(){
        if(!this.gasOn) return;
        // Điều chỉnh frame set cho boiling
        if(this.noodleAdded && this.spiceAdded){
            this.boilFrames = ['7','8'];
        } else if(this.noodleAdded){
            this.boilFrames = ['5','6'];
        } else {
            this.boilFrames = ['3','4'];
        }
    }
} 
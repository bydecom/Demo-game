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
        this.bowlAdded = false;
        this.bowlCollected = false;

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
        // Nếu đã bỏ gia vị xong, cho phép tắt bếp
        if (this.noodleAdded && this.spiceAdded && this.gasOn) {
            this.gasButton.style.filter = 'none';
            this.gasButton.style.pointerEvents = 'auto';
            return;
        }
        const enabled = this.waterAdded && this.isGasReady();
        this.gasButton.style.filter = enabled ? 'none' : 'grayscale(70%)';
        this.gasButton.style.pointerEvents = enabled ? 'auto' : 'none';
    }

    updatePotImage() {
        if (!this.hintImage) return;
        if (this.bowlCollected) {
            this.hintImage.src = 'assets/images/items/noi/9.png';
            this.updateHintMessage();
            return;
        }
        // Nếu đã bỏ gia vị và bếp đã tắt, giữ frame 7
        if (this.noodleAdded && this.spiceAdded && !this.gasOn) {
            this.hintImage.src = 'assets/images/items/noi/7.png';
            this.updateHintMessage();
            return;
        }
        if (!this.waterAdded) {
            this.hintImage.src = 'assets/images/items/noi/1.png';
        } else if (!this.gasOn) {
            this.hintImage.src = 'assets/images/items/noi/2.png';
        } else {
            // Nếu đang sôi, chọn frame set phù hợp với trạng thái
            if (this.noodleAdded && this.spiceAdded) {
                this.boilFrames = ['7', '8'];
            } else if (this.noodleAdded) {
                this.boilFrames = ['5', '6'];
            } else {
                this.boilFrames = ['3', '4'];
            }
            // Nếu chưa có interval, tạo mới
            if (!this.boilInterval) {
                let idx = 0;
                this.boilInterval = setInterval(() => {
                    if (!this.gasOn) return;
                    if (!this.boilFrames || this.boilFrames.length === 0) return;
                    idx = (idx + 1) % this.boilFrames.length;
                    this.hintImage.src = `assets/images/items/noi/${this.boilFrames[idx]}.png`;
                }, 500);
            }
            // Hiển thị frame đầu tiên
            this.hintImage.src = `assets/images/items/noi/${this.boilFrames[0]}.png`;
        }
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

        // Huỷ waiter cũ
        this.game.clearPendingWaiter();

        if (distance > THRESHOLD) {
            this.game.player.moveToPosition(targetX);
            // Phát âm thanh bước chân khi di chuyển
            this.game.audioManager.playWalkSound();
            const timer = setInterval(() => {
                if (!this.game.player.isMoving) {
                    this.game.clearPendingWaiter();
                    open();
                }
            }, 100);
            this.game.setPendingWaiter(timer);
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
        container.className = 'hint-container';

        // Pot image
        this.hintImage = document.createElement('img');
        this.hintImage.src = 'assets/images/items/noi/1.png';
        this.hintImage.style.maxWidth = '90%';
        this.hintImage.style.maxHeight = '90%';
        this.hintImage.style.objectFit = 'contain';
        this.hintImage.style.marginLeft = '60px';
        this.hintImage.draggable = false;
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
        this.gasButton.draggable = false;
        this.gasButton.addEventListener('click', () => this.handleGasToggle());
        container.appendChild(this.gasButton);

        // Message label với class CSS chung
        this.messageLabel = document.createElement('div');
        this.messageLabel.className = 'modal-description-label';
        container.appendChild(this.messageLabel);

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close-btn';
        closeBtn.addEventListener('click', () => this.hideModal());
        this.overlay.appendChild(closeBtn);

        // Drag-and-drop setup
        container.addEventListener('dragover', (e) => e.preventDefault());
        container.addEventListener('drop', (e) => this.handleDrop(e));

        this.overlay.appendChild(container);
        this.overlay.appendChild(this.messageLabel);
        document.body.appendChild(this.overlay);
        this.modalCreated = true;

        this.updateHintMessage();
    }

    /* ------------------------------------------------------------------ */
    // Show / hide
    /* ------------------------------------------------------------------ */
    showModal() {
        this.overlay.style.display = 'flex';
        
        // Disable gas button if water is boiling
        if (this.gasOn) {
            this.gasButton.style.pointerEvents = 'none';
            this.gasButton.style.filter = 'grayscale(30%)';
            this.gasButton.src = 'assets/images/items/gas_button_on.png';
        } else {
        this.updateGasButtonState();
        }
        
        this.updatePotImage();
        this.updateHintMessage();

        // Khôi phục animation sôi nếu nước đang sôi
        if (this.gasOn && !this.boilInterval) {
            this.startBoiling();
        } else if (this.gasOn) {
            // Đảm bảo âm thanh nước sôi tiếp tục nếu modal được mở lại
            if (this.game.audioManager) {
                this.game.audioManager.playBoilingSound();
            }
        }
    }

    hideModal() {
        if (!this.overlay) return;
        this.overlay.style.display = 'none';
        // Ngừng animation sôi nếu modal đóng
        if (this.boilInterval) {
            clearInterval(this.boilInterval);
            this.boilInterval = null;
        }
        // Dừng tiếng nước sôi nếu còn phát
        if (this.game.audioManager) this.game.audioManager.stopBoilingSound();
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
        } else if (itemId === 'to_mi' && this.noodleAdded && this.spiceAdded && !this.bowlAdded) {
            if (this.gasOn) {
                this.messageLabel.textContent = 'Hãy tắt bếp trước khi lấy mì ra tô!';
                this.updateGasButtonState();
                return;
            }
            this.onBowlDropped();
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

    onBowlDropped() {
        // Đánh dấu đã thêm tô mì
        this.bowlAdded = true;
        // Xóa tô mì khỏi inventory
        this.game.inventory.removeItem('to_mi');
        // Hiện modal với hình tomi_done.png
        this.showBowlDoneModal();
    }

    showBowlDoneModal() {
        if (this.overlay) this.overlay.style.display = 'none';
        
        this.bowlModal = document.createElement('div');
        Object.assign(this.bowlModal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '2000'
        });
        
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.width = '400px';
        container.style.height = '400px';
        container.style.background = 'transparent';
        
        const img = document.createElement('img');
        img.src = 'assets/images/items/tomi_done.png';
        img.style.maxWidth = '90%';
        img.style.maxHeight = '90%';
        img.style.objectFit = 'contain';
        img.style.background = 'transparent';
        img.draggable = false;
        container.appendChild(img);
        
        const desc = document.createElement('div');
        desc.className = 'modal-description-label';
        desc.textContent = 'Một tô mì nóng hổi đã sẵn sàng!';
        this.bowlModal.appendChild(desc);
        
        container.addEventListener('click', (e) => {
            e.stopPropagation();
            this.collectBowlDone();
        });
        
        this.bowlModal.appendChild(container);
        document.body.appendChild(this.bowlModal);
    }

    collectBowlDone() {
        // Xóa modal tô mì
        if (this.bowlModal) {
            this.bowlModal.remove();
            this.bowlModal = null;
        }
        // Hiện lại modal nồi (nếu chưa đóng)
        if (this.overlay) this.overlay.style.display = 'flex';
        // Thêm tô mì done vào inventory
        this.game.inventory.addItem({
            id: 'to_mi_done',
            name: 'Tô mì đã nấu',
            image: 'assets/images/items/tomi_done.png',
            inventoryImage: 'assets/images/items/tomi_done.png',
            clickMessage: 'Bạn đã thu thập tô mì đã nấu!'
        });
        this.game.audioManager.playItemSound();
        // Đổi hình nồi thành 9.png
        if (this.hintImage) {
            this.hintImage.src = 'assets/images/items/noi/9.png';
        }
        // Đánh dấu đã thu thập để updatePotImage không ghi đè nữa
        this.bowlCollected = true;
        // Dừng animation sôi nếu còn
        if (this.boilInterval) {
            clearInterval(this.boilInterval);
            this.boilInterval = null;
        }
        // Dừng tiếng nước sôi
        if (this.game.audioManager) this.game.audioManager.stopBoilingSound();
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
        // Nếu đã bỏ gia vị xong và bếp đang bật, cho phép tắt bếp
        if (this.noodleAdded && this.spiceAdded && this.gasOn) {
            // Tắt bếp
            this.gasOn = false;
            this.gasButton.src = 'assets/images/items/gas_button_off.png';
            this.gasButton.style.pointerEvents = 'none';
            this.gasButton.style.filter = 'grayscale(70%)';
            if (this.boilInterval) {
                clearInterval(this.boilInterval);
                this.boilInterval = null;
            }
            // Dừng tiếng nước sôi
            if (this.game.audioManager) this.game.audioManager.stopBoilingSound();
            this.updatePotImage();
            this.updateHintMessage();
            return;
        }
        // Ngăn chặn việc bật lại bếp gas nếu đã có mì hoặc gia vị (khi chưa đến bước tắt bếp)
        if (this.noodleAdded || this.spiceAdded) {
            this.game.messageManager.showMessage('Không thể tắt bếp gas khi đã nấu mì!');
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

        // Phát tiếng nước sôi
        if (this.game.audioManager) this.game.audioManager.playBoilingSound();

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
        vatMi.src = 'assets/images/items/vatmi.PNG';
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
        vatMi.className = 'draggable-item';
        vatMi.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', 'vatmi');
            e.dataTransfer.effectAllowed = 'move';
        });

        const giaVi = document.createElement('img');
        giaVi.src = 'assets/images/items/giavi1.PNG';
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
        giaVi.className = 'draggable-item';
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
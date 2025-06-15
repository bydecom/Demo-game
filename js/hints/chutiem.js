import NPC from './npc.js';

export default class ChuTiem extends NPC {
    constructor(config) {
        super(config);

        // Chuỗi hội thoại; có thể truyền qua config.dialogues
        this.dialogues = config.dialogues || [
            'Xin chào!',
            'Ta đói bụng quá!',
            'Cháu quay lại rồi à'
        ];
        this.dialogueIndex = 0;
        this.modalCreated  = false;

        // Thiết lập drag-and-drop để nhận tô mì nấu chín
        this.setupDropListener();

        this.startIdleAnimation();

        // Đánh dấu element là khu vực chấp nhận drop trong bộ lọc global
        this.element.classList.add('drop-target');
    }

    /* ---------------- click -> mở thoại ---------------- */
    onClick() {
        const targetX  = this.x + this.width / 2;
        const distance = Math.abs(this.game.player.x - targetX);
        const THRESHOLD = 220;

        const speak = () => this.showNextDialogue();

        // Huỷ waiter cũ nếu đang tồn tại (phòng trường hợp gọi liên tục)
        if (this.game.clearPendingWaiter) this.game.clearPendingWaiter();

        if (distance > THRESHOLD) {
            this.game.player.moveToPosition(targetX);
            const timer = setInterval(() => {
                if (!this.game.player.isMoving) {
                    clearInterval(timer);
                    if (this.game.clearPendingWaiter) this.game.clearPendingWaiter();
                    speak();
                }
            }, 100);
            if (this.game.setPendingWaiter) this.game.setPendingWaiter(timer);
        } else {
            speak();
        }
    }

    /* ---------------- speech bubble helpers ---------------- */
    createSpeechBubble(){
        if(this.bubble) return;
        this.bubble = document.createElement('div');
        Object.assign(this.bubble.style, {
            position: 'absolute',
            padding: '20px 32px',
            backgroundColor: 'rgba(0,0,0,0.9)',
            color: '#ffffff',
            borderRadius: '12px',
            fontSize: '60px',
            maxWidth: '90%',
            textAlign: 'center',
            zIndex: '999'
        });
        this.game.gameContainer.appendChild(this.bubble);
    }

    updateBubblePosition(){
        if(!this.bubble) return;
        const left = this.x + this.width/2;
        const top  = this.y - 200;
        this.bubble.style.left = `${left}px`;
        this.bubble.style.top  = `${top}px`;
        this.bubble.style.transform = 'translateX(-50%)';
    }

    showNextDialogue(){
        this.createSpeechBubble();
        this.updateBubblePosition();
        this.bubble.textContent = this.dialogues[this.dialogueIndex];
        this.bubble.style.display = 'block';
        // Tiến tới câu tiếp theo cho lần click sau
        this.dialogueIndex = (this.dialogueIndex + 1) % this.dialogues.length;
        // Tự ẩn sau 3 giây
        clearTimeout(this.hideBubbleTimeout);
        this.hideBubbleTimeout = setTimeout(()=>{
            if(this.bubble) this.bubble.style.display='none';
        }, 3000);
    }

    /* ----------------------------------------------- */
    // Noodle delivery
    /* ----------------------------------------------- */
    deliverNoodle(){
        // Remove bowl from inventory
        this.game.inventory.removeItem('to_mi_done');
        // Mark delivered flag
        this.game.noodleDelivered = true;

        // Update dialogues to reflect gratitude
        this.dialogues = [
            'Mì ngon lắm, cảm ơn cháu!',
            'Ăn xong ta sẽ cho con mượn máy chủ.',
            'Nếu cần giúp gì cứ hỏi nhé!'
        ];

        // Hiển thị bong bóng cảm ơn ngay
        this.dialogueIndex = 0; // reset để bắt đầu từ câu đầu
        this.showNextDialogue();

        // Phát âm thanh item done
        this.game.audioManager && this.game.audioManager.playItemSound && this.game.audioManager.playItemSound();

        // Hiển thị lời cảm ơn bằng thanh thông báo chung
        this.game.messageManager.showMessage('Chủ Tiệm: Cảm ơn con! Giờ con có thể sử dụng máy chủ.');
    }

    /* ---------- Drag & Drop nhận tô mì ---------- */
    setupDropListener(){
        // Cho phép drag over
        this.element.addEventListener('dragover', e=>{
            e.preventDefault();
        });

        this.element.addEventListener('drop', e=>{
            e.preventDefault();
            const itemId = e.dataTransfer.getData('text/plain');
            if(itemId === 'to_mi_done' && !this.game.noodleDelivered){
                const targetX = this.x + this.width/2;
                const distance = Math.abs(this.game.player.x - targetX);
                const THRESHOLD = 220;

                const performDelivery = () => {
                    this.deliverNoodle();
                };

                if(distance > THRESHOLD){
                    this.game.player.moveToPosition(targetX);
                    const timer = setInterval(()=>{
                        if(!this.game.player.isMoving){
                            clearInterval(timer);
                            performDelivery();
                        }
                    },100);
                } else {
                    performDelivery();
                }
            } else {
                this.game.messageManager.showMessage('Không thể dùng vật phẩm này cho Chủ Tiệm.');
            }
        });
    }
} 
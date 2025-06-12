import NPC from './npc.js';

export default class ChuTiem extends NPC {
    constructor(config) {
        super(config);

        // Chuỗi hội thoại; có thể truyền qua config.dialogues
        this.dialogues = config.dialogues || [
            'Xin chào! Cần mua gì không?',
            'Ở đây ta bán đủ thứ để sống sót đấy!',
            'Hãy quay lại khi con có tiền nhé!'
        ];
        this.dialogueIndex = 0;
        this.modalCreated  = false;
    }

    /* ---------------- click -> mở thoại ---------------- */
    onClick() {
        // Di chuyển người chơi tới gần NPC (±200px)
        const targetX  = this.x + this.width / 2;
        const distance = Math.abs(this.game.player.x - targetX);
        const THRESHOLD = 220;

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

    /* ---------------- xây modal ---------------- */
    createModal() {
        /* overlay */
        this.overlay = document.createElement('div');
        Object.assign(this.overlay.style, {
            position : 'fixed',
            top      : '0',
            left     : '0',
            width    : '100%',
            height   : '100%',
            display  : 'flex',
            justifyContent: 'center',
            alignItems    : 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: '1000'
        });

        /* khung hội thoại */
        const box = document.createElement('div');
        Object.assign(box.style, {
            position : 'relative',
            backgroundColor: '#222',
            borderRadius   : '12px',
            padding        : '40px 120px 80px',
            color          : 'white',
            fontSize       : '24px',
            maxWidth       : '60%',
            textAlign      : 'center'
        });

        /* Avatar NPC bên trái */
        const avatar = document.createElement('img');
        avatar.src = this.frames[0];
        Object.assign(avatar.style, {
            position: 'absolute',
            top : '-120px',
            left: '-80px',
            width: '200px',
            height:'400px',
            objectFit: 'contain',
            pointerEvents: 'none'
        });
        box.appendChild(avatar);

        /* Label thoại */
        this.dialogueLabel = document.createElement('div');
        this.dialogueLabel.textContent = this.dialogues[0];
        box.appendChild(this.dialogueLabel);

        /* Nút Next */
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Tiếp';
        Object.assign(nextBtn.style, {
            position: 'absolute',
            bottom  : '20px',
            right   : '40px',
            padding : '10px 25px',
            fontSize: '20px',
            cursor  : 'pointer'
        });
        nextBtn.addEventListener('click', () => this.nextDialogue());
        box.appendChild(nextBtn);

        /* Nút Close */
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Đóng';
        Object.assign(closeBtn.style, {
            position: 'absolute',
            bottom  : '20px',
            left    : '40px',
            padding : '10px 25px',
            fontSize: '20px',
            cursor  : 'pointer'
        });
        closeBtn.addEventListener('click', () => this.hideModal());
        box.appendChild(closeBtn);

        this.overlay.appendChild(box);
        document.body.appendChild(this.overlay);
        this.modalCreated = true;
    }

    showModal() {
        this.dialogueIndex = 0;
        this.dialogueLabel.textContent = this.dialogues[0];
        this.overlay.style.display = 'flex';
    }

    hideModal() {
        this.overlay.style.display = 'none';
    }

    nextDialogue() {
        this.dialogueIndex = (this.dialogueIndex + 1) % this.dialogues.length;
        this.dialogueLabel.textContent = this.dialogues[this.dialogueIndex];
    }
} 
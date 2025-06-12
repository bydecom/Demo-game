import Hint from '../hint.js';

export default class ThungDa extends Hint {
    constructor(config) {
        super(config);
        this.modalCreated = false;

        // Thông số overlay phía trước (bình + ấm) có thể truyền từ map
        this.frontImage = config.frontImage || 'assets/images/items/thungda/binham.png';
        this.frontOffsetX = config.frontOffsetX || 142; // dịch so với x của thùng đá
        this.frontOffsetY = config.frontOffsetY || 147;
        this.frontWidth = config.frontWidth || 830;
        this.frontHeight = config.frontHeight || 678;

        // Sau khi tạo element base, chèn ảnh bình-ấm che phía trước
        this.createFrontOverlay();
    }

    createFrontOverlay() {
        // Tạo div overlay đặt trên thùng đá nhưng không bắt sự kiện
        this.frontElement = document.createElement('div');
        this.frontElement.style.position = 'absolute';
        this.frontElement.style.left = `${this.x + this.frontOffsetX}px`;
        this.frontElement.style.top = `${this.y + this.frontOffsetY}px`;
        this.frontElement.style.width = `${this.frontWidth}px`;
        this.frontElement.style.height = `${this.frontHeight}px`;
        this.frontElement.style.backgroundImage = `url('${this.frontImage}')`;
        this.frontElement.style.backgroundSize = 'contain';
        this.frontElement.style.backgroundRepeat = 'no-repeat';
        this.frontElement.style.pointerEvents = 'none'; // không bắt click
        this.frontElement.style.zIndex = '2';

        // Thêm vào game container sau base element để nó nằm trên
        this.game.gameContainer.appendChild(this.frontElement);
    }

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

        const img = document.createElement('img');
        img.src = 'assets/images/items/thungda/1.png';
        img.style.maxWidth = '90%';
        img.style.maxHeight = '90%';
        img.style.objectFit = 'contain';
        container.appendChild(img);

        // Description
        const desc = document.createElement('div');
        desc.textContent = 'Một thùng đá cũ, có vẻ chứa thứ gì đó bên trong.';
        Object.assign(desc.style, {
            position: 'absolute',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            color: 'white',
            fontSize: '24px',
            textAlign: 'center'
        });
        this.overlay.appendChild(desc);

        // Click để đóng modal
        container.addEventListener('click', (e)=>{
            e.stopPropagation();
            this.hideModal();
        });

        this.overlay.appendChild(container);
        document.body.appendChild(this.overlay);
        this.modalCreated = true;
    }

    showModal(){
        this.overlay.style.display = 'flex';
    }

    hideModal(){
        if (this.overlay) this.overlay.style.display='none';
    }

    // override remove để xóa overlay front khi reset map
    remove(){
        super.remove();
        if (this.frontElement && this.frontElement.parentNode){
            this.frontElement.remove();
        }
    }
} 
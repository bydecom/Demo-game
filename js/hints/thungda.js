import Hint from '../hint.js';

export default class ThungDa extends Hint {
    constructor(config) {
        super(config);
        this.modalCreated = false;
        this.currentStep = 1;
        this.cupCollected = false;
        // Modal xem trước ca nước (tương tự item)
        this.cupModalCreated = false;

        // Thông số overlay phía trước (bình + ấm) có thể truyền từ map
        this.frontImage = config.frontImage || 'assets/images/items/thungda/binham.png';
        this.frontOffsetX = config.frontOffsetX || 35; // dịch so với x của thùng đá
        this.frontOffsetY = config.frontOffsetY || 130;
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
        container.style.marginLeft = '10%';
        container.style.marginBottom = '10%';


        this.hintImage = document.createElement('img');
        this.hintImage.style.maxWidth = '90%';
        this.hintImage.style.maxHeight = '90%';
        this.hintImage.style.objectFit = 'contain';
        this.hintImage.draggable = false;
        this.hintImage.addEventListener('click', () => this.onImageClick());
        container.appendChild(this.hintImage);

        // Close button đặt ở đỉnh giữa modal
        const closeBtn = document.createElement('button');
        Object.assign(closeBtn.style, {
            position: 'absolute',
            top: '60px',
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

        // Description
        const desc = document.createElement('div');
        desc.textContent = 'Một thùng đá cũ, có vẻ chứa thứ gì đó bên trong.';
        Object.assign(desc.style, {
            position: 'absolute',
            bottom: '3%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            color: 'white',
            fontSize: '24px',
            textAlign: 'center'
        });
        this.overlay.appendChild(desc);

        // Không đóng modal khi click container; chỉ xử lý qua hình hoặc button ngoài nếu muốn

        this.overlay.appendChild(container);
        document.body.appendChild(this.overlay);
        this.modalCreated = true;
        this.updateHintImage();
    }

    showModal(){
        this.overlay.style.display = 'flex';
        this.updateHintImage();
    }

    hideModal(){
        if (this.overlay) this.overlay.style.display='none';
    }

    onImageClick(){
        if(this.currentStep===1){
            this.currentStep=2;
            this.updateHintImage();
        } else if(this.currentStep===2){
            // Ẩn modal thùng đá và mở modal ca nước để thu thập
            if(!this.cupCollected){
                this.hideModal();
                this.showCupModal();
            } else {
                this.currentStep = 3;
                this.updateHintImage();
            }
        }
    }

    collectCup(){
        this.cupCollected=true;
        const cupItem={
            id:'cup_water',
            name:'Ca nước',
            image:'assets/images/items/thungda/canuoc_item.png',
            backgroundSize:'cover', // lấp đầy slot để tránh viền trống
            onClick:()=>{}
        };
        this.game.inventory.addItem(cupItem);
        this.game.audioManager.playItemSound();
    }

    updateHintImage(){
        let src;
        if(this.currentStep===1){
            src='assets/images/items/thungda/thungda_hint1.png';
        } else if(this.currentStep===2){
            src='assets/images/items/thungda/thungda_hint2.png';
        } else {
            src='assets/images/items/thungda/thungda_hint3.png';
        }
        if(this.hintImage) this.hintImage.src=src;
    }

    // Hiển thị modal phóng to ca nước để người chơi thu thập
    showCupModal(){
        if(!this.cupModalCreated){
            this.createCupModal();
        }
        this.cupOverlay.style.display='flex';
    }

    createCupModal(){
        this.cupOverlay = document.createElement('div');
        Object.assign(this.cupOverlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1001' // cao hơn hint overlay một chút
        });

        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';

        const img = document.createElement('img');
        img.src = 'assets/images/items/canuoc_item.png';
        img.style.maxWidth = '90%';
        img.style.maxHeight = '90%';
        img.style.objectFit = 'contain';
        img.draggable = false;
        container.appendChild(img);

        const desc = document.createElement('div');
        desc.textContent = 'Một ca nước mát lạnh.';
        Object.assign(desc.style, {
            position: 'absolute',
            bottom: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            fontSize: '24px',
            textAlign: 'center',
            width: '80%'
        });
        this.cupOverlay.appendChild(desc);

        container.addEventListener('click', (e) => {
            e.stopPropagation();
            this.cupOverlay.style.display = 'none';
            if(!this.cupCollected){
                this.collectCup();
            }
            // Chuyển sang bước 3 và hiển thị lại modal thùng đá (trạng thái đã lấy ca)
            this.currentStep = 3;
            this.updateHintImage();
            this.showModal();
        });

        this.cupOverlay.appendChild(container);
        document.body.appendChild(this.cupOverlay);
        this.cupModalCreated = true;
    }

    // override remove để xóa overlay front khi reset map
    remove(){
        super.remove();
        if (this.frontElement && this.frontElement.parentNode){
            this.frontElement.remove();
        }
    }
} 
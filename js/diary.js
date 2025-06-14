export default class Diary {
    constructor(game) {
        this.game = game;
        this.currentPage = 1;
        this.maxPages = 6;
        this.isOpen = false;
        this.customPages = {}; // lưu mapping pageNumber->custom image
        this.createDiaryUI();
    }

    createDiaryUI() {
        // Tạo container cho diary
        this.diaryElement = document.createElement('div');
        this.diaryElement.className = 'diary-modal';
        this.diaryElement.style.display = 'none';

        // Tạo phần hiển thị trang sách
        this.pageElement = document.createElement('div');
        this.pageElement.className = 'diary-page';
        
        // Thêm sự kiện click cho việc lật trang
        this.pageElement.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = this.pageElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const centerX = rect.width / 2;

            if (x < centerX) {
                this.prevPage();
            } else {
                this.nextPage();
            }
        });

        // Tạo nút đóng
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close-btn';
        closeButton.style.backgroundImage = "url('assets/images/button/exit.png')";
        closeButton.style.backgroundSize = 'contain';
        closeButton.style.backgroundPosition = 'center';
        closeButton.style.backgroundRepeat = 'no-repeat';
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeDiary();
        });

        // Thêm các phần tử vào container
        this.diaryElement.appendChild(this.pageElement);
        this.diaryElement.appendChild(closeButton);

        // Thêm vào game
        this.game.gameWrapper.appendChild(this.diaryElement);

        // Thêm sự kiện click bên ngoài để đóng diary
        document.addEventListener('click', (e) => {
            if (this.isOpen && e.target === this.diaryElement) {
                this.closeDiary();
            }
        });

        // Ngăn chặn sự kiện click trên diary không lan ra ngoài
        this.diaryElement.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Thêm hiệu ứng hover để chỉ ra vùng click
        this.pageElement.addEventListener('mousemove', (e) => {
            const rect = this.pageElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const centerX = rect.width / 2;

            // Always set to custom cursor for page interaction
            this.pageElement.style.cursor = "url('assets/images/chuot32x32.png'), auto";
            
            // Original logic (commented out as per user request to use custom cursor for all interactions)
            // if (x < centerX) {
            //     this.pageElement.style.cursor = this.currentPage > 1 ? 'w-resize' : 'default';
            // } else {
            //     this.pageElement.style.cursor = this.currentPage < this.maxPages ? 'e-resize' : 'default';
            // }
        });
    }

    openDiary() {
        this.isOpen = true;
        this.diaryElement.style.display = 'flex';
        this.showPage(1);
        // Vô hiệu hóa click events của game
        this.game.disableGameEvents();
    }

    closeDiary() {
        this.isOpen = false;
        this.diaryElement.style.display = 'none';
        // Kích hoạt lại click events của game
        this.game.enableGameEvents();
    }

    showPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > this.maxPages) return;
        
        // Chỉ phát âm thanh khi thực sự chuyển trang
        if (pageNumber !== this.currentPage) {
            this.game.audioManager.playBookSound();
        }
        
        this.currentPage = pageNumber;
        const src = this.customPages[pageNumber] || `assets/images/items/nhatky/${pageNumber}.png`;
        this.pageElement.style.backgroundImage = `url('${src}')`;
        this.pageElement.style.backgroundSize = 'contain';
        this.pageElement.style.backgroundPosition = 'center';
    }

    nextPage() {
        if (this.currentPage < this.maxPages) {
            this.showPage(this.currentPage + 1);
            // Chỉ phát book-sound, không phát get-item
            // this.game.audioManager.playItemSound();
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.showPage(this.currentPage - 1);
            // Chỉ phát book-sound, không phát get-item
            // this.game.audioManager.playItemSound();
        }
    }

    /* -------------------------------------------------------------- */
    // Hiệu ứng lật trang đặc biệt: hiện trang oldPage rồi từ từ overlay newPage
    /* -------------------------------------------------------------- */
    revealNewPage(oldPageNumber, newPageNumber, fadeTime = 2000) {
        // Bảo vệ tham số
        if (oldPageNumber < 1 || newPageNumber < 1 || newPageNumber > this.maxPages) {
            return;
        }

        // Đảm bảo diary đang mở
        if (!this.isOpen) {
            this.openDiary();
        }

        // Hiển thị trang cũ
        this.showPage(oldPageNumber);

        // Tạo overlay trang mới
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundImage: `url('assets/images/items/nhatky/${newPageNumber}.png')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            opacity: '0',
            transition: `opacity ${fadeTime}ms ease-in-out`,
            pointerEvents: 'none'
        });

        // Bảo đảm pageElement là relative
        this.pageElement.style.position = 'relative';
        this.pageElement.appendChild(overlay);

        // Trigger fade
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 50);

        // Sau khi hoàn tất, đặt currentPage và xoá overlay cho sạch
        setTimeout(() => {
            this.currentPage = newPageNumber;
            // đặt background chính thành trang mới
            this.pageElement.style.backgroundImage = `url('assets/images/items/nhatky/${newPageNumber}.png')`;
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, fadeTime + 100);
    }

    /* -------------------------------------------------------------- */
    // Thay thế hình ảnh của pageNumber bằng newImageSrc với hiệu ứng fade
    /* -------------------------------------------------------------- */
    replacePageImage(pageNumber, newImageSrc, fadeTime = 2000) {
        if (pageNumber < 1 || pageNumber > this.maxPages) return;

        if (!this.isOpen) this.openDiary();

        // Hiển thị trang hiện tại (giữ nguyên pageNumber)
        this.showPage(pageNumber);

        // Overlay ảnh mới
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundImage: `url('${newImageSrc}')`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: '0',
            transition: `opacity ${fadeTime}ms ease-in-out`,
            pointerEvents: 'none'
        });
        this.pageElement.style.position = 'relative';
        this.pageElement.appendChild(overlay);

        setTimeout(()=>{ overlay.style.opacity='1'; },50);

        setTimeout(()=>{
            this.customPages[pageNumber] = newImageSrc;
            this.pageElement.style.backgroundImage = `url('${newImageSrc}')`;
            if(overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, fadeTime+100);
    }
} 
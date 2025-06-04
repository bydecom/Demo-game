export default class Diary {
    constructor(game) {
        this.game = game;
        this.currentPage = 1;
        this.maxPages = 6;
        this.isOpen = false;
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
        closeButton.className = 'diary-close-button';
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
        this.pageElement.style.backgroundImage = `url('assets/images/items/nhatky/${pageNumber}.png')`;
    }

    nextPage() {
        if (this.currentPage < this.maxPages) {
            this.showPage(this.currentPage + 1);
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.showPage(this.currentPage - 1);
        }
    }
} 
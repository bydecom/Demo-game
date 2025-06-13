export default class MatKhau {
    constructor(canvas, width = 400, height = 300) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        
        // Thiết lập kích thước canvas
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Trạng thái mật khẩu
        this.password = '';
        this.maxLength = 4;
        this.isUnlocked = false;
        this.correctPassword = '5236'; // Mật khẩu mặc định
        this.showError = false;
        this.errorTime = 0;
        
        // Bind sự kiện
        this.setupControls();
        
        // Vẽ giao diện ban đầu
        this.draw();
    }
    
    setupControls() {
        // Lắng nghe sự kiện keydown
        this.keyHandler = (e) => {
            if (this.isUnlocked) return;
            
            // Chỉ cho phép số 0-9
            if (e.key >= '0' && e.key <= '9' && this.password.length < this.maxLength) {
                this.password += e.key;
                this.draw();
            }
            // Backspace để xóa
            else if (e.key === 'Backspace' && this.password.length > 0) {
                this.password = this.password.slice(0, -1);
                this.draw();
            }
            // Enter để kiểm tra mật khẩu
            else if (e.key === 'Enter' && this.password.length === this.maxLength) {
                this.checkPassword();
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
        
        // Click trên canvas để focus
        this.canvas.addEventListener('click', () => {
            this.canvas.focus();
        });
        
        // Đặt canvas có thể focus
        this.canvas.setAttribute('tabindex', '0');
    }
    
    checkPassword() {
        if (this.password === this.correctPassword) {
            this.isUnlocked = true;
            this.showError = false;
            this.draw();
            // Callback khi mật khẩu đúng
            if (this.onUnlock) {
                this.onUnlock();
            }
        } else {
            this.showError = true;
            this.errorTime = Date.now();
            this.password = '';
            this.draw();
            
            // Gọi callback onError nếu có
            if (this.onError) {
                this.onError();
            }
            
            // Ẩn lỗi sau 2 giây
            setTimeout(() => {
                this.showError = false;
                this.draw();
            }, 2000);
        }
    }
    
    draw() {
        // Clear canvas với màu nền Windows XP
        this.ctx.fillStyle = '#ECE9D8';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Vẽ border window
        this.drawWindowBorder();
        
        // Vẽ title bar
        this.drawTitleBar();
        
        // Vẽ nội dung chính
        this.drawContent();
    }
    
    drawWindowBorder() {
        // Border ngoài (3D effect)
        this.ctx.strokeStyle = '#DFDFDF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(1, 1, this.width - 2, this.height - 2);
        
        // Border trong
        this.ctx.strokeStyle = '#404040';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(3, 3, this.width - 6, this.height - 6);
    }
    
    drawTitleBar() {
        // Background title bar (gradient xanh XP)
        const gradient = this.ctx.createLinearGradient(0, 4, 0, 28);
        gradient.addColorStop(0, '#0A246A');
        gradient.addColorStop(0.5, '#3F7BCF');
        gradient.addColorStop(1, '#0A246A');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(4, 4, this.width - 8, 24);
        
        // Title text
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '11px Tahoma, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Đăng nhập', 8, 20);
        
        // Close button (X)
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(this.width - 20, 6, 14, 14);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('×', this.width - 13, 16);
    }
    
    drawContent() {
        const centerX = this.width / 2;
        const startY = 60;
        
        if (this.isUnlocked) {
            // Màn hình đã mở khóa
            this.ctx.fillStyle = '#00AA00';
            this.ctx.font = '16px Tahoma, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('✓ Đăng nhập thành công!', centerX, startY + 40);
            this.ctx.fillStyle = '#666666';
            this.ctx.font = '12px Tahoma, sans-serif';
            this.ctx.fillText('Chào mừng bạn đến với hệ thống', centerX, startY + 70);
            return;
        }
        
        // Icon khóa
        this.drawLockIcon(centerX, startY);
        
        // Text "Nhập mật khẩu để mở khóa"
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '12px Tahoma, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Nhập mật khẩu để mở khóa', centerX, startY + 50);
        
        // Ô nhập mật khẩu
        this.drawPasswordBoxes(centerX, startY + 80);
        
        // Hướng dẫn
        this.ctx.fillStyle = '#666666';
        this.ctx.font = '10px Tahoma, sans-serif';
        this.ctx.fillText('Nhập 4 chữ số, nhấn Enter để xác nhận', centerX, startY + 140);
        
        // Hiển thị lỗi nếu có
        if (this.showError) {
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = '11px Tahoma, sans-serif';
            this.ctx.fillText('❌ Mật khẩu không đúng!', centerX, startY + 160);
        }
    }
    
    drawLockIcon(centerX, y) {
        // Vẽ icon khóa đơn giản
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        
        // Phần móc khóa
        this.ctx.beginPath();
        this.ctx.arc(centerX, y + 5, 8, Math.PI, 0, false);
        this.ctx.stroke();
        
        // Thân khóa
        this.ctx.fillRect(centerX - 10, y + 5, 20, 15);
        
        // Lỗ khóa
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(centerX, y + 10, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Thanh nhỏ dưới lỗ khóa
        this.ctx.fillRect(centerX - 1, y + 12, 2, 4);
    }
    
    drawPasswordBoxes(centerX, y) {
        const boxSize = 25;
        const spacing = 10;
        const totalWidth = (boxSize * this.maxLength) + (spacing * (this.maxLength - 1));
        const startX = centerX - totalWidth / 2;
        
        for (let i = 0; i < this.maxLength; i++) {
            const x = startX + i * (boxSize + spacing);
            
            // Vẽ ô input (3D effect)
            // Border ngoài sáng
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(x - 1, y - 1, boxSize + 2, boxSize + 2);
            
            // Border trong tối
            this.ctx.fillStyle = '#808080';
            this.ctx.fillRect(x, y, boxSize, boxSize);
            
            // Nền trắng
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(x + 1, y + 1, boxSize - 2, boxSize - 2);
            
            // Hiển thị dấu * nếu đã nhập
            if (i < this.password.length) {
                this.ctx.fillStyle = '#000000';
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('●', x + boxSize / 2, y + boxSize / 2 + 5);
            }
            
            // Cursor nhấp nháy ở ô hiện tại
            if (i === this.password.length && Math.floor(Date.now() / 500) % 2) {
                this.ctx.fillStyle = '#0000FF';
                this.ctx.fillRect(x + boxSize / 2 - 1, y + 5, 2, boxSize - 10);
            }
        }
    }
    
    destroy() {
        // Cleanup
        document.removeEventListener('keydown', this.keyHandler);
    }
    
    // Setter cho callback khi mở khóa thành công
    setOnUnlock(callback) {
        this.onUnlock = callback;
    }
    
    // Setter cho mật khẩu
    setPassword(newPassword) {
        this.correctPassword = newPassword;
    }
    
    // Setter cho callback khi nhập sai mật khẩu
    setOnError(callback) {
        this.onError = callback;
    }
} 
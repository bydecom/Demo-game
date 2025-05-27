import Hint from '../hint.js';

export default class Computer extends Hint {
    constructor(config) {
        super(config);
        this.isOn = false;
        this.password = '1234'; // Ví dụ mật khẩu
        this.attempts = 0;
        this.maxAttempts = 3;
    }

    onClick() {
        if (!this.isOn) {
            this.turnOn();
        } else {
            this.promptPassword();
        }
    }

    turnOn() {
        this.isOn = true;
        // Thay đổi hình ảnh sang máy tính đã bật
        this.element.style.backgroundImage = "url('assets/images/item/computer.png')";
        this.game.messageManager.showMessage("Máy tính đã được bật. Nhập mật khẩu để truy cập.");
        this.promptPassword();
    }

    promptPassword() {
        if (this.attempts >= this.maxAttempts) {
            this.game.messageManager.showMessage("Máy tính đã bị khóa do nhập sai quá nhiều lần!");
            return;
        }

        const password = prompt("Nhập mật khẩu để truy cập máy tính:");
        
        if (password === null) {
            return; // Người dùng đã hủy
        }

        if (password === this.password) {
            this.unlockComputer();
        } else {
            this.attempts++;
            const remainingAttempts = this.maxAttempts - this.attempts;
            this.game.messageManager.showMessage(
                `Mật khẩu không đúng! Còn ${remainingAttempts} lần thử.`
            );
        }
    }

    unlockComputer() {
        // Hiển thị nội dung khi mở khóa thành công
        this.game.messageManager.showMessage(
            "Đăng nhập thành công! Bạn tìm thấy một tệp tin bí mật..."
        );
        
        // Có thể thêm các hành động khác ở đây
        // Ví dụ: Mở một dialog box, thay đổi trạng thái game, v.v.
        setTimeout(() => {
            alert("Nội dung tệp tin bí mật:\n\nMật mã để mở cửa kho báu là: 'TREASURE'");
        }, 1000);
    }
} 
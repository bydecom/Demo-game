export default class MessageManager {
    constructor(messages = []) {
        this.messageElement = document.getElementById('message');
        this.messages = messages.length > 0 ? messages : [
            "Đến đây rồi!",
            "Tôi đang di chuyển!",
            "Thật thú vị!",
            "Đi đến đó!",
            "Chỗ này trông đẹp đấy!"
        ];
    }
    
    updateMessages(newMessages) {
        if (newMessages && newMessages.length > 0) {
            this.messages = newMessages;
        }
    }
    
    showMessage(message) {
        this.messageElement.textContent = message;
        this.messageElement.style.opacity = '1';
        
        setTimeout(() => {
            this.messageElement.style.opacity = '0';
        }, 3000);
    }
    
    showInitialMessage() {
        setTimeout(() => {
            this.messageElement.style.opacity = '1';
            setTimeout(() => {
                this.messageElement.style.opacity = '0';
            }, 3000);
        }, 500);
    }
    
    showRandomMessage() {
        const randomMessage = this.messages[Math.floor(Math.random() * this.messages.length)];
        this.showMessage(randomMessage);
    }
} 
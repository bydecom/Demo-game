export default class MessageManager {
    constructor(messages = []) {
        this.messageElement = document.getElementById('message');
        // Ẩn hoàn toàn phần tử message nếu tồn tại
        if (this.messageElement) {
            this.messageElement.style.display = 'none';
        }

        // Không lưu trữ messages nữa – bỏ global messages
        this.messages = [];
    }
    
    updateMessages(newMessages) {
        if (newMessages && newMessages.length > 0) {
            this.messages = newMessages;
        }
    }
    
    // Vô hiệu hoá hiển thị message
    showMessage(_) { /* no-op */ }
    
    showInitialMessage() { /* no-op */ }
    
    showRandomMessage() { /* no-op */ }
} 
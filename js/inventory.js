export default class Inventory {
    constructor(game) {
        this.game = game;
        this.items = [];
        this.inventoryElement = null;
        
        // Tạo UI inventory
        this.createInventoryUI();
    }
    
    createInventoryUI() {
        // Tạo container cho inventory
        this.inventoryElement = document.createElement('div');
        this.inventoryElement.className = 'inventory';
        
        // Tạo tiêu đề
        const title = document.createElement('div');
        title.className = 'inventory-title';
        title.textContent = 'Túi đồ';
        this.inventoryElement.appendChild(title);
        
        // Tạo container cho items
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'inventory-items';
        this.inventoryElement.appendChild(itemsContainer);
        
        // Thêm nút mở/đóng inventory
        const toggleButton = document.createElement('button');
        toggleButton.className = 'inventory-toggle';
        
        // Tạo hình ảnh cho nút
        const baloImage = document.createElement('img');
        baloImage.src = 'assets/images/items/balo.png';
        baloImage.style.width = '100%';
        baloImage.style.height = '100%';
        baloImage.style.objectFit = 'contain';
        toggleButton.appendChild(baloImage);
        
        // Chỉ thêm sự kiện ngăn chặn click lan truyền
        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Thêm vào game
        this.game.gameWrapper.appendChild(this.inventoryElement);
        this.game.gameWrapper.appendChild(toggleButton);
        
        // Thêm stopPropagation cho inventory element
        this.inventoryElement.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    addItem(item) {
        // Thêm item vào danh sách
        this.items.push(item);
        
        // Tạo UI cho item
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.style.backgroundImage = `url('${item.image}')`;
        itemElement.title = item.name;
        
        // Hiển thị thông tin khi hover
        itemElement.addEventListener('mouseover', () => {
            this.game.messageManager.showMessage(`${item.name}: Đã thu thập`);
        });
        
        // Ngăn chặn sự kiện click lan truyền
        itemElement.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Thêm item vào inventory UI
        const itemsContainer = this.inventoryElement.querySelector('.inventory-items');
        itemsContainer.appendChild(itemElement);
        
        // Lưu reference đến element trong item
        item.inventoryElement = itemElement;
        
        // Cập nhật UI - hiển thị số lượng item
        this.updateUI();
    }
    
    removeItem(itemId) {
        // Tìm item theo ID
        const index = this.items.findIndex(item => item.id === itemId);
        
        if (index !== -1) {
            const item = this.items[index];
            
            // Xóa item khỏi danh sách
            this.items.splice(index, 1);
            
            // Xóa UI của item
            if (item.inventoryElement) {
                item.inventoryElement.remove();
            }
            
            // Cập nhật UI
            this.updateUI();
        }
    }
    
    hasItem(itemId) {
        return this.items.some(item => item.id === itemId);
    }
    
    updateUI() {
        // Cập nhật số lượng item
        const count = this.items.length;
        
        // Cập nhật tiêu đề
        const title = this.inventoryElement.querySelector('.inventory-title');
        title.textContent = `Túi đồ (${count})`;
        
        // Hiệu ứng nếu có item mới
        if (count > 0) {
            const toggleButton = document.querySelector('.inventory-toggle');
            toggleButton.classList.add('has-items');
            
            // Xóa class sau 1 giây
            setTimeout(() => {
                toggleButton.classList.remove('has-items');
            }, 1000);
        }
    }
    
    clear() {
        // Xóa tất cả items
        this.items = [];
        
        // Xóa tất cả item elements trong UI
        const itemsContainer = this.inventoryElement.querySelector('.inventory-items');
        itemsContainer.innerHTML = '';
        
        // Cập nhật UI
        this.updateUI();
    }
    
    clearItems() {
        // Xóa tất cả items trong inventory
        this.items = [];
        
        // Xóa tất cả items khỏi UI
        const itemsContainer = this.inventoryElement.querySelector('.inventory-items');
        while (itemsContainer.firstChild) {
            itemsContainer.removeChild(itemsContainer.firstChild);
        }
    }
} 
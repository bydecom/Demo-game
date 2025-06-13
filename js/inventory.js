export default class Inventory {
    constructor(game) {
        this.game = game;
        this.items = [];
        this.collectedItems = new Set(); // Để theo dõi các item đã thu thập
        this.maxSlots = 5; // Số lượng slots tối đa
        this.inventoryElement = null;
        this.isOpen = false;
        this.autoCloseTimeout = null; // timeout tự động đóng
        
        // Kích thước gốc của slot.png
        this.slotImageWidth = 1899;
        this.slotImageHeight = 327;
        this.sidePadding = 60; // Padding hai bên của ảnh gốc
        
        // Vị trí slot đầu tiên và khoảng cách giữa các slot
        const firstSlotX = this.sidePadding + 60; // Vị trí x của slot đầu tiên
        const slotSpacing = 360; // Khoảng cách cố định giữa các slot
        
        // Tọa độ các slot (tính từ góc trái của slot.png)
        this.slotPositions = [
            { x: firstSlotX, y: 35 },                    // Slot 1: 120
            { x: firstSlotX + slotSpacing, y: 35 },     // Slot 2: 495
            { x: firstSlotX + slotSpacing * 2, y: 35 }, // Slot 3: 870
            { x: firstSlotX + slotSpacing * 3, y: 35 }, // Slot 4: 1245
            { x: firstSlotX + slotSpacing * 4, y: 35 }  // Slot 5: 1620
        ];
        
        // Kích thước hiển thị (scale để vừa màn hình)
        this.displayWidth = 450; // Điều chỉnh kích thước hiển thị
        this.scale = this.displayWidth / this.slotImageWidth;
        this.displayHeight = this.slotImageHeight * this.scale;
        
        // Kích thước của từng item trong slot
        this.itemSize = 60; 
        this.itemOffset = 5; // Khoảng cách từ mép slot đến item
        
        // Tạo UI inventory
        this.createInventoryUI();
    }
    
    createInventoryUI() {
        // Tạo container cho inventory
        this.inventoryElement = document.createElement('div');
        this.inventoryElement.className = 'inventory';
        this.inventoryElement.style.position = 'fixed';
        this.inventoryElement.style.top = '20px';
        this.inventoryElement.style.left = '50%';
        this.inventoryElement.style.transform = 'translateX(-50%)';
        this.inventoryElement.style.display = 'none';
        this.inventoryElement.style.width = `${this.displayWidth}px`;
        this.inventoryElement.style.height = `${this.displayHeight}px`;
        this.inventoryElement.style.backgroundImage = "url('assets/images/items/slot.png')";
        this.inventoryElement.style.backgroundSize = 'contain';
        this.inventoryElement.style.backgroundRepeat = 'no-repeat';
        this.inventoryElement.style.zIndex = '1001';
        
        // Tạo containers cho từng slot
        this.slotPositions.forEach((pos, index) => {
            const itemContainer = document.createElement('div');
            itemContainer.className = 'inventory-item';
            itemContainer.style.position = 'absolute';
            itemContainer.style.left = `${pos.x * this.scale + this.itemOffset}px`;
            itemContainer.style.top = `${pos.y * this.scale + this.itemOffset}px`;
            itemContainer.style.width = `${this.itemSize}px`;
            itemContainer.style.height = `${this.itemSize}px`;
            itemContainer.style.backgroundSize = 'contain';
            itemContainer.style.backgroundRepeat = 'no-repeat';
            itemContainer.style.backgroundPosition = 'center';
            
            // Reset timer khi click vào item
            itemContainer.addEventListener('click', (e) => {
                this.startAutoCloseTimer();
            });
            
            this.inventoryElement.appendChild(itemContainer);
        });
        
        // Thêm nút mở/đóng inventory
        const toggleButton = document.createElement('button');
        toggleButton.className = 'inventory-toggle';
        toggleButton.style.position = 'fixed';
        toggleButton.style.bottom = '20px';
        toggleButton.style.left = '50px';
        toggleButton.style.width = '100px';
        toggleButton.style.height = '100px';
        toggleButton.style.border = 'none';
        toggleButton.style.borderRadius = '5px';
        toggleButton.style.zIndex = '1001';
        
        // Tạo hình ảnh cho nút
        const baloImage = document.createElement('img');
        baloImage.src = 'assets/images/items/balo.png';
        baloImage.style.width = '100%';
        baloImage.style.height = '100%';
        baloImage.style.objectFit = 'contain';
        baloImage.draggable = false; // Ngăn kéo thả hình balo
        toggleButton.appendChild(baloImage);
        
        // Thêm sự kiện click để mở/đóng inventory
        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleInventory();
        });
        
        // Thêm vào game
        this.game.gameWrapper.appendChild(this.inventoryElement);
        this.game.gameWrapper.appendChild(toggleButton);
        
        // Thêm stopPropagation cho inventory element
        this.inventoryElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.startAutoCloseTimer(); // reset timer khi click inventory
        });
    }

    toggleInventory() {
        if (this.isOpen) {
            this.closeInventory();
        } else {
            this.openInventory();
        }
    }

    openInventory() {
        this.inventoryElement.style.display = 'block';
        this.isOpen = true;
        this.startAutoCloseTimer();
    }

    closeInventory() {
        this.inventoryElement.style.display = 'none';
        this.isOpen = false;
        this.clearAutoCloseTimer();
    }

    startAutoCloseTimer() {
        this.clearAutoCloseTimer();
        this.autoCloseTimeout = setTimeout(() => {
            this.closeInventory();
        }, 10000);
    }

    clearAutoCloseTimer() {
        if (this.autoCloseTimeout) {
            clearTimeout(this.autoCloseTimeout);
            this.autoCloseTimeout = null;
        }
    }
    
    addItem(item) {
        if (this.items.length >= this.maxSlots) {
            this.game.messageManager.showMessage("Túi đồ đã đầy!");
            return false;
        }

        // Thêm item vào danh sách và đánh dấu đã thu thập
        this.items.push(item);
        this.collectedItems.add(item.id);
        
        // Tìm slot trống đầu tiên
        const slots = this.inventoryElement.querySelectorAll('.inventory-item');
        const emptySlot = Array.from(slots).find(slot => !slot.style.backgroundImage || slot.style.backgroundImage === 'none');
        
        if (emptySlot) {
            // Thêm item vào slot, ưu tiên sử dụng inventoryImage nếu có
            emptySlot.style.backgroundImage = `url('${item.inventoryImage || item.image}')`;
            // Nếu item có chỉ định kích thước background riêng cho inventory thì ghi đè
            if (item.backgroundSize) {
                emptySlot.style.backgroundSize = item.backgroundSize;
            }
            emptySlot.title = item.name;
            
            // Làm cho slot có thể kéo được
            emptySlot.className = emptySlot.className ? emptySlot.className + ' draggable-item' : 'inventory-item draggable-item';
            // Lưu ID của item vào thuộc tính dataset để dễ dàng lấy ra khi kéo
            emptySlot.dataset.itemId = item.id; 

            // Sự kiện khi bắt đầu kéo
            emptySlot.addEventListener('dragstart', (e) => {
                this.startAutoCloseTimer(); // reset timer khi bắt đầu kéo
                e.dataTransfer.setData('text/plain', item.id); // Truyền ID của item
                e.dataTransfer.effectAllowed = 'move'; // Cho phép di chuyển item
                emptySlot.style.opacity = '0.5'; // Giảm độ mờ khi kéo
            });

            // Sự kiện khi kết thúc kéo
            emptySlot.addEventListener('dragend', () => {
                emptySlot.style.opacity = '1'; // Khôi phục độ mờ
                this.startAutoCloseTimer(); // reset timer khi kết thúc kéo
            });

            // Sự kiện khi đang kéo qua inventory
            this.inventoryElement.addEventListener('dragover', (e) => {
                this.startAutoCloseTimer();
            });

            // Thêm hover effect
            emptySlot.addEventListener('mouseover', () => {
                this.game.messageManager.showMessage(`${item.name}: Đã thu thập`);
            });

            // Thêm click event cho item (nếu có)
            if (item.onClick) {
                emptySlot.addEventListener('click', (e) => {
                    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
                    item.onClick();
                });
            }
        }
        
        // Hiệu ứng khi có item mới
        const toggleButton = document.querySelector('.inventory-toggle');
        toggleButton.classList.add('has-items');
        setTimeout(() => {
            toggleButton.classList.remove('has-items');
        }, 1000);

        return true;
    }
    
    removeItem(itemId) {
        const index = this.items.findIndex(item => item.id === itemId);
        
        if (index !== -1) {
            // Xóa item khỏi danh sách
            this.items.splice(index, 1);
            this.collectedItems.delete(itemId);
            
            // Cập nhật UI - tìm slot chứa item đã xóa
            const slots = this.inventoryElement.querySelectorAll('.inventory-item');
            let targetSlot = null;
            // Tìm slot dựa trên dataset.itemId
            for (let i = 0; i < slots.length; i++) {
                if (slots[i].dataset.itemId === itemId) {
                    targetSlot = slots[i];
                    break;
                }
            }

            if (targetSlot) {
                targetSlot.style.backgroundImage = 'none'; // Xóa hình ảnh
                targetSlot.title = ''; // Xóa tooltip
                targetSlot.className = 'inventory-item'; // Xóa class draggable-item
                delete targetSlot.dataset.itemId; // Xóa dữ liệu item id
                
                // (Tùy chọn) Xóa bỏ các event listener nếu được thêm riêng lẻ cho slot này
            }
        }
    }
    
    hasItem(itemId) {
        return this.collectedItems.has(itemId);
    }
    
    clearItems() {
        // Xóa tất cả items
        this.items = [];
        this.collectedItems.clear();
        
        // Xóa items khỏi tất cả các slots
        const slots = this.inventoryElement.querySelectorAll('.inventory-item');
        slots.forEach(slot => {
            slot.style.backgroundImage = 'none';
            slot.title = '';
        });
    }
} 
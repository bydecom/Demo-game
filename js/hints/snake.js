export default class SnakeGame {
    constructor(canvas, width = 500, height = 500) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        
        // Kích thước viền bao (margin) – vùng chơi thực sẽ nằm bên trong
        this.margin = 40; // px
        
        // Khu vực chơi thực tế (không thay đổi kích thước tổng canvas)
        this.playWidth  = this.width  - this.margin * 2;
        this.playHeight = this.height - this.margin * 2;
        
        // Thiết lập kích thước canvas
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Kích thước ô
        this.gridSize = 20;
        
        // FIX: Đảm bảo khu vực chơi chia hết cho gridSize
        this.actualPlayWidth = Math.floor(this.playWidth / this.gridSize) * this.gridSize;
        this.actualPlayHeight = Math.floor(this.playHeight / this.gridSize) * this.gridSize;
        
        this.tileCount = {
            x: this.actualPlayWidth / this.gridSize,   // Chính xác hơn
            y: this.actualPlayHeight / this.gridSize   // Chính xác hơn
        };
        
        // Khởi tạo game
        this.reset();
        
        this.isDestroyed = false;
        this.rafId = null;

        // Bind key handler for removal later
        this.keydownHandler = (e) => {
            if (!this.gameStarted && !this.gameOver) {
                this.gameStarted = true;
                this.direction = { x: 1, y: 0 };
                this.nextDirection = { x: 1, y: 0 };
                return;
            }

            if (this.gameOver && e.code === 'Space') {
                this.reset();
                return;
            }

            switch (e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: -1 };
                    }
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: 1 };
                    }
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: -1, y: 0 };
                    }
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: 1, y: 0 };
                    }
                    break;
            }
        };
        document.addEventListener('keydown', this.keydownHandler);
        
        // Bắt đầu game loop
        this.gameLoop();
    }
    
    reset() {
        // Vị trí ban đầu của rắn
        this.snake = [
            { x: Math.floor(this.tileCount.x / 2), y: Math.floor(this.tileCount.y / 2) }
        ];
        
        // Hướng di chuyển
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        
        // Tạo thức ăn
        this.generateFood();
        
        // Điểm số
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        
        // FPS
        this.lastTime = 0;
        this.gameSpeed = 150; // ms giữa các frame
    }
    
    generateFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount.x),
                y: Math.floor(Math.random() * this.tileCount.y)
            };
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
    }
    
    update() {
        if (!this.gameStarted || this.gameOver) return;
        
        // Cập nhật hướng
        this.direction = { ...this.nextDirection };
        
        // Di chuyển rắn
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // FIX: Kiểm tra va chạm với tường - sử dụng tileCount chính xác
        if (head.x < 0 || head.x >= this.tileCount.x || 
            head.y < 0 || head.y >= this.tileCount.y) {
            this.gameOver = true;
            return;
        }
        
        // Kiểm tra va chạm với thân rắn
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver = true;
            return;
        }
        
        this.snake.unshift(head);
        
        // Kiểm tra ăn thức ăn
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.generateFood();
            
            // Tăng tốc độ game một chút
            if (this.gameSpeed > 80) {
                this.gameSpeed -= 2;
            }
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        // Xóa canvas toàn bộ
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // FIX: Vẽ viền bao ngoài khu vực chơi thực tế
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(
            this.margin - 1.5, 
            this.margin - 1.5, 
            this.actualPlayWidth + 3, 
            this.actualPlayHeight + 3
        );
        
        // FIX: Vẽ grid trong khu vực chơi thực tế
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.actualPlayWidth; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin + x, this.margin);
            this.ctx.lineTo(this.margin + x, this.margin + this.actualPlayHeight);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.actualPlayHeight; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin, this.margin + y);
            this.ctx.lineTo(this.margin + this.actualPlayWidth, this.margin + y);
            this.ctx.stroke();
        }
        
        // Vẽ thức ăn
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(
            this.margin + this.food.x * this.gridSize,
            this.margin + this.food.y * this.gridSize,
            this.gridSize,
            this.gridSize
        );
        
        // Vẽ rắn
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#00ff00' : '#00aa00'; // Đầu sáng hơn thân
            this.ctx.fillRect(
                this.margin + segment.x * this.gridSize,
                this.margin + segment.y * this.gridSize,
                this.gridSize,
                this.gridSize
            );

            // Thêm chấm bông vàng cho thân (không áp dụng cho đầu)
            if (index !== 0) {
                this.ctx.fillStyle = '#ffff00'; // Màu vàng cho chấm bông
                this.ctx.beginPath();
                this.ctx.arc(
                    this.margin + segment.x * this.gridSize + this.gridSize / 2, // tâm X của ô
                    this.margin + segment.y * this.gridSize + this.gridSize / 2, // tâm Y của ô
                    this.gridSize / 4, // bán kính chấm
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            }
        });
        
        // Vẽ điểm số ở góc trên bên trái, bên ngoài khu vực chơi
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 25);
        
        // Debug info - có thể bỏ sau khi test
        this.ctx.fillText(`Grid: ${this.tileCount.x}x${this.tileCount.y}`, 10, this.height - 10);
        
        // Vẽ hướng dẫn hoặc game over
        if (!this.gameStarted && !this.gameOver) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Nhấn phím bất kỳ để bắt đầu', this.width / 2, this.height / 2);
            this.ctx.fillText('Sử dụng WASD hoặc mũi tên', this.width / 2, this.height / 2 + 20);
            this.ctx.textAlign = 'left';
        }
        
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 20);
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 10);
            this.ctx.fillText('Nhấn SPACE để chơi lại', this.width / 2, this.height / 2 + 40);
            this.ctx.textAlign = 'left';
        }
    }
    
    gameLoop(currentTime = 0) {
        if (this.isDestroyed) return; // stop if destroyed
        if (currentTime - this.lastTime >= this.gameSpeed) {
            this.update();
            this.draw();
            this.lastTime = currentTime;
        }
        
        this.rafId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    destroy() {
        this.isDestroyed = true;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        document.removeEventListener('keydown', this.keydownHandler);
    }
}
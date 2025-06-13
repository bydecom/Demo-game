export default class SnakeGame {
    constructor(canvas, width = 500, height = 500) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        
        // Thiết lập kích thước canvas
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Kích thước ô
        this.gridSize = 20;
        this.tileCount = {
            x: Math.floor(this.width / this.gridSize),
            y: Math.floor(this.height / this.gridSize)
        };
        
        // Khởi tạo game
        this.reset();
        
        // Bind sự kiện bàn phím
        this.setupControls();
        
        // Bắt đầu game loop
        this.gameLoop();
    }
    
    reset() {
        // Vị trí ban đầu của rắn
        this.snake = [
            { x: 10, y: 10 }
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
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
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
        });
    }
    
    update() {
        if (!this.gameStarted || this.gameOver) return;
        
        // Cập nhật hướng
        this.direction = { ...this.nextDirection };
        
        // Di chuyển rắn
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Kiểm tra va chạm với tường
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
        // Xóa canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Vẽ grid (tùy chọn)
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        
        // Vẽ thức ăn
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(
            this.food.x * this.gridSize + 1,
            this.food.y * this.gridSize + 1,
            this.gridSize - 2,
            this.gridSize - 2
        );
        
        // Vẽ rắn
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#00ff00' : '#00aa00'; // Đầu sáng hơn thân
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        
        // Vẽ điểm số
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 25);
        
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
        if (currentTime - this.lastTime >= this.gameSpeed) {
            this.update();
            this.draw();
            this.lastTime = currentTime;
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    destroy() {
        // Cleanup nếu cần
        this.gameOver = true;
    }
} 
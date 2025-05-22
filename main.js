import Game from './js/game.js';
 
// Khởi tạo game khi trang đã load xong
window.addEventListener('load', () => {
    const game = new Game();
    game.start();
}); 
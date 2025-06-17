export default class CastScene2 {
  constructor(config = {}) {
    this.container  = config.container || document.body;
    this.delay      = config.delay     || 2500;   // ms trước khi hiện chữ
    this.fadeTime   = config.fadeTime  || 3000;   // thời gian chữ fade-in
    this.zIndex     = config.zIndex    || 3000;   // trên mọi thứ
    this.onFinish   = config.onFinish  || null;

    this.game = config.game || null;
    this.creditScrollTime = config.creditScrollTime || 15000; // thời gian cuộn credit
    
    // Thêm config cho logo ghép
    this.logo = "/assets/images/logo.png";  // đường dẫn logo đã ghép

    this._init();
  }

  _init() {
    // Tạo overlay đen chiếm toàn màn hình
    this.overlay = document.createElement('div');
    Object.assign(this.overlay.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3002,
      overflow: 'hidden'
    });
    this.container.appendChild(this.overlay);

    // Tạo phần tử chữ "KẾT THÚC!"
    this.textEl = document.createElement('div');
    this.textEl.textContent = 'KẾT THÚC!';
    Object.assign(this.textEl.style, {
      color: '#fff',
      fontSize: '60px',
      fontWeight: 'bold',
      opacity: '0',
      transition: `opacity ${this.fadeTime}ms ease-in-out`,
      textAlign: 'center',
      lineHeight: '1'
    });
    this.overlay.appendChild(this.textEl);

    // Sau delay, fade chữ vào
    setTimeout(() => {
      this.textEl.style.opacity = '1';
      if (this.onFinish) {
        setTimeout(() => this.onFinish(), this.fadeTime);
      }

      // Cho phép click để xem credit khi chữ đã hiện ra
      this.overlay.addEventListener('click', () => this._showCredits(), { once: true });
    }, this.delay);
  }

  _showCredits() {
    // Ẩn chữ Kết Thúc
    this.textEl.style.transition = 'opacity 1s ease';
    this.textEl.style.opacity = '0';

    // Sau khi fade out, xoá textEl
    setTimeout(() => {
      if (this.textEl && this.textEl.parentNode) this.textEl.parentNode.removeChild(this.textEl);
      this._createCredits();
    }, 1000);
  }

  _createCredits() {
    // Inject keyframes nếu chưa có
    if (!document.getElementById('credit-scroll-style')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'credit-scroll-style';
      styleEl.textContent = `@keyframes scrollCredits {0%{transform: translate(-50%, 100vh);}100%{transform: translate(-50%, -100%);}}`;
      document.head.appendChild(styleEl);
    }

    this.creditContainer = document.createElement('div');
    Object.assign(this.creditContainer.style, {
      position: 'absolute',
      left: '50%',
      top: '0',
      transform: 'translate(-50%, 100vh)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: '#fff',
      fontSize: '20px',
      fontFamily: 'inherit',
      lineHeight: '1.4',
      pointerEvents: 'none',
      whiteSpace: 'pre-line',
      textAlign: 'center',
      animation: `scrollCredits ${this.creditScrollTime}ms linear forwards`
    });

    // Nội dung credit dựa theo hình
    const lines = [
      ['Giáo viên hướng dẫn', 'Ths. Đào Đức Khôi'],
      ['Nhà sản xuất', 'Phan Thị Mẫn'],
      ['Design', 'Phan Thị Mẫn'],
      ['Art', 'Phan Thị Mẫn'],
      ['Kịch bản', 'Phan Thị Mẫn'],
      ['Programming', 'Thái Minh Bằng']
    ];

    lines.forEach(([role, name]) => {
      const roleEl = document.createElement('div');
      roleEl.style.fontWeight = '700';
      roleEl.style.marginTop = '20px'; // Thêm khoảng cách giữa các mục
      roleEl.textContent = role;
      this.creditContainer.appendChild(roleEl);

      const nameEl = document.createElement('div');
      nameEl.style.marginBottom = '10px';
      nameEl.textContent = name;
      this.creditContainer.appendChild(nameEl);
    });

    // Thêm khoảng trống trước logo
    const spacer = document.createElement('div');
    spacer.style.height = '80px';
    this.creditContainer.appendChild(spacer);

    // Thêm logo ghép vào giữa
    if (this.logo) {
      const logoElement = document.createElement('img');
      logoElement.src = this.logo;
      Object.assign(logoElement.style, {
        width: '300px',
        height: 'auto',
        objectFit: 'contain',
        filter: 'brightness(1.2)', // làm sáng logo trên nền đen
        marginBottom: '40px'
      });
      this.creditContainer.appendChild(logoElement);
    }

    // Thêm khoảng trống cuối để logo có thể cuộn hết
    const endSpacer = document.createElement('div');
    endSpacer.style.height = '100px';
    this.creditContainer.appendChild(endSpacer);

    this.overlay.appendChild(this.creditContainer);

    // Khi credit cuộn xong, trở về menu
    this.creditContainer.addEventListener('animationend', () => {
      this._returnToMenu();
    });
  }

  _returnToMenu() {
    // Xoá overlay
    this.destroy();

    if (this.game) {
      // Ẩn game container và disable events
      this.game.disableGameEvents && this.game.disableGameEvents();
      this.game.gameContainer.style.display = 'none';

      // Hiện menu
      if (this.game.menu && this.game.menu.menuElement) {
        this.game.menu.menuElement.style.display = 'flex';
        this.game.menu.menuElement.style.opacity = '1';
      }
    }
  }

  destroy() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}
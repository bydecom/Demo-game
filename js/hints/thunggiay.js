import Hint from '../hint.js';

export default class ThungGiay extends Hint {
  constructor(config){
    super(config);
    this.modalCreated=false;
    this.currentStep = 1;

    // Modal/puzzle flags
    this.puzzleModalCreated = false;
    this.rewardModalCreated = false;
    this.keyModalCreated = false;

    // 4x4 binary puzzle state
    this.gridValues = new Array(16).fill(0);
    // Mật khẩu đúng (có thể truyền từ config), mặc định 0101... để demo
    this.password = (config.password || '0000100000010111').split('').map(n=>parseInt(n));

    // Trạng thái thu thập chìa khoá
    this.keyCollected = false;
  }

  onClick(){
    const targetX=this.x+this.width/2;
    const distance=Math.abs(this.game.player.x-targetX);
    const THRESHOLD=200;
    const open=()=>{if(!this.modalCreated) this.createModal(); this.showModal();};
    this.game.clearPendingWaiter();
    if(distance>THRESHOLD){
      this.game.player.moveToPosition(targetX);
      this.game.audioManager.playWalkSound();
      const timer=setInterval(()=>{if(!this.game.player.isMoving){this.game.clearPendingWaiter();open();}},100);
      this.game.setPendingWaiter(timer);
    }else{open();}
  }

  createModal(){
    this.overlay=document.createElement('div');
    Object.assign(this.overlay.style,{position:'fixed',top:0,left:0,width:'100%',height:'100%',backgroundColor:'rgba(0,0,0,0.7)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:1000});
    this.overlay.className='hint-overlay';

    const container=document.createElement('div');
    container.className='hint-container';
    container.style.position='relative';

    this.hintImage = document.createElement('img');
    Object.assign(this.hintImage.style, {
      maxWidth: '600px',
      maxHeight: '600px',
      width: '90%',
      height: 'auto',
      objectFit: 'contain',
      cursor: 'pointer'
    });
    this.hintImage.draggable=false;
    this.hintImage.addEventListener('click',()=>this.onImageClick());
    container.appendChild(this.hintImage);

    const closeBtn=document.createElement('button');
    closeBtn.className='modal-close-btn';
    closeBtn.addEventListener('click',()=>this.hideModal());

    const desc = document.createElement('div');
    desc.className = 'modal-description-label';
    desc.textContent = 'Một thùng giấy cũ trông khá nặng.';
    this.overlay.appendChild(desc);

    this.overlay.appendChild(container);
    this.overlay.appendChild(closeBtn);
    document.body.appendChild(this.overlay);
    this.modalCreated=true;
    this.updateHintImage();
  }

  showModal(){
    if(this.overlay){
      this.overlay.style.display='flex';
      this.updateHintImage();
    }
  }
  hideModal(){if(this.overlay) this.overlay.style.display='none';}

  onImageClick(){
    if(this.currentStep === 1){
      // Chuyển sang bước 2: mở puzzle
      this.currentStep = 2;
      this.hideModal();
      this.showPuzzleModal();
    } else if(this.currentStep === 2){
      // Đang ở trạng thái nhập mật khẩu, mở lại puzzle modal nếu bị đóng
      this.showPuzzleModal();
    } else if(this.currentStep === 3){
      // Click hộp có khoá để xem và thu thập khoá
      this.showKeyModal();
    }
  }

  updateHintImage(){
    let src;
    if(this.currentStep === 1 || this.currentStep === 2){ // show same image for steps 1 & 2
      src = 'assets/images/items/hopmatma/thunggiayhop.png';
    } else if(this.currentStep === 3){
      src = 'assets/images/items/hopmatma/hopmonapcokhoa.png';
    } else if(this.currentStep >= 4){
      src = 'assets/images/items/hopmatma/hopmonap.png';
    }
    if(this.hintImage) this.hintImage.src = src;
  }

  /* ----------------------------------------------------------- */
  // P U Z Z L E   M O D A L  (dongnap + keypad)
  /* ----------------------------------------------------------- */
  showPuzzleModal(){
    if(!this.puzzleModalCreated) this.createPuzzleModal();
    else this.refreshGridImages();

    this.puzzleOverlay.style.display = 'flex';
  }

  createPuzzleModal(){
    this.puzzleOverlay = document.createElement('div');
    Object.assign(this.puzzleOverlay.style, {
      position:'fixed', top:0,left:0,width:'100%',height:'100%',backgroundColor:'rgba(0,0,0,0.8)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:1100
    });

    const container = document.createElement('div');
    container.style.position = 'relative';

    const img = document.createElement('img');
    img.src = 'assets/images/items/hopmatma/dongnap.png';
    Object.assign(img.style, {
      maxWidth: '800px',
      maxHeight: '800px',
      width: '90%',
      marginBottom:'300px',
      height: 'auto',
      objectFit: 'contain'
    });
    img.draggable=false;
    container.appendChild(img);

    // Grid keypad overlay
    this.gridContainer = document.createElement('div');
    Object.assign(this.gridContainer.style, {
      position:'absolute',
      top:'57.5%',
      left:'54.5%',
      transform:'translate(-50%, -50%)',
      display:'grid',
      gridTemplateColumns:'repeat(4, 18px)',
      gridTemplateRows:'repeat(4, 18px)',
      gap:'4px'
    });

    for(let i=0;i<16;i++){
      const cell = document.createElement('img');
      cell.dataset.index = i;
      cell.style.width='18px';
      cell.style.height='18px';
      cell.style.cursor='pointer';
      cell.src = `assets/images/items/hopmatma/0${this.gridValues[i]}.png`;
      cell.addEventListener('click', (e)=>{
        const idx = parseInt(e.currentTarget.dataset.index);
        this.toggleCell(idx);
      });
      this.gridContainer.appendChild(cell);
    }
    container.appendChild(this.gridContainer);

    // Message label bên trong puzzle modal
    this.puzzleMessage = document.createElement('div');
    this.puzzleMessage.className = 'modal-description-label';
    this.puzzleMessage.style.marginTop = '10px';
    container.appendChild(this.puzzleMessage);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-btn';
    closeBtn.addEventListener('click',()=>{this.puzzleOverlay.style.display='none';});
    this.puzzleOverlay.appendChild(closeBtn);

    this.puzzleOverlay.appendChild(container);
    document.body.appendChild(this.puzzleOverlay);
    this.puzzleModalCreated = true;
  }

  toggleCell(idx){
    this.gridValues[idx] = this.gridValues[idx] === 0 ? 1 : 0;
    const cellImg = this.gridContainer.children[idx];
    cellImg.src = `assets/images/items/hopmatma/0${this.gridValues[idx]}.png`;
    this.checkPassword();
  }

  checkPassword(){
    const matched = this.gridValues.every((v,i)=>v===this.password[i]);
    if(!matched) return;

    // Kiểm tra điều kiện phải có Tờ giấy
    if(!this.game.inventory.hasItem('togiay')){
      if(this.puzzleMessage){
         this.puzzleMessage.textContent = 'Bạn chưa tìm đủ manh mối. Có vẻ còn thiếu một tờ giấy...';
      }
      return;
    }

    // Đã có tờ giấy và mật khẩu đúng => mở hộp
    this.puzzleOverlay.style.display='none';
    this.currentStep = 3;
    this.updateHintImage();
    this.showRewardModal();
  }

  /* ----------------------------------------------------------- */
  // R E W A R D   M O D A L  (hộp mở có khoá)
  /* ----------------------------------------------------------- */
  showRewardModal(){
    if(!this.rewardModalCreated) this.createRewardModal();
    this.rewardOverlay.style.display='flex';
  }

  createRewardModal(){
    this.rewardOverlay = document.createElement('div');
    Object.assign(this.rewardOverlay.style, {
      position:'fixed', top:0,left:0,width:'100%',height:'100%',backgroundColor:'rgba(0,0,0,0.8)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:1101
    });

    const img = document.createElement('img');
    img.src = 'assets/images/items/hopmatma/hopmonapcokhoa.png';
    Object.assign(img.style, {
      maxWidth:'600px',maxHeight:'600px',width:'90%',height:'auto',objectFit:'contain',cursor:'pointer'
    });
    img.addEventListener('click', ()=>{
      this.rewardOverlay.style.display='none';
      this.showKeyModal();
    });
    img.draggable=false;
    this.rewardOverlay.appendChild(img);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-btn';
    closeBtn.addEventListener('click', ()=>{this.rewardOverlay.style.display='none';});
    this.rewardOverlay.appendChild(closeBtn);

    document.body.appendChild(this.rewardOverlay);
    this.rewardModalCreated = true;
  }

  /* ----------------------------------------------------------- */
  // K E Y   M O D A L  +  C O L L E C T
  /* ----------------------------------------------------------- */
  showKeyModal(){
    if(!this.keyModalCreated) this.createKeyModal();
    this.keyOverlay.style.display='flex';
  }

  createKeyModal(){
    this.keyOverlay = document.createElement('div');
    Object.assign(this.keyOverlay.style, {
      position:'fixed', top:0,left:0,width:'100%',height:'100%',backgroundColor:'rgba(0,0,0,0.8)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:1102
    });

    const img = document.createElement('img');
    img.src = 'assets/images/items/hopmatma/khoa.png';
    Object.assign(img.style, {
      maxWidth:'300px',maxHeight:'300px',width:'40%',height:'auto',objectFit:'contain',cursor:'pointer'
    });
    img.draggable=false;
    img.addEventListener('click', ()=>{
      this.keyOverlay.style.display='none';
      if(!this.keyCollected){
        this.collectKey();
      }
    });
    this.keyOverlay.appendChild(img);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-btn';
    closeBtn.addEventListener('click', ()=>{this.keyOverlay.style.display='none';});
    this.keyOverlay.appendChild(closeBtn);

    document.body.appendChild(this.keyOverlay);
    this.keyModalCreated = true;
  }

  collectKey(){
    this.keyCollected = true;
    this.currentStep = 4;
    this.updateHintImage();
    const keyItem = {
      id:'khoa',
      name:'Chìa khóa',
      image:'assets/images/items/hopmatma/khoa.png',
      backgroundSize:'contain',
      onClick:()=>{}
    };
    this.game.inventory.addItem(keyItem);
    this.game.audioManager.playItemSound();
  }

  // Helper to update all cell images based on gridValues
  refreshGridImages(){
    if(!this.gridContainer) return;
    for(let i=0;i<16;i++){
      const cell = this.gridContainer.children[i];
      if(cell) cell.src = `assets/images/items/hopmatma/0${this.gridValues[i]}.png`;
    }
  }
} 
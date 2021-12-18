const gridCan = document.querySelector('#grid-canvas') as HTMLCanvasElement;
const gridCtx = gridCan.getContext('2d');

gridCan.width = window.innerWidth;
gridCan.height = window.innerHeight;

const can = document.querySelector('#canvas') as HTMLCanvasElement;
const ctx = can.getContext('2d');

can.width = window.innerWidth;
can.height = window.innerHeight;

const GRID_SIZE = 10;
const CELL_SIZE = Math.min(gridCan.width, gridCan.height) / GRID_SIZE;

interface Position {
  x: number;
  y: number;
}

enum Direction {
  Up,
  UpRight,
  Right,
  DownRight,
  Down,
  DownLeft,
  Left,
  UpLeft
}

class Tank {
  gridPos: Position;
  hp: number;
  ap: number;
  range: number;
  color: string;

  constructor(x: number = Math.floor(Math.random()*GRID_SIZE), y: number = Math.floor(Math.random()*GRID_SIZE)) {
    this.hp = 3;
    this.gridPos = {x, y};
    this.ap = 0;
    this.range = 1;
    this.color = 'yellow';
  }

  addHP(): boolean {
    if (this.ap < 3)
      return false;
    this.ap -= 3;
    this.hp++;
    return true;
  }

  upgradeRange(): boolean {
    if (this.range >= 3)
      return false;
    if (this.ap < 3)
      return false;
    this.ap -= 3;
    this.range++;
    return true;
  }

  move(dir: Direction, numSpaces: number): boolean {
    if (numSpaces > this.range)
      return false;
    switch(dir) {
      case Direction.Up:
        if (this.gridPos.y - numSpaces < 0)
          return false;
        this.gridPos.y -= numSpaces;
        return true;
      case Direction.Right:
        if (this.gridPos.x + numSpaces >= GRID_SIZE)
          return false;
        this.gridPos.x += numSpaces;
        return true;
    }
    return false;
  }

  moveTo(pos: Position): boolean {
    if (pos.x == this.gridPos.x && pos.y == this.gridPos.y)
      return false;
    if (this.ap <= 0)
      return false;
    if (Math.abs(pos.x - this.gridPos.x) > this.range ||
        Math.abs(pos.y - this.gridPos.y) > this.range) 
      return false;
    [this.gridPos.x, this.gridPos.y] = [pos.x, pos.y];
    this.ap--;
    return true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.gridPos.x*CELL_SIZE + 10,
                 this.gridPos.y*CELL_SIZE + 10,
                 CELL_SIZE - 20,
                 CELL_SIZE - 20);
  }
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  for (let col = 0; col < GRID_SIZE; col++) {
    ctx.moveTo(col*CELL_SIZE + 0.5, 0);
    ctx.lineTo(col*CELL_SIZE + 0.5, GRID_SIZE*CELL_SIZE);
    ctx.stroke();
  }
  for (let row = 0; row < GRID_SIZE; row++) {
    ctx.moveTo(0,                 row*CELL_SIZE);
    ctx.lineTo(GRID_SIZE*CELL_SIZE, row*CELL_SIZE);
    ctx.stroke();
  }
}

drawGrid(gridCtx);
const tank = new Tank();

let mouseX = 0;
let mouseY = 0;
function drawFocus(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(0 ,0, 0, 0.3)';
  ctx.fillRect(Math.floor(mouseX / CELL_SIZE) * CELL_SIZE,
               Math.floor(mouseY / CELL_SIZE) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function drawTankInfo(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'black';
  ctx.font = '30px arial';
  ctx.fillText(`HP: ${tank.hp}`, can.width - 600, can.height - 10);
  ctx.fillText(`AP: ${tank.ap}`, can.width - 400, can.height - 10);
  ctx.fillText(`Range: ${tank.range}`, can.width - 200, can.height - 10);
}

document.addEventListener('keydown', function(e) {
  switch(e.key) {
    case ' ':
      tank.ap++;
      break;
  }
});

document.addEventListener('mousemove', function(e) {
  [mouseX, mouseY] = [e.clientX, e.clientY];
});

document.addEventListener('mousedown', function(e) {
  const targetPos = {
    x: Math.floor(e.clientX / CELL_SIZE),
    y: Math.floor(e.clientY / CELL_SIZE)
  };
  tank.moveTo(targetPos);
});

document.querySelector('button#add-hp-button')
        .addEventListener('click', function() {
          tank.addHP();
        });

document.querySelector('button#upgrade-range-button')
        .addEventListener('click', function() {
          tank.upgradeRange();
        });

(function loop() {
  ctx.clearRect(0, 0, can.width, can.height);
  tank.draw(ctx);
  drawFocus(ctx);
  drawTankInfo(ctx);

  requestAnimationFrame(loop);
})();

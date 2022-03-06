const GRID_SIZE = 10;

export interface TankState {
  id: string;
  playerName?: string,
  posX?: number;
  posY?: number;
  color?: string;
  isAlive?: boolean;
  hp?: number;
  ap?: number;
  range?: number;
}

export function drawTank(ctx: CanvasRenderingContext2D, tank: TankState) {
  const cellSize = Math.min(ctx.canvas.width, ctx.canvas.height) / GRID_SIZE;
  ctx.fillStyle = tank.color;
  ctx.fillRect(tank.posX*cellSize + 10,
               tank.posY*cellSize + 10,
               cellSize - 20,
               cellSize - 20);
  ctx.fillStyle = 'white';
  ctx.font = '15px serif';
  ctx.textAlign = 'center';
  ctx.fillText(tank.playerName, tank.posX*cellSize + (cellSize/2), tank.posY*cellSize + (cellSize/2));
}

export function drawPlayerTankInfo(ctx: CanvasRenderingContext2D, player: TankState) {
  ctx.fillStyle = 'black';
  ctx.font = '30px arial';
  ctx.fillText(`HP: ${player.hp}`, ctx.canvas.width - 600, ctx.canvas.height - 10);
  ctx.fillText(`AP: ${player.ap}`, ctx.canvas.width - 400, ctx.canvas.height - 10);
  ctx.fillText(`Range: ${player.range}`, ctx.canvas.width - 200, ctx.canvas.height - 10);
}

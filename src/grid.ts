export function drawGrid(ctx: CanvasRenderingContext2D, gridSize: number, cellSize: number) {
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 3;

  for (let col = 0; col <= gridSize; col++) {
    ctx.moveTo(col*cellSize + 0.5, 0);
    ctx.lineTo(col*cellSize + 0.5, gridSize*cellSize);
    //ctx.lineTo(col*cellSize + 0.5, ctx.canvas.height);
    ctx.stroke();
  }
  for (let row = 0; row <= gridSize; row++) {
    ctx.moveTo(0,                 row*cellSize);
    ctx.lineTo(gridSize*cellSize, row*cellSize);
    //ctx.lineTo(ctx.canvas.width, row*cellSize);
    ctx.stroke();
  }
}

import {io, Socket} from 'socket.io-client';
import {drawGrid} from './grid';
import {ActionResult} from './gameManager';
import {TankState, drawTank, drawPlayerTankInfo} from './tank'; 
import {Mode} from './mode';
import {ServerToClientEvents, ClientToServerEvents} from './events';
import {SessionData} from './sessionStore';

const can: HTMLCanvasElement = document.querySelector('#canvas');
const ctx = can.getContext('2d');

const gridSize = 10;
let cellSize = Math.min(can.width, can.height) / gridSize;

let currMode = '';

const modeSpan: HTMLSpanElement = document.querySelector('span#mode');
modeSpan.innerText = currMode;

window.addEventListener('load', () => {
  resizeCanvas(can);
});

const socket: Socket<ServerToClientEvents, ClientToServerEvents> & {data?: any} = Object.defineProperty(io({autoConnect: false}), 'data', {value: {}});
const sessionID = localStorage.getItem('sessionID');
if (sessionID) {
  console.log(`sessionID: ${sessionID}`);
  socket.auth = {sessionID};
  socket.connect();
}

socket.on('connect_error', (err: Error) => {
  console.error(err.message);
});

let tanks: TankState[] = [];

socket.on('session', (session: Partial<SessionData>) => {
  socket.auth = {sessionID: session.sessionID};
  localStorage.setItem("sessionID", session.sessionID);
  console.log('SESSION');
  socket.data.userID = session.userID;
});

socket.on('mode', (mode: Mode) => {
  console.log(mode);
  currMode = mode;
  modeSpan.innerText = currMode;
});

socket.on('updateTanks', (tankStates: TankState[]) => {
  tanks = [];
  tankStates.forEach((t: TankState) => {
    const tank = Object.assign({}, t);
    tanks.push(tank);
  });
  updatePlayerList(tanks);
});

let mouseX = 0;
let mouseY = 0;
function drawFocus(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(0 ,0, 0, 0.3)';
  ctx.fillRect(Math.floor(mouseX/cellSize)*cellSize,
               Math.floor(mouseY/cellSize)*cellSize, cellSize, cellSize);
}

document.addEventListener('mousemove', function(e) {
  [mouseX, mouseY] = [e.clientX, e.clientY];
});

function updatePlayerList(tankList: TankState[]) {
  const playersList = document.querySelector('ul#players-list');
  while (playersList.firstChild)
    playersList.firstChild.remove();
  tankList.forEach(t => {
    const playerNameEl = document.createElement('li');
    playerNameEl.innerText = t.playerName;
    playersList.appendChild(playerNameEl);
  });
}

document.querySelector('#register-btn')
        .addEventListener('click', () => {
          const playerName: string = (<HTMLInputElement>document.querySelector('#name-input')).value;
          socket.auth = {username: playerName};
          socket.connect();
          //socket.emit('register', playerName);
        });

/*
document.addEventListener('mousedown', function(e) {
  socket.emit('move', player.posX, player.posY);
});
*/

/*
document.querySelector('button#add-hp-button')
        .addEventListener('click', () => {
          player.addHP();
        });

document.querySelector('button#upgrade-range-button')
        .addEventListener('click', () => {
          player.upgradeRange();
        });
       */

      /*
document.querySelector('button#upgrade-range-button')
        .addEventListener('click', () => {

        });
       */

function resizeCanvas(c: HTMLCanvasElement) {
  const displayWidth = c.clientWidth;
  const displayHeight = c.clientHeight;
  const needResize = c.width !== displayWidth ||
                     c.height !== displayHeight;
  if (needResize) {
    c.width = displayWidth;
    c.height = displayHeight;
    cellSize = Math.min(can.width, can.height) / gridSize;
  }
}

document.querySelector('button#start-play-mode')
        .addEventListener('click', () => {
          socket.emit('mode');
        });

(function loop() {
  resizeCanvas(can);
  ctx.clearRect(0, 0, can.width, can.height);

  drawGrid(ctx, gridSize, cellSize);

  if (currMode == Mode.PLAY)
    tanks.forEach(t => drawTank(ctx, t));

  drawFocus(ctx);

  requestAnimationFrame(loop);
})();

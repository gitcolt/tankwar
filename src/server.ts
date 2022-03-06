import express from 'express';
import path from 'path';
import {TankState} from './tank';
import http from 'http';
import {Server} from 'socket.io';
import {setCurrMode, currMode, getDetailedTankState, getEnemyTankStates,
  tankShootTank, addTankHP, moveTankTo, upgradeTankRange, tanks, registerNewTank} from './gameManager';
import {Mode} from './mode';
import {ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData} from './events';
import {SessionData, InMemorySessionStore} from './sessionStore';
import * as crypto from 'crypto';

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server);

const sessionStore = new InMemorySessionStore();

function randomID(): string {
  return crypto.randomBytes(8).toString('hex');
}

app.use(express.static(path.resolve('dist')));

app.get('/', (_, res) => {
  res.sendFile(path.resolve('index.html'));
});

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.data.sessionID = sessionID;
      socket.data.userID = session.userID;
      socket.data.username = session.username;
      return next();
    }
  }
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.data.sessionID = randomID();
  socket.data.userID = randomID();
  socket.data.username = username;
  next();
});

io.on('connection', socket => {
  const sessionData: SessionData = {
    sessionID: socket.data.sessionID,
    username: 'asdf',
    userID: 'asdf'
  }
  sessionStore.saveSession(socket.data.sessionID, sessionData);
  socket.emit('session', sessionData);

  socket.emit('mode', currMode);
  registerNewTank(socket.id, sessionData.username);
  socket.emit('updateTanks', tanks);

  socket.on('disconnect', () => {
    console.log('disconnect');
    // TODO: figure out what to do on disconnect during registration window
    //       and after game has started
    // for now, just remove the tank from the game
    const tankIdx = tanks.findIndex(t => t.id == socket.id);
    if (tankIdx >= 0)
      tanks.splice(tankIdx, 1);
    else {
      console.error('[disconnect]: could not find tank');
      console.error(`tanks: ${tanks}`);
    }
  });

  socket.on('mode', () => {
    setCurrMode(Mode.PLAY);
    io.emit('mode', currMode);
    io.emit('updateTanks', tanks);
  });

  socket.on('upgradeRange', () => {
    const tank = tanks.find((t: TankState) => t.id == socket.id);
    const result = upgradeTankRange(tank);
  });

  socket.on('move', (posX: number, posY: number) => {
    const tank = tanks.find((t: TankState) => t.id == socket.id);
    const result = moveTankTo(tank, posX, posY);
  });

  socket.on('register', (playerName: string) => {
    if (tanks.find(t => t.playerName == playerName)) {
      console.log('player name already registered');
      return;
    }

    if (!registerNewTank(socket.id, playerName)) {
      console.error('registerNewTank failed');
      return;
    }
    console.log(`${playerName} (${socket.id}) registered`);
    io.emit('updateTanks', tanks);
  });
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});

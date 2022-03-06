import {Mode} from './mode';
import {TankState} from './tank';
import {SessionData} from './sessionStore';

export interface ServerToClientEvents {
  session: (session: Pick<SessionData, 'sessionID' | 'userID'>) => void;
  mode: (currMode: Mode) => void;
  updateTanks: (tanks: TankState[]) => void;
}

export interface ClientToServerEvents {
  mode: () => void;
  upgradeRange: () => void;
  move: (posX: number, posY: number) => void;
  register: (playerName: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userID: string;
  sessionID: string;
  username: string;
}

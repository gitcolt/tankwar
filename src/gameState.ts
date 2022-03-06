export interface LimitedTankState {
  //name: string,
  id: string,
  posX: number,
  posY: number,
  color: string
}

export interface TankState extends LimitedTankState {
  hp: number,
  ap: number,
  range: number
}

export interface GameState {
  gridSizeX: number,
  gridSizeY: number,
  tankStates: TankState[]
}

export const tankColors: string[] = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'indigo',
  'violet'
];
export function placeRandomTank(state: GameState, socketID: string) {
  let x: number;
  let y: number;
  do {
    x = Math.floor(Math.random()*state.gridSizeX);
    y = Math.floor(Math.random()*state.gridSizeY);
  } while (state.tankStates.some(t => t.posX == x && t.posY == y));

  let color: string;
  do {
    color = tankColors[Math.floor(Math.random()*tankColors.length)];
  } while (state.tankStates.some(t => t.color == color));

  const tankState: TankState = {
    id: socketID,
    posX: x,
    posY: y,
    color: color,
    hp: 3,
    ap: 0,
    range: 1
  };
  state.tankStates.push(tankState);
}

/*
export const state: GameState = {
  gridSizeX: 10,
  gridSizeY: 10,
  tankStates: []
};

export function getDetailedTankState(state: GameState, socketID: string) {
  return state.tankStates.find(t => t.id == socketID);
}

export function getEnemyTankStates(state: GameState, socketID: string) {
  return state.tankStates.filter(t => t.id != socketID)
                         .map(t => {
                           delete t.id;
                           delete t.hp;
                           delete t.ap;
                           delete t.range;
                           return t;
                         });
} 
*/

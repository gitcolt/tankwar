import {TankState} from './tank';
import {tankColors} from './gameState';
import {Mode} from './mode';

const GRID_SIZE_X = 10;
const GRID_SIZE_Y = 10;
const MAX_TANK_RANGE = 4;

export let currMode = Mode.REGISTRATION;

export function setCurrMode(mode: Mode) {
  currMode = mode;
}

export const tanks: TankState[] = [];

export function getDetailedTankState(socketID: string): TankState {
  return tanks.find(t => t.id == socketID);
}

export function getEnemyTankStates(socketID: string): TankState[] {
  return tanks.filter(t => t.id != socketID)
              .map(t => {
                delete t.id;
                delete t.hp;
                delete t.ap;
                delete t.range;
                return t;
              });
}

export interface TankDelta {
  id: string,
  posX?: number,
  posY?: number,
  isAlive?: boolean,
  ap?: number,
  range?: number,
  hp?: number
}

export interface ActionResult {
  success: boolean,
  tankStates?: TankState[]
}

export function registerNewTank(socketID: string, playerName: string): boolean {
  console.log('registerNewTank');

  if (tanks.find(t => t.id == socketID || t.playerName == playerName))
    return false;

  let posX: number;
  let posY: number;
  do {
    posX = Math.floor(Math.random()*GRID_SIZE_X);
    posY = Math.floor(Math.random()*GRID_SIZE_Y);
  } while (tanks.some(t => t.posX == posX && t.posY == posY));

  let color: string;
  do {
    color = tankColors[Math.floor(Math.random()*tankColors.length)];
  } while (tanks.some(t => t.color == color));

  const tank: TankState = {
    id: socketID,
    playerName,
    posX,
    posY,
    color
  };
  tanks.push(tank);
  return true;
}

enum Action {
  MOVE,
  SHOOT,
  UPGRADE_RANGE,
  ADD_HEART
}

const actionCosts = new Map<Action, number>();
actionCosts.set(Action.MOVE,          1);
actionCosts.set(Action.SHOOT,         1);
actionCosts.set(Action.UPGRADE_RANGE, 3);
actionCosts.set(Action.ADD_HEART,     3);

export function addTankHP(tank: TankState): ActionResult {
  if (!tank.isAlive)
    return {success: false};

  const APCost = actionCosts.get(Action.ADD_HEART);

  if (tank.ap < APCost)
    return {success: false};

  tank.ap -= APCost;
  tank.hp++;
  return {
    success: true,
    tankStates: [
      {
        id: tank.id,
        ap: tank.ap,
        hp: tank.hp
      }
    ]
  };
}

export function upgradeTankRange(tank: TankState): ActionResult {
  if (!tank.isAlive)
    return {success: false};

  if (tank.range >= MAX_TANK_RANGE)
    return {success: false};

  const APCost = actionCosts.get(Action.UPGRADE_RANGE);

  if (tank.ap < APCost)
    return {success: false};

  tank.ap -= APCost;
  tank.range++;
  return {
    success: true,
    tankStates: [
      {
        id: tank.id,
        ap: tank.ap,
        range: tank.range
      }
    ]
  };
}

export function moveTankTo(tank: TankState, x: number, y: number): ActionResult {
  if (!tank.isAlive)
    return {success: false};

  // destination is outside the grid
  if (x < 0            ||
      y < 0            ||
      x >= GRID_SIZE_X ||
      y >= GRID_SIZE_Y
     )
    return {success: false};

  // destination cell is not adjacent to current position
  if (Math.abs(tank.posX - x) > 1 ||
      Math.abs(tank.posY - y) > 1)
    return {success: false};

  // another tank is already occupying that cell
  if (tanks.some(t => t.posX == tank.posX && t.posY == tank.posY))
    return {success: false};

  const APCost = actionCosts.get(Action.MOVE);

  if (tank.ap < APCost)
    return {success: false};

  tank.ap -= APCost;
  [tank.posX, tank.posY] = [x, y];
  return {
    success: true,
    tankStates: [
      {
        id: tank.id,
        ap: tank.ap,
        posX: tank.posX,
        posY: tank.posY,
      }
    ]
  };
}

export function tankShootTank(aggressorTank: TankState, targetTank: TankState): ActionResult {
  if (!aggressorTank.isAlive || !targetTank.isAlive)
    return {success: false};
  if (Math.abs(targetTank.posX - aggressorTank.posX) > aggressorTank.range ||
      Math.abs(targetTank.posY - aggressorTank.posY) > aggressorTank.range)
    return {success: false};

  const APCost = actionCosts.get(Action.SHOOT);

  if (aggressorTank.ap < APCost)
    return {success: false};

  aggressorTank.ap -= APCost;
  targetTank.hp--;
  if (targetTank.hp <= 0) {
    targetTank.isAlive = false;
  }
  return {
    success: true,
    tankStates: [
      {
        id: aggressorTank.id,
        ap: aggressorTank.ap
      },
      {
        id: targetTank.id,
        hp: targetTank.hp,
        isAlive: targetTank.isAlive
      }
    ]
  };
}


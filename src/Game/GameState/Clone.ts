import { FlatVec } from '../../Physics/FlatVec';
import { ECB, ECBPoints } from '../ECB';
import { LedgeDetector, LedgeDetectorBox, Player } from '../Player/Player';

export function cloneFlatVec(source: FlatVec) {
  return new FlatVec(source.X, source.Y);
}

export function cloneFlatVecArray(source: Array<FlatVec>) {
  const length = source.length;
  const cloneArr = new Array<FlatVec>(length);

  for (let i = 0; i < length; i++) {
    cloneArr[i] = cloneFlatVec(source[i]);
  }

  return cloneArr;
}

export function cloneECBPoints(source: ECBPoints) {
  const top = cloneFlatVec(source.top);
  const right = cloneFlatVec(source.right);
  const bottom = cloneFlatVec(source.bottom);
  const left = cloneFlatVec(source.left);

  return { top, right, bottom, left } as ECBPoints;
}

export function cloneECBData(source: ECB) {
  const clonePosition = cloneFlatVec(source.GetPosition());
  const clonePoints = cloneECBPoints(source.GetPoints());
  const color = String(source.GetColor());
  const cloneVerts = cloneFlatVecArray(source.GetVerticies());

  return {
    position: clonePosition,
    points: clonePoints,
    color,
    verts: cloneVerts,
  } as ECBData;
}

export function cloneLedgeDetectorBox(source: LedgeDetectorBox) {
  const y = source.y;
  const x = source.x;
  const width = source.width;
  const height = source.height;

  return { x, y, width, height } as LedgeDetectorBoxData;
}

export function cloneLedgeDetectorData(source: LedgeDetector) {
  const YOffset = source.YOffset;
  const front = cloneLedgeDetectorBox(source.Front);

  return { YOffset, Front: front } as LedgeDetectorData;
}

export function clonePlayerData(source: Player) {
  return {
    Grounded: source.Grounded,
    LedgeGrab: source.LedgeGrab,
    PreviousePlayerPosition: cloneFlatVec(source.PreviousPlayerPosition),
    PlayerPosition: cloneFlatVec(source.PlayerPosition),
    ECBData: cloneECBData(source.ECB),
    LedgeDetectorData: cloneLedgeDetectorData(source.LedgeDetector),
    FacingRight: source.FacingRight,
    CurrentStateMachineState: String(source.CurrentStateMachineState),
  } as PlayerData;
}

export type PlayerData = {
  Grounded: boolean;
  LedgeGrab: boolean;
  PreviousePlayerPosition: FlatVec;
  PlayerPosition: FlatVec;
  PlayerVelocity: FlatVec;
  ECBData: ECBData;
  LedgeDetectorData: LedgeDetectorData;
  FacingRight: boolean;
  CurrentStateMachineState: string;
};

export type LedgeDetectorData = {
  YOffset: number;
  Front: LedgeDetectorBoxData;
};

export type ECBData = {
  position: FlatVec;
  points: ECBPoints;
  color: string;
  verts: Array<FlatVec>;
};

export type LedgeDetectorBoxData = {
  x: number;
  y: number;
  width: number;
  height: number;
};

import { GrabBubbleConfig, GrabConfig } from '../../../character/shared';
import { GrabGameEventMappings } from '../../finite-state-machine/PlayerStates';
import {
  GameEventId,
  GrabId,
} from '../../finite-state-machine/stateConfigurations/shared';
import { FixedPoint } from '../../math/fixedPoint';
import { FlatVec } from '../../physics/vector';
import { ActiveGrabBubblesDTO } from '../../pools/ActiveGrabBubbles';
import { Pool } from '../../pools/Pool';
import { PooledVector } from '../../pools/PooledVector';
import { ToFV } from '../../utils';
import { frameNumber } from './attack';

type bubbleId = number;

export class GrabBubble {
  private readonly posRef: FlatVec;
  private readonly facingRight: () => boolean;
  public readonly BubbleId: bubbleId;
  public readonly Radius: FixedPoint;
  public readonly activeFrames = new Set<number>();
  public readonly frameOffsets = new Map<frameNumber, FlatVec>();

  constructor(
    gbc: GrabBubbleConfig,
    posRef: FlatVec,
    directionGetter: () => boolean,
  ) {
    this.posRef = posRef;
    this.facingRight = directionGetter;
    this.BubbleId = gbc.BubbleId;
    this.Radius = new FixedPoint(gbc.Radius);
    for (const [k, v] of gbc.frameOffsets) {
      this.frameOffsets.set(k, ToFV(v.x, v.y));
      this.activeFrames.add(k);
    }
  }

  public GetLocalPositionOffsetForFrame(
    frameNumber: frameNumber,
  ): FlatVec | undefined {
    return this.frameOffsets.get(frameNumber);
  }

  public IsActive(grabFrameNumber: frameNumber): boolean {
    return this.activeFrames.has(grabFrameNumber);
  }

  public GetGlobalPosition(
    vecPool: Pool<PooledVector>,
    grabFrameNumber: frameNumber,
  ): PooledVector | undefined {
    const offset = this.frameOffsets.get(grabFrameNumber);
    if (offset === undefined) {
      return undefined;
    }
    const xRaw = this.posRef.X.Raw;
    const yRaw = this.posRef.Y.Raw;

    const globalXRaw = this.facingRight()
      ? xRaw + offset.X.Raw
      : xRaw - offset.X.Raw;
    const globalYRaw = yRaw + offset.Y.Raw;
    return vecPool.Rent().SetXYRaw(globalXRaw, globalYRaw);
  }

  public GetPreviousGlobalPosition(
    vecPool: Pool<PooledVector>,
    prevPlayerXRaw: number,
    prevPlayerYRaw: number,
    prevFacinRight: boolean,
    grabFrameNumber: frameNumber,
  ): PooledVector | undefined {
    const offset = this.frameOffsets.get(grabFrameNumber);
    if (offset === undefined) {
      return undefined;
    }
    const globalXRaw = prevFacinRight
      ? prevPlayerXRaw + offset.X.Raw
      : prevPlayerXRaw - offset.X.Raw;
    const globalYRaw = prevPlayerYRaw + offset.Y.Raw;
    return vecPool.Rent().SetXYRaw(globalXRaw, globalYRaw);
  }
}

export class Grab {
  public readonly Name: string;
  public readonly GrabId: GrabId;
  public readonly ImpulseClamp: FixedPoint | undefined;
  public readonly Impulses: Map<frameNumber, FlatVec> | undefined;
  public readonly GrabBubbles: Array<GrabBubble>;

  constructor(
    conf: GrabConfig,
    posRef: FlatVec,
    directionGetter: () => boolean,
  ) {
    this.Name = conf.Name;
    this.GrabId = conf.GrabId;
    const gbs = conf.GrabBubbles.map(
      (gbc) => new GrabBubble(gbc, posRef, directionGetter),
    );
    this.GrabBubbles = gbs.sort((a, b) => a.BubbleId - b.BubbleId);
    if (conf.Impulses !== undefined) {
      this.ImpulseClamp = new FixedPoint(conf.ImpulseClamp!);
      this.Impulses = new Map<frameNumber, FlatVec>();
      for (const [k, v] of conf.Impulses) {
        this.Impulses.set(k, ToFV(v.x, v.y));
      }
    }
  }

  public GetImpulseForFrame(fameNumber: frameNumber): FlatVec | undefined {
    if (this.Impulses === undefined) {
      return undefined;
    }
    return this.Impulses.get(fameNumber);
  }

  public GetActiveBubblesForFrame(
    frame: number,
    activeGbs: ActiveGrabBubblesDTO,
  ) {
    const gbLength = this.GrabBubbles.length;
    if (gbLength === 0) {
      return activeGbs;
    }
    for (let i = 0; i < gbLength; i++) {
      const gb = this.GrabBubbles[i];
      if (gb.IsActive(frame)) {
        activeGbs.AddBubble(gb);
      }
    }
    return activeGbs;
  }
}

export class GrabComponent {
  private grabs: Map<GrabId, Grab> = new Map();
  private currentGrab: Grab | undefined = undefined;

  public constructor(
    grabConfigs: Map<GrabId, GrabConfig>,
    posRef: FlatVec,
    directionGetter: () => boolean,
  ) {
    for (const [k, v] of grabConfigs) {
      this.grabs.set(k, new Grab(v, posRef, directionGetter));
    }
  }

  public GetGrab(): Grab | undefined {
    return this.currentGrab;
  }

  public SetGrab(gameEventId: GameEventId): void {
    const grabId = GrabGameEventMappings.get(gameEventId);
    if (grabId === undefined) {
      return;
    }
    const grab = this.grabs.get(grabId);
    if (grab === undefined) {
      return;
    }
    this.currentGrab = grab;
  }

  public ZeroCurrentGrab(): void {
    this.currentGrab = undefined;
  }

  public set CompState(history: GrabHist) {
    if (history.grabId === undefined) {
      this.currentGrab = undefined;
    } else {
      this.currentGrab = this.grabs.get(history.grabId);
    }
  }
}

export type GrabHist = {
  grabId: GrabId | undefined;
};

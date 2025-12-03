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
import { IHistoryEnabled } from '../componentHistory';
import { frameNumber } from './attack';

type bubbleId = number;

export class GrabBubble {
  public readonly BubbleId: bubbleId;
  public readonly Radius: FixedPoint;
  public readonly activeStartFrame: frameNumber;
  public readonly activeEndFrame: frameNumber;
  public readonly frameOffsets: Map<frameNumber, FlatVec>;

  constructor(gbc: GrabBubbleConfig) {
    this.BubbleId = gbc.BubbleId;
    this.Radius = new FixedPoint(gbc.Radius);
    const activeframes = Array.from(gbc.frameOffsets.keys()).sort(
      (a, b) => a - b
    );
    this.activeStartFrame = activeframes[0];
    this.activeEndFrame = activeframes[activeframes.length - 1];
    this.frameOffsets = new Map<frameNumber, FlatVec>();
    for (const [k, v] of gbc.frameOffsets) {
      this.frameOffsets.set(k, ToFV(v.x, v.y));
    }
  }

  public GetLocalPositionOffsetForFrame(
    frameNumber: frameNumber
  ): FlatVec | undefined {
    return this.frameOffsets.get(frameNumber);
  }

  public IsActive(grabFrameNumber: frameNumber): boolean {
    return (
      grabFrameNumber >= this.activeStartFrame &&
      grabFrameNumber <= this.activeEndFrame
    );
  }

  public GetGlobalPosition(
    vecPool: Pool<PooledVector>,
    playerX: FixedPoint,
    playerY: FixedPoint,
    facinRight: boolean,
    grabFrameNumber: frameNumber
  ): PooledVector | undefined {
    const offset = this.frameOffsets.get(grabFrameNumber);
    if (offset === undefined) {
      return undefined;
    }
    const xRaw = playerX.Raw;
    const yRaw = playerY.Raw;

    const globalXRaw = facinRight ? xRaw + offset.X.Raw : xRaw - offset.X.Raw;
    const globalYRaw = yRaw + offset.Y.Raw;
    return vecPool.Rent().SetXYRaw(globalXRaw, globalYRaw);
  }
}

export class Grab {
  public readonly Name: string;
  public readonly GrabId: GrabId;
  public readonly TotalFrameLength: number;
  public readonly ImpulseClamp: FixedPoint | undefined;
  public readonly Impulses: Map<frameNumber, FlatVec> | undefined;
  public readonly GrabBubbles: Array<GrabBubble>;

  constructor(conf: GrabConfig) {
    this.Name = conf.Name;
    this.GrabId = conf.GrabId;
    this.TotalFrameLength = conf.TotalFrameLength;
    const gbs = conf.GrabBubbles.map((gbc) => new GrabBubble(gbc));
    this.GrabBubbles = gbs.sort((a, b) => a.BubbleId - b.BubbleId);
    if (conf.Impulses !== undefined) {
      this.ImpulseClamp = new FixedPoint().SetFromNumber(conf.ImpulseClamp!);
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
    activeGbs: ActiveGrabBubblesDTO
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

export type GrabSnapShot = Grab | undefined;

export class GrabComponent implements IHistoryEnabled<GrabSnapShot> {
  private grabs: Map<GrabId, Grab> = new Map();
  private currentGrab: Grab | undefined = undefined;

  public constructor(grabConfigs: Map<GrabId, GrabConfig>) {
    for (const [k, v] of grabConfigs) {
      this.grabs.set(k, new Grab(v));
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

  public SnapShot(): GrabSnapShot {
    return this.currentGrab;
  }

  public SetFromSnapShot(snapShot: GrabSnapShot): void {
    this.currentGrab = snapShot;
  }
}

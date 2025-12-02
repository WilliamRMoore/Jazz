import { GrabBubbleConfig, GrabConfig } from '../../../character/shared';
import { FixedPoint } from '../../math/fixedPoint';
import { FlatVec } from '../../physics/vector';
import { ToFV } from '../../utils';
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
}

export class Grab {
  public readonly Name: string;
  public readonly TotalFrameLength: number;
  public readonly ImpulseClamp: FixedPoint | undefined;
  public readonly Impulses: Map<frameNumber, FlatVec> | undefined;
  public readonly GrabBubbles: Array<GrabBubble>;
  constructor(conf: GrabConfig) {
    this.Name = conf.Name;
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
}

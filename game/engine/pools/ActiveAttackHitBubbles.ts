import { HitBubble } from '../player/playerComponents';
import { IPooledObject } from './Pool';

export class ActiveHitBubblesDTO implements IPooledObject {
  private bubbles: Array<HitBubble> = [];

  public AddBubble(bub: HitBubble): ActiveHitBubblesDTO {
    this.bubbles.push(bub);
    return this;
  }

  public AtIndex(index: number): HitBubble | undefined {
    return this.bubbles[index];
  }

  public get Bubbles(): Array<HitBubble> {
    return this.bubbles;
  }

  public get Length(): number {
    return this.bubbles.length;
  }

  Zero(): void {
    this.bubbles.length = 0;
  }
}

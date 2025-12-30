import { GrabBubble } from '../entity/components/grab';
import { IPooledObject } from './Pool';

export class ActiveGrabBubblesDTO implements IPooledObject {
  private bubbles: Array<GrabBubble> = [];

  public AddBubble(bub: GrabBubble): ActiveGrabBubblesDTO {
    this.bubbles.push(bub);
    return this;
  }

  public AtIndex(index: number): GrabBubble | undefined {
    return this.bubbles[index];
  }

  public get Bubbles(): Array<GrabBubble> {
    return this.bubbles;
  }

  public get Length(): number {
    return this.bubbles.length;
  }

  Zero(): void {
    this.bubbles.length = 0;
  }
}

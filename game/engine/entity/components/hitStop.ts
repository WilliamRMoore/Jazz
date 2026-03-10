export class HitStopComponent {
  private hitStopFrames: number = 0;

  public SetHitStop(frames: number): void {
    this.hitStopFrames = frames;
  }

  public Decrement(): void {
    this.hitStopFrames--;
  }

  public SetZero(): void {
    this.hitStopFrames = 0;
  }

  public get Frames(): number {
    return this.hitStopFrames;
  }

  public set CompState(history: HitStopHist) {
    this.hitStopFrames = history.hitStopFrames;
  }
}

export type HitStopHist = {
  hitStopFrames: number;
};

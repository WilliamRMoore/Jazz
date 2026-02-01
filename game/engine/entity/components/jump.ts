import { FixedPoint } from '../../math/fixedPoint';
import { IHistoryEnabled } from '../componentHistory';

export type JumpSnapShot = number;

export class JumpComponent implements IHistoryEnabled<JumpSnapShot> {
  private readonly numberOfJumps: number = 2;
  private jumpCount: number = 0;
  public readonly JumpVelocity: FixedPoint = new FixedPoint(0);

  constructor(jumpVelocity: number, numberOfJumps: number = 2) {
    this.JumpVelocity.SetFromNumber(jumpVelocity);
    this.numberOfJumps = numberOfJumps;
  }

  public HasJumps(): boolean {
    return this.jumpCount < this.numberOfJumps;
  }

  public OnFirstJump(): boolean {
    return this.jumpCount === 1;
  }

  public JumpCountIsZero(): boolean {
    return this.jumpCount === 0;
  }

  public IncrementJumps(): void {
    this.jumpCount++;
  }

  public ResetJumps(): void {
    this.jumpCount = 0;
  }

  public SnapShot(): JumpSnapShot {
    return this.jumpCount;
  }

  public Set(jumps: number) {
    this.jumpCount = jumps;
  }

  public SetFromSnapShot(snapShot: JumpSnapShot): void {
    this.jumpCount = snapShot;
  }

  public get JumpCount(): number {
    return this.jumpCount;
  }
}

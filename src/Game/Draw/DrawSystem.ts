import { Player } from '../Player/Player';
import Stage from '../../classes/Stage';

export class DrawSystem {
  private readonly Stage: Stage;
  private readonly Players: Array<Player>;
  private readonly CTX: CanvasRenderingContext2D;

  constructor(
    playerArr: Array<Player>,
    stage: Stage,
    ctx: CanvasRenderingContext2D
  ) {
    this.Players = playerArr;
    this.Stage = stage;
    this.CTX = ctx;
  }

  public Draw(): void {
    this.DrawStage();
    this.DrawLedges();
    this.DrawPlayer();
  }

  private DrawPlayer() {
    let pLength = this.Players.length;

    for (let i = 0; i < pLength; i++) {
      const p = this.Players[i];
      const px = p.PlayerPosition.X;
      const py = p.PlayerPosition.Y;
      const ecb = p.ECB.GetVerticies();
      const ecbColor = p.ECB.GetColor();

      this.CTX.beginPath();
      this.CTX.moveTo(ecb[0].X, ecb[0].Y);
      this.CTX.lineTo(ecb[1].X, ecb[1].Y);
      this.CTX.lineTo(ecb[2].X, ecb[2].Y);
      this.CTX.lineTo(ecb[3].X, ecb[3].Y);
      this.CTX.closePath();
      this.CTX.fillStyle = ecbColor;
      this.CTX.fill();

      this.CTX.lineWidth = 1;
      this.CTX.strokeStyle = 'blue';

      this.CTX.beginPath();
      this.CTX.moveTo(px, py);
      this.CTX.lineTo(px + 10, py);
      this.CTX.stroke();
      this.CTX.moveTo(px, py);
      this.CTX.lineTo(px - 10, py);
      this.CTX.stroke();
      this.CTX.moveTo(px, py);
      this.CTX.lineTo(px, py + 10);
      this.CTX.stroke();
      this.CTX.moveTo(px, py);
      this.CTX.lineTo(px, py - 10);
      this.CTX.stroke();
      this.CTX.closePath();

      this.CTX.strokeStyle = 'white';

      if (p.FacingRight) {
        this.CTX.beginPath();
        this.CTX.moveTo(ecb[1].X, ecb[1].Y);
        this.CTX.lineTo(ecb[1].X + 10, ecb[1].Y);
        this.CTX.stroke();
        this.CTX.closePath;
      } else {
        this.CTX.beginPath();
        this.CTX.moveTo(ecb[3].X, ecb[3].Y);
        this.CTX.lineTo(ecb[3].X - 10, ecb[3].Y);
        this.CTX.stroke();
        this.CTX.closePath;
      }

      const ledgeDetectVerts = p.LedgeDetector.GetVerticies();
      this.CTX.strokeStyle = 'blue';
      if (!p.FacingRight) {
        this.CTX.strokeStyle = 'red';
      }
      this.CTX.beginPath();
      this.CTX.moveTo(ledgeDetectVerts[0].X, ledgeDetectVerts[0].Y);
      this.CTX.lineTo(ledgeDetectVerts[1].X, ledgeDetectVerts[1].Y);
      this.CTX.stroke();
      this.CTX.lineTo(ledgeDetectVerts[2].X, ledgeDetectVerts[2].Y);
      this.CTX.stroke();
      this.CTX.lineTo(ledgeDetectVerts[3].X, ledgeDetectVerts[3].Y);
      this.CTX.stroke();
      this.CTX.closePath();
      this.CTX.stroke();
      this.CTX.strokeStyle = 'red';
      if (!p.FacingRight) {
        this.CTX.strokeStyle = 'blue';
      }
      this.CTX.beginPath();
      this.CTX.moveTo(ledgeDetectVerts[4].X, ledgeDetectVerts[4].Y);
      this.CTX.lineTo(ledgeDetectVerts[5].X - 1, ledgeDetectVerts[5].Y);
      this.CTX.stroke();
      //this.CTX.moveTo(ledgeDetectVerts[5].X, ledgeDetectVerts[5].Y);
      this.CTX.lineTo(ledgeDetectVerts[6].X - 1, ledgeDetectVerts[6].Y);
      this.CTX.stroke();
      //this.CTX.moveTo(ledgeDetectVerts[6].X, ledgeDetectVerts[6].Y);
      this.CTX.lineTo(ledgeDetectVerts[7].X, ledgeDetectVerts[7].Y);
      this.CTX.stroke();
      this.CTX.closePath();
      this.CTX.stroke();
    }
  }

  private DrawStage() {
    const stageVerts = this.Stage.GetVerticies();
    const color = this.Stage.color;
    const svLength = stageVerts.length;

    this.CTX.beginPath();
    this.CTX.moveTo(stageVerts[0].X, stageVerts[0].Y);
    for (let i = 0; i < svLength; i++) {
      const point = stageVerts[i];
      this.CTX.lineTo(point.X, point.Y);
    }
    this.CTX.closePath();
    this.CTX.fillStyle = color;
    this.CTX.fill();
  }

  private DrawLedges() {
    const { left, right } = this.Stage.GetLedges();

    this.CTX.fillStyle = 'yellow';
    this.CTX.beginPath();
    this.CTX.moveTo(left[0].X, left[0].Y);
    this.CTX.lineTo(left[1].X, left[1].Y);
    this.CTX.lineTo(left[2].X, left[2].Y);
    this.CTX.lineTo(left[3].X, left[3].Y);
    this.CTX.closePath();
    this.CTX.fill();

    this.CTX.beginPath();
    this.CTX.moveTo(right[0].X, right[0].Y);
    this.CTX.lineTo(right[1].X, right[1].Y);
    this.CTX.lineTo(right[2].X, right[2].Y);
    this.CTX.lineTo(right[3].X, right[3].Y);
    this.CTX.closePath();
    this.CTX.fill();
  }
}

interface IDraw {}

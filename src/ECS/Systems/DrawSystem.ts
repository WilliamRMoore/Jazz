import { ECBComponent } from '../Components/ECB';
import { LedgeDetectorComponent } from '../Components/LedgeDetector';
import { PositionComponent } from '../Components/Position';
import { StageMainComponent, UnboxedStage } from '../Components/StageMain';
import { Entity } from '../ECS';
import { UnboxedPlayer } from '../Extensions/ECSBuilderExtensions';

export class DrawSystem {
  private readonly stage: UnboxedStage;
  private readonly players: Array<UnboxedPlayer>;
  private readonly ctx: CanvasRenderingContext2D;

  constructor(
    playerArr: Array<Entity>,
    stage: Entity,
    ctx: CanvasRenderingContext2D
  ) {
    this.players = new Array<UnboxedPlayer>();
    playerArr.forEach((p) => {
      this.players.push(new UnboxedPlayer(p));
    });
    this.stage = new UnboxedStage(stage);
    this.ctx = ctx;
  }

  public Draw() {
    this.ctx.clearRect(0, 0, 1920, 1080);
    this.drawStage();
    this.drawPlayer();
  }

  private drawEcb(ecb: ECBComponent) {
    const ecbVerts = ecb.GetVerticies();
    const ecbColor = ecb.GetColor();

    this.ctx.beginPath();
    this.ctx.moveTo(ecbVerts[0].X, ecbVerts[0].Y);
    this.ctx.lineTo(ecbVerts[1].X, ecbVerts[1].Y);
    this.ctx.lineTo(ecbVerts[2].X, ecbVerts[2].Y);
    this.ctx.lineTo(ecbVerts[3].X, ecbVerts[3].Y);
    this.ctx.closePath();
    this.ctx.fillStyle = ecbColor;
    this.ctx.fill();
  }

  private drawPlayerPosition(playerPosition: PositionComponent) {
    const px = playerPosition.Pos.X;
    const py = playerPosition.Pos.Y;
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'blue';

    this.ctx.beginPath();
    this.ctx.moveTo(px, py);
    this.ctx.lineTo(px + 10, py);
    this.ctx.stroke();
    this.ctx.moveTo(px, py);
    this.ctx.lineTo(px - 10, py);
    this.ctx.stroke();
    this.ctx.moveTo(px, py);
    this.ctx.lineTo(px, py + 10);
    this.ctx.stroke();
    this.ctx.moveTo(px, py);
    this.ctx.lineTo(px, py - 10);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  private drawDirectionLine(facingRight: boolean, ecbComp: ECBComponent) {
    const ecb = ecbComp.GetVerticies();
    this.ctx.strokeStyle = 'white';

    if (facingRight) {
      this.ctx.beginPath();
      this.ctx.moveTo(ecb[1].X, ecb[1].Y);
      this.ctx.lineTo(ecb[1].X + 10, ecb[1].Y);
      this.ctx.stroke();
      this.ctx.closePath;
      return;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(ecb[3].X, ecb[3].Y);
    this.ctx.lineTo(ecb[3].X - 10, ecb[3].Y);
    this.ctx.stroke();
    this.ctx.closePath;
  }

  private drawLedgeDetectors(
    facingRight: boolean,
    ledgeDetector: LedgeDetectorComponent
  ) {
    const right = ledgeDetector.GetRightSideDetectorVerts();
    const left = ledgeDetector.GetLeftSideDetectorVerts();

    this.ctx.strokeStyle = ledgeDetector.GetRightBoxColor(facingRight);

    this.ctx.beginPath();
    this.ctx.moveTo(right[0].X, right[0].Y);
    this.ctx.lineTo(right[1].X, right[1].Y);
    this.ctx.stroke();
    this.ctx.lineTo(right[2].X, right[2].Y);
    this.ctx.stroke();
    this.ctx.lineTo(right[3].X, right[3].Y);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.stroke();

    this.ctx.strokeStyle = ledgeDetector.GetLeftBoxColor(facingRight);

    this.ctx.beginPath();
    this.ctx.moveTo(left[0].X, left[0].Y);
    this.ctx.lineTo(left[1].X, left[1].Y);
    this.ctx.stroke();
    this.ctx.lineTo(left[2].X, left[2].Y);
    this.ctx.stroke();
    this.ctx.lineTo(left[3].X, left[3].Y);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.stroke();
  }

  private drawPlayer() {
    let numberOfPlayers = this.players.length;

    for (let i = 0; i < numberOfPlayers; i++) {
      const p = this.players[i];
      this.drawEcb(p.ECBComp);
      this.drawPlayerPosition(p.PosComp);
      this.drawDirectionLine(p.FlagsComp.IsFacingRight(), p.ECBComp);
      this.drawLedgeDetectors(p.FlagsComp.IsFacingRight(), p.LedgeDetectorComp);
    }
  }

  private drawStage() {
    const stageRef = this.stage.MainStage;
    const stageVerts = stageRef.GetVerticies();
    const color = stageRef.Color;
    const ledgeColor = stageRef.LegdeColor;
    const { left, right } = stageRef.GetLedges();

    const svLength = stageVerts.length;

    this.ctx.beginPath();
    this.ctx.moveTo(stageVerts[0].X, stageVerts[0].Y);

    for (let i = 0; i < svLength; i++) {
      const point = stageVerts[i];
      this.ctx.lineTo(point.X, point.Y);
    }

    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();

    //Draw left ledge
    this.ctx.fillStyle = ledgeColor;
    this.ctx.beginPath();
    this.ctx.moveTo(left[0].X, left[0].Y);
    this.ctx.lineTo(left[1].X, left[1].Y);
    this.ctx.lineTo(left[2].X, left[2].Y);
    this.ctx.lineTo(left[3].X, left[3].Y);
    this.ctx.closePath();
    this.ctx.fill();

    //Draw right ledge
    this.ctx.beginPath();
    this.ctx.moveTo(right[0].X, right[0].Y);
    this.ctx.lineTo(right[1].X, right[1].Y);
    this.ctx.lineTo(right[2].X, right[2].Y);
    this.ctx.lineTo(right[3].X, right[3].Y);
    this.ctx.closePath();
    this.ctx.fill();
  }
}

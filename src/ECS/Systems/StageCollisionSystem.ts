import { IntersectsPolygons } from '../../Physics/Collisions';
import {
  FlatVec,
  VectorAdder,
  VectorAllocator,
  VectorMultiplier,
  VectorNegator,
} from '../../Physics/FlatVec';
import { UnboxedStage } from '../Components/StageMain';
import { Entity } from '../ECS';
import { UnboxedPlayer } from '../Extensions/ECSBuilderExtensions';
import { LineSegmentIntersection } from '../../Physics/RayCast/RayCast';
import { IInputStorageManager } from '../../input/InputStorageManager';
import {
  Actions,
  InputAction,
  InputActionPacket,
} from '../../input/GamePadInput';
import {
  land,
  neutralFall,
} from '../../Game/State/CharacterStates/Movement/ECSStateTest';

export class StageCollisionSystem {
  private Stage: UnboxedStage;
  private Players = new Array<UnboxedPlayer>();
  private GroundedCorrrection: number = 0.01;
  private GroundedDetectDepth: number = -0.02;

  constructor(stage: Entity, playerEnts: Array<Entity>) {
    this.Stage = new UnboxedStage(stage);
    playerEnts.forEach((p) => this.Players.push(new UnboxedPlayer(p)));
  }

  public Detect() {
    const sverts = this.Stage.MainStage.GetVerticies();
    const pLength = this.Players.length;

    for (let index = 0; index < pLength; index++) {
      const player = this.Players[index];
      const pVerts = player.ECBComp.GetVerticies();

      const res = IntersectsPolygons(pVerts, sverts);

      if (res.collision) {
        const move = VectorMultiplier(VectorNegator(res.normal!), res.depth!);
        move.Y += this.GroundedCorrrection;
        let resolution = VectorAdder(player.PosComp.Pos, move);

        // correction if we hit a corner, I just want it to push you on the x axis, not the y.
        if (Math.abs(res!.normal!.X) > 0 && res.normal!.Y > 0) {
          const fix = move.X <= 0 ? move.Y : -move.Y;
          move.X += fix;
          move.Y = 0;
          resolution = VectorAdder(player.PosComp.Pos, move);
        }

        player.UpdatePlayerPosition(resolution.X, resolution.Y);

        const bottomEcbPoint = player.ECBComp.Bottom();
        const ecbTestPoint = VectorAllocator(
          bottomEcbPoint.X,
          bottomEcbPoint.Y + this.GroundedDetectDepth
        );

        const grounded = this.checkGround(
          ecbTestPoint,
          player.ECBComp.Bottom(),
          sverts[0],
          sverts[1]
        );

        if (grounded && !player.FlagsComp.IsGrounded()) {
          player.FlagsComp.Ground();
          player.StateMachineComp.StateMachine.ForceState(land.Name);
        }

        if (!grounded) {
          player.FlagsComp.Unground();
          player.StateMachineComp.StateMachine.SetState(neutralFall.Name, null);
        }
      }

      if (!res.collision) {
        player.FlagsComp.Unground();
        player.StateMachineComp.StateMachine.SetState(neutralFall.Name, null);
      }
    }
  }

  private checkGround(
    start1: FlatVec,
    end1: FlatVec,
    start2: FlatVec,
    end2: FlatVec
  ) {
    let res = LineSegmentIntersection(
      start1.X,
      start1.Y,
      end1.X,
      end1.Y,
      start2.X,
      start2.Y,
      end2.X,
      end2.Y
    );

    if (res) {
      return true;
    } else {
      return false;
    }
  }
}

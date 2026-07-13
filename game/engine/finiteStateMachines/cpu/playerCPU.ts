import { Player } from '../../entity/playerOrchestrator';
import { World } from '../../world/world';
import { GroundPatrol } from './sequences/groundPatrol';
import { CPUAction } from './sequences/shared';
import { IAstNode, SelectorNode } from './astNode';
import {
  Node_IsOffStage,
  Node_IsOnPlatform,
  Node_ReturnSequence
} from './analyzers/platformChecks';
import { Recover } from './sequences/recover';
import { FallThrough } from './sequences/fallThrough';
import { InputAction, NewInputAction } from '../../input/Input';
import { STATE_IDS } from '../player/shared';
import { Sequencer } from '../../utils';

export class PlayerCPU {
  public readonly ID: number;
  public readonly Player: Player;
  private readonly world: World;

  public CurrentCPUSeq: CPUAction | undefined = undefined;
  private sequenceFrame = 0;

  private readonly inputOut: InputAction;
  private readonly astRoot: IAstNode;
  private readonly prng: Sequencer;

  constructor(id: number, w: World) {
    this.ID = id;
    this.Player = w.PlayerData.Player(id);
    this.world = w;
    this.inputOut = NewInputAction();

    // Seed the PRNG with something based on the player ID
    this.prng = new Sequencer(
      (s: number) => (s * 1103515245 + 12345) % 2147483648
    );
    this.prng.SeqStart = 1000 + id;

    // Hardcoded AST for POC:
    // Root (Selector)
    //  - IsOffStage -> Recover
    //  - IsOnPlatform -> FallThrough
    //  - AlwaysTrue -> GroundPatrol
    this.astRoot = new SelectorNode([
      new Node_IsOffStage(new Node_ReturnSequence(Recover)),
      new Node_IsOnPlatform(new Node_ReturnSequence(FallThrough)),
      new Node_ReturnSequence(GroundPatrol)
    ]);
  }

  public NextInput(): InputAction {
    const stateId = this.Player.FSMInfo.CurrentStateId;
    const isHitstun =
      stateId === STATE_IDS.HIT_FLINCH_S ||
      stateId === STATE_IDS.HIT_SLIDE_S ||
      stateId === STATE_IDS.HIT_STOP_S ||
      stateId === STATE_IDS.LAUNCH_S ||
      stateId === STATE_IDS.TUMBLE_S;

    if (isHitstun) {
      if (this.CurrentCPUSeq && this.CurrentCPUSeq.OnExit) {
        this.CurrentCPUSeq.OnExit(this, this.world);
      }
      this.CurrentCPUSeq = undefined;
    }

    // 2. Evaluate AST if no active sequence
    if (this.CurrentCPUSeq === undefined) {
      // For POC, just using current world state.
      // (Variable reaction delay via HistoryData can be injected here later).
      this.CurrentCPUSeq = this.astRoot.Evaluate(this.world, this.Player);
      this.sequenceFrame = 0;

      if (this.CurrentCPUSeq && this.CurrentCPUSeq.OnEnter) {
        this.CurrentCPUSeq.OnEnter(this, this.world);
      }
    }

    // 3. Tick active sequence
    if (this.CurrentCPUSeq !== undefined) {
      const isDone = this.CurrentCPUSeq.Tick(
        this.sequenceFrame,
        this,
        this.world,
        this.inputOut
      );
      this.sequenceFrame++;

      if (isDone) {
        if (this.CurrentCPUSeq.OnExit) {
          this.CurrentCPUSeq.OnExit(this, this.world);
        }
        this.CurrentCPUSeq = undefined;
      }
    }

    return this.inputOut;
  }
}

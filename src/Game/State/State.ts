import { InputAction } from '../../input/GamePadInput';
import { Player } from '../Player/Player';
import { StateMachine } from './StateMachine';

interface IState {
  frameCount: number;
  stateDefaultTransition: string;
  name: string;
  onEnter?: (player: Player, ia: InputAction) => void;
  onUpdate?: (
    stateFrame: number,
    player: Player,
    inputAction?: InputAction
  ) => void;
  onExit?: (player: Player) => void;
  onDefaultInput?: (input: InputAction) => string;
  tranisitions?: string[];
}

export default IState;

export class PState {
  private frameCount?: number;
  public readonly Name: string;
  private stateDefaultTransition?: PState;
  private WhiteList?: Array<PState>;
  public onEnter?: (player: Player) => void;
  public onUpdate?: (stateFrame: number, p: Player, ia: InputAction) => void;
  public onExit?: (p: Player) => void;
  private getLegalTransition: (
    transitions: Array<PState>,
    stateName: string
  ) => PState | null;

  constructor(name: string) {
    this.Name = name;
  }

  public SetFrameCount(f: number): void {
    this.frameCount = f;
  }

  public SetDefaultTransition(pstate: PState): void {
    this.stateDefaultTransition = pstate;
  }

  public SetWhiteList(states: Array<PState>) {
    this.WhiteList = states;
  }

  public SetOnEnter(onEnter: (p: Player) => void): void {
    this.onEnter = onEnter;
  }

  public SetOnUpdate(
    onUpdate: (f: number, p: Player, ia: InputAction) => void
  ): void {
    this.onUpdate = onUpdate;
  }

  public SetOnExit(onExit: (p: Player) => void): void {
    this.onExit = onExit;
  }

  public SetGetLegalTranisitions(
    lt: (transisitions: Array<PState>, name: string) => PState | null
  ) {
    this.getLegalTransition = lt;
  }

  public GetLegalTransisitions(stateName: string): PState | null {
    return this.getLegalTransition(this.WhiteList, stateName);
  }
}

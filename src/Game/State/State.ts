import { InputAction } from '../../input/GamePadInput';
import { Player } from '../Player/Player';
import { StateMachine } from './StateMachine';

interface IState {
  frameCount: number;
  stateDefaultTransition: string;
  name: string;
  onEnter?: (player: Player, inputAction?: InputAction) => void;
  onUpdate?: (
    stateFrame: number,
    player: Player,
    inputAction?: InputAction
  ) => void;
  onExit?: (player: Player, inputAction?: InputAction) => void;
  tranisitions?: string[];
}

export default IState;

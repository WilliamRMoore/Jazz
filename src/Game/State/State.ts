import { InputAction } from '../../input/GamePadInput';
import { Player } from '../Player/Player';

interface IState {
  frameCount: number;
  stateDefaultTransition: IState;
  name: string;
  onEnter?: (player: Player, ia: InputAction) => void;
  onUpdate?: (
    stateFrame: number,
    player: Player,
    inputAction?: InputAction
  ) => void;
  onExit?: (player: Player) => void;
  tranisitions?: Map<string, IState>;
}

export default IState;

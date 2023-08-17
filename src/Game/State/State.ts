import { Player } from '../Player/Player';

interface IState {
  name: string;
  onEnter?: (player: Player) => void;
  onUpdate?: (dt: number, player: Player) => void;
  onExit?: (player: Player) => void;
  tranisitions?: string[];
}

export default IState;

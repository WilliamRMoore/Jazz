import { Player } from '../../Player/Player';
import { InputAction } from '../../../input/GamePadInput';
import IState from '../State';
import { VectorAllocator } from '../../../Physics/FlatVec';

export const run = {
  name: 'run',
  onEnter: (player) => {
    console.log('enter run');
  },
  onUpdate: (dt, player) => {
    player.AddVelocity(VectorAllocator(10, 0));
    player.ApplyVelocity();
    player.ApplyVelocityDecay();
    player.ApplyGravity();
    player.ECB.MoveToPosition(player.PlayerPosition.X, player.PlayerPosition.Y);
    player.ECB.Update();
  },
  onExit: (p) => {
    console.log('Exiting run');
  },
} as IState;

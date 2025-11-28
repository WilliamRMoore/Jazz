import { Player } from '../../entity/playerOrchestrator';

export type SetJumpCountCommand = {
  commandName: string;
  payload: number;
};

export function SetJumpCount(p: Player, c: SetJumpCountCommand) {
  p.Jump.Set(c.payload);
}

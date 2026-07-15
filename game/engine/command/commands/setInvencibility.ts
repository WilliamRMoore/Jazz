import { Player } from '../../entity/playerOrchestrator';

export type SetInvincibilityCommand = {
  commandName: string;
  payload: { frames: number };
};

export function SetInvincibility(p: Player, c: SetInvincibilityCommand) {
  p.Flags.SetInvincibilityFrames(c.payload.frames);
}

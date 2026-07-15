import { Player } from '../../entity/playerOrchestrator';

export type SetSuperArmorCommand = {
  commandName: string;
  payload: { frames: number };
};

export function SetSuperArmor(p: Player, c: SetSuperArmorCommand) {
  p.Flags.SetSuperArmorFrames(c.payload.frames);
}

import { DefaultCharacterConfig } from '../../../character/default';
import { STATE_IDS } from '../../finite-state-machine/stateConfigurations/shared';
import { RawToNumber } from '../../math/fixedPoint';
import { CORRECTION_DEPTH_RAW } from '../../systems/shared';
import { ToFV } from '../../utils';
import { JazzDebugger } from '../jazzDebugWrapper';

export function SpawnAndAttackWithNSpecial(jazz: JazzDebugger) {
  const cc = new DefaultCharacterConfig();
  const g = jazz.World.StageData.Stage.StageVerticies.GetGround()[0];
  const centerX = g.X2.AsNumber - (g.X2.AsNumber - g.X1.AsNumber) / 2;
  const groundHeight = g.Y1.AsNumber + RawToNumber(CORRECTION_DEPTH_RAW);
  const pdb = jazz.AddPlayerEntity(cc, ToFV(centerX, groundHeight));
  pdb.LookLeft();
  pdb.ForceState(STATE_IDS.SPCL_S);
}

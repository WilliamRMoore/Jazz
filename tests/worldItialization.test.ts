import { DefaultCharacterConfig } from '../game/character/default';
import { Player } from '../game/engine/entity/playerOrchestrator';
import { defaultStage, Stage } from '../game/engine/stage/stageMain';
import { World } from '../game/engine/world/world';

describe('world initiliazation', () => {
  let world: World;
  let stage: Stage;
  let po: Player;
  let config = new DefaultCharacterConfig();

  beforeAll(() => {
    world = new World();
    stage = defaultStage();
    po = new Player(0, config);
    world.SetStage(stage);
    world.SetPlayer(po);
  });

  test('stage ground initialization', () => {
    const s = world.StageData.Stage;
    expect(s).toBeDefined();
    const v = s.StageVerticies;
    const grnd = v.GetGround();
    expect(grnd.length).toBe(1);
    expect(grnd[0].X1.AsNumber).toBe(500);
    expect(grnd[0].Y1.AsNumber).toBe(650);
    expect(grnd[0].X2.AsNumber).toBe(1600);
    expect(grnd[0].Y2.AsNumber).toBe(650);
  });

  test('playerStateMachine initialization', () => {
    const pd = world.PlayerData;
    const player = pd.Player(0);
    expect(player).toBeDefined();
    const fsm = player.FSMInfo;
    expect(fsm).toBeDefined();
    const state = fsm.CurrentState;
    expect(state).toBeDefined();
    expect(state.StateName).toBe('IDLE');
    expect(state.StateId).toBe(0);
    const sm = pd.StateMachine(0);
    expect(sm).toBeDefined();
  });
});

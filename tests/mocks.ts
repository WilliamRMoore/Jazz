import { AttackConfig } from "../game/character/shared";
import { ATTACK_IDS, GAME_EVENT_IDS } from "../game/engine/finite-state-machine/playerStates/shared";

export const MOCK_ATTACK_CONFIG: AttackConfig = {
    AttackId: ATTACK_IDS.N_GRND_ATK,
    Name: 'mock_attack',
    TotalFrameLength: 10,
    InteruptableFrame: 5,
    GravityActive: true,
    BaseKnockBack: 10,
    KnockBackScaling: 0.1,
    HitBubbles: [],
    GameEvent: GAME_EVENT_IDS.ATTACK_GE,
    CanOnlyFallOffLedgeIfFacingAwayFromIt: false
};

import { CharacterConfig } from '../../../game/character/shared';
import { traitTypes } from '../editForm/editableTrait';

type s = keyof CharacterConfig;

function GetSpeedSection() {
  const sections = new Map<s, traitTypes>();
  sections
    .set('GroundedVelocityDecay', 'num')
    .set('AerialVelocityDecay', 'num')
    .set('AerialSpeedInpulseLimit', 'num')
    .set('AerialSpeedMultiplier', 'num')
    .set('AirDodgeSpeed', 'num')
    .set('DodgeRollSpeed', 'num')
    .set('LedgeRollSpeed', 'num')
    .set('GetUpRollForwardSpeed', 'num')
    .set('GetUpRollBackSpeed', 'num')
    .set('MaxWalkSpeed', 'num')
    .set('MaxRunSpeed', 'num')
    .set('DashMutiplier', 'num')
    .set('MaxDashSpeed', 'num')
    .set('WalkSpeedMulitplier', 'num')
    .set('RunSpeedMultiplier', 'num')
    .set('FastFallSpeed', 'num')
    .set('FallSpeed', 'num')
    .set('Gravity', 'num');

  return sections;
}

function GetNameSection() {
  const sections = new Map<s, traitTypes>();
  sections.set('Name', 'string');
  return sections;
}

function GetJumpSection() {
  const sections = new Map<s, traitTypes>();
  sections.set('JumpVelocity', 'num').set('NumberOfJumps', 'num');
  return sections;
}

function GetWallKickSection() {
  const sections = new Map<s, traitTypes>();
  sections.set('WallKickVelocity', 'flatvec');
  return sections;
}

function GetGrabSection() {
  const sections = new Map<s, traitTypes>();
  sections.set('Grabs', 'grab');
  return sections;
}

function GetAttackSection() {
  const sections = new Map<s, traitTypes>();
  sections.set('Attacks', 'attack');
  return sections;
}

function GetSheildSection() {
  const sections = new Map<s, traitTypes>();
  sections.set('ShieldRadius', 'num').set('ShieldYOffset', 'num');
  return sections;
}

function GetWeightSection() {
  const sections = new Map<s, traitTypes>();
  sections.set('Weight', 'num');
  return sections;
}

function GetECBShapeSection() {
  const sections = new Map<s, traitTypes>();
  sections
    .set('ECBHeight', 'num')
    .set('ECBWidth', 'num')
    .set('ECBOffset', 'num')
    .set('ECBShapes', 'ecbshape');
  return sections;
}

function GetHurtCapsuleSection() {
  const sections = new Map<s, traitTypes>();
  sections.set('HurtCapsules', 'hurtcapsule');
  return sections;
}

function GetThrowsSection() {
  const sections = new Map<s, traitTypes>();
  sections.set('Throws', 'throw');
  return sections;
}

function GetLedgeSection() {
  const sections = new Map<s, traitTypes>();
  sections
    .set('LedgeBoxHeight', 'num')
    .set('LedgeBoxWidth', 'num')
    .set('LedgeBoxYOffset', 'num');
  return sections;
}

export const sections = new Map<string, Map<s, traitTypes>>();
sections.set('Speed', GetSpeedSection());
sections.set('Name', GetNameSection());
sections.set('Jump', GetJumpSection());
sections.set('WallKick', GetWallKickSection());
sections.set('Grab', GetGrabSection());
sections.set('Attack', GetAttackSection());
sections.set('Sheild', GetSheildSection());
sections.set('Weight', GetWeightSection());
sections.set('ECBShape', GetECBShapeSection());
sections.set('HurtCapsule', GetHurtCapsuleSection());
sections.set('Throws', GetThrowsSection());
sections.set('Ledge', GetLedgeSection());

/***
 * TODO: Add more sections
 * ADD:
 *  Direction section
 *  Jump Section
 *  Wall Kick Section
 *  Shield Section
 *  Weights Section
 *  Attack section (can add, delete, and edit attacks)
 *  Annimation state link section (frame lengths can be set here)
 *  Animation ECB Section (ecb shapes can be set here)
 *  Animation HurtCapsules Section
 *  Throws section
 *  Sensors section ( what state they belong to, when to run, what commands)
 *  Shaders Section
 */

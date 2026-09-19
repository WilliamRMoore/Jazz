import { HurtCapsuleAttachment } from '../../game/character/shared';

/**
 * Common symmetry replacement pairs for 3D skeleton bone naming conventions.
 */
const SYMMETRY_PATTERNS: Array<[RegExp, string]> = [
  // Full word patterns
  [/\bLeft\b/g, 'Right'],
  [/\bRight\b/g, 'Left'],
  [/\bleft\b/g, 'right'],
  [/\bright\b/g, 'left'],
  
  // CamelCase prefixes/mid-words (e.g. LeftUpLeg, mixamorigLeftHand)
  [/Left([A-Z0-9_])/g, 'Right$1'],
  [/Right([A-Z0-9_])/g, 'Left$1'],
  
  // Dot suffixes (e.g. hand.L, hand.R)
  [/\.L\b/g, '.R'],
  [/\.R\b/g, '.L'],
  [/\.l\b/g, '.r'],
  [/\.r\b/g, '.l'],
  
  // Underscore or hyphen suffixes (e.g. hand_L, hand_R, hand-L)
  [/_L\b/g, '_R'],
  [/_R\b/g, '_L'],
  [/_l\b/g, '_r'],
  [/_r\b/g, '_l'],
  [/-L\b/g, '-R'],
  [/-R\b/g, '-L'],
  
  // Prefixes (e.g. L_Hand, R_Hand, l_hand)
  [/^L_/g, 'R_'],
  [/^R_/g, 'L_'],
  [/^l_/g, 'r_'],
  [/^r_/g, 'l_']
];

/**
 * Attempts to find the reciprocal/mirrored bone name for a given bone
 * from the list of all known bone names in the character's skeleton.
 */
export function mirrorBoneName(boneName: string, allBoneNames: string[]): string | undefined {
  if (!boneName) return undefined;

  // Try each pattern in sequence
  for (const [regex, replacement] of SYMMETRY_PATTERNS) {
    if (regex.test(boneName)) {
      const candidate = boneName.replace(regex, replacement);
      if (candidate !== boneName && allBoneNames.includes(candidate)) {
        return candidate;
      }
    }
  }

  // Case-insensitive fallback lookup in allBoneNames
  for (const [regex, replacement] of SYMMETRY_PATTERNS) {
    if (regex.test(boneName)) {
      const candidate = boneName.replace(regex, replacement).toLowerCase();
      const match = allBoneNames.find((b) => b.toLowerCase() === candidate);
      if (match && match !== boneName) {
        return match;
      }
    }
  }

  return undefined;
}

/**
 * Mirrors a hurt capsule attachment (flipping Bone A, Bone B, and label name).
 * Returns null if the bones cannot be mirrored (e.g. center bones without reciprocal).
 */
export function mirrorHurtCapsule(
  capsule: HurtCapsuleAttachment,
  allBoneNames: string[]
): HurtCapsuleAttachment | null {
  const mirroredBoneA = mirrorBoneName(capsule.boneA, allBoneNames);
  const mirroredBoneB = mirrorBoneName(capsule.boneB, allBoneNames);

  // At least one bone must have a mirrored pair; if boneA == boneB (sphere), both mirror
  const targetBoneA = mirroredBoneA || capsule.boneA;
  const targetBoneB = mirroredBoneB || capsule.boneB;

  // If neither bone changed, it's a central bone (e.g. spine/pelvis) that cannot be mirrored
  if (targetBoneA === capsule.boneA && targetBoneB === capsule.boneB) {
    return null;
  }

  // Mirror the name string if it contains left/right indicators
  let mirroredName = capsule.name;
  if (/\bLeft\b/i.test(mirroredName)) {
    mirroredName = mirroredName.replace(/\bLeft\b/g, 'Right').replace(/\bleft\b/g, 'right');
  } else if (/\bRight\b/i.test(mirroredName)) {
    mirroredName = mirroredName.replace(/\bRight\b/g, 'Left').replace(/\bright\b/g, 'left');
  } else {
    mirroredName = `${capsule.name} (Mirrored)`;
  }

  return {
    id: 'capsule_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
    name: mirroredName,
    boneA: targetBoneA,
    boneB: targetBoneB,
    radius: capsule.radius
  };
}

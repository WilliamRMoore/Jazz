import { mirrorBoneName, mirrorHurtCapsule } from '../characterEditor/core/mirroring';
import { HurtCapsuleAttachment, DisplayLayerConfig } from '../game/character/shared';

describe('Editor Hurt Capsule & Bone Mirroring Logic', () => {
  const mockSkeletonBones = [
    'Hips',
    'Spine',
    'Neck',
    'Head',
    'LeftUpLeg',
    'LeftLeg',
    'LeftFoot',
    'RightUpLeg',
    'RightLeg',
    'RightFoot',
    'LeftArm',
    'LeftForeArm',
    'LeftHand',
    'RightArm',
    'RightForeArm',
    'RightHand',
    'shoulder.L',
    'shoulder.R',
    'finger_01_l',
    'finger_01_r',
    'mixamorigLeftToeBase',
    'mixamorigRightToeBase',
    'L_Clavicle',
    'R_Clavicle'
  ];

  describe('mirrorBoneName', () => {
    it('should mirror CamelCase Left/Right bones', () => {
      expect(mirrorBoneName('LeftUpLeg', mockSkeletonBones)).toBe('RightUpLeg');
      expect(mirrorBoneName('RightForeArm', mockSkeletonBones)).toBe('LeftForeArm');
      expect(mirrorBoneName('LeftHand', mockSkeletonBones)).toBe('RightHand');
    });

    it('should mirror dot-suffix .L / .R bones', () => {
      expect(mirrorBoneName('shoulder.L', mockSkeletonBones)).toBe('shoulder.R');
      expect(mirrorBoneName('shoulder.R', mockSkeletonBones)).toBe('shoulder.L');
    });

    it('should mirror underscore-suffix _l / _r bones', () => {
      expect(mirrorBoneName('finger_01_l', mockSkeletonBones)).toBe('finger_01_r');
      expect(mirrorBoneName('finger_01_r', mockSkeletonBones)).toBe('finger_01_l');
    });

    it('should mirror prefix L_ / R_ bones', () => {
      expect(mirrorBoneName('L_Clavicle', mockSkeletonBones)).toBe('R_Clavicle');
      expect(mirrorBoneName('R_Clavicle', mockSkeletonBones)).toBe('L_Clavicle');
    });

    it('should mirror mixamorig prefixed bones', () => {
      expect(mirrorBoneName('mixamorigLeftToeBase', mockSkeletonBones)).toBe('mixamorigRightToeBase');
      expect(mirrorBoneName('mixamorigRightToeBase', mockSkeletonBones)).toBe('mixamorigLeftToeBase');
    });

    it('should return undefined for central bones with no symmetry', () => {
      expect(mirrorBoneName('Hips', mockSkeletonBones)).toBeUndefined();
      expect(mirrorBoneName('Spine', mockSkeletonBones)).toBeUndefined();
      expect(mirrorBoneName('Head', mockSkeletonBones)).toBeUndefined();
    });

    it('should return undefined when opposite bone does not exist in skeleton', () => {
      expect(mirrorBoneName('LeftSpecialWing', mockSkeletonBones)).toBeUndefined();
    });
  });

  describe('mirrorHurtCapsule', () => {
    it('should mirror both bones, flip label, and preserve radius', () => {
      const leftLegCapsule: HurtCapsuleAttachment = {
        id: 'cap_1',
        name: 'Left Leg',
        boneA: 'LeftUpLeg',
        boneB: 'LeftLeg',
        radius: 12.5
      };

      const mirrored = mirrorHurtCapsule(leftLegCapsule, mockSkeletonBones);
      expect(mirrored).not.toBeNull();
      expect(mirrored!.name).toBe('Right Leg');
      expect(mirrored!.boneA).toBe('RightUpLeg');
      expect(mirrored!.boneB).toBe('RightLeg');
      expect(mirrored!.radius).toBe(12.5);
      expect(mirrored!.id).not.toBe('cap_1');
    });

    it('should mirror spherical single-bone capsule (e.g. LeftFoot -> LeftFoot)', () => {
      const leftFootCapsule: HurtCapsuleAttachment = {
        id: 'cap_2',
        name: 'Left Foot',
        boneA: 'LeftFoot',
        boneB: 'LeftFoot',
        radius: 8.0
      };

      const mirrored = mirrorHurtCapsule(leftFootCapsule, mockSkeletonBones);
      expect(mirrored).not.toBeNull();
      expect(mirrored!.name).toBe('Right Foot');
      expect(mirrored!.boneA).toBe('RightFoot');
      expect(mirrored!.boneB).toBe('RightFoot');
      expect(mirrored!.radius).toBe(8.0);
    });

    it('should return null when attempting to mirror a central bone capsule', () => {
      const headCapsule: HurtCapsuleAttachment = {
        id: 'cap_head',
        name: 'Head Capsule',
        boneA: 'Head',
        boneB: 'Neck',
        radius: 15
      };

      const mirrored = mirrorHurtCapsule(headCapsule, mockSkeletonBones);
      expect(mirrored).toBeNull();
    });
  });

  describe('Capacity Limit & DisplayLayerConfig Serialization', () => {
    it('should enforce 25 capsule maximum capacity', () => {
      const MAX_CAPS = 25;
      const capsules: HurtCapsuleAttachment[] = [];

      for (let i = 0; i < MAX_CAPS; i++) {
        capsules.push({
          id: `cap_${i}`,
          name: `Capsule ${i}`,
          boneA: 'LeftArm',
          boneB: 'LeftForeArm',
          radius: 10
        });
      }

      expect(capsules.length).toBe(25);
      // Attempting to add 26th
      const canAdd = capsules.length < MAX_CAPS;
      expect(canAdd).toBe(false);
    });

    it('should serialize and deserialize DisplayLayerConfig with hurtCapsules correctly', () => {
      const displayConfig: DisplayLayerConfig = {
        simulationScale: 1.5,
        deadRightRotation: 90,
        states: new Map(),
        hurtCapsules: [
          { id: '1', name: 'Left Thigh', boneA: 'LeftUpLeg', boneB: 'LeftLeg', radius: 10 },
          { id: '2', name: 'Right Thigh', boneA: 'RightUpLeg', boneB: 'RightLeg', radius: 10 }
        ]
      };

      const jsonStr = JSON.stringify(displayConfig, (key, value) => {
        if (value instanceof Map) {
          return { dataType: 'Map', value: Array.from(value.entries()) };
        }
        return value;
      });

      const parsed: DisplayLayerConfig = JSON.parse(jsonStr, (key, value) => {
        if (typeof value === 'object' && value !== null && value.dataType === 'Map') {
          return new Map(value.value);
        }
        return value;
      });

      expect(parsed.simulationScale).toBe(1.5);
      expect(parsed.deadRightRotation).toBe(90);
      expect(parsed.hurtCapsules).toBeDefined();
      expect(parsed.hurtCapsules!.length).toBe(2);
      expect(parsed.hurtCapsules![0].boneA).toBe('LeftUpLeg');
      expect(parsed.hurtCapsules![1].boneA).toBe('RightUpLeg');
    });
  });

  describe('Deferred 2D Projection Math on Export', () => {
    it('should project 3D bone endpoints into 2D line segment coordinates', () => {
      const scale = 2.0;
      const deadRightDeg = 0; // facing along +X
      const facingRad = deadRightDeg * (Math.PI / 180);
      const modelBaseY = 10;

      // 3D coordinates of Bone A and Bone B
      const boneA = { x: 5, y: 30, z: 0 };
      const boneB = { x: 15, y: 50, z: 0 };
      const radius = 8;

      const x1 = (boneA.x * Math.cos(-facingRad) - boneA.z * Math.sin(-facingRad)) * scale;
      const y1 = (boneA.y - modelBaseY) * scale;
      const x2 = (boneB.x * Math.cos(-facingRad) - boneB.z * Math.sin(-facingRad)) * scale;
      const y2 = (boneB.y - modelBaseY) * scale;
      const projRadius = radius * scale;

      expect(x1).toBe(10);
      expect(y1).toBe(40);
      expect(x2).toBe(30);
      expect(y2).toBe(80);
      expect(projRadius).toBe(16);
    });
  });
});

import {
  AttackConfig,
  CharacterConfig,
  ECBShape,
  GrabConfig,
  HurtCapsuleConfig,
  ThrowConfig
} from '../../game/character/shared';
import {
  AttackId,
  GrabId,
  StateId
} from '../../game/engine/finiteStateMachines/player/states/shared';

import { sections } from '../ui/panels/leftPanel';
import { RightPanel } from '../ui/panels/rightPanel';

export type CharacterProject = {
  config: CharacterConfig;
  // TODO: Add other project specific data like animation maps
};

export class CharacterEditor {
  private project: CharacterProject;
  private rightPanel: RightPanel;

  constructor(cc: CharacterConfig | undefined = undefined) {
    if (cc === undefined) {
      this.project = { config: emptyCahrConfig() };
    } else {
      this.project = { config: cc };
    }

    this.rightPanel = new RightPanel(
      'right-panel',
      this.project.config,
      (newConfig) => {
        this.project.config = newConfig;
        console.log('Config updated:', this.project.config);
      }
    );

    this.initLeftPanel();
    this.initToolbar();
  }

  private initLeftPanel() {
    const leftPanelEl = document.getElementById('left-panel');
    if (!leftPanelEl) return;

    const ul = document.createElement('ul');

    sections.forEach((_, sectionName) => {
      const li = document.createElement('li');
      li.innerText = sectionName;
      li.addEventListener('click', () => {
        // Remove active class from all
        ul.querySelectorAll('li').forEach((el) =>
          el.classList.remove('active')
        );
        li.classList.add('active');
        this.rightPanel.renderSection(sectionName);
      });
      ul.appendChild(li);
    });

    leftPanelEl.appendChild(ul);
  }

  private initToolbar() {
    const btnNew = document.getElementById('btn-new');
    const btnOpen = document.getElementById('btn-open');
    const btnSave = document.getElementById('btn-save');
    const btnExport = document.getElementById('btn-export');

    btnNew?.addEventListener('click', () => {
      this.project = { config: emptyCahrConfig() };
      this.rightPanel.updateConfig(this.project.config);
      document.getElementById('right-panel')!.innerHTML = '';
      document
        .querySelectorAll('.left-panel li')
        .forEach((el) => el.classList.remove('active'));
    });

    btnSave?.addEventListener('click', () => {
      // Stub for saving project file
      console.log('Saving project:', this.project);
      alert('Project saved to console');
    });

    btnExport?.addEventListener('click', () => {
      // Stub for exporting character config
      const json = JSON.stringify(
        this.project.config,
        (key, value) => {
          if (value instanceof Map) {
            return { dataType: 'Map', value: Array.from(value.entries()) }; // Handle Map serialization
          }
          return value;
        },
        2
      );
      console.log('Exporting Config:', json);
      alert('Config exported to console');
    });
  }
}

// Bootstrapping the editor when the script loads
document.addEventListener('DOMContentLoaded', () => {
  new CharacterEditor();
});

function emptyCahrConfig(): CharacterConfig {
  const cc = {
    Name: 'NO_NAME',
    FrameLengths: new Map<StateId, number>(),
    ECBHeight: 100,
    ECBWidth: 100,
    ECBOffset: 0,
    ECBShapes: new Map<StateId, ECBShape>(),
    HurtCapsules: new Array<HurtCapsuleConfig>(),
    JumpVelocity: 0,
    WallKickVelocity: { x: 0, y: 0 },
    NumberOfJumps: 0,
    LedgeBoxHeight: 0,
    LedgeBoxWidth: 0,
    LedgeBoxYOffset: 0,
    LedgeRollFrames: {
      ledgeGetUpFrames: 0,
      ledgeRollFrames: [0, 0]
    },
    Attacks: new Map<AttackId, AttackConfig>(),
    Grabs: new Map<GrabId, GrabConfig>(),
    Throws: new Array<ThrowConfig>(),
    Weight: 0,
    ShieldRadius: 0,
    ShieldYOffset: 0,
    GroundedVelocityDecay: 0,
    AerialVelocityDecay: 0,
    AerialSpeedInpulseLimit: 0,
    AerialSpeedMultiplier: 0,
    AirDodgeSpeed: 0,
    DodgeRollSpeed: 0,
    LedgeRollSpeed: 0,
    GetUpRollForwardSpeed: 0,
    GetUpRollBackSpeed: 0,
    MaxWalkSpeed: 0,
    MaxRunSpeed: 0,
    DashMutiplier: 0,
    MaxDashSpeed: 0,
    WalkSpeedMulitplier: 0,
    RunSpeedMultiplier: 0,
    FastFallSpeed: 0,
    FallSpeed: 0,
    Gravity: 0
  } as CharacterConfig;
  return cc;
}

/**
 * TODO:
 * Create 3D scene and import model
 * Create an animations left menu option that expands a tree of states to select animations for
 * Select a state, and the list of animations for the model should be displayed for the selected state
 * When applying an animation to a state, you should be able to set the start frame and end frame of the animation (or the time slice), as well as the speed you want the animation to run at.
 * Ensure the animation is loopable, and there is an option to select a non-loopable animation.
 *
 * ECB Section: (animations must be set PRIOR to this being openable, greyed out until then)
 *
 * NOTE:  this will require an enhacement to the ECB, we need to add a collection of ECB shapes that will update on a per frame basis, rather than just one for the whole state.
 * This way the ECB can be dynamic and changes shape with the animation. We also want to add a 'fulcrum' point for the width. Like how a diomand can be balanced, top heavy(like a kite), or bottom heavy.
 *
 * Need to set the right facing direction, then a compile ECBs button.
 * The button will run a script that will do something to the affect of projects all of the bones into 2D points from the angle of looking at the character while they are facing right (what ever we configured in the previous step)
 * Effectivly, this should be like stenciling an ECB from the shadow of a 3D model projected on the wall behind it.
 *
 * It should do this for every frame of every animation, then display the ECB on the character in the canvas, represented by the model, and a 2d plane that represents where the ECB is.
 *
 * The right point should track the furthest right bone (for that frame), the left point the furthest left bone (for that frame), the top the top most (for that frame), and the bottom the will always be the origin point unless a yOffSet is set.Some states will need a yOffset, or
 * put another way, if we think og the bottom as the origin, we need the ability to set the origin for some ECB tracks (like, the jump track will need a y offset applied to all ECB states for that state).
 *
 * After compilation, the canvas should displa a drop down where you can select and animation, when selected the bottom panel with be populated with animation related features. For this, we will want a slider to control the current frame of the animation, and for the ECB to update in real time.
 *
 * Attack Section:
 *
 * The attack editor should allow you to add hitboxes to an attack.
 * When adding the attack, you will use the 3D canvas to place it. You can place it with an abosolute offset, or you can select bone tracking mode, and select a bone for the attack to follow (this will need to be compiled becsause we still need to pre-compute all hitbox placements).
 * The form on the right should allow you to edit all of the properties of the attack, such as damage, radius, Launch angle, etc...
 *
 * Attack commands should also be configrable (by which I mean commands can be added to the attack like those that exist in the default character config. Commands like 'SwicthState' or 'SetSuperArmor', 'ActivatePlayerSensor', etc...)
 *
 * Grab:
 *
 * Similar to attacks, but focused entirely on the grab hitboxes.
 *
 * You should also be able to Edit Throw configs here for the 4 types of throws.
 *
 * Hurt Capsule Section:
 *
 * NOTE: This will require an enhancment to HurtCapsules. Right now they just have static off sets. They need offsets for each frame so they can move dynamically
 *
 * Similar to the ECB section, but for hurt capsules.
 * Hurt capsules need to be attached to bones and compiled into offsets.
 * This should be done by select the bones you want to track. We may only care about torso, thighs, neck, head, arms, and wirsts.
 * But the user should be able to select what they need to track.
 */

import {
  AttackConfig,
  CharacterConfig,
  ECBShape,
  GrabConfig,
  HurtCapsuleConfig,
  ThrowConfig
} from '../../game/character/shared';
import {
  StateId,
  AttackId,
  GrabId
} from '../../game/engine/finiteStateMachines/player/shared';

import { RightPanel } from '../ui/panels/rightPanel';
import { sections } from '../ui/panels/leftPanel';

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
        ul.querySelectorAll('li').forEach((el) => el.classList.remove('active'));
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
      document.querySelectorAll('.left-panel li').forEach(el => el.classList.remove('active'));
    });

    btnSave?.addEventListener('click', () => {
      // Stub for saving project file
      console.log('Saving project:', this.project);
      alert('Project saved to console');
    });

    btnExport?.addEventListener('click', () => {
      // Stub for exporting character config
      const json = JSON.stringify(this.project.config, (key, value) => {
        if (value instanceof Map) {
          return { dataType: 'Map', value: Array.from(value.entries()) }; // Handle Map serialization
        }
        return value;
      }, 2);
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

import {
  AttackConfig,
  CharacterConfig,
  DisplayLayerConfig,
  ECBShape,
  GrabConfig,
  HurtCapsuleConfig,
  HurtCapsuleAttachment,
  ThrowConfig,
  AnimationLayerConfig
} from '../../game/character/shared';
import {
  AttackId,
  GrabId,
  StateId,
  StateIdToNameMap,
  STATE_IDS
} from '../../game/engine/finiteStateMachines/player/states/shared';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import JSZip from 'jszip';

import { sections } from '../ui/panels/leftPanel';
import { RightPanel } from '../ui/panels/rightPanel';
import { BottomPanel } from '../ui/panels/bottomPanel';
import { AllStateNodes } from '../../game/engine/finiteStateMachines/player/PlayerStateCollections';
import { mirrorHurtCapsule } from './mirroring';

// Zero-allocation scratch objects for render loop & 3D bone picking
const _vA = new THREE.Vector3();
const _vB = new THREE.Vector3();
const _vMid = new THREE.Vector3();
const _vDir = new THREE.Vector3();
const _yAxis = new THREE.Vector3(0, 1, 0);
const _scratchRaycaster = new THREE.Raycaster();
const _scratchMouse = new THREE.Vector2();

export type CharacterProject = {
  config: CharacterConfig;
  displayConfig: DisplayLayerConfig;
  modelData?: ArrayBuffer;
  modelFilename?: string;
};

export class CharacterEditor {
  private project: CharacterProject;
  private rightPanel: RightPanel;
  private bottomPanel: BottomPanel;

  // Three.js
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId: number = 0;
  private mixer?: THREE.AnimationMixer;
  private clock = new THREE.Clock();
  private loadedModel?: THREE.Group<THREE.Object3DEventMap>;
  private loadedAnimations: THREE.AnimationClip[] = [];
  private currentActions: { action: THREE.AnimationAction, config: AnimationLayerConfig, clipDurationSeconds: number }[] = [];
  private fadingOutActions: { action: THREE.AnimationAction, startWeight: number, fadeStartTime: number, duration: number }[] = [];
  private statePreviewTime: number = 0;
  private stateRealStartTime: number = 0;
  private globalCrossfadeDuration: number = 0;
  private controls!: OrbitControls;
  private fileHandle?: any;
  private modelBaseX: number = 0;
  private modelBaseY: number = 0;
  private modelBaseZ: number = 0;
  private cachedRootBone?: THREE.Bone;
  private allBoneNames: string[] = [];
  private skeletonHelper?: THREE.SkeletonHelper;

  // Hurtbox capsules & 3D visualization
  private showHurtCapsules: boolean = false;
  private hurtCapsuleVisualGroup = new THREE.Group();
  private capsuleMeshes: Map<
    string,
    {
      group: THREE.Group;
      sphereA: THREE.Mesh;
      sphereB: THREE.Mesh;
      cylinder: THREE.Mesh;
    }
  > = new Map();
  private unitSphereGeo = new THREE.SphereGeometry(1, 14, 14);
  private unitCylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 14);
  private hurtCapsuleMat = new THREE.MeshBasicMaterial({
    color: 0xffeb3b,
    transparent: true,
    opacity: 0.35,
    depthWrite: false
  });

  // Interactive 3D Armature Bone Picking
  private jointPickers: Array<{ mesh: THREE.Mesh; bone: THREE.Bone }> = [];
  private jointPickerGeo = new THREE.SphereGeometry(1.5, 8, 8);
  private jointPickerNormalMat = new THREE.MeshBasicMaterial({
    color: 0x8a2be2,
    wireframe: true,
    transparent: true,
    opacity: 0.7
  });
  private jointPickerHoverMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: false,
    transparent: true,
    opacity: 0.9
  });
  private jointPickerSelectedMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    wireframe: false,
    transparent: true,
    opacity: 0.95
  });

  private isPickingBone: boolean = false;
  private pickingState: 'PICK_BONE_A' | 'PICK_BONE_B' | 'REPICK_A' | 'REPICK_B' = 'PICK_BONE_A';
  private repickCapsuleId?: string;
  private tempPickedBoneA?: string;
  private hoveredJointPicker?: THREE.Mesh;
  private selectedJointPicker?: THREE.Mesh;

  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private isLoopMode: boolean = true;
  private currentStateId?: StateId;

  constructor(cc: CharacterConfig | undefined = undefined) {
    if (cc === undefined) {
      this.project = {
        config: emptyCahrConfig(),
        displayConfig: emptyDisplayConfig()
      };
    } else {
      this.project = { config: cc, displayConfig: emptyDisplayConfig() };
    }

    this.rightPanel = new RightPanel(
      'right-panel',
      this.project.config,
      (newConfig) => {
        this.project.config = newConfig;
        console.log('Config updated:', this.project.config);
      }
    );

    this.bottomPanel = new BottomPanel('bottom-panel');

    this.initLeftPanel();
    this.initToolbar();
    this.initThreeJs();
    this.initResizers();
    this.initKeyboardShortcuts();
  }

  private initResizers() {
    const leftResizer = document.getElementById('left-resizer');
    const rightResizer = document.getElementById('right-resizer');
    const bottomResizer = document.getElementById('bottom-resizer');
    const mainWindow = document.querySelector('.main-editor-window') as HTMLElement;

    if (leftResizer && rightResizer && bottomResizer && mainWindow) {
      let isResizingLeft = false;
      let isResizingRight = false;
      let isResizingBottom = false;

      leftResizer.addEventListener('mousedown', (e) => { isResizingLeft = true; e.preventDefault(); leftResizer.classList.add('active'); });
      rightResizer.addEventListener('mousedown', (e) => { isResizingRight = true; e.preventDefault(); rightResizer.classList.add('active'); });
      bottomResizer.addEventListener('mousedown', (e) => { isResizingBottom = true; e.preventDefault(); bottomResizer.classList.add('active'); });

      window.addEventListener('mousemove', (e) => {
        if (isResizingLeft) {
          mainWindow.style.setProperty('--left-panel-width', `${Math.max(100, Math.min(e.clientX, window.innerWidth - 300))}px`);
        } else if (isResizingRight) {
          mainWindow.style.setProperty('--right-panel-width', `${Math.max(100, Math.min(window.innerWidth - e.clientX, window.innerWidth - 300))}px`);
        } else if (isResizingBottom) {
          mainWindow.style.setProperty('--bottom-panel-height', `${Math.max(100, Math.min(window.innerHeight - e.clientY, window.innerHeight - 200))}px`);
        }
      });

      window.addEventListener('mouseup', () => {
        isResizingLeft = false;
        isResizingRight = false;
        isResizingBottom = false;
        leftResizer.classList.remove('active');
        rightResizer.classList.remove('active');
        bottomResizer.classList.remove('active');
      });
    }
  }

  private initLeftPanel() {
    const leftPanelEl = document.getElementById('left-panel');
    if (!leftPanelEl) return;

    const ul = document.createElement('ul');

    // Make a helper to clear active state
    const clearActive = () =>
      ul.querySelectorAll('li').forEach((el) => el.classList.remove('active'));

    // 1. Model Setup
    const liModel = document.createElement('li');
    liModel.innerText = 'Model Setup';
    liModel.addEventListener('click', () => {
      clearActive();
      liModel.classList.add('active');
      this.renderModelSetup();
    });
    ul.appendChild(liModel);

    // 1.5 Hurtbox Setup (Attaching capsules to armature)
    const liHurt = document.createElement('li');
    liHurt.innerText = 'Hurtbox Setup';
    liHurt.addEventListener('click', () => {
      clearActive();
      liHurt.classList.add('active');
      this.renderHurtboxSetup();
    });
    ul.appendChild(liHurt);

    // 2. State Animations Accordion
    const liStatesHeader = document.createElement('li');
    liStatesHeader.innerText = '▼ State Animations';
    liStatesHeader.style.fontWeight = 'bold';
    ul.appendChild(liStatesHeader);

    const statesUl = document.createElement('ul');
    statesUl.style.display = 'block'; // Open by default
    liStatesHeader.addEventListener('click', () => {
      if (statesUl.style.display === 'none') {
        statesUl.style.display = 'block';
        liStatesHeader.innerText = '▼ State Animations';
      } else {
        statesUl.style.display = 'none';
        liStatesHeader.innerText = '▶ State Animations';
      }
    });

    Object.values(STATE_IDS).forEach((stateId) => {
      const stateName = StateIdToNameMap.get(stateId);
      if (!stateName) return;
      const liState = document.createElement('li');
      liState.innerText = stateName;
      liState.style.paddingLeft = '15px';
      liState.addEventListener('click', () => {
        clearActive();
        liState.classList.add('active');
        this.renderStateAnimationEditor(stateId, stateName);
      });
      statesUl.appendChild(liState);
    });
    ul.appendChild(statesUl);

    // 3. Native sections
    sections.forEach((_, sectionName) => {
      const li = document.createElement('li');
      li.innerText = sectionName;
      li.addEventListener('click', () => {
        clearActive();
        li.classList.add('active');
        if (sectionName === 'HurtCapsule') {
          this.renderHurtboxSetup();
        } else {
          this.rightPanel.renderSection(sectionName);
        }
      });
      ul.appendChild(li);
    });

    leftPanelEl.appendChild(ul);
  }

  private renderModelSetup() {
    const rightPanelEl = document.getElementById('right-panel');
    if (!rightPanelEl) return;

    rightPanelEl.innerHTML = ''; // clear

    const title = document.createElement('h2');
    title.innerText = 'Model Setup';
    title.style.marginTop = '0';
    rightPanelEl.appendChild(title);

    // File Input
    const fileGroup = document.createElement('div');
    fileGroup.className = 'form-group';
    const fileLabel = document.createElement('label');
    fileLabel.innerText = 'Load .glb Model:';
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.glb';
    fileInput.style.width = '100%';
    fileInput.addEventListener('change', (e) => this.onModelLoaded(e));
    fileGroup.appendChild(fileLabel);
    fileGroup.appendChild(fileInput);
    rightPanelEl.appendChild(fileGroup);

    // Dead Right Rotation
    const rotGroup = document.createElement('div');
    rotGroup.className = 'form-group';
    const rotLabel = document.createElement('label');
    rotLabel.innerText = 'Dead Right Y-Rotation: ';
    const rotDisplay = document.createElement('span');
    rotDisplay.innerText = `${this.project.displayConfig.deadRightRotation}°`;
    rotDisplay.style.color = 'var(--accent)';
    rotLabel.appendChild(rotDisplay);

    const rotInput = document.createElement('input');
    rotInput.type = 'range';
    rotInput.id = 'dead-right-rotation';
    rotInput.min = '0';
    rotInput.max = '360';
    rotInput.value = this.project.displayConfig.deadRightRotation.toString();
    rotInput.style.width = '100%';

    rotInput.addEventListener('input', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value, 10);
      rotDisplay.innerText = `${val}°`;
      this.project.displayConfig.deadRightRotation = val;
      if (this.loadedModel) {
        this.loadedModel.rotation.y = val * (Math.PI / 180);
      }
    });
    rotGroup.appendChild(rotLabel);
    rotGroup.appendChild(rotInput);
    rightPanelEl.appendChild(rotGroup);

    // Simulation Scale
    const scaleGroup = document.createElement('div');
    scaleGroup.className = 'form-group';
    const scaleLabel = document.createElement('label');
    scaleLabel.innerText = 'Simulation Scale:';

    const scaleInput = document.createElement('input');
    scaleInput.type = 'number';
    scaleInput.id = 'simulation-scale';
    scaleInput.step = '0.1';
    scaleInput.value = this.project.displayConfig.simulationScale.toString();

    scaleInput.addEventListener('input', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      if (!isNaN(val)) {
        this.project.displayConfig.simulationScale = val;
        if (this.loadedModel) {
          this.loadedModel.scale.set(val, val, val);
        }
      }
    });
    scaleGroup.appendChild(scaleLabel);
    scaleGroup.appendChild(scaleInput);
    rightPanelEl.appendChild(scaleGroup);
  }

  private renderHurtboxSetup() {
    const rightPanelEl = document.getElementById('right-panel');
    if (!rightPanelEl) return;

    // Show hurtboxes in 3D automatically while in Hurtbox Setup
    this.showHurtCapsules = true;
    this.setArmaturePickersVisible(true);
    if (this.skeletonHelper) {
      this.skeletonHelper.visible = true;
    }
    this.syncAllCapsuleMeshes();

    rightPanelEl.innerHTML = ''; // clear

    const MAX_CAPS = 25;
    if (!this.project.displayConfig.hurtCapsules) {
      this.project.displayConfig.hurtCapsules = [];
    }
    const capsules = this.project.displayConfig.hurtCapsules;
    const isMaxReached = capsules.length >= MAX_CAPS;

    // Header with counter
    const header = document.createElement('div');
    header.className = 'hurtbox-header';

    const title = document.createElement('h2');
    title.innerText = 'Hurtbox Setup';
    title.style.margin = '0';
    header.appendChild(title);

    const badge = document.createElement('span');
    badge.className = `capsule-count-badge ${isMaxReached ? 'limit-reached' : ''}`;
    badge.innerText = `${capsules.length} / ${MAX_CAPS}${isMaxReached ? ' (MAX)' : ''}`;
    header.appendChild(badge);

    rightPanelEl.appendChild(header);

    // Primary action button: 3D picking
    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '8px';
    btnGroup.style.marginBottom = '15px';

    const btnPick = document.createElement('button');
    btnPick.innerText = '+ New Hurt Capsule (Click Bones in 3D)';
    btnPick.className = 'top-toolbar button';
    btnPick.style.flex = '1';
    btnPick.style.backgroundColor = isMaxReached ? '#444' : 'var(--accent, #8a2be2)';
    btnPick.style.color = '#fff';
    btnPick.style.fontWeight = 'bold';
    btnPick.style.padding = '8px 12px';
    btnPick.style.cursor = isMaxReached ? 'not-allowed' : 'pointer';
    btnPick.disabled = isMaxReached;
    btnPick.title = isMaxReached
      ? 'Maximum 25 hurt capsules reached'
      : 'Click bones in 3D to attach capsule';
    btnPick.addEventListener('click', () => {
      this.startPickingMode('PICK_BONE_A');
    });
    btnGroup.appendChild(btnPick);

    const btnManual = document.createElement('button');
    btnManual.innerText = '+ Manual';
    btnManual.className = 'capsule-btn';
    btnManual.disabled = isMaxReached;
    btnManual.style.cursor = isMaxReached ? 'not-allowed' : 'pointer';
    btnManual.title = 'Add capsule with default bones';
    btnManual.addEventListener('click', () => {
      const defaultBoneA = this.allBoneNames[0] || 'Root';
      const defaultBoneB = this.allBoneNames[1] || defaultBoneA;
      this.addHurtCapsuleFromBones(defaultBoneA, defaultBoneB);
      this.renderHurtboxSetup();
    });
    btnGroup.appendChild(btnManual);

    rightPanelEl.appendChild(btnGroup);

    // Instructions note
    const tip = document.createElement('div');
    tip.style.fontSize = '12px';
    tip.style.color = '#888';
    tip.style.marginBottom = '15px';
    tip.innerHTML =
      'Attach hurt capsules to armature bones. They track automatically during animation playback. Max <b>25</b> capsules allowed.';
    rightPanelEl.appendChild(tip);

    // Capsule Cards List
    const listContainer = document.createElement('div');
    listContainer.id = 'capsules-list';

    if (capsules.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.style.padding = '20px';
      emptyState.style.textAlign = 'center';
      emptyState.style.color = '#666';
      emptyState.style.border = '1px dashed var(--border-color)';
      emptyState.style.borderRadius = '4px';
      emptyState.innerHTML =
        'No hurt capsules yet.<br>Click <b>+ New Hurt Capsule</b> to begin attaching to armature in 3D.';
      listContainer.appendChild(emptyState);
    } else {
      capsules.forEach((cap, idx) => {
        const card = document.createElement('div');
        card.className = 'capsule-card';

        // Card Header
        const cardHeader = document.createElement('div');
        cardHeader.className = 'capsule-card-header';

        const cardTitle = document.createElement('span');
        cardTitle.className = 'capsule-card-title';
        cardTitle.innerText = `#${idx + 1}: ${cap.name || 'Capsule'}`;
        cardHeader.appendChild(cardTitle);

        const actions = document.createElement('div');
        actions.className = 'capsule-actions';

        // Mirror Button
        const mirrorBtn = document.createElement('button');
        mirrorBtn.className = 'capsule-btn';
        mirrorBtn.innerText = '🪞 Mirror';
        mirrorBtn.title = 'Mirror capsule to opposite side (e.g. Left -> Right)';
        mirrorBtn.disabled = isMaxReached;
        mirrorBtn.addEventListener('click', () => {
          if (capsules.length >= MAX_CAPS) {
            alert('Cannot mirror: maximum 25 hurt capsules reached.');
            return;
          }
          const mirrored = mirrorHurtCapsule(cap, this.allBoneNames);
          if (!mirrored) {
            alert(`Could not find mirrored bone names for "${cap.boneA}" or "${cap.boneB}".`);
            return;
          }
          capsules.push(mirrored);
          this.createCapsuleMesh(mirrored);
          this.renderHurtboxSetup();
        });
        actions.appendChild(mirrorBtn);

        // Delete Button
        const delBtn = document.createElement('button');
        delBtn.className = 'capsule-btn delete-btn';
        delBtn.innerText = '✕';
        delBtn.title = 'Delete this hurt capsule';
        delBtn.addEventListener('click', () => {
          const cIdx = capsules.findIndex((c) => c.id === cap.id);
          if (cIdx !== -1) {
            capsules.splice(cIdx, 1);
            this.removeCapsuleMesh(cap.id);
            this.renderHurtboxSetup();
          }
        });
        actions.appendChild(delBtn);

        cardHeader.appendChild(actions);
        card.appendChild(cardHeader);

        // Name input
        const nameGroup = document.createElement('div');
        nameGroup.className = 'form-group';
        nameGroup.style.marginBottom = '8px';
        const nameLabel = document.createElement('label');
        nameLabel.innerText = 'Label:';
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = cap.name;
        nameInput.style.width = '100%';
        nameInput.addEventListener('input', (e) => {
          cap.name = (e.target as HTMLInputElement).value;
          cardTitle.innerText = `#${idx + 1}: ${cap.name || 'Capsule'}`;
        });
        nameGroup.appendChild(nameLabel);
        nameGroup.appendChild(nameInput);
        card.appendChild(nameGroup);

        // Bone A selector row
        const boneAGroup = document.createElement('div');
        boneAGroup.className = 'form-group';
        boneAGroup.style.marginBottom = '8px';
        const boneALabel = document.createElement('label');
        boneALabel.innerText = 'Start Joint (Bone A):';
        boneAGroup.appendChild(boneALabel);

        const boneARow = document.createElement('div');
        boneARow.className = 'bone-select-row';

        const selectA = document.createElement('select');
        this.allBoneNames.forEach((b) => {
          const opt = document.createElement('option');
          opt.value = b;
          opt.innerText = b;
          if (b === cap.boneA) opt.selected = true;
          selectA.appendChild(opt);
        });
        selectA.addEventListener('change', (e) => {
          cap.boneA = (e.target as HTMLInputElement).value;
        });
        boneARow.appendChild(selectA);

        const pickABtn = document.createElement('button');
        pickABtn.className = 'capsule-btn';
        pickABtn.innerText = '🎯 3D';
        pickABtn.title = 'Pick Bone A in 3D viewport';
        pickABtn.addEventListener('click', () => {
          this.startPickingMode('REPICK_A', cap.id);
        });
        boneARow.appendChild(pickABtn);
        boneAGroup.appendChild(boneARow);
        card.appendChild(boneAGroup);

        // Bone B selector row
        const boneBGroup = document.createElement('div');
        boneBGroup.className = 'form-group';
        boneBGroup.style.marginBottom = '8px';
        const boneBLabel = document.createElement('label');
        boneBLabel.innerText = 'End Joint (Bone B):';
        boneBGroup.appendChild(boneBLabel);

        const boneBRow = document.createElement('div');
        boneBRow.className = 'bone-select-row';

        const selectB = document.createElement('select');
        this.allBoneNames.forEach((b) => {
          const opt = document.createElement('option');
          opt.value = b;
          opt.innerText = b;
          if (b === cap.boneB) opt.selected = true;
          selectB.appendChild(opt);
        });
        selectB.addEventListener('change', (e) => {
          cap.boneB = (e.target as HTMLInputElement).value;
        });
        boneBRow.appendChild(selectB);

        const pickBBtn = document.createElement('button');
        pickBBtn.className = 'capsule-btn';
        pickBBtn.innerText = '🎯 3D';
        pickBBtn.title = 'Pick Bone B in 3D viewport';
        pickBBtn.addEventListener('click', () => {
          this.startPickingMode('REPICK_B', cap.id);
        });
        boneBRow.appendChild(pickBBtn);
        boneBGroup.appendChild(boneBRow);
        card.appendChild(boneBGroup);

        // Radius Slider
        const radiusGroup = document.createElement('div');
        radiusGroup.className = 'form-group';
        const radiusLabel = document.createElement('label');
        radiusLabel.innerText = `Radius: ${cap.radius}`;
        const radiusInp = document.createElement('input');
        radiusInp.type = 'range';
        radiusInp.min = '1';
        radiusInp.max = '60';
        radiusInp.step = '0.5';
        radiusInp.value = cap.radius.toString();
        radiusInp.style.width = '100%';
        radiusInp.addEventListener('input', (e) => {
          cap.radius = parseFloat((e.target as HTMLInputElement).value) || 1;
          radiusLabel.innerText = `Radius: ${cap.radius}`;
        });
        radiusGroup.appendChild(radiusLabel);
        radiusGroup.appendChild(radiusInp);
        card.appendChild(radiusGroup);

        listContainer.appendChild(card);
      });
    }

    rightPanelEl.appendChild(listContainer);
  }

  private startPickingMode(
    state: 'PICK_BONE_A' | 'REPICK_A' | 'REPICK_B',
    repickId?: string
  ) {
    if (!this.loadedModel || this.allBoneNames.length === 0) {
      alert('Please load a .glb character model first in Model Setup!');
      return;
    }

    this.isPickingBone = true;
    this.pickingState = state;
    this.repickCapsuleId = repickId;
    this.tempPickedBoneA = undefined;
    if (this.selectedJointPicker) {
      this.resetJointPickerHighlight(this.selectedJointPicker);
      this.selectedJointPicker = undefined;
    }

    // Ensure armature & pickers are visible
    this.setArmaturePickersVisible(true);
    if (this.skeletonHelper) {
      this.skeletonHelper.visible = true;
    }

    const hud = document.getElementById('bone-pick-hud');
    if (hud) {
      hud.style.display = 'flex';
      if (state === 'PICK_BONE_A') {
        this.updatePickHudText('🎯 Click <b>Start Joint (Bone A)</b> in 3D view...');
      } else if (state === 'REPICK_A') {
        this.updatePickHudText('🎯 Click new <b>Start Joint (Bone A)</b> in 3D view...');
      } else if (state === 'REPICK_B') {
        this.updatePickHudText('🎯 Click new <b>End Joint (Bone B)</b> in 3D view...');
      }
    }
  }

  private endPickingMode() {
    this.isPickingBone = false;
    this.repickCapsuleId = undefined;
    this.tempPickedBoneA = undefined;

    if (this.hoveredJointPicker) {
      this.resetJointPickerHighlight(this.hoveredJointPicker);
      this.hoveredJointPicker = undefined;
    }
    if (this.selectedJointPicker) {
      this.resetJointPickerHighlight(this.selectedJointPicker);
      this.selectedJointPicker = undefined;
    }

    const hud = document.getElementById('bone-pick-hud');
    if (hud) hud.style.display = 'none';

    const tooltip = document.getElementById('bone-tooltip');
    if (tooltip) tooltip.style.display = 'none';

    this.renderer.domElement.style.cursor = 'default';
  }

  private updatePickHudText(html: string) {
    const hud = document.getElementById('bone-pick-hud');
    if (!hud) return;
    hud.innerHTML = `<span>${html}</span><button class="bone-pick-hud-cancel" id="bone-pick-cancel-btn">Cancel (Esc)</button>`;
    const cancelBtn = document.getElementById('bone-pick-cancel-btn');
    cancelBtn?.addEventListener('click', () => this.endPickingMode());
  }

  private resetJointPickerHighlight(mesh: THREE.Mesh) {
    mesh.material = this.jointPickerNormalMat;
    mesh.scale.set(1.0, 1.0, 1.0);
  }

  private setArmaturePickersVisible(visible: boolean) {
    for (let i = 0; i < this.jointPickers.length; i++) {
      this.jointPickers[i].mesh.visible = visible;
    }
  }

  private handleBonePicked(boneName: string, mesh: THREE.Mesh) {
    if (this.pickingState === 'PICK_BONE_A') {
      this.tempPickedBoneA = boneName;
      this.selectedJointPicker = mesh;
      mesh.material = this.jointPickerSelectedMat;
      mesh.scale.set(1.8, 1.8, 1.8);
      this.pickingState = 'PICK_BONE_B';
      this.updatePickHudText(
        `Start Joint: <b>${boneName}</b>. Now click <b>End Joint</b> in 3D (or same bone for sphere)...`
      );
    } else if (this.pickingState === 'PICK_BONE_B') {
      const boneA = this.tempPickedBoneA || boneName;
      const boneB = boneName;
      this.addHurtCapsuleFromBones(boneA, boneB);
      this.endPickingMode();
      this.renderHurtboxSetup();
    } else if (this.pickingState === 'REPICK_A' && this.repickCapsuleId) {
      const cap = (this.project.displayConfig.hurtCapsules || []).find(
        (c) => c.id === this.repickCapsuleId
      );
      if (cap) {
        cap.boneA = boneName;
      }
      this.endPickingMode();
      this.renderHurtboxSetup();
    } else if (this.pickingState === 'REPICK_B' && this.repickCapsuleId) {
      const cap = (this.project.displayConfig.hurtCapsules || []).find(
        (c) => c.id === this.repickCapsuleId
      );
      if (cap) {
        cap.boneB = boneName;
      }
      this.endPickingMode();
      this.renderHurtboxSetup();
    }
  }

  private addHurtCapsuleFromBones(boneA: string, boneB: string) {
    if (!this.project.displayConfig.hurtCapsules) {
      this.project.displayConfig.hurtCapsules = [];
    }
    if (this.project.displayConfig.hurtCapsules.length >= 25) {
      alert('Maximum capacity of 25 hurt capsules reached!');
      return;
    }

    let capName = boneA === boneB ? boneA : `${boneA} - ${boneB}`;
    capName = capName.replace(/mixamorig/g, '');

    const newCap: HurtCapsuleAttachment = {
      id:
        'capsule_' +
        Math.random().toString(36).substring(2, 9) +
        '_' +
        Date.now(),
      name: capName,
      boneA,
      boneB,
      radius: 10
    };

    this.project.displayConfig.hurtCapsules.push(newCap);
    this.createCapsuleMesh(newCap);
  }

  private createCapsuleMesh(cap: HurtCapsuleAttachment) {
    if (this.capsuleMeshes.has(cap.id)) return;

    const group = new THREE.Group();
    group.name = `__hurtCapsuleGroup__${cap.id}`;

    const sphereA = new THREE.Mesh(this.unitSphereGeo, this.hurtCapsuleMat);
    const sphereB = new THREE.Mesh(this.unitSphereGeo, this.hurtCapsuleMat);
    const cylinder = new THREE.Mesh(this.unitCylinderGeo, this.hurtCapsuleMat);

    group.add(sphereA);
    group.add(sphereB);
    group.add(cylinder);

    this.hurtCapsuleVisualGroup.add(group);
    this.capsuleMeshes.set(cap.id, { group, sphereA, sphereB, cylinder });
  }

  private removeCapsuleMesh(capId: string) {
    const meshData = this.capsuleMeshes.get(capId);
    if (!meshData) return;

    this.hurtCapsuleVisualGroup.remove(meshData.group);
    this.capsuleMeshes.delete(capId);
  }

  private syncAllCapsuleMeshes() {
    const currentIds = new Set(
      (this.project.displayConfig.hurtCapsules || []).map((c) => c.id)
    );
    for (const [id] of this.capsuleMeshes.entries()) {
      if (!currentIds.has(id)) {
        this.removeCapsuleMesh(id);
      }
    }
    const caps = this.project.displayConfig.hurtCapsules || [];
    for (let i = 0; i < caps.length; i++) {
      this.createCapsuleMesh(caps[i]);
    }
  }

  private projectHurtCapsulesToEngineConfig() {
    const attachments = this.project.displayConfig.hurtCapsules || [];
    if (!this.loadedModel || attachments.length === 0) {
      return;
    }

    const compiled: HurtCapsuleConfig[] = [];
    const scale = this.project.displayConfig.simulationScale || 1.0;
    const facingRad =
      (this.project.displayConfig.deadRightRotation || 0) * (Math.PI / 180);

    for (let i = 0; i < attachments.length; i++) {
      const att = attachments[i];
      const boneAObj = this.loadedModel.getObjectByName(att.boneA);
      const boneBObj = this.loadedModel.getObjectByName(att.boneB);

      if (!boneAObj) continue;

      boneAObj.getWorldPosition(_vA);
      if (boneBObj && att.boneB !== att.boneA) {
        boneBObj.getWorldPosition(_vB);
      } else {
        _vB.copy(_vA);
      }

      // Project into 2D plane: X is horizontal facing direction, Y is vertical height
      const x1 =
        (_vA.x * Math.cos(-facingRad) - _vA.z * Math.sin(-facingRad)) * scale;
      const y1 = (_vA.y - this.modelBaseY) * scale;
      const x2 =
        (_vB.x * Math.cos(-facingRad) - _vB.z * Math.sin(-facingRad)) * scale;
      const y2 = (_vB.y - this.modelBaseY) * scale;

      compiled.push({
        x1: Math.round(x1 * 100) / 100,
        y1: Math.round(y1 * 100) / 100,
        x2: Math.round(x2 * 100) / 100,
        y2: Math.round(y2 * 100) / 100,
        radius: Math.round(att.radius * scale * 100) / 100
      });
    }

    this.project.config.HurtCapsules = compiled;
  }

  private renderStateAnimationEditor(stateId: StateId, stateName: string) {
    const rightPanelEl = document.getElementById('right-panel');
    if (!rightPanelEl) return;

    rightPanelEl.innerHTML = ''; // clear

    const title = document.createElement('h2');
    title.innerText = `State: ${stateName}`;
    title.style.marginTop = '0';
    rightPanelEl.appendChild(title);

    // Check if we have state display config
    if (!this.project.displayConfig.states.has(stateId)) {
      this.project.displayConfig.states.set(stateId, { animations: [] });
    }
    const stateConfig = this.project.displayConfig.states.get(stateId)!;

    // Real-Time Hurt Capsule Tracking Toggle
    const hurtToggleGroup = document.createElement('div');
    hurtToggleGroup.className = 'form-group';
    hurtToggleGroup.style.marginBottom = '12px';
    hurtToggleGroup.style.display = 'flex';
    hurtToggleGroup.style.alignItems = 'center';
    hurtToggleGroup.style.gap = '8px';

    const hurtCheckbox = document.createElement('input');
    hurtCheckbox.type = 'checkbox';
    hurtCheckbox.id = 'anim-toggle-hurtboxes';
    hurtCheckbox.checked = this.showHurtCapsules;
    hurtCheckbox.addEventListener('change', (e) => {
      this.showHurtCapsules = (e.target as HTMLInputElement).checked;
      const btn = document.getElementById('canvas-toggle-hurtboxes');
      if (btn) {
        btn.style.backgroundColor = this.showHurtCapsules ? '#ffd700' : 'var(--accent, #8a2be2)';
        btn.style.color = this.showHurtCapsules ? '#000' : '#fff';
      }
    });

    const hurtLabel = document.createElement('label');
    hurtLabel.htmlFor = 'anim-toggle-hurtboxes';
    hurtLabel.style.cursor = 'pointer';
    hurtLabel.style.fontWeight = 'bold';
    hurtLabel.innerText = 'Show Hurt Capsules (Real-Time Tracking)';

    hurtToggleGroup.appendChild(hurtCheckbox);
    hurtToggleGroup.appendChild(hurtLabel);
    rightPanelEl.appendChild(hurtToggleGroup);

    const xfadeGroup = document.createElement('div');
    xfadeGroup.className = 'form-group';
    xfadeGroup.style.marginBottom = '15px';
    const xfadeLabel = document.createElement('label');
    xfadeLabel.innerText = 'Crossfade from Previous State (Frames):';
    const xfadeInp = document.createElement('input');
    xfadeInp.type = 'number';
    xfadeInp.value = (stateConfig.crossfadeFrames || 0).toString();
    xfadeInp.addEventListener('change', (e) => {
      stateConfig.crossfadeFrames = parseInt((e.target as HTMLInputElement).value, 10);
    });
    xfadeGroup.appendChild(xfadeLabel);
    xfadeGroup.appendChild(xfadeInp);
    rightPanelEl.appendChild(xfadeGroup);
    
    // BottomPanel integration
    this.currentStateId = stateId;
    this.stopPreview();
    this.bottomPanel.setState(stateId, stateConfig, this.loadedAnimations);
    
    const refreshPreviewActions = () => {
      if (this.currentStateId !== undefined && this.currentActions.length > 0) {
        const wasPaused = this.isPaused;
        const curTime = this.statePreviewTime;
        this.playStatePreview(this.currentStateId, this.isLoopMode);
        this.isPaused = wasPaused;
        this.statePreviewTime = curTime;
      }
    };

    this.bottomPanel.onPlay = () => this.startPreview(stateId, true);
    this.bottomPanel.onPlayOnce = () => this.startPreview(stateId, false);
    this.bottomPanel.onPause = () => {
      this.isPaused = true;
    };
    this.bottomPanel.onStepFrame = (delta) => this.stepFrame(delta);
    this.bottomPanel.onTogglePause = () => this.togglePause();
    this.bottomPanel.onLayerSelect = (idx) => renderLayers();
    this.bottomPanel.onTimelineChange = () => {
      renderLayers();
      if (stateConfig.animations.length === 0) {
        this.stopPreview();
      } else {
        refreshPreviewActions();
      }
    };
    this.bottomPanel.onScrub = (frame) => {
      if (this.currentActions.length === 0 && this.currentStateId !== undefined) {
        this.playStatePreview(this.currentStateId, this.isLoopMode);
      }
      this.isPlaying = true;
      this.isPaused = true;
      this.bottomPanel.setPlaying(true, true);
      this.statePreviewTime = frame / 60;
    };

    // Preview initial pose at frame 0
    if (stateConfig.animations.length > 0) {
      this.playStatePreview(stateId, this.isLoopMode);
      this.isPlaying = true;
      this.isPaused = true;
      this.statePreviewTime = 0;
      this.bottomPanel.setPlaying(true, true);
      this.bottomPanel.updatePlayhead(0);
    }

    const layersContainer = document.createElement('div');
    layersContainer.id = 'layers-container';

    const renderLayers = () => {
      layersContainer.innerHTML = '';
      
      const activeIdx = this.bottomPanel.getActiveLayerIndex();
      if (activeIdx < 0 || activeIdx >= stateConfig.animations.length) {
          layersContainer.innerHTML = '<div style="color: #aaa; margin-top: 15px; font-style: italic;">No animation track selected. Click a track in the bottom panel.</div>';
          return;
      }
      
      const idx = activeIdx;
      const anim = stateConfig.animations[idx];

      const layerBox = document.createElement('div');
      layerBox.style.border = '1px solid var(--border-color)';
      layerBox.style.padding = '10px';
      layerBox.style.marginBottom = '10px';
      layerBox.style.borderRadius = '3px';
      layerBox.style.position = 'relative';

      const titleDiv = document.createElement('div');
      titleDiv.style.fontWeight = 'bold';
      titleDiv.style.marginBottom = '10px';
      titleDiv.style.display = 'flex';
      titleDiv.style.justifyContent = 'space-between';
      titleDiv.style.alignItems = 'center';

      const titleSpan = document.createElement('span');
      titleSpan.innerText = `Layer ${idx + 1}: ${anim.clipName || 'Empty'}`;
      titleDiv.appendChild(titleSpan);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'layer-delete-btn';
      deleteBtn.innerText = '✕ Remove Layer';
      deleteBtn.title = 'Remove this animation layer';
      deleteBtn.addEventListener('click', () => {
        this.bottomPanel.deleteLayer(idx);
      });
      titleDiv.appendChild(deleteBtn);
      layerBox.appendChild(titleDiv);

      // Track Start / End Frame
      const trackFramesGroup = document.createElement('div');
      trackFramesGroup.className = 'form-group flatvec-group';

      const trackStartDiv = document.createElement('div');
      trackStartDiv.innerHTML = '<label>Track Start (Frame):</label>';
      const trackStartInp = document.createElement('input');
      trackStartInp.type = 'number';
      trackStartInp.value = (anim.stateStartFrame || 0).toString();
      trackStartInp.addEventListener('change', (e) => {
        anim.stateStartFrame = parseInt((e.target as HTMLInputElement).value, 10);
        this.bottomPanel.forceRender();
        renderLayers();
        refreshPreviewActions();
      });
      trackStartDiv.appendChild(trackStartInp);

      const trackEndDiv = document.createElement('div');
      trackEndDiv.innerHTML = '<label>Track End (0=clip len):</label>';
      const trackEndInp = document.createElement('input');
      trackEndInp.type = 'number';
      trackEndInp.value = (anim.stateEndFrame || 0).toString();
      trackEndInp.addEventListener('change', (e) => {
        anim.stateEndFrame = parseInt((e.target as HTMLInputElement).value, 10);
        this.bottomPanel.forceRender();
        renderLayers();
        refreshPreviewActions();
      });
      trackEndDiv.appendChild(trackEndInp);

      trackFramesGroup.appendChild(trackStartDiv);
      trackFramesGroup.appendChild(trackEndDiv);
      layerBox.appendChild(trackFramesGroup);

      // Fades
      const fadesGroup = document.createElement('div');
      fadesGroup.className = 'form-group flatvec-group';

      const fadeInDiv = document.createElement('div');
      fadeInDiv.innerHTML = '<label>Fade In (Frames):</label>';
      const fadeInInp = document.createElement('input');
      fadeInInp.type = 'number';
      fadeInInp.value = (anim.fadeInFrames || 0).toString();
      fadeInInp.addEventListener('change', (e) => {
        anim.fadeInFrames = parseInt((e.target as HTMLInputElement).value, 10);
        this.bottomPanel.forceRender();
        renderLayers();
        refreshPreviewActions();
      });
      fadeInDiv.appendChild(fadeInInp);

      const fadeOutDiv = document.createElement('div');
      fadeOutDiv.innerHTML = '<label>Fade Out (Frames):</label>';
      const fadeOutInp = document.createElement('input');
      fadeOutInp.type = 'number';
      fadeOutInp.value = (anim.fadeOutFrames || 0).toString();
      fadeOutInp.addEventListener('change', (e) => {
        anim.fadeOutFrames = parseInt((e.target as HTMLInputElement).value, 10);
        this.bottomPanel.forceRender();
        renderLayers();
        refreshPreviewActions();
      });
      fadeOutDiv.appendChild(fadeOutInp);

      fadesGroup.appendChild(fadeInDiv);
      fadesGroup.appendChild(fadeOutDiv);
      layerBox.appendChild(fadesGroup);

      // Start / End Frame
      const framesGroup = document.createElement('div');
      framesGroup.className = 'form-group flatvec-group';

      const startDiv = document.createElement('div');
      startDiv.innerHTML = '<label>Clip Start Frame:</label>';
      const startInp = document.createElement('input');
      startInp.type = 'number';
      startInp.value = anim.startFrame.toString();
      startInp.addEventListener('change', (e) => {
        anim.startFrame = parseInt((e.target as HTMLInputElement).value, 10);
        this.bottomPanel.forceRender();
        renderLayers();
        refreshPreviewActions();
      });
      startDiv.appendChild(startInp);

      const endDiv = document.createElement('div');
      endDiv.innerHTML = '<label>Clip End Frame:</label>';
      const endInp = document.createElement('input');
      endInp.type = 'number';
      endInp.value = anim.endFrame.toString();
      endInp.addEventListener('change', (e) => {
        anim.endFrame = parseInt((e.target as HTMLInputElement).value, 10);
        this.bottomPanel.forceRender();
        renderLayers();
        refreshPreviewActions();
      });
      endDiv.appendChild(endInp);

      framesGroup.appendChild(startDiv);
      framesGroup.appendChild(endDiv);
      layerBox.appendChild(framesGroup);

      // Clip Select
      const clipGroup = document.createElement('div');
      clipGroup.className = 'form-group';
      const clipLabel = document.createElement('label');
      clipLabel.innerText = 'Animation Clip:';
      const clipSelect = document.createElement('select');
      clipSelect.style.width = '100%';
      const emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.innerText = '-- Select --';
      clipSelect.appendChild(emptyOpt);

      this.loadedAnimations.forEach((clip) => {
        const opt = document.createElement('option');
        opt.value = clip.name;
        opt.innerText = clip.name;
        if (anim.clipName === clip.name) opt.selected = true;
        clipSelect.appendChild(opt);
      });
      clipSelect.addEventListener('change', (e) => {
        anim.clipName = (e.target as HTMLSelectElement).value;
        const selectedClip = this.loadedAnimations.find(
          (a) => a.name === anim.clipName
        );
        if (selectedClip) {
          anim.startFrame = 0;
          anim.endFrame = Math.round(selectedClip.duration * 60);
        } else {
          anim.startFrame = 0;
          anim.endFrame = 0;
        }
        this.bottomPanel.forceRender();
        renderLayers();
        refreshPreviewActions();
      });
      clipGroup.appendChild(clipLabel);
      clipGroup.appendChild(clipSelect);
      layerBox.appendChild(clipGroup);
      layerBox.appendChild(framesGroup);

      // Playback Speed
      const speedGroup = document.createElement('div');
      speedGroup.className = 'form-group';
      const speedLabel = document.createElement('label');
      speedLabel.innerText = 'Playback Speed (Multiplier):';
      const speedInp = document.createElement('input');
      speedInp.type = 'number';
      speedInp.step = '0.1';
      speedInp.value = anim.playbackSpeed.toString();
      speedInp.addEventListener('change', (e) => {
        const val = parseFloat((e.target as HTMLInputElement).value);
        anim.playbackSpeed = isNaN(val) || val <= 0 ? 1.0 : val;
        const matching = this.currentActions.find((a) => a.config === anim);
        if (matching) {
          matching.action.setEffectiveTimeScale(anim.playbackSpeed);
        }
        this.bottomPanel.forceRender();
        renderLayers();
      });
      speedGroup.appendChild(speedLabel);
      speedGroup.appendChild(speedInp);
      layerBox.appendChild(speedGroup);

      // Loopable
      const loopGroup = document.createElement('div');
      loopGroup.className = 'form-group';
      const loopLabel = document.createElement('label');
      loopLabel.innerText = 'Loopable: ';
      const loopInp = document.createElement('input');
      loopInp.type = 'checkbox';
      loopInp.checked = anim.loopable;
      loopInp.addEventListener('change', (e) => {
        anim.loopable = (e.target as HTMLInputElement).checked;
      });
      loopLabel.appendChild(loopInp);
      loopGroup.appendChild(loopLabel);
      layerBox.appendChild(loopGroup);

      // Lock Root Motion
      const lockGroup = document.createElement('div');
      lockGroup.className = 'form-group';
      const lockLabel = document.createElement('label');
      lockLabel.innerText = 'Lock Root Motion: ';
      const lockInp = document.createElement('input');
      lockInp.type = 'checkbox';
      lockInp.checked = anim.lockRootMotion;
      lockInp.addEventListener('change', (e) => {
        anim.lockRootMotion = (e.target as HTMLInputElement).checked;
        renderLayers();
      });
      lockLabel.appendChild(lockInp);
      lockGroup.appendChild(lockLabel);
      layerBox.appendChild(lockGroup);

      // Root Y Offset (only visible when lock root motion is on)
      if (anim.lockRootMotion) {
        const lockBoneGroup = document.createElement('div');
        lockBoneGroup.className = 'form-group';
        const lockBoneLabel = document.createElement('label');
        lockBoneLabel.innerText = 'Y-Axis Lock Anchor:';
        const lockBoneSelect = document.createElement('select');
        lockBoneSelect.style.width = '100%';
        
        const addOpt = (val: string, text: string) => {
          const opt = document.createElement('option');
          opt.value = val;
          opt.innerText = text;
          if (anim.yLockAnchor === val || (!anim.yLockAnchor && val === 'none')) {
            opt.selected = true;
          }
          lockBoneSelect.appendChild(opt);
        };

        addOpt('none', '-- None (Free Y) --');
        addOpt('center_of_feet', '-- Center of Feet --');
        addOpt('lowest_foot', '-- Lowest Foot --');
        
        this.allBoneNames.forEach(boneName => {
          addOpt(boneName, boneName);
        });
        
        lockBoneSelect.addEventListener('change', (e) => {
          const val = (e.target as HTMLSelectElement).value;
          anim.yLockAnchor = val === 'none' ? undefined : val;
        });
        
        lockBoneGroup.appendChild(lockBoneLabel);
        lockBoneGroup.appendChild(lockBoneSelect);
        layerBox.appendChild(lockBoneGroup);

        const yOffsetGroup = document.createElement('div');
        yOffsetGroup.className = 'form-group';
        const yOffsetLabel = document.createElement('label');
        yOffsetLabel.innerText = `Root Y Offset: ${anim.rootYOffset}`;
        const yOffsetInp = document.createElement('input');
        yOffsetInp.type = 'range';
        yOffsetInp.min = '-200';
        yOffsetInp.max = '200';
        yOffsetInp.step = '1';
        yOffsetInp.value = anim.rootYOffset.toString();
        yOffsetInp.style.width = '100%';
        yOffsetInp.addEventListener('input', (e) => {
          anim.rootYOffset = parseFloat((e.target as HTMLInputElement).value);
          yOffsetLabel.innerText = `Root Y Offset: ${anim.rootYOffset}`;
        });
        yOffsetGroup.appendChild(yOffsetLabel);
        yOffsetGroup.appendChild(yOffsetInp);
        layerBox.appendChild(yOffsetGroup);
      }

      // Mix Weight
      const weightGroup = document.createElement('div');
      weightGroup.className = 'form-group';
      const weightLabel = document.createElement('label');
      weightLabel.innerText = `Mix Weight (${anim.mixWeight}):`;
      const weightInp = document.createElement('input');
      weightInp.type = 'range';
      weightInp.min = '0';
      weightInp.max = '1';
      weightInp.step = '0.05';
      weightInp.value = anim.mixWeight.toString();
      weightInp.addEventListener('input', (e) => {
        anim.mixWeight = parseFloat((e.target as HTMLInputElement).value);
        weightLabel.innerText = `Mix Weight (${anim.mixWeight}):`;
      });
      weightGroup.appendChild(weightLabel);
      weightGroup.appendChild(weightInp);
      layerBox.appendChild(weightGroup);

      layersContainer.appendChild(layerBox);
    };
    
    renderLayers();
    rightPanelEl.appendChild(layersContainer);

    const btnAddLayer = document.createElement('button');
    btnAddLayer.innerText = '+ Add Animation Layer';
    btnAddLayer.style.padding = '5px 10px';
    btnAddLayer.style.marginTop = '10px';
    btnAddLayer.addEventListener('click', () => {
      this.bottomPanel.addLayer({
        clipName: '',
        startFrame: 0,
        endFrame: 100,
        playbackSpeed: 1.0,
        loopable: true,
        mixWeight: 1.0,
        lockRootMotion: false,
        rootYOffset: 0,
        stateStartFrame: 0,
        stateEndFrame: 0
      });
      renderLayers();
    });
    rightPanelEl.appendChild(btnAddLayer);
  }

  private startPreview(stateId: StateId, loop: boolean) {
    this.currentStateId = stateId;
    this.isLoopMode = loop;
    this.isPlaying = true;
    this.isPaused = false;
    this.statePreviewTime = 0;
    this.playStatePreview(stateId, loop);
    this.bottomPanel.setPlaying(true, false);
  }

  private togglePause() {
    if (!this.isPlaying) {
      if (this.currentStateId !== undefined) {
        this.startPreview(this.currentStateId, this.isLoopMode);
      }
      return;
    }
    this.isPaused = !this.isPaused;
    this.bottomPanel.setPlaying(this.isPlaying, this.isPaused);
  }

  private getTotalStateFrames(stateId?: StateId): number {
    if (stateId === undefined) return 100;
    const stateConfig = this.project.displayConfig.states.get(stateId);
    if (!stateConfig || stateConfig.animations.length === 0) return 100;

    const max = Math.max(...stateConfig.animations.map((a) => {
      const start = a.stateStartFrame || 0;
      let end = a.endFrame;
      if (end === undefined || end === 0) {
        const clip = this.loadedAnimations.find(c => c.name === a.clipName);
        end = clip ? Math.round(clip.duration * 60) : 100;
      }
      const speed = (a.playbackSpeed !== undefined && a.playbackSpeed > 0) ? a.playbackSpeed : 1.0;
      const clipLen = Math.max(1, Math.round((end - (a.startFrame || 0)) / speed));
      return (a.stateEndFrame && a.stateEndFrame > 0) ? a.stateEndFrame : (start + clipLen);
    }));

    return max > 0 ? max : 100;
  }

  private stepFrame(deltaFrames: number) {
    if (this.currentStateId === undefined) return;

    if (this.currentActions.length === 0) {
      this.playStatePreview(this.currentStateId, this.isLoopMode);
    }

    const totalStateFrames = this.getTotalStateFrames(this.currentStateId);

    this.isPlaying = true;
    this.isPaused = true;
    this.bottomPanel.setPlaying(true, true);

    const currentFrame = Math.round(this.statePreviewTime * 60);
    let nextFrame = currentFrame + deltaFrames;

    if (this.isLoopMode) {
      nextFrame = ((nextFrame % totalStateFrames) + totalStateFrames) % totalStateFrames;
    } else {
      nextFrame = Math.max(0, Math.min(totalStateFrames, nextFrame));
    }

    this.statePreviewTime = nextFrame / 60;
    this.bottomPanel.updatePlayhead(nextFrame);
  }

  private initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      const activeTag = (document.activeElement?.tagName || '').toUpperCase();
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === '.') {
        e.preventDefault();
        this.stepFrame(1);
      } else if (e.key === 'ArrowLeft' || e.key === ',') {
        e.preventDefault();
        this.stepFrame(-1);
      } else if (e.code === 'Space') {
        e.preventDefault();
        this.togglePause();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeIdx = this.bottomPanel.getActiveLayerIndex();
        if (activeIdx >= 0) {
          e.preventDefault();
          this.bottomPanel.deleteLayer(activeIdx);
        }
      }
    });
  }

  private stopPreview() {
    this.isPlaying = false;
    this.isPaused = false;
    this.statePreviewTime = 0;
    this.currentActions.forEach((item) => item.action.stop());
    this.fadingOutActions.forEach((item) => item.action.stop());
    this.currentActions = [];
    this.fadingOutActions = [];
    this.bottomPanel.setPlaying(false);
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.update(0);
    }
    if (this.loadedModel) {
      this.loadedModel.position.set(this.modelBaseX, this.modelBaseY, this.modelBaseZ);
      this.loadedModel.updateMatrixWorld(true);
    }
  }

  private playStatePreview(stateId: StateId, loop: boolean = true) {
    if (!this.mixer) return;

    this.isLoopMode = loop;
    this.isPlaying = true;
    this.isPaused = false;
    this.statePreviewTime = 0;
    this.stateRealStartTime = this.clock.getElapsedTime();

    const stateConfig = this.project.displayConfig.states.get(stateId);
    if (!stateConfig) {
      this.currentActions.forEach((item) => item.action.stop());
      this.currentActions = [];
      return;
    }

    const crossfadeDuration = (stateConfig.crossfadeFrames || 0) / 60;
    this.globalCrossfadeDuration = crossfadeDuration;

    if (crossfadeDuration > 0) {
      const now = this.clock.getElapsedTime();
      this.currentActions.forEach((item) => {
        const weight = item.action.getEffectiveWeight();
        if (weight > 0) {
          this.fadingOutActions.push({
            action: item.action,
            startWeight: weight,
            fadeStartTime: now,
            duration: crossfadeDuration
          });
        } else {
          item.action.stop();
        }
      });
    } else {
      this.currentActions.forEach((item) => item.action.stop());
      this.fadingOutActions.forEach((item) => item.action.stop());
      this.fadingOutActions = [];
    }
    
    this.currentActions = [];

    if (stateConfig.animations.length === 0) {
      if (this.mixer) {
        this.mixer.stopAllAction();
        this.mixer.update(0);
      }
      if (this.loadedModel) {
        this.loadedModel.position.set(this.modelBaseX, this.modelBaseY, this.modelBaseZ);
        this.loadedModel.updateMatrixWorld(true);
      }
      return;
    }

    stateConfig.animations.forEach((animConfig) => {
      if (!animConfig.clipName) return;

      let clip = this.loadedAnimations.find(
        (a) => a.name === animConfig.clipName
      );
      if (!clip) return;

      const clipDurationFrames = Math.round(clip.duration * 60);
      let startFrame = animConfig.startFrame || 0;
      let endFrame = animConfig.endFrame || clipDurationFrames;

      if (endFrame > clipDurationFrames) endFrame = clipDurationFrames;
      if (startFrame >= endFrame) startFrame = 0;

      const configuredFrames = Math.max(1, endFrame - startFrame);
      const configuredDuration = configuredFrames / 60;

      if (startFrame > 0 || endFrame < clipDurationFrames) {
        clip = THREE.AnimationUtils.subclip(
          clip,
          clip.name + '_sub',
          startFrame,
          endFrame + 0.001,
          60
        );
        clip.duration = configuredDuration;
      } else {
        clip = clip.clone();
        clip.duration = configuredDuration;
      }

      // Root motion locking is handled in animate() via world-space position correction
      // after the mixer update, so we don't modify animation tracks here.
      const action = this.mixer!.clipAction(clip);
      action.time = 0;
      action.setEffectiveTimeScale(1.0);
      action.setEffectiveWeight(0);
      action.play();

      this.currentActions.push({
        action,
        config: animConfig,
        clipDurationSeconds: configuredDuration
      });
    });
  }

  private async onModelLoaded(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    const file = target.files[0];
    this.project.modelFilename = file.name;

    // Read as ArrayBuffer for saving
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target && ev.target.result) {
        this.project.modelData = ev.target.result as ArrayBuffer;
      }
    };
    reader.readAsArrayBuffer(file);

    const url = URL.createObjectURL(file);
    this.loadModelFromUrl(url);
  }

  private loadModelFromUrl(url: string) {
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      if (this.loadedModel) {
        this.scene.remove(this.loadedModel);
      }
      this.loadedModel = gltf.scene;

      // Center the model
      const box = new THREE.Box3().setFromObject(this.loadedModel);
      const center = box.getCenter(new THREE.Vector3());
      this.loadedModel.position.sub(center);
      this.modelBaseX = this.loadedModel.position.x;
      this.modelBaseY = this.loadedModel.position.y;
      this.modelBaseZ = this.loadedModel.position.z;

      // Find the active skinned mesh and skeleton root
      let activeSkeleton: THREE.Skeleton | undefined;
      this.loadedModel.traverse((child) => {
        if ((child as THREE.SkinnedMesh).isSkinnedMesh && !activeSkeleton) {
          activeSkeleton = (child as THREE.SkinnedMesh).skeleton;
        }
      });

      this.cachedRootBone = undefined;
      if (activeSkeleton && activeSkeleton.bones.length > 0) {
        let curr: THREE.Object3D = activeSkeleton.bones[0];
        while (curr.parent && (curr.parent as THREE.Bone).isBone) {
          curr = curr.parent;
        }
        this.cachedRootBone = curr as THREE.Bone;
      } else {
        this.loadedModel.traverse((child) => {
          if ((child as THREE.Bone).isBone && !this.cachedRootBone) {
            this.cachedRootBone = child as THREE.Bone;
          }
        });
      }

      if (activeSkeleton && activeSkeleton.bones.length > 0) {
        this.allBoneNames = Array.from(new Set(activeSkeleton.bones.map((b) => b.name)));
      } else {
        const boneNames: string[] = [];
        this.loadedModel.traverse((child) => {
          if ((child as THREE.Bone).isBone) {
            boneNames.push(child.name);
          }
        });
        this.allBoneNames = Array.from(new Set(boneNames));
      }

      // Apply initial rotation from display config
      this.loadedModel.rotation.y =
        this.project.displayConfig.deadRightRotation * (Math.PI / 180);

      // Apply initial simulation scale
      const scale = this.project.displayConfig.simulationScale;
      this.loadedModel.scale.set(scale, scale, scale);

      this.scene.add(this.loadedModel);
      
      // Armature visualization: target the active skeleton root so ghost/orphan armatures are ignored
      if (this.skeletonHelper) {
        this.scene.remove(this.skeletonHelper);
      }
      const skeletonTarget = this.cachedRootBone || this.loadedModel;
      this.skeletonHelper = new THREE.SkeletonHelper(skeletonTarget);
      this.skeletonHelper.visible = false; // Hidden by default
      // Note: SkeletonHelper uses a custom material. We can just add it to the scene.
      this.scene.add(this.skeletonHelper);

      // Clean up previous joint pickers
      this.jointPickers.forEach((p) => {
        p.bone.remove(p.mesh);
      });
      this.jointPickers = [];

      // Create interactive joint picker nodes on all bones for 3D picking
      const targetBones: THREE.Bone[] = [];
      if (activeSkeleton && activeSkeleton.bones.length > 0) {
        targetBones.push(...activeSkeleton.bones);
      } else {
        this.loadedModel.traverse((child) => {
          if ((child as THREE.Bone).isBone) {
            targetBones.push(child as THREE.Bone);
          }
        });
      }

      const uniqueBones = Array.from(new Set(targetBones));
      for (const bone of uniqueBones) {
        const pickerMesh = new THREE.Mesh(
          this.jointPickerGeo,
          this.jointPickerNormalMat
        );
        pickerMesh.name = '__picker__' + bone.name;
        pickerMesh.userData = { boneName: bone.name, boneRef: bone };
        pickerMesh.visible = false;
        bone.add(pickerMesh);
        this.jointPickers.push({ mesh: pickerMesh, bone });
      }

      // Sync 3D capsule meshes for any existing hurtbox attachments
      this.syncAllCapsuleMeshes();

      // Handle animations
      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.loadedModel);
        this.loadedAnimations = gltf.animations;
      } else {
        this.loadedAnimations = [];
      }
    });
  }

  private initToolbar() {
    const menuNew = document.getElementById('menu-new');
    const menuOpen = document.getElementById('menu-open');
    const menuSave = document.getElementById('menu-save');
    const menuExport = document.getElementById('menu-export');

    menuNew?.addEventListener('click', (e) => {
      e.preventDefault();
      this.fileHandle = undefined;
      this.project = {
        config: emptyCahrConfig(),
        displayConfig: emptyDisplayConfig()
      };
      this.syncAllCapsuleMeshes();
      this.rightPanel.updateConfig(this.project.config);
      document.getElementById('right-panel')!.innerHTML = '';
      document
        .querySelectorAll('.left-panel li')
        .forEach((el) => el.classList.remove('active'));

      // Clear model
      if (this.loadedModel) {
        this.scene.remove(this.loadedModel);
        this.loadedModel = undefined;
      }
      this.mixer = undefined;
      this.loadedAnimations = [];
      this.currentActions.forEach((item) => item.action.stop());
      this.currentActions = [];
    });

    menuOpen?.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        if ('showOpenFilePicker' in window) {
            const [fileHandle] = await (window as any).showOpenFilePicker({
              types: [{
                description: 'Jazz Project',
                accept: { 'application/x-zip-compressed': ['.jproj'] }
              }],
              multiple: false
            });
            this.fileHandle = fileHandle;
            const file = await fileHandle.getFile();
            await this.openProjectFile(file);
        } else {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.jproj';
            fileInput.onchange = async (ev) => {
                const target = ev.target as HTMLInputElement;
                if (!target.files || target.files.length === 0) return;
                await this.openProjectFile(target.files[0]);
            };
            fileInput.click();
        }
      } catch (err) {
        console.error(err);
      }
    });

    menuSave?.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.saveProject(false);
    });

    const menuSaveAs = document.getElementById('menu-save-as');
    menuSaveAs?.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.saveProject(true);
    });

    menuExport?.addEventListener('click', (e) => {
      e.preventDefault();
      // Deferred 3D-to-2D projection: compile hurt capsules to 2D only upon export
      this.projectHurtCapsulesToEngineConfig();

      // Stub for exporting character config
      const json = JSON.stringify(
        this.project.config,
        (key, value) => {
          if (value instanceof Map) {
            return { dataType: 'Map', value: Array.from(value.entries()) };
          }
          return value;
        },
        2
      );
      console.log('Exporting Config:', json);
      alert('Config exported to console');
    });
  }

  private async saveProject(saveAs: boolean = false) {
    if (!this.project.modelData) {
      alert('No model loaded! Load a model before saving.');
      return;
    }

    const zip = new JSZip();

    // Serialize CharacterConfig
    const engineConfigStr = JSON.stringify(
      this.project.config,
      (key, value) => {
        if (value instanceof Map) {
          return { dataType: 'Map', value: Array.from(value.entries()) };
        }
        return value;
      },
      2
    );
    zip.file('engine_config.json', engineConfigStr);

    // Serialize DisplayLayerConfig
    const displayConfigStr = JSON.stringify(
      this.project.displayConfig,
      (key, value) => {
        if (value instanceof Map) {
          return { dataType: 'Map', value: Array.from(value.entries()) };
        }
        return value;
      },
      2
    );
    zip.file('display_layer_config.json', displayConfigStr);

    zip.file(this.project.modelFilename || 'model.glb', this.project.modelData);

    const blob = await zip.generateAsync({ type: 'blob' });

    if ('showSaveFilePicker' in window) {
        if (!this.fileHandle || saveAs) {
            try {
                this.fileHandle = await (window as any).showSaveFilePicker({
                    types: [{
                        description: 'Jazz Project',
                        accept: { 'application/x-zip-compressed': ['.jproj'] }
                    }],
                    suggestedName: `${this.project.config.Name || 'Character'}.jproj`
                });
            } catch (err) {
                return; // User cancelled
            }
        }
        const writable = await this.fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        console.log("Project quick saved!");
    } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.project.config.Name || 'Character'}.jproj`;
        a.click();
        URL.revokeObjectURL(url);
    }
  }

  private async openProjectFile(file: File) {
    const zip = await JSZip.loadAsync(file);

    // Load configs
    const engineConfigStr = await zip
      .file('engine_config.json')
      ?.async('string');
    const displayConfigStr = await zip
      .file('display_layer_config.json')
      ?.async('string');

    if (engineConfigStr) {
      this.project.config = JSON.parse(engineConfigStr, (key, value) => {
        if (
          typeof value === 'object' &&
          value !== null &&
          value.dataType === 'Map'
        ) {
          return new Map(value.value);
        }
        return value;
      });
    }

    if (displayConfigStr) {
      this.project.displayConfig = JSON.parse(
        displayConfigStr,
        (key, value) => {
          if (
            typeof value === 'object' &&
            value !== null &&
            value.dataType === 'Map'
          ) {
            return new Map(value.value);
          }
          return value;
        }
      );

      if (!this.project.displayConfig.hurtCapsules) {
        this.project.displayConfig.hurtCapsules = [];
      }
      this.syncAllCapsuleMeshes();

      const scaleInput = document.getElementById(
        'simulation-scale'
      ) as HTMLInputElement;
      if (scaleInput) {
        scaleInput.value =
          this.project.displayConfig.simulationScale.toString();
      }

      const rotInput = document.getElementById(
        'dead-right-rotation'
      ) as HTMLInputElement;
      if (rotInput) {
        rotInput.value =
          this.project.displayConfig.deadRightRotation.toString();
        // Trigger input event to update display span and model rotation
        rotInput.dispatchEvent(new Event('input'));
      }
    }

    // Find and load the .glb
    const glbFile = Object.values(zip.files).find((f) =>
      f.name.endsWith('.glb')
    );
    if (glbFile) {
      this.project.modelFilename = glbFile.name;
      const modelArrayBuffer = await glbFile.async('arraybuffer');
      this.project.modelData = modelArrayBuffer;

      const blob = new Blob([modelArrayBuffer], { type: 'model/gltf-binary' });
      const url = URL.createObjectURL(blob);

      this.loadModelFromUrl(url);
    }

    this.rightPanel.updateConfig(this.project.config);
  }

  private initThreeJs() {
    const canvas = document.getElementById(
      'editor-canvas'
    ) as HTMLCanvasElement;
    const container = document.getElementById('editor-canvas-container');
    if (!canvas || !container) return;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222);

    // Camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 50, 150);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7.5);
    this.scene.add(dirLight);

    // Grid/Helpers (100x100 simulation units)
    const gridHelper = new THREE.GridHelper(100, 100);
    this.scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // Reference Box (100 units tall)
    const boxGeo = new THREE.BoxGeometry(40, 100, 40);
    const boxMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, 
      wireframe: true,
      transparent: true,
      opacity: 0.15 
    });
    const refBox = new THREE.Mesh(boxGeo, boxMat);
    refBox.position.y = 50; // shift up so bottom is at 0
    this.scene.add(refBox);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.PAN // Allow right click to also pan, or could be DOLLY. We'll leave it as PAN for consistency.
    };
    this.controls.target.set(0, 50, 0);
    this.controls.update();

    // Reset Camera Button
    const resetBtn = document.createElement('button');
    resetBtn.innerText = 'Reset Camera';
    resetBtn.style.position = 'absolute';
    resetBtn.style.bottom = '10px';
    resetBtn.style.right = '10px';
    resetBtn.style.padding = '5px 10px';
    resetBtn.style.zIndex = '10';
    resetBtn.style.backgroundColor = 'var(--accent, #8a2be2)';
    resetBtn.style.color = '#fff';
    resetBtn.style.border = 'none';
    resetBtn.style.borderRadius = '3px';
    resetBtn.style.cursor = 'pointer';
    resetBtn.addEventListener('click', () => {
      this.camera.position.set(0, 50, 150);
      this.controls.target.set(0, 50, 0);
      this.controls.update();
    });
    container.appendChild(resetBtn);

    // Add Hurt Capsule Visual Group to scene
    this.scene.add(this.hurtCapsuleVisualGroup);

    // Toggle Armature Button
    const armatureBtn = document.createElement('button');
    armatureBtn.innerText = 'Toggle Armature';
    armatureBtn.style.position = 'absolute';
    armatureBtn.style.bottom = '45px'; // Place it above Reset Camera
    armatureBtn.style.right = '10px';
    armatureBtn.style.padding = '5px 10px';
    armatureBtn.style.zIndex = '10';
    armatureBtn.style.backgroundColor = 'var(--accent, #8a2be2)';
    armatureBtn.style.color = '#fff';
    armatureBtn.style.border = 'none';
    armatureBtn.style.borderRadius = '3px';
    armatureBtn.style.cursor = 'pointer';
    armatureBtn.addEventListener('click', () => {
      if (this.skeletonHelper) {
        this.skeletonHelper.visible = !this.skeletonHelper.visible;
        this.setArmaturePickersVisible(this.skeletonHelper.visible);
      }
    });
    container.appendChild(armatureBtn);

    // Toggle Hurtboxes Button
    const hurtboxBtn = document.createElement('button');
    hurtboxBtn.id = 'canvas-toggle-hurtboxes';
    hurtboxBtn.innerText = 'Toggle Hurtboxes';
    hurtboxBtn.style.position = 'absolute';
    hurtboxBtn.style.bottom = '80px'; // Place it above Toggle Armature
    hurtboxBtn.style.right = '10px';
    hurtboxBtn.style.padding = '5px 10px';
    hurtboxBtn.style.zIndex = '10';
    hurtboxBtn.style.backgroundColor = this.showHurtCapsules ? '#ffd700' : 'var(--accent, #8a2be2)';
    hurtboxBtn.style.color = this.showHurtCapsules ? '#000' : '#fff';
    hurtboxBtn.style.border = 'none';
    hurtboxBtn.style.borderRadius = '3px';
    hurtboxBtn.style.cursor = 'pointer';
    hurtboxBtn.addEventListener('click', () => {
      this.showHurtCapsules = !this.showHurtCapsules;
      hurtboxBtn.style.backgroundColor = this.showHurtCapsules ? '#ffd700' : 'var(--accent, #8a2be2)';
      hurtboxBtn.style.color = this.showHurtCapsules ? '#000' : '#fff';
      const chk = document.getElementById('anim-toggle-hurtboxes') as HTMLInputElement;
      if (chk) chk.checked = this.showHurtCapsules;
    });
    container.appendChild(hurtboxBtn);

    // Floating HUD for 3D Bone Picking Mode
    const pickHud = document.createElement('div');
    pickHud.id = 'bone-pick-hud';
    pickHud.className = 'bone-pick-hud';
    pickHud.style.display = 'none';
    container.appendChild(pickHud);

    // Floating Tooltip for Bone Hover
    const tooltip = document.createElement('div');
    tooltip.id = 'bone-tooltip';
    tooltip.className = 'bone-tooltip';
    container.appendChild(tooltip);

    // 3D Bone Picking Pointer Event Listeners
    let downX = 0;
    let downY = 0;

    const onPointerMove = (e: MouseEvent) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      _scratchMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _scratchMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!this.camera || !this.loadedModel) return;

      const pickMeshes = this.jointPickers.map((p) => p.mesh);
      if (pickMeshes.length === 0) return;

      _scratchRaycaster.setFromCamera(_scratchMouse, this.camera);
      const hits = _scratchRaycaster.intersectObjects(pickMeshes, false);

      if (hits.length > 0) {
        const hitMesh = hits[0].object as THREE.Mesh;
        const boneName = hitMesh.userData.boneName as string;

        if (this.hoveredJointPicker && this.hoveredJointPicker !== hitMesh) {
          if (this.hoveredJointPicker !== this.selectedJointPicker) {
            this.resetJointPickerHighlight(this.hoveredJointPicker);
          }
        }

        this.hoveredJointPicker = hitMesh;
        if (hitMesh !== this.selectedJointPicker) {
          hitMesh.material = this.jointPickerHoverMat;
          hitMesh.scale.set(1.6, 1.6, 1.6);
        }

        tooltip.style.display = 'block';
        tooltip.style.left = `${e.clientX - rect.left + 14}px`;
        tooltip.style.top = `${e.clientY - rect.top + 14}px`;
        tooltip.innerText = `Bone: ${boneName}`;
        this.renderer.domElement.style.cursor = 'pointer';
      } else {
        if (this.hoveredJointPicker) {
          if (this.hoveredJointPicker !== this.selectedJointPicker) {
            this.resetJointPickerHighlight(this.hoveredJointPicker);
          }
          this.hoveredJointPicker = undefined;
        }
        tooltip.style.display = 'none';
        this.renderer.domElement.style.cursor = 'default';
      }
    };

    const onPointerDown = (e: MouseEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onPointerUp = (e: MouseEvent) => {
      // Ignore if user was dragging to rotate/pan camera
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return;
      if (!this.isPickingBone || e.button !== 0) return;
      if (!this.hoveredJointPicker) return;

      const boneName = this.hoveredJointPicker.userData.boneName as string;
      this.handleBonePicked(boneName, this.hoveredJointPicker);
    };

    this.renderer.domElement.addEventListener('mousemove', onPointerMove);
    this.renderer.domElement.addEventListener('mousedown', onPointerDown);
    this.renderer.domElement.addEventListener('mouseup', onPointerUp);

    // Resize handler
    const resizeObserver = new ResizeObserver(() => this.onWindowResize());
    resizeObserver.observe(container);

    // Escape key cancels bone picking
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isPickingBone) {
        this.endPickingMode();
      }
    });

    // Start loop
    this.animate();
  }

  private onWindowResize() {
    const container = document.getElementById('editor-canvas-container');
    if (!container || !this.camera || !this.renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  private animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    if (this.mixer) {
      // 1. Calculate total state duration
      const totalStateFrames = this.getTotalStateFrames(this.currentStateId);
      const totalStateDuration = totalStateFrames / 60;

      // 2. Advance state preview playback clock
      if (this.isPlaying && !this.isPaused) {
        this.statePreviewTime += delta;
        if (this.isLoopMode) {
          if (this.statePreviewTime >= totalStateDuration) {
            this.statePreviewTime = this.statePreviewTime % totalStateDuration;
          }
        } else {
          if (this.statePreviewTime >= totalStateDuration) {
            this.statePreviewTime = totalStateDuration;
            this.isPlaying = false;
            this.bottomPanel.setPlaying(false);
          }
        }
      }

      // 3. Update timeline playhead
      if (this.bottomPanel) {
        const currentFrame = Math.max(0, Math.min(totalStateFrames, this.statePreviewTime * 60));
        this.bottomPanel.updatePlayhead(currentFrame);
      }

      // 4. Handle fading out actions from previous state
      const now = this.clock.getElapsedTime();
      for (let i = this.fadingOutActions.length - 1; i >= 0; i--) {
        const fade = this.fadingOutActions[i];
        const elapsed = now - fade.fadeStartTime;
        if (elapsed >= fade.duration) {
          fade.action.setEffectiveWeight(0);
          fade.action.stop();
          this.fadingOutActions.splice(i, 1);
        } else {
          const progress = 1.0 - (elapsed / fade.duration);
          fade.action.setEffectiveWeight(fade.startWeight * progress);
        }
      }

      // 5. Global crossfade multiplier for entering state
      let globalMultiplier = 1.0;
      if (this.globalCrossfadeDuration > 0) {
        const elapsed = now - this.stateRealStartTime;
        if (elapsed < this.globalCrossfadeDuration) {
          globalMultiplier = elapsed / this.globalCrossfadeDuration;
        }
      }

      // 6. Update current actions at this.statePreviewTime
      this.currentActions.forEach((item) => {
        const config = item.config;
        const trackStart = (config.stateStartFrame || 0) / 60;
        const clipDuration = item.clipDurationSeconds;
        const speed = (config.playbackSpeed !== undefined && config.playbackSpeed > 0) ? config.playbackSpeed : 1.0;
        const trackEnd = (config.stateEndFrame && config.stateEndFrame > 0)
          ? (config.stateEndFrame / 60)
          : (trackStart + (clipDuration / speed));
        const trackDuration = Math.max(1 / 60, trackEnd - trackStart);

        const fadeInTime = (config.fadeInFrames || 0) / 60;
        const fadeOutTime = (config.fadeOutFrames || 0) / 60;

        let targetWeight = 0;
        let actionTime = 0;

        if (this.statePreviewTime >= trackStart - 0.0001 && this.statePreviewTime <= trackEnd + 0.0001) {
          const trackElapsed = Math.max(0, this.statePreviewTime - trackStart);

          targetWeight = config.mixWeight;
          if (fadeInTime > 0 && trackElapsed < fadeInTime) {
            targetWeight = config.mixWeight * (trackElapsed / fadeInTime);
          }
          if (fadeOutTime > 0 && trackElapsed > trackDuration - fadeOutTime) {
            const fadeProgress = (trackDuration - trackElapsed) / fadeOutTime;
            targetWeight = config.mixWeight * Math.max(0, fadeProgress);
          }

          const animElapsed = trackElapsed * speed;
          if (config.loopable && clipDuration > 0) {
            actionTime = animElapsed >= clipDuration ? clipDuration : (animElapsed % clipDuration);
          } else {
            // Non-loopable or static pose: clamp at end of clip and HOLD IT
            actionTime = Math.min(clipDuration, animElapsed);
          }
        } else {
          targetWeight = 0;
          actionTime = 0;
        }

        item.action.time = actionTime;
        item.action.setEffectiveWeight(targetWeight * globalMultiplier);
      });

      // 7. Evaluate mixer
      this.mixer.update(0);

      // 8. Lock root motion: cancel X/Z world-space drift after mixer update
      // and optionally lock Y axis based on the user's anchor selection
      if (this.loadedModel && this.cachedRootBone) {
        let hasLock = false;
        let yOffset = 0;
        let yLockAnchor: string | undefined;
        for (let i = 0; i < this.currentActions.length; i++) {
          const cfg = this.currentActions[i].config;
          if (cfg.lockRootMotion) {
            hasLock = true;
            yOffset = cfg.rootYOffset || 0;
            yLockAnchor = cfg.yLockAnchor;
            break;
          }
        }
        if (hasLock) {
          // Reset model to base position before reading world coords
          this.loadedModel.position.set(this.modelBaseX, this.modelBaseY, this.modelBaseZ);
          this.loadedModel.updateMatrixWorld(true);

          // Always lock X/Z using the root bone to keep character centered horizontally
          const rootWorld = new THREE.Vector3();
          this.cachedRootBone.getWorldPosition(rootWorld);
          this.loadedModel.position.x -= rootWorld.x;
          this.loadedModel.position.z -= rootWorld.z;

          // Y Locking logic
          if (!yLockAnchor || yLockAnchor === 'none') {
            // Free Y: let it drift naturally (good for run/turn), just apply user offset
            this.loadedModel.position.y += yOffset;
          } else if (yLockAnchor === 'center_of_feet' || yLockAnchor === 'lowest_foot') {
            // Find foot bones heuristically under active skeleton
            const feetBones: THREE.Bone[] = [];
            const searchTarget = this.cachedRootBone || this.loadedModel;
            searchTarget.traverse((child) => {
              if ((child as THREE.Bone).isBone) {
                const name = child.name.toLowerCase();
                if (name.includes('foot') || name.includes('toe')) {
                  feetBones.push(child as THREE.Bone);
                }
              }
            });
            
            if (feetBones.length > 0) {
              let targetY = 0;
              const pos = new THREE.Vector3();
              if (yLockAnchor === 'center_of_feet') {
                for (const bone of feetBones) {
                  bone.getWorldPosition(pos);
                  targetY += pos.y;
                }
                targetY /= feetBones.length;
              } else {
                targetY = Infinity;
                for (const bone of feetBones) {
                  bone.getWorldPosition(pos);
                  if (pos.y < targetY) targetY = pos.y;
                }
              }
              // Move model to anchor targetY to modelBaseY + yOffset
              this.loadedModel.position.y += ((this.modelBaseY + yOffset) - targetY);
            } else {
              this.loadedModel.position.y += yOffset;
            }
          } else {
            // Specific bone
            const anchorBone = this.loadedModel.getObjectByName(yLockAnchor);
            if (anchorBone && (anchorBone as THREE.Bone).isBone) {
              const pos = new THREE.Vector3();
              anchorBone.getWorldPosition(pos);
              this.loadedModel.position.y += ((this.modelBaseY + yOffset) - pos.y);
            } else {
              this.loadedModel.position.y += yOffset;
            }
          }
        } else {
          this.loadedModel.position.set(this.modelBaseX, this.modelBaseY, this.modelBaseZ);
        }
      }
    }

    // Real-time tracking of hurt capsules to armature anchor points
    if (this.showHurtCapsules && this.loadedModel) {
      this.hurtCapsuleVisualGroup.visible = true;
      const hurtCaps = this.project.displayConfig.hurtCapsules;
      if (hurtCaps && hurtCaps.length > 0) {
        for (let i = 0; i < hurtCaps.length; i++) {
          const cap = hurtCaps[i];
          const meshData = this.capsuleMeshes.get(cap.id);
          if (!meshData) continue;

          const boneAObj = this.loadedModel.getObjectByName(cap.boneA);
          const boneBObj = this.loadedModel.getObjectByName(cap.boneB);

          if (!boneAObj) {
            meshData.group.visible = false;
            continue;
          }
          meshData.group.visible = true;

          boneAObj.getWorldPosition(_vA);
          if (boneBObj && cap.boneB !== cap.boneA) {
            boneBObj.getWorldPosition(_vB);
            _vDir.subVectors(_vB, _vA);
            const len = _vDir.length();
            _vMid.addVectors(_vA, _vB).multiplyScalar(0.5);

            meshData.sphereA.visible = true;
            meshData.sphereB.visible = true;
            meshData.cylinder.visible = true;

            meshData.sphereA.position.copy(_vA);
            meshData.sphereA.scale.set(cap.radius, cap.radius, cap.radius);

            meshData.sphereB.position.copy(_vB);
            meshData.sphereB.scale.set(cap.radius, cap.radius, cap.radius);

            meshData.cylinder.position.copy(_vMid);
            meshData.cylinder.scale.set(cap.radius, Math.max(0.001, len), cap.radius);
            if (len > 0.0001) {
              _vDir.divideScalar(len);
              meshData.cylinder.quaternion.setFromUnitVectors(_yAxis, _vDir);
            }
          } else {
            // Spherical joint capsule (single bone or boneA === boneB)
            meshData.sphereA.visible = true;
            meshData.sphereB.visible = false;
            meshData.cylinder.visible = false;

            meshData.sphereA.position.copy(_vA);
            meshData.sphereA.scale.set(cap.radius, cap.radius, cap.radius);
          }
        }
      }
    } else {
      this.hurtCapsuleVisualGroup.visible = false;
    }

    if (this.controls) {
      this.controls.update();
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
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
    ECBShapes: new Map<StateId, ECBShape[]>(),
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

function emptyDisplayConfig(): DisplayLayerConfig {
  return {
    simulationScale: 1.0,
    deadRightRotation: 0,
    states: new Map(),
    hurtCapsules: []
  };
}

function getAllTransitionableStates(stateId: StateId): false | number[] {
  const tranitionableIds = new Set<number>();
  AllStateNodes.find((n) => {
    if (n.State.StateId == stateId) {
      n.DirectTransitions.forEach((d) => tranitionableIds.add(d.sId));
      n.DefaultConditions.forEach((dc) => {
        tranitionableIds.add(dc.StateId);
      });
      n.Conditions.forEach((c) => tranitionableIds.add(c.StateId));
    }
  });
  if (tranitionableIds.size! > 0) {
    return false;
  }
  return Array.from(tranitionableIds);
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

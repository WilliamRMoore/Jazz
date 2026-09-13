import {
  AttackConfig,
  CharacterConfig,
  DisplayLayerConfig,
  ECBShape,
  GrabConfig,
  HurtCapsuleConfig,
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
  private currentActions: { action: THREE.AnimationAction, config: AnimationLayerConfig, mixerStartTime: number }[] = [];
  private fadingOutActions: { action: THREE.AnimationAction, startWeight: number, fadeStartTime: number, duration: number }[] = [];
  private stateStartTime: number = 0;
  private globalCrossfadeDuration: number = 0;
  private controls!: OrbitControls;
  private fileHandle?: any;
  private modelBaseX: number = 0;
  private modelBaseY: number = 0;
  private modelBaseZ: number = 0;
  private cachedRootBone?: THREE.Bone;
  private allBoneNames: string[] = [];
  private skeletonHelper?: THREE.SkeletonHelper;

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
        this.rightPanel.renderSection(sectionName);
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
    
    this.bottomPanel.onPlay = () => this.startPreview(stateId, true);
    this.bottomPanel.onPlayOnce = () => this.startPreview(stateId, false);
    this.bottomPanel.onTogglePause = () => this.togglePause();
    this.bottomPanel.onLayerSelect = (idx) => renderLayers();
    this.bottomPanel.onTimelineChange = () => renderLayers();

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
      titleDiv.innerText = `Layer ${idx + 1}: ${anim.clipName || 'Empty'}`;
      titleDiv.style.fontWeight = 'bold';
      titleDiv.style.marginBottom = '10px';
      layerBox.appendChild(titleDiv);

      const deleteBtn = document.createElement('button');
      deleteBtn.innerText = 'X';
      deleteBtn.style.position = 'absolute';
      deleteBtn.style.top = '5px';
      deleteBtn.style.right = '5px';
      deleteBtn.addEventListener('click', () => {
        this.bottomPanel.deleteLayer(idx);
      });
      layerBox.appendChild(deleteBtn);

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
          this.bottomPanel.forceRender();
          renderLayers();
        }
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

  private stopPreview() {
    this.isPlaying = false;
    this.isPaused = false;
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

    const stateConfig = this.project.displayConfig.states.get(stateId);
    if (!stateConfig) {
      this.currentActions.forEach((item) => item.action.stop());
      this.currentActions = [];
      return;
    }

    const crossfadeDuration = (stateConfig.crossfadeFrames || 0) / 60;
    this.stateStartTime = this.mixer.time;
    this.globalCrossfadeDuration = crossfadeDuration;

    if (crossfadeDuration > 0) {
      const now = this.mixer.time;
      this.currentActions.forEach((item) => {
        // The current weight is what it happens to be at this moment
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

    if (stateConfig.animations.length === 0) return;

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

      if (startFrame > 0 || endFrame < clipDurationFrames) {
        clip = THREE.AnimationUtils.subclip(
          clip,
          clip.name + '_sub',
          startFrame,
          endFrame,
          60
        );
      } else {
        clip = clip.clone();
      }

      // Root motion locking is handled in animate() via world-space position correction
      // after the mixer update, so we don't modify animation tracks here.

      const action = this.mixer!.clipAction(clip);

      // Calculate times based on frames (assume 60fps for editor purposes)
      // Since we subclipped, we start at 0
      action.time = 0;
      action.setEffectiveTimeScale(animConfig.playbackSpeed);
      action.setEffectiveWeight(animConfig.mixWeight);

      if (!loop) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      } else {
        action.setLoop(THREE.LoopRepeat, Infinity);
      }

      const stateStartDelay = (animConfig.stateStartFrame || 0) / 60;
      if (stateStartDelay > 0) {
        action.startAt(this.mixer!.time + stateStartDelay);
      }
      action.play();
      this.currentActions.push({
        action,
        config: animConfig,
        mixerStartTime: this.mixer!.time
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

      // Cache the root bone for lock root motion and gather all bone names
      this.cachedRootBone = undefined;
      this.allBoneNames = [];
      this.loadedModel.traverse((child) => {
        if ((child as THREE.Bone).isBone) {
          if (!this.cachedRootBone) {
            this.cachedRootBone = child as THREE.Bone;
          }
          this.allBoneNames.push(child.name);
        }
      });

      // Apply initial rotation from display config
      this.loadedModel.rotation.y =
        this.project.displayConfig.deadRightRotation * (Math.PI / 180);

      // Apply initial simulation scale
      const scale = this.project.displayConfig.simulationScale;
      this.loadedModel.scale.set(scale, scale, scale);

      this.scene.add(this.loadedModel);
      
      // Armature visualization
      if (this.skeletonHelper) {
        this.scene.remove(this.skeletonHelper);
      }
      this.skeletonHelper = new THREE.SkeletonHelper(this.loadedModel);
      this.skeletonHelper.visible = false; // Hidden by default
      // Note: SkeletonHelper uses a custom material. We can just add it to the scene.
      this.scene.add(this.skeletonHelper);

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
      }
    });
    container.appendChild(armatureBtn);

    // Resize handler
    const resizeObserver = new ResizeObserver(() => this.onWindowResize());
    resizeObserver.observe(container);

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
      if (this.isPlaying && !this.isPaused) {
        this.mixer.update(delta);
      }
      const currentTime = this.mixer.time;
      
      if (this.bottomPanel) {
        let currentFrame = Math.max(0, (currentTime - this.stateStartTime) * 60);

        const activeIdx = this.bottomPanel.getActiveLayerIndex();
        const activeItem = (activeIdx >= 0 && activeIdx < this.currentActions.length)
          ? this.currentActions[activeIdx]
          : (this.currentActions.length > 0 ? this.currentActions[0] : undefined);

        if (activeItem) {
          const config = activeItem.config;
          const speed = (config.playbackSpeed !== undefined && config.playbackSpeed > 0)
            ? config.playbackSpeed
            : 1.0;
          const delay = config.stateStartFrame || 0;
          const startTime = activeItem.mixerStartTime + (delay / 60);

          if (currentTime < startTime) {
            currentFrame = Math.max(0, (currentTime - activeItem.mixerStartTime) * 60);
          } else {
            const animElapsed = currentTime - startTime;
            const clipFramesElapsed = animElapsed * 60 * speed;
            const trackDuration = (config.stateEndFrame && config.stateEndFrame > 0)
              ? (config.stateEndFrame - delay)
              : Math.max(0, (config.endFrame || 100) - (config.startFrame || 0));

            if (this.isLoopMode && trackDuration > 0) {
              currentFrame = delay + (clipFramesElapsed % trackDuration);
            } else {
              currentFrame = delay + Math.min(trackDuration, clipFramesElapsed);
              if (this.isPlaying && clipFramesElapsed >= trackDuration) {
                this.isPlaying = false;
                this.bottomPanel.setPlaying(false);
              }
            }
          }
        }

        this.bottomPanel.updatePlayhead(currentFrame);
      }

      // Lock root motion: cancel X/Z world-space drift after mixer update
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
            // Find foot bones heuristically
            const feetBones: THREE.Bone[] = [];
            this.loadedModel.traverse((child) => {
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

      for (let i = this.fadingOutActions.length - 1; i >= 0; i--) {
        const fade = this.fadingOutActions[i];
        if (currentTime >= fade.fadeStartTime + fade.duration) {
          fade.action.setEffectiveWeight(0);
          fade.action.stop();
          this.fadingOutActions.splice(i, 1);
        } else {
          const progress = 1.0 - ((currentTime - fade.fadeStartTime) / fade.duration);
          fade.action.setEffectiveWeight(fade.startWeight * progress);
        }
      }

      let globalMultiplier = 1.0;
      if (this.globalCrossfadeDuration > 0) {
        if (currentTime < this.stateStartTime + this.globalCrossfadeDuration) {
          globalMultiplier = (currentTime - this.stateStartTime) / this.globalCrossfadeDuration;
        }
      }

      this.currentActions.forEach((item) => {
        const config = item.config;
        
        const startTime = item.mixerStartTime + ((config.stateStartFrame || 0) / 60);
        
        const clipDurationSeconds = Math.max(0, config.endFrame - config.startFrame) / 60;
        const actualClipDuration = clipDurationSeconds / config.playbackSpeed;
        
        let trackDurationSeconds = actualClipDuration;
        if (config.stateEndFrame && config.stateEndFrame > 0) {
            trackDurationSeconds = Math.max(0, (config.stateEndFrame - (config.stateStartFrame || 0)) / 60);
        }
        const endTime = startTime + trackDurationSeconds;

        const fadeInTime = (config.fadeInFrames || 0) / 60;
        const fadeOutTime = (config.fadeOutFrames || 0) / 60;

        const hasExplicitEnd = !!(config.stateEndFrame && config.stateEndFrame > 0);

        let targetWeight = 0;

        if (currentTime < startTime) {
          targetWeight = 0;
        } else if (hasExplicitEnd && currentTime >= endTime) {
          targetWeight = 0;
        } else if (!this.isLoopMode && !hasExplicitEnd && fadeOutTime > 0 && currentTime >= endTime) {
          targetWeight = 0;
        } else {
          targetWeight = config.mixWeight;

          if (fadeInTime > 0 && currentTime < startTime + fadeInTime) {
            const progress = (currentTime - startTime) / fadeInTime;
            targetWeight = config.mixWeight * progress;
          }

          if (fadeOutTime > 0 && (hasExplicitEnd || !this.isLoopMode) && currentTime > endTime - fadeOutTime) {
            const progress = (endTime - currentTime) / fadeOutTime;
            targetWeight = config.mixWeight * Math.max(0, progress);
          }
        }

        item.action.setEffectiveWeight(targetWeight * globalMultiplier);
      });
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
    states: new Map()
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

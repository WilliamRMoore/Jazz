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
import JSZip from 'jszip';

import { sections } from '../ui/panels/leftPanel';
import { RightPanel } from '../ui/panels/rightPanel';

export type CharacterProject = {
  config: CharacterConfig;
  displayConfig: DisplayLayerConfig;
  modelData?: ArrayBuffer;
  modelFilename?: string;
};

export class CharacterEditor {
  private project: CharacterProject;
  private rightPanel: RightPanel;

  // Three.js
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId: number = 0;
  private mixer?: THREE.AnimationMixer;
  private clock = new THREE.Clock();
  private loadedModel?: THREE.Group<THREE.Object3DEventMap>;
  private loadedAnimations: THREE.AnimationClip[] = [];
  private currentActions: THREE.AnimationAction[] = [];

  constructor(cc: CharacterConfig | undefined = undefined) {
    if (cc === undefined) {
      this.project = { config: emptyCahrConfig(), displayConfig: emptyDisplayConfig() };
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

    this.initLeftPanel();
    this.initToolbar();
    this.initThreeJs();
  }

  private initLeftPanel() {
    const leftPanelEl = document.getElementById('left-panel');
    if (!leftPanelEl) return;

    const ul = document.createElement('ul');

    // Make a helper to clear active state
    const clearActive = () => ul.querySelectorAll('li').forEach((el) => el.classList.remove('active'));

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
    
    scaleInput.addEventListener('change', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      if (!isNaN(val)) {
        this.project.displayConfig.simulationScale = val;
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

    const layersContainer = document.createElement('div');
    layersContainer.id = 'layers-container';

    const renderLayers = () => {
      layersContainer.innerHTML = '';
      stateConfig.animations.forEach((anim, idx) => {
        const layerBox = document.createElement('div');
        layerBox.style.border = '1px solid var(--border-color)';
        layerBox.style.padding = '10px';
        layerBox.style.marginBottom = '10px';
        layerBox.style.borderRadius = '3px';
        layerBox.style.position = 'relative';

        const titleDiv = document.createElement('div');
        titleDiv.innerText = `Layer ${idx + 1}`;
        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.marginBottom = '10px';
        layerBox.appendChild(titleDiv);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'X';
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.top = '5px';
        deleteBtn.style.right = '5px';
        deleteBtn.addEventListener('click', () => {
           stateConfig.animations.splice(idx, 1);
           renderLayers();
        });
        layerBox.appendChild(deleteBtn);

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

        this.loadedAnimations.forEach(clip => {
           const opt = document.createElement('option');
           opt.value = clip.name;
           opt.innerText = clip.name;
           if (anim.clipName === clip.name) opt.selected = true;
           clipSelect.appendChild(opt);
        });
        clipSelect.addEventListener('change', (e) => {
           anim.clipName = (e.target as HTMLSelectElement).value;
        });
        clipGroup.appendChild(clipLabel);
        clipGroup.appendChild(clipSelect);
        layerBox.appendChild(clipGroup);

        // Start / End Frame
        const framesGroup = document.createElement('div');
        framesGroup.className = 'form-group flatvec-group';
        
        const startDiv = document.createElement('div');
        startDiv.innerHTML = '<label>Start Frame:</label>';
        const startInp = document.createElement('input');
        startInp.type = 'number';
        startInp.value = anim.startFrame.toString();
        startInp.addEventListener('change', (e) => { anim.startFrame = parseInt((e.target as HTMLInputElement).value, 10); });
        startDiv.appendChild(startInp);
        
        const endDiv = document.createElement('div');
        endDiv.innerHTML = '<label>End Frame:</label>';
        const endInp = document.createElement('input');
        endInp.type = 'number';
        endInp.value = anim.endFrame.toString();
        endInp.addEventListener('change', (e) => { anim.endFrame = parseInt((e.target as HTMLInputElement).value, 10); });
        endDiv.appendChild(endInp);

        framesGroup.appendChild(startDiv);
        framesGroup.appendChild(endDiv);
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
        speedInp.addEventListener('change', (e) => { anim.playbackSpeed = parseFloat((e.target as HTMLInputElement).value); });
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
        loopInp.addEventListener('change', (e) => { anim.loopable = (e.target as HTMLInputElement).checked; });
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
        lockInp.addEventListener('change', (e) => { anim.lockRootMotion = (e.target as HTMLInputElement).checked; });
        lockLabel.appendChild(lockInp);
        lockGroup.appendChild(lockLabel);
        layerBox.appendChild(lockGroup);

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
      });
    };
    renderLayers();
    rightPanelEl.appendChild(layersContainer);

    const btnAddLayer = document.createElement('button');
    btnAddLayer.innerText = '+ Add Animation Layer';
    btnAddLayer.style.padding = '5px 10px';
    btnAddLayer.style.marginTop = '10px';
    btnAddLayer.addEventListener('click', () => {
      stateConfig.animations.push({
        clipName: '',
        startFrame: 0,
        endFrame: 100,
        playbackSpeed: 1.0,
        loopable: true,
        mixWeight: 1.0,
        lockRootMotion: false
      });
      renderLayers();
    });
    rightPanelEl.appendChild(btnAddLayer);

    const btnPlay = document.createElement('button');
    btnPlay.innerText = 'Play State Preview';
    btnPlay.style.marginTop = '15px';
    btnPlay.style.display = 'block';
    btnPlay.style.padding = '10px 20px';
    btnPlay.style.backgroundColor = 'var(--accent)';
    btnPlay.style.color = '#fff';
    btnPlay.style.border = 'none';
    btnPlay.style.borderRadius = '3px';
    btnPlay.style.cursor = 'pointer';
    btnPlay.addEventListener('click', () => this.playStatePreview(stateId));
    rightPanelEl.appendChild(btnPlay);
  }

  private playStatePreview(stateId: StateId) {
    if (!this.mixer) return;
    
    // Stop any existing actions
    this.currentActions.forEach(action => action.stop());
    this.currentActions = [];

    const stateConfig = this.project.displayConfig.states.get(stateId);
    if (!stateConfig || stateConfig.animations.length === 0) return;

    stateConfig.animations.forEach(animConfig => {
      if (!animConfig.clipName) return;
      
      let clip = this.loadedAnimations.find(a => a.name === animConfig.clipName);
      if (!clip) return;

      if (animConfig.lockRootMotion) {
        clip = clip.clone();
        // Remove the position track of the root bone (usually the first position track)
        const posTracks = clip.tracks.filter(t => t.name.endsWith('.position'));
        if (posTracks.length > 0) {
          const rootNodeName = posTracks[0].name.split('.')[0];
          clip.tracks = clip.tracks.filter(t => !(t.name.startsWith(rootNodeName) && t.name.endsWith('.position')));
        }
      }

      const action = this.mixer!.clipAction(clip);
      
      // Calculate times based on frames (assume 60fps for editor purposes)
      // Or we can let three.js handle time. The config uses frames for slicing.
      // E.g. startFrame 10 means 10/60 seconds.
      action.time = animConfig.startFrame / 60;
      action.setEffectiveTimeScale(animConfig.playbackSpeed);
      action.setEffectiveWeight(animConfig.mixWeight);
      
      if (!animConfig.loopable) {
         action.setLoop(THREE.LoopOnce, 1);
         action.clampWhenFinished = true;
      } else {
         action.setLoop(THREE.LoopRepeat, Infinity);
      }

      action.play();
      this.currentActions.push(action);
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

      // Apply initial rotation from display config
      this.loadedModel.rotation.y = this.project.displayConfig.deadRightRotation * (Math.PI / 180);

      this.scene.add(this.loadedModel);

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
      this.project = { config: emptyCahrConfig(), displayConfig: emptyDisplayConfig() };
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
      this.currentActions.forEach(a => a.stop());
      this.currentActions = [];
    });

    menuOpen?.addEventListener('click', (e) => {
      e.preventDefault();
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.jproj';
      fileInput.onchange = async (e) => this.openProject(e);
      fileInput.click();
    });

    menuSave?.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.saveProject();
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

  private async saveProject() {
    if (!this.project.modelData) {
      alert('No model loaded! Load a model before saving.');
      return;
    }

    const zip = new JSZip();
    
    // Serialize CharacterConfig
    const engineConfigStr = JSON.stringify(this.project.config, (key, value) => {
      if (value instanceof Map) {
        return { dataType: 'Map', value: Array.from(value.entries()) };
      }
      return value;
    }, 2);
    zip.file('engine_config.json', engineConfigStr);

    // Serialize DisplayLayerConfig
    const displayConfigStr = JSON.stringify(this.project.displayConfig, (key, value) => {
      if (value instanceof Map) {
        return { dataType: 'Map', value: Array.from(value.entries()) };
      }
      return value;
    }, 2);
    zip.file('display_layer_config.json', displayConfigStr);

    zip.file(this.project.modelFilename || 'model.glb', this.project.modelData);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    
    // Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.project.config.Name || 'Character'}.jproj`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  private async openProject(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    const file = target.files[0];
    const zip = await JSZip.loadAsync(file);

    // Load configs
    const engineConfigStr = await zip.file('engine_config.json')?.async('string');
    const displayConfigStr = await zip.file('display_layer_config.json')?.async('string');
    
    if (engineConfigStr) {
      this.project.config = JSON.parse(engineConfigStr, (key, value) => {
        if (typeof value === 'object' && value !== null && value.dataType === 'Map') {
          return new Map(value.value);
        }
        return value;
      });
    }

    if (displayConfigStr) {
      this.project.displayConfig = JSON.parse(displayConfigStr, (key, value) => {
        if (typeof value === 'object' && value !== null && value.dataType === 'Map') {
          return new Map(value.value);
        }
        return value;
      });

      const scaleInput = document.getElementById('simulation-scale') as HTMLInputElement;
      if (scaleInput) {
        scaleInput.value = this.project.displayConfig.simulationScale.toString();
      }

      const rotInput = document.getElementById('dead-right-rotation') as HTMLInputElement;
      if (rotInput) {
        rotInput.value = this.project.displayConfig.deadRightRotation.toString();
        // Trigger input event to update display span and model rotation
        rotInput.dispatchEvent(new Event('input'));
      }
    }

    // Find and load the .glb
    const glbFile = Object.values(zip.files).find(f => f.name.endsWith('.glb'));
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
    const canvas = document.getElementById('editor-canvas') as HTMLCanvasElement;
    const container = document.getElementById('editor-canvas-container');
    if (!canvas || !container) return;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222);

    // Camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 1.5, 5);

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

    // Grid/Helpers
    const gridHelper = new THREE.GridHelper(10, 10);
    this.scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // Resize handler
    window.addEventListener('resize', this.onWindowResize.bind(this));

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
      this.mixer.update(delta);
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

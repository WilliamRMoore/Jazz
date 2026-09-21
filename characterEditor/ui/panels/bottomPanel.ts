import { AnimationLayerConfig } from '../../../game/character/shared';
import { StateId } from '../../../game/engine/finiteStateMachines/player/states/shared';
import * as THREE from 'three';

export type StateDisplayConfig = {
  crossfadeFrames?: number;
  animations: AnimationLayerConfig[];
};

export class BottomPanel {
  private container: HTMLElement;
  private stateId?: StateId;
  private stateConfig?: StateDisplayConfig;
  private loadedAnimations: THREE.AnimationClip[] = [];

  private activeLayerIndex: number = -1;
  private maxStateFrame: number = 100;

  // Callbacks
  public onLayerSelect?: (layerIndex: number) => void;
  public onPlay?: () => void;
  public onPlayOnce?: () => void;
  public onTogglePause?: () => void;
  public onPause?: () => void;
  public onStepFrame?: (deltaFrames: number) => void;
  public onTimelineChange?: () => void; // Called when drag changes a value
  public onScrub?: (frame: number) => void; // Called when scrubbing timeline playhead

  // UI Elements
  private playheadEl!: HTMLElement;
  private tracksContainer!: HTMLElement;
  private playBtn!: HTMLButtonElement;
  private playOnceBtn!: HTMLButtonElement;
  private stepBackBtn!: HTMLButtonElement;
  private stepFwdBtn!: HTMLButtonElement;
  private frameDisplayEl!: HTMLElement;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Could not find container ${containerId}`);
    this.container = el;
    this.renderBaseUI();
  }

  public setState(stateId: StateId, config: StateDisplayConfig, animations: THREE.AnimationClip[]) {
    this.stateId = stateId;
    this.stateConfig = config;
    this.loadedAnimations = animations;
    this.activeLayerIndex = config.animations.length > 0 ? 0 : -1;
    this.renderBaseUI();
    this.setPlaying(false);
    this.render();
  }

  public getActiveLayerIndex(): number {
    return this.activeLayerIndex;
  }

  public getMaxStateFrame(): number {
    return this.maxStateFrame;
  }

  public setPlaying(playing: boolean, paused: boolean = false) {
    this.isPlaying = playing;
    this.isPaused = paused;
    if (!this.playBtn) return;
    if (playing && !paused) {
      this.playBtn.innerText = '⏸ Pause';
      this.playBtn.title = 'Pause playback';
    } else {
      this.playBtn.innerText = '▶ Play';
      this.playBtn.title = paused ? 'Resume playback' : 'Play animation (looping)';
    }
  }

  public addLayer(layer: AnimationLayerConfig) {
    if (!this.stateConfig) return;
    this.stateConfig.animations.push(layer);
    this.activeLayerIndex = this.stateConfig.animations.length - 1;
    this.render();
    this.onTimelineChange?.();
    this.onLayerSelect?.(this.activeLayerIndex);
  }

  public deleteLayer(index: number) {
    if (!this.stateConfig) return;
    this.stateConfig.animations.splice(index, 1);
    if (this.activeLayerIndex >= this.stateConfig.animations.length) {
      this.activeLayerIndex = this.stateConfig.animations.length - 1;
    }
    this.render();
    this.onTimelineChange?.();
    if (this.activeLayerIndex >= 0) {
      this.onLayerSelect?.(this.activeLayerIndex);
    } else {
      this.onLayerSelect?.(-1);
    }
  }

  public updatePlayhead(frame: number) {
    if (!this.playheadEl || this.maxStateFrame <= 0) return;
    const clamped = Math.max(0, Math.min(this.maxStateFrame, frame));
    const percent = (clamped / this.maxStateFrame) * 100;
    this.playheadEl.style.left = `${percent}%`;
    if (this.frameDisplayEl) {
      this.frameDisplayEl.innerText = `${Math.round(clamped)}/${this.maxStateFrame}`;
    }
  }

  public forceRender() {
    this.render();
  }

  public getContainer(): HTMLElement {
    return this.container;
  }

  public clear() {
    this.container.innerHTML = '';
  }

  private renderBaseUI() {
    this.container.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.className = 'timeline-header';

    const controls = document.createElement('div');
    controls.className = 'timeline-controls';

    this.playBtn = document.createElement('button');
    this.playBtn.className = 'timeline-play-btn';
    this.playBtn.innerText = '▶ Play';
    this.playBtn.title = 'Play animation (looping)';
    this.playBtn.onclick = () => {
      if (this.isPlaying && !this.isPaused) {
        this.onTogglePause?.();
        this.setPlaying(true, true);
      } else if (this.isPlaying && this.isPaused) {
        this.onTogglePause?.();
        this.setPlaying(true, false);
      } else {
        this.onPlay?.();
        this.setPlaying(true, false);
      }
    };
    controls.appendChild(this.playBtn);

    this.playOnceBtn = document.createElement('button');
    this.playOnceBtn.className = 'timeline-play-btn secondary';
    this.playOnceBtn.innerText = 'Play Once';
    this.playOnceBtn.title = 'Play animation once without looping';
    this.playOnceBtn.onclick = () => {
      this.onPlayOnce?.();
      this.setPlaying(true, false);
    };
    controls.appendChild(this.playOnceBtn);

    this.stepBackBtn = document.createElement('button');
    this.stepBackBtn.className = 'timeline-step-btn';
    this.stepBackBtn.innerText = '◀';
    this.stepBackBtn.title = 'Step back 1 frame (Left Arrow / ,)';
    this.stepBackBtn.onclick = () => {
      this.onStepFrame?.(-1);
    };
    controls.appendChild(this.stepBackBtn);

    this.stepFwdBtn = document.createElement('button');
    this.stepFwdBtn.className = 'timeline-step-btn';
    this.stepFwdBtn.innerText = '▶|';
    this.stepFwdBtn.title = 'Step forward 1 frame (Right Arrow / .)';
    this.stepFwdBtn.onclick = () => {
      this.onStepFrame?.(1);
    };
    controls.appendChild(this.stepFwdBtn);

    this.frameDisplayEl = document.createElement('span');
    this.frameDisplayEl.className = 'timeline-frame-display';
    this.frameDisplayEl.innerText = `0/${this.maxStateFrame}`;
    controls.appendChild(this.frameDisplayEl);

    header.appendChild(controls);

    const ruler = document.createElement('div');
    ruler.className = 'timeline-ruler';
    ruler.id = 'timeline-ruler';
    ruler.style.cursor = 'pointer';

    const handleRulerScrub = (e: MouseEvent) => {
      if (this.isPlaying && !this.isPaused) {
        this.isPaused = true;
        this.setPlaying(true, true);
        this.onPause?.();
      }
      const rect = ruler.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const frame = Math.round((x / rect.width) * this.maxStateFrame);
      this.updatePlayhead(frame);
      this.onScrub?.(frame);
    };

    ruler.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handleRulerScrub(e);
      const onMove = (ev: MouseEvent) => handleRulerScrub(ev);
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    header.appendChild(ruler);

    this.container.appendChild(header);

    // Tracks Container
    this.tracksContainer = document.createElement('div');
    this.tracksContainer.className = 'timeline-track-container';

    this.container.appendChild(this.tracksContainer);
  }

  private render() {
    if (!this.tracksContainer || !this.container.contains(this.tracksContainer)) {
      this.renderBaseUI();
    }

    if (!this.stateConfig) {
      this.tracksContainer.innerHTML = '';
      return;
    }

    this.calculateMaxFrames();
    this.renderRuler();

    this.tracksContainer.innerHTML = '';

    // Global playhead inside tracks container (absolute to body width minus name)
    const playheadContainer = document.createElement('div');
    playheadContainer.style.position = 'absolute';
    playheadContainer.style.top = '0';
    playheadContainer.style.bottom = '0';
    playheadContainer.style.left = '240px';
    playheadContainer.style.right = '0';
    playheadContainer.style.pointerEvents = 'none';
    playheadContainer.style.zIndex = '100';

    this.playheadEl = document.createElement('div');
    this.playheadEl.className = 'timeline-playhead';
    this.playheadEl.style.left = '0%';
    this.playheadEl.style.pointerEvents = 'auto';

    this.playheadEl.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.isPlaying && !this.isPaused) {
        this.isPaused = true;
        this.setPlaying(true, true);
        this.onPause?.();
      }
      const bodyRect = playheadContainer.getBoundingClientRect();
      const handleDrag = (ev: MouseEvent) => {
        const x = Math.max(0, Math.min(bodyRect.width, ev.clientX - bodyRect.left));
        const frame = Math.round((x / bodyRect.width) * this.maxStateFrame);
        this.updatePlayhead(frame);
        this.onScrub?.(frame);
      };
      const onUp = () => {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', onUp);
    });

    playheadContainer.appendChild(this.playheadEl);

    this.tracksContainer.appendChild(playheadContainer);

    this.stateConfig.animations.forEach((anim, idx) => {
      const trackEl = document.createElement('div');
      trackEl.className = 'timeline-track';
      if (idx === this.activeLayerIndex) {
        trackEl.classList.add('active');
      }

      trackEl.onclick = (e) => {
        // Prevent click if we just finished dragging
        if ((e as any)._wasDragging) return;
        this.activeLayerIndex = idx;
        this.render();
        this.onLayerSelect?.(idx);
      };

      const nameEl = document.createElement('div');
      nameEl.className = 'timeline-track-name';

      const labelSpan = document.createElement('span');
      labelSpan.style.flexGrow = '1';
      labelSpan.style.overflow = 'hidden';
      labelSpan.style.textOverflow = 'ellipsis';
      labelSpan.style.whiteSpace = 'nowrap';
      labelSpan.innerText = `Layer ${idx + 1}: ${anim.clipName || 'Empty'}`;
      nameEl.appendChild(labelSpan);

      const deleteTrackBtn = document.createElement('button');
      deleteTrackBtn.className = 'timeline-track-delete-btn';
      deleteTrackBtn.innerText = '✕';
      deleteTrackBtn.title = `Remove Layer ${idx + 1}`;
      deleteTrackBtn.onclick = (ev) => {
        ev.stopPropagation();
        this.deleteLayer(idx);
      };
      nameEl.appendChild(deleteTrackBtn);

      trackEl.appendChild(nameEl);

      const bodyEl = document.createElement('div');
      bodyEl.className = 'timeline-track-body';

      this.renderClip(anim, bodyEl);

      trackEl.appendChild(bodyEl);
      this.tracksContainer.appendChild(trackEl);
    });
  }

  private calculateMaxFrames() {
    if (!this.stateConfig) return;
    let max = 100;
    if (this.stateConfig.animations.length > 0) {
      max = Math.max(...this.stateConfig.animations.map(a => {
        const start = a.startFrame || 0;
        let end = a.endFrame;
        if (end === undefined || end === 0) {
          const clip = this.loadedAnimations.find(c => c.name === a.clipName);
          end = clip ? Math.round(clip.duration * 60) : 100;
        }
        const speed = (a.playbackSpeed !== undefined && a.playbackSpeed > 0) ? a.playbackSpeed : 1.0;
        const clipLen = Math.max(1, Math.round((end - start) / speed));
        const trackEnd = (a.stateEndFrame && a.stateEndFrame > 0) ? a.stateEndFrame : ((a.stateStartFrame || 0) + clipLen);
        return trackEnd;
      }));
    }
    this.maxStateFrame = max > 0 ? max : 100;
    if (this.frameDisplayEl) {
      this.frameDisplayEl.innerText = `0/${this.maxStateFrame}`;
    }
  }

  private renderRuler() {
    const ruler = document.getElementById('timeline-ruler');
    if (!ruler) return;
    ruler.innerHTML = '';

    const step = this.maxStateFrame > 200 ? 50 : (this.maxStateFrame > 50 ? 10 : 5);
    for (let i = 0; i <= this.maxStateFrame; i += step) {
      const percent = (i / this.maxStateFrame) * 100;

      const tick = document.createElement('div');
      tick.className = 'timeline-ruler-tick';
      tick.style.left = `${percent}%`;
      tick.style.height = i % (step * 2) === 0 ? '8px' : '4px';
      ruler.appendChild(tick);

      if (i % (step * 2) === 0) {
        const label = document.createElement('div');
        label.className = 'timeline-ruler-label';
        label.style.left = `${percent}%`;
        label.innerText = i.toString();
        ruler.appendChild(label);
      }
    }
  }

  private renderClip(anim: AnimationLayerConfig, container: HTMLElement) {
    let clipDurationFrames = 100; // default for empty clips
    const clip = this.loadedAnimations.find((a) => a.name === anim.clipName);
    if (clip) {
      clipDurationFrames = Math.round(clip.duration * 60);
    }

    // Background green bar (Full clip relative to stateStartFrame)
    const fullClipEl = document.createElement('div');
    fullClipEl.className = 'timeline-clip-full';
    const delay = anim.stateStartFrame || 0;
    // The full clip duration mapped to timeline space
    // If we scrub through the full clip, its length on the timeline depends on playbackSpeed.
    // For simplicity, we assume 1:1 frame mapping here.
    const fullDuration = clipDurationFrames;

    fullClipEl.style.left = `${(delay / this.maxStateFrame) * 100}%`;
    fullClipEl.style.width = `${(fullDuration / this.maxStateFrame) * 100}%`;
    container.appendChild(fullClipEl);

    // Yellow selected slice
    const selectedEl = document.createElement('div');
    selectedEl.className = 'timeline-clip-selected';

    // Offset is delay + the startFrame of the clip (assuming 1:1 speed for timeline visual)
    const start = anim.startFrame || 0;
    const end = anim.endFrame || 100;
    const trackDuration = (anim.stateEndFrame && anim.stateEndFrame > 0) ? (anim.stateEndFrame - delay) : Math.max(0, end - start);

    selectedEl.style.left = `${(delay / this.maxStateFrame) * 100}%`;
    selectedEl.style.width = `${(trackDuration / this.maxStateFrame) * 100}%`;

    // Fades indicators
    const fadeIn = anim.fadeInFrames || 0;
    const fadeOut = anim.fadeOutFrames || 0;
    if (trackDuration > 0 && (fadeIn > 0 || fadeOut > 0)) {
      const inStop = Math.min(100, (fadeIn / trackDuration) * 100);
      const outStop = Math.max(0, 100 - (fadeOut / trackDuration) * 100);
      selectedEl.style.background = `linear-gradient(90deg, 
          transparent 0%, 
          var(--accent, #8a2be2) ${inStop}%, 
          var(--accent, #8a2be2) ${outStop}%, 
          transparent 100%)`;
    }

    container.appendChild(selectedEl);

    // Handles
    const leftHandle = document.createElement('div');
    leftHandle.className = 'timeline-handle left';
    selectedEl.appendChild(leftHandle);

    const rightHandle = document.createElement('div');
    rightHandle.className = 'timeline-handle right';
    selectedEl.appendChild(rightHandle);

    // Dragging logic
    this.attachDragLogic(selectedEl, leftHandle, rightHandle, anim, container, fullDuration);
  }

  private attachDragLogic(selectedEl: HTMLElement, leftHandle: HTMLElement, rightHandle: HTMLElement, anim: AnimationLayerConfig, container: HTMLElement, fullDuration: number) {
    let isDragging = false;
    let dragMode = ''; // 'left', 'right', 'center'
    let startX = 0;
    let initialStartFrame = 0;
    let initialEndFrame = 0;
    let initialStateStartFrame = 0;
    let containerWidth = 1;

    const onMouseDown = (mode: string, e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      dragMode = mode;
      startX = e.clientX;

      initialStartFrame = anim.startFrame || 0;
      initialEndFrame = anim.endFrame || 100;
      initialStateStartFrame = anim.stateStartFrame || 0;
      containerWidth = container.clientWidth;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    leftHandle.onmousedown = (e) => onMouseDown('left', e);
    rightHandle.onmousedown = (e) => onMouseDown('right', e);
    selectedEl.onmousedown = (e) => onMouseDown('center', e);

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const framesDelta = Math.round((dx / containerWidth) * this.maxStateFrame);

      if (dragMode === 'left') {
        let newStart = initialStartFrame + framesDelta;
        newStart = Math.max(0, Math.min(newStart, (anim.endFrame || 100) - 1));
        anim.startFrame = newStart;
        // Adjust stateStartFrame so the clip stays in place relative to the end?
        // Actually, standard NLE behaviour: dragging left bound trims clip, moves start time.
        anim.stateStartFrame = Math.max(0, initialStateStartFrame + framesDelta);
      } else if (dragMode === 'right') {
        const currentStart = anim.stateStartFrame || 0;
        const currentTrackEnd = (anim.stateEndFrame && anim.stateEndFrame > 0)
          ? anim.stateEndFrame
          : (currentStart + Math.max(1, initialEndFrame - initialStartFrame));
        anim.stateEndFrame = Math.max(currentStart + 1, currentTrackEnd + framesDelta);

        let newEnd = initialEndFrame + framesDelta;
        anim.endFrame = Math.max((anim.startFrame || 0) + 1, Math.min(newEnd, fullDuration));
      } else if (dragMode === 'center') {
        let newStart = initialStateStartFrame + framesDelta;
        newStart = Math.max(0, newStart);
        anim.stateStartFrame = newStart;

        const trackDuration = (anim.stateEndFrame && anim.stateEndFrame > 0) ? (initialEndFrame - initialStartFrame) : (anim.endFrame - anim.startFrame);
        if (anim.stateEndFrame && anim.stateEndFrame > 0) {
          anim.stateEndFrame = newStart + trackDuration;
        }
      }

      this.render(); // Fast enough for immediate re-render
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      isDragging = false;

      // Flag to prevent the click event from firing on the track body
      (e as any)._wasDragging = true;
      setTimeout(() => { (e as any)._wasDragging = false; }, 0);

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      this.calculateMaxFrames();
      this.render();
      this.onTimelineChange?.();
    };
  }
}

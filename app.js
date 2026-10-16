/**
 * FOLDING DICE 3D - Interactive 2D Net to 3D Cube Educational Visualizer
 * Pure Vanilla HTML5, CSS3 3D Transforms, and ES6 JavaScript.
 * Zero external dependencies.
 */

(function () {
  'use strict';

  // --- Constants & Configuration ---
  const SQUARE_SIZE = 84;
  const HALF_SIZE = SQUARE_SIZE / 2;
  const MAX_SQUARES = 6;

  // 2D Grid Neighbor Directions (on the XZ ground plane)
  // +X is East (Right), -X is West (Left), +Z is South (Front), -Z is North (Back)
  const DIRS_2D = {
    east:  { dx: 1,  dz: 0,  opposite: 'west',  label: 'Right' },
    west:  { dx: -1, dz: 0,  opposite: 'east',  label: 'Left' },
    south: { dx: 0,  dz: 1,  opposite: 'north', label: 'Front' },
    north: { dx: 0,  dz: -1, opposite: 'south', label: 'Back' },
  };

  const PALETTE_COLORS = [
    '#ffffff', // Classic Dice White
    '#3b82f6', // Electric Blue
    '#10b981', // Emerald Green
    '#f59e0b', // Amber Gold
    '#ef4444', // Ruby Red
    '#8b5cf6', // Violet Purple
    '#06b6d4', // Cyan
    '#f97316', // Tangy Orange
    '#ec4899', // Vibrant Pink
    '#84cc16', // Lime Green
    '#6366f1', // Indigo
    '#475569', // Slate Gray
  ];

  // Distinct auto-colors for squares 1..6 when Auto-Color is enabled
  const AUTO_SQUARE_COLORS = [
    '#ffffff', // 1: White (Base)
    '#60a5fa', // 2: Sky Blue
    '#34d399', // 3: Emerald
    '#fbbf24', // 4: Amber
    '#f87171', // 5: Coral Red
    '#c084fc', // 6: Lavender
  ];

  // The 6 Geometric Die Symbols:
  // 1: A plus sign (+)
  // 2: An empty square (□)
  // 3: A filled in square (black) (■)
  // 4: An empty circle (○)
  // 5: A filled in black circle (●)
  // 6: Four dots (as in the face 4 in a die) (⚃)
  const SYMBOLS_CONFIG = {
    0: {
      id: 0,
      name: 'None',
      short: '—',
      svg: '',
    },
    1: {
      id: 1,
      name: 'Plus Sign (+)',
      short: '+',
      svg: '<svg viewBox="0 0 48 48" class="face-symbol-svg"><path d="M24 9v30M9 24h30" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/></svg>',
    },
    2: {
      id: 2,
      name: 'Empty Square (□)',
      short: '□',
      svg: '<svg viewBox="0 0 48 48" class="face-symbol-svg"><rect x="10" y="10" width="28" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="4.5"/></svg>',
    },
    3: {
      id: 3,
      name: 'Filled Black Square (■)',
      short: '■',
      svg: '<svg viewBox="0 0 48 48" class="face-symbol-svg"><rect x="10" y="10" width="28" height="28" rx="2" fill="currentColor"/></svg>',
    },
    4: {
      id: 4,
      name: 'Empty Circle (○)',
      short: '○',
      svg: '<svg viewBox="0 0 48 48" class="face-symbol-svg"><circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" stroke-width="4.5"/></svg>',
    },
    5: {
      id: 5,
      name: 'Filled Black Circle (●)',
      short: '●',
      svg: '<svg viewBox="0 0 48 48" class="face-symbol-svg"><circle cx="24" cy="24" r="14.5" fill="currentColor"/></svg>',
    },
    6: {
      id: 6,
      name: 'Four Dots (⚃)',
      short: '⚃',
      svg: '<svg viewBox="0 0 48 48" class="face-symbol-svg"><circle cx="14" cy="14" r="4.8" fill="currentColor"/><circle cx="34" cy="14" r="4.8" fill="currentColor"/><circle cx="14" cy="34" r="4.8" fill="currentColor"/><circle cx="34" cy="34" r="4.8" fill="currentColor"/></svg>',
    },
  };

  function getSymbolConfig(id) {
    return SYMBOLS_CONFIG[id] || SYMBOLS_CONFIG[0];
  }

  // All 11 Valid Hexomino Cube Nets (each defined as 6 [gx, gz] coordinates, with [0,0] as default base)
  const ALL_11_VALID_NETS = [
    // 1. Classic Cross (1-4-1)
    { name: 'Classic Cross (1-4-1)', coords: [[0,0], [-1,0], [1,0], [2,0], [0,-1], [0,1]] },
    // 2. T-Shape (1-4-1)
    { name: 'T-Shape Net (1-4-1)', coords: [[0,0], [-1,0], [1,0], [0,1], [0,2], [0,-1]] },
    // 3. Offset Cross (1-4-1)
    { name: 'Offset Cross (1-4-1)', coords: [[0,0], [-1,0], [1,0], [2,0], [0,-1], [1,1]] },
    // 4. Long L / Wing Net (1-4-1)
    { name: 'Wing Net (1-4-1)', coords: [[0,0], [-1,0], [1,0], [2,0], [-1,-1], [2,1]] },
    // 5. Knight Wing (1-4-1)
    { name: 'Knight Wing (1-4-1)', coords: [[0,0], [-1,0], [1,0], [2,0], [-1,-1], [1,1]] },
    // 6. Same-Side T (1-4-1)
    { name: 'Banner Net (1-4-1)', coords: [[0,0], [-1,0], [1,0], [2,0], [-1,-1], [-1,1]] },
    // 7. Z-Shape (2-3-1)
    { name: 'Z-Shape Net (2-3-1)', coords: [[0,0], [-1,0], [1,0], [1,-1], [2,-1], [-1,1]] },
    // 8. S-Wing (2-3-1)
    { name: 'S-Wing Net (2-3-1)', coords: [[0,0], [-1,0], [1,0], [1,-1], [2,-1], [0,1]] },
    // 9. Hook Net (2-3-1)
    { name: 'Hook Net (2-3-1)', coords: [[0,0], [-1,0], [1,0], [1,-1], [2,-1], [1,1]] },
    // 10. Stairs Net (2-2-2)
    { name: 'Stairs Net (2-2-2)', coords: [[0,0], [-1,1], [0,1], [0,-1], [1,-1], [1,-2]] },
    // 11. 3-3 Parallel Net (3-3)
    { name: '3-3 Parallel Net', coords: [[0,0], [-1,0], [-2,0], [0,1], [1,1], [2,1]] },
  ];

  // --- Sound FX via Web Audio API (Vanilla Synth) ---
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(freqStart = 320, freqEnd = 640, duration = 0.09, type = 'sine', volume = 0.16) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = type;
        osc.frequency.setValueAtTime(freqStart, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), now + duration);

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {
        // Ignore audio errors prior to user interaction
      }
    }

    playAdd(count = 1) {
      const base = 300 + count * 45;
      this.playTone(base, base * 1.6, 0.09, 'sine', 0.17);
    }

    playDelete() {
      this.playTone(460, 180, 0.11, 'sine', 0.16);
    }

    playPaint() {
      this.playTone(540, 620, 0.06, 'triangle', 0.14);
    }

    playFoldStep(stepIdx, isFoldingIn = true) {
      const base = 280 + stepIdx * 55;
      if (isFoldingIn) {
        this.playTone(base, base * 1.35, 0.16, 'triangle', 0.14);
      } else {
        this.playTone(base * 1.35, base, 0.15, 'triangle', 0.14);
      }
    }

    playCompleteDice() {
      // Pleasant major triad arpeggio when all 6 faces form a valid 3D cube
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, freq * 1.02, 0.14, 'triangle', 0.14);
        }, i * 65);
      });
    }

    playError() {
      this.playTone(220, 140, 0.18, 'sawtooth', 0.12);
    }
  }

  // --- Camera Controller (Orbit, Zoom, Pan, Ortho 2D Views, ViewCube) ---
  class CameraController {
    constructor(viewportEl, worldEl, onUpdate) {
      this.viewport = viewportEl;
      this.world = worldEl;
      this.onUpdate = onUpdate;

      // Default isometric orbit angle tuned for viewing both 2D ground net & 3D folding cube
      this.rotX = -38;
      this.rotY = 34;
      this.targetRotX = -38;
      this.targetRotY = 34;

      this.panX = 0;
      this.panY = 0;
      this.targetPanX = 0;
      this.targetPanY = 0;

      this.zoom = 1.0;
      this.targetZoom = 1.0;

      this.isAutoRotating = false;

      this.isPointerDown = false;
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.hasDragged = false;
      this.activeButton = 0;
      this.isShiftDown = false;

      this.projectionMode = 'perspective';
      this.onProjectionChange = null;

      this.viewCube = document.getElementById('viewcube');
      this.viewCubeViewport = document.getElementById('viewcube-viewport');

      this.setupEvents();
      this.startRenderLoop();
    }

    setProjection(mode) {
      this.projectionMode = mode;
      if (mode === 'ortho') {
        this.viewport.classList.add('arch-view');
      } else {
        this.viewport.classList.remove('arch-view');
      }
      if (this.onProjectionChange) {
        this.onProjectionChange(mode);
      }
    }

    setupEvents() {
      window.addEventListener('resize', () => this.applyTransform());

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Shift') {
          this.isShiftDown = true;
          if (this.isPointerDown) this.viewport.classList.add('panning');
        }
      });
      window.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') {
          this.isShiftDown = false;
          this.viewport.classList.remove('panning');
        }
      });

      this.viewport.addEventListener('pointerdown', (e) => this.onPointerDown(e));
      window.addEventListener('pointermove', (e) => this.onPointerMove(e));
      window.addEventListener('pointerup', (e) => this.onPointerUp(e));
      window.addEventListener('pointercancel', (e) => this.onPointerUp(e));
      this.viewport.addEventListener('contextmenu', (e) => e.preventDefault());
      this.viewport.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

      this.viewport.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
      this.viewport.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
      this.viewport.addEventListener('touchend', () => { this.initialPinchDist = null; });

      if (this.viewCubeViewport) {
        let isCubeDragging = false;
        let cubeStartX = 0, cubeStartY = 0;
        let hasCubeDragged = false;

        this.viewCubeViewport.addEventListener('pointerdown', (e) => {
          isCubeDragging = true;
          hasCubeDragged = false;
          cubeStartX = e.clientX;
          cubeStartY = e.clientY;
          e.stopPropagation();
        });

        window.addEventListener('pointermove', (e) => {
          if (!isCubeDragging) return;
          const dx = e.clientX - cubeStartX;
          const dy = e.clientY - cubeStartY;
          if (Math.hypot(dx, dy) > 3) hasCubeDragged = true;
          if (!hasCubeDragged) return;

          cubeStartX = e.clientX;
          cubeStartY = e.clientY;

          if (this.projectionMode === 'ortho') {
            this.setProjection('perspective');
          }
          this.targetRotY += dx * 0.7;
          this.targetRotX -= dy * 0.7;
          this.targetRotX = Math.max(-89, Math.min(89, this.targetRotX));
        });

        window.addEventListener('pointerup', (e) => {
          if (!isCubeDragging) return;
          isCubeDragging = false;
          if (!hasCubeDragged) {
            const face = e.target.closest('.vface');
            if (face) {
              const view = face.dataset.view;
              const pill = document.querySelector(`.pill-btn[data-view="${view}"]`);
              if (pill) pill.click();
            }
          }
        });
      }
    }

    onPointerDown(e) {
      this.isPointerDown = true;
      this.hasDragged = false;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.activeButton = e.button;
      this.isShiftDown = e.shiftKey;

      if (this.activeButton === 2 || this.activeButton === 1 || this.isShiftDown) {
        this.viewport.classList.add('panning');
      } else {
        this.viewport.classList.add('grabbing');
      }
    }

    onPointerMove(e) {
      if (!this.isPointerDown) return;

      const dx = e.clientX - this.dragStartX;
      const dy = e.clientY - this.dragStartY;
      if (Math.hypot(dx, dy) > 4) {
        this.hasDragged = true;
      }
      if (!this.hasDragged) return;

      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;

      const isPanning = (this.activeButton === 2 || this.activeButton === 1 || this.isShiftDown || e.shiftKey);
      if (isPanning) {
        this.targetPanX += dx;
        this.targetPanY += dy;
      } else {
        if (this.projectionMode === 'ortho') {
          this.setProjection('perspective');
          this.viewport.classList.remove('arch-top');
        }
        this.targetRotY += dx * 0.42;
        this.targetRotX -= dy * 0.42;
        this.targetRotX = Math.max(-89, Math.min(89, this.targetRotX));
      }
    }

    onPointerUp() {
      this.isPointerDown = false;
      this.viewport.classList.remove('grabbing');
      this.viewport.classList.remove('panning');
    }

    onWheel(e) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      this.setZoom(this.targetZoom * zoomFactor);
    }

    onTouchStart(e) {
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        this.initialPinchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        this.initialPinchZoom = this.targetZoom;
      }
    }

    onTouchMove(e) {
      if (e.touches.length === 2 && this.initialPinchDist) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        this.setZoom(this.initialPinchZoom * (dist / this.initialPinchDist));
      }
    }

    setZoom(val) {
      this.targetZoom = Math.max(0.35, Math.min(3.5, val));
      if (this.onUpdate) this.onUpdate(this);
    }

    zoomIn() {
      this.setZoom(this.targetZoom * 1.22);
    }

    zoomOut() {
      this.setZoom(this.targetZoom * 0.82);
    }

    resetView(bounds = null) {
      this.viewport.classList.remove('arch-top');
      this.targetRotX = -38;
      this.targetRotY = 34;
      this.targetPanX = bounds ? -bounds.centerX : 0;
      this.targetPanY = bounds ? -bounds.centerY : 0;
      this.targetZoom = 1.0;
      this.setProjection('perspective');
      if (this.onUpdate) this.onUpdate(this);
    }

    setViewPreset(preset, bounds = null) {
      if (preset === 'top') {
        this.viewport.classList.add('arch-top');
      } else {
        this.viewport.classList.remove('arch-top');
      }
      const cx = bounds ? bounds.centerX : 0;
      const cy = bounds ? bounds.centerY : 0;
      const cz = bounds ? bounds.centerZ : 0;

      switch (preset) {
        case 'iso':
          this.targetRotX = -38;
          this.targetRotY = 34;
          this.setProjection('perspective');
          this.targetPanX = -cx;
          this.targetPanY = -cy;
          break;
        case 'top':
          this.targetRotX = -90;
          this.targetRotY = 0;
          this.setProjection('ortho');
          this.targetPanX = -cx;
          this.targetPanY = -cz;
          break;
        case 'bottom':
          this.targetRotX = 90;
          this.targetRotY = 0;
          this.setProjection('ortho');
          this.targetPanX = -cx;
          this.targetPanY = cz;
          break;
        case 'front':
          this.targetRotX = 0;
          this.targetRotY = 0;
          this.setProjection('ortho');
          this.targetPanX = -cx;
          this.targetPanY = -cy;
          break;
        case 'back':
          this.targetRotX = 0;
          this.targetRotY = 180;
          this.setProjection('ortho');
          this.targetPanX = cx;
          this.targetPanY = -cy;
          break;
        case 'left':
          this.targetRotX = 0;
          this.targetRotY = 90;
          this.setProjection('ortho');
          this.targetPanX = -cz;
          this.targetPanY = -cy;
          break;
        case 'right':
          this.targetRotX = 0;
          this.targetRotY = -90;
          this.setProjection('ortho');
          this.targetPanX = cz;
          this.targetPanY = -cy;
          break;
      }
    }

    toggleAutoRotate() {
      this.isAutoRotating = !this.isAutoRotating;
      return this.isAutoRotating;
    }

    startRenderLoop() {
      const step = () => {
        if (this.isAutoRotating && !this.isPointerDown) {
          this.targetRotY += 0.35;
        }

        const lerp = 0.18;
        this.rotX += (this.targetRotX - this.rotX) * lerp;
        this.rotY += (this.targetRotY - this.rotY) * lerp;
        this.panX += (this.targetPanX - this.panX) * lerp;
        this.panY += (this.targetPanY - this.panY) * lerp;
        this.zoom += (this.targetZoom - this.zoom) * lerp;

        this.applyTransform();
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    applyTransform() {
      this.world.style.transform = `
        translate3d(${this.panX.toFixed(2)}px, ${this.panY.toFixed(2)}px, 0px)
        scale3d(${this.zoom.toFixed(4)}, ${this.zoom.toFixed(4)}, ${this.zoom.toFixed(4)})
        rotateX(${this.rotX.toFixed(2)}deg)
        rotateY(${this.rotY.toFixed(2)}deg)
      `;

      if (this.viewCube) {
        this.viewCube.style.transform = `rotateX(${this.rotX.toFixed(2)}deg) rotateY(${this.rotY.toFixed(2)}deg)`;
      }
    }
  }

  // --- 3D Vector Math Helper for Exact Target Face & Overlap Calculation ---
  function getFaceNameFromNormal(nx, ny, nz) {
    // Remember: inward normal (nx, ny, nz) points INTO the cube center from that face.
    // Base square is at bottom (y = -0.5 in 3D up-coords), so its inward normal is (0, +1, 0) -> BOTTOM.
    if (ny === 1)  return 'BOTTOM';
    if (ny === -1) return 'TOP';
    if (nx === -1) return 'RIGHT';
    if (nx === 1)  return 'LEFT';
    if (nz === -1) return 'FRONT';
    if (nz === 1)  return 'BACK';
    return 'SIDE';
  }

  function stepOrientationFrame(frame, dir) {
    const { u, v, n } = frame;
    const neg = (vec) => [-vec[0], -vec[1], -vec[2]];
    switch (dir) {
      case 'east':
        return { u: [...n], v: [...v], n: neg(u) };
      case 'west':
        return { u: neg(n), v: [...v], n: [...u] };
      case 'south':
        return { u: [...u], v: [...n], n: neg(v) };
      case 'north':
        return { u: [...u], v: neg(n), n: [...v] };
      default:
        return frame;
    }
  }

  function isLightColor(hex) {
    if (!hex || hex[0] !== '#') return true;
    const c = hex.substring(1);
    const rgb = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.62;
  }

  // --- 2D Net & Kinematic 3D Folding Tree Manager ---
  class NetManager {
    constructor(treeContainerEl, slotsContainerEl, soundManager) {
      this.treeContainer = treeContainerEl;
      this.slotsContainer = slotsContainerEl;
      this.sound = soundManager;

      // Map: key "gx,gz" -> { gx, gz, color, pip }
      this.squares = new Map();
      this.baseKey = '0,0';

      // Computed BFS tree nodes ordered by stepIndex (0 = Base, 1..N-1 = Folding Steps)
      this.orderedNodes = [];
      this.nodeMap = new Map();
      this.hasOverlap = false;
      this.faceToNodes = new Map();

      // Undo / Redo stacks
      this.undoStack = [];
      this.redoStack = [];

      // Callbacks
      this.onNetChange = null;
      this.onHistoryChange = null;
      this.onCandidateClick = null;
    }

    key(gx, gz) {
      return `${gx},${gz}`;
    }

    has(gx, gz) {
      return this.squares.has(this.key(gx, gz));
    }

    get(gx, gz) {
      return this.squares.get(this.key(gx, gz));
    }

    snapshot() {
      const list = [];
      for (const sq of this.squares.values()) {
        list.push({ gx: sq.gx, gz: sq.gz, color: sq.color, pip: sq.pip });
      }
      return { baseKey: this.baseKey, list };
    }

    pushUndo(prevState) {
      this.undoStack.push(prevState);
      this.redoStack = [];
      this.notifyHistory();
    }

    addSquare(gx, gz, color = '#ffffff', pip = 1, recordUndo = true, animate = true) {
      const k = this.key(gx, gz);
      if (this.squares.has(k)) return false;
      if (this.squares.size >= MAX_SQUARES) return false;

      // Must be adjacent to an existing square if net is non-empty
      if (this.squares.size > 0 && !this.isAdjacentToExisting(gx, gz)) {
        return false;
      }

      if (recordUndo) {
        this.pushUndo(this.snapshot());
      }

      if (this.squares.size === 0) {
        this.baseKey = k;
      }

      this.squares.set(k, { gx, gz, color, pip });
      this.sound.playAdd(this.squares.size);
      this.rebuildTree(animate ? k : null);
      return true;
    }

    canRemoveSquareWithoutDisconnecting(gx, gz) {
      const k = this.key(gx, gz);
      if (!this.squares.has(k) || this.squares.size <= 1) return false;

      // Check if remaining squares form a single connected component
      const remainingKeys = [...this.squares.keys()].filter((key) => key !== k);
      const startKey = remainingKeys[0];
      const visited = new Set([startKey]);
      const queue = [startKey];

      while (queue.length > 0) {
        const curr = queue.shift();
        const [cx, cz] = curr.split(',').map(Number);
        for (const dirCfg of Object.values(DIRS_2D)) {
          const nk = this.key(cx + dirCfg.dx, cz + dirCfg.dz);
          if (nk !== k && this.squares.has(nk) && !visited.has(nk)) {
            visited.add(nk);
            queue.push(nk);
          }
        }
      }

      return visited.size === remainingKeys.length;
    }

    removeSquare(gx, gz, recordUndo = true) {
      const k = this.key(gx, gz);
      if (!this.squares.has(k)) return { ok: false, reason: 'not_found' };
      if (this.squares.size <= 1) return { ok: false, reason: 'last_square' };

      if (!this.canRemoveSquareWithoutDisconnecting(gx, gz)) {
        this.sound.playError();
        return { ok: false, reason: 'bridge_square' };
      }

      if (recordUndo) {
        this.pushUndo(this.snapshot());
      }

      this.squares.delete(k);

      // If we deleted the base square, promote an adjacent or first remaining square to Base
      if (this.baseKey === k || !this.squares.has(this.baseKey)) {
        this.baseKey = this.squares.keys().next().value;
      }

      this.sound.playDelete();
      this.rebuildTree();
      return { ok: true };
    }

    styleSquare(gx, gz, newColor, newPip, recordUndo = true) {
      const sq = this.get(gx, gz);
      if (!sq) return false;
      const resolvedPip = newPip !== null && newPip !== undefined ? newPip : sq.pip;
      const resolvedColor = newColor || sq.color;
      if (sq.color === resolvedColor && sq.pip === resolvedPip) return false;

      if (recordUndo) {
        this.pushUndo(this.snapshot());
      }

      sq.color = resolvedColor;
      sq.pip = resolvedPip;
      this.sound.playPaint();
      this.rebuildTree();
      return true;
    }

    setBaseSquare(gx, gz, recordUndo = true) {
      const k = this.key(gx, gz);
      if (!this.squares.has(k) || this.baseKey === k) return false;

      if (recordUndo) {
        this.pushUndo(this.snapshot());
      }

      this.baseKey = k;
      this.sound.playPaint();
      this.rebuildTree();
      return true;
    }

    autoAssignSum7Pips(recordUndo = true) {
      if (this.squares.size === 0) return;
      if (recordUndo) {
        this.pushUndo(this.snapshot());
      }

      // Standard opposite face pairs that sum to 7:
      // BOTTOM: 1, TOP: 6, FRONT: 2, BACK: 5, LEFT: 3, RIGHT: 4
      const standardFacePips = {
        BOTTOM: 1,
        TOP: 6,
        FRONT: 2,
        BACK: 5,
        LEFT: 3,
        RIGHT: 4,
      };

      const used = new Set();
      for (const node of this.orderedNodes) {
        const sq = this.squares.get(node.key);
        const preferred = standardFacePips[node.targetFace];
        if (preferred && !used.has(preferred)) {
          sq.pip = preferred;
          used.add(preferred);
        } else {
          // Fallback for colliding faces
          for (let p = 1; p <= 6; p++) {
            if (!used.has(p)) {
              sq.pip = p;
              used.add(p);
              break;
            }
          }
        }
      }

      this.sound.playCompleteDice();
      this.rebuildTree();
    }

    loadState(stateObj, recordUndo = true) {
      if (recordUndo && this.squares.size > 0) {
        this.pushUndo(this.snapshot());
      }

      this.squares.clear();
      const list = Array.isArray(stateObj) ? stateObj : (stateObj.list || []);
      list.slice(0, MAX_SQUARES).forEach((item, idx) => {
        const gx = Number(item.gx ?? item.x ?? 0);
        const gz = Number(item.gz ?? item.z ?? 0);
        const color = item.color || AUTO_SQUARE_COLORS[idx % AUTO_SQUARE_COLORS.length];
        const pip = item.pip !== undefined ? Number(item.pip) : ((idx % 6) + 1);
        this.squares.set(this.key(gx, gz), { gx, gz, color, pip });
      });

      if (stateObj.baseKey && this.squares.has(stateObj.baseKey)) {
        this.baseKey = stateObj.baseKey;
      } else if (this.squares.size > 0) {
        this.baseKey = this.squares.keys().next().value;
      }

      this.rebuildTree();
    }

    undo() {
      if (this.undoStack.length === 0) return false;
      const prev = this.undoStack.pop();
      this.redoStack.push(this.snapshot());
      this.loadState(prev, false);
      this.notifyHistory();
      return true;
    }

    redo() {
      if (this.redoStack.length === 0) return false;
      const next = this.redoStack.pop();
      this.undoStack.push(this.snapshot());
      this.loadState(next, false);
      this.notifyHistory();
      return true;
    }

    notifyHistory() {
      if (this.onHistoryChange) {
        this.onHistoryChange(this.undoStack.length > 0, this.redoStack.length > 0);
      }
    }

    isAdjacentToExisting(gx, gz) {
      for (const dirCfg of Object.values(DIRS_2D)) {
        if (this.has(gx + dirCfg.dx, gz + dirCfg.dz)) return true;
      }
      return false;
    }

    getCandidateSlots() {
      if (this.squares.size >= MAX_SQUARES) return [];
      const candidates = new Map();

      for (const sq of this.squares.values()) {
        for (const [dirName, cfg] of Object.entries(DIRS_2D)) {
          const nx = sq.gx + cfg.dx;
          const nz = sq.gz + cfg.dz;
          const nk = this.key(nx, nz);
          if (!this.squares.has(nk) && !candidates.has(nk)) {
            candidates.set(nk, { gx: nx, gz: nz, fromKey: this.key(sq.gx, sq.gz), dir: dirName });
          }
        }
      }
      return [...candidates.values()];
    }

    // Build BFS Spanning Tree from baseKey and construct nested 3D DOM elements
    rebuildTree(newlyAddedKey = null) {
      this.treeContainer.innerHTML = '';
      this.slotsContainer.innerHTML = '';
      this.orderedNodes = [];
      this.nodeMap.clear();
      this.faceToNodes.clear();
      this.hasOverlap = false;

      if (this.squares.size === 0) {
        if (this.onNetChange) this.onNetChange();
        return;
      }

      if (!this.squares.has(this.baseKey)) {
        this.baseKey = this.squares.keys().next().value;
      }

      // BFS traversal from Base Square
      const visited = new Set([this.baseKey]);
      const queue = [
        {
          key: this.baseKey,
          parentKey: null,
          dir: null,
          frame: { u: [1, 0, 0], v: [0, 0, 1], n: [0, 1, 0] },
        },
      ];

      const dirPriority = ['north', 'south', 'west', 'east'];

      while (queue.length > 0) {
        const item = queue.shift();
        const sq = this.squares.get(item.key);
        const stepIndex = this.orderedNodes.length; // 0 for Base, 1..N-1 for folding steps
        const targetFace = getFaceNameFromNormal(item.frame.n[0], item.frame.n[1], item.frame.n[2]);

        const node = {
          key: item.key,
          gx: sq.gx,
          gz: sq.gz,
          color: sq.color,
          pip: sq.pip,
          parentKey: item.parentKey,
          dir: item.dir,
          stepIndex,
          targetFace,
          frame: item.frame,
          el: null,
        };

        this.orderedNodes.push(node);
        this.nodeMap.set(node.key, node);

        if (!this.faceToNodes.has(targetFace)) {
          this.faceToNodes.set(targetFace, []);
        }
        this.faceToNodes.get(targetFace).push(node);

        // Enqueue connected neighbors
        for (const dirName of dirPriority) {
          const cfg = DIRS_2D[dirName];
          const nx = sq.gx + cfg.dx;
          const nz = sq.gz + cfg.dz;
          const nk = this.key(nx, nz);
          if (this.squares.has(nk) && !visited.has(nk)) {
            visited.add(nk);
            const nextFrame = stepOrientationFrame(item.frame, dirName);
            queue.push({
              key: nk,
              parentKey: item.key,
              dir: dirName,
              frame: nextFrame,
            });
          }
        }
      }

      // Check for 3D face collisions / overlaps
      for (const nodesOnFace of this.faceToNodes.values()) {
        if (nodesOnFace.length > 1) {
          this.hasOverlap = true;
          nodesOnFace.forEach((n) => {
            n.isColliding = true;
          });
        }
      }

      // Compute which open 2D perimeter edges zip together in 3D when folded (for Quiz Visual Hint)
      const ZIP_EDGE_COLORS = [
        '#ec4899', // E1: Pink
        '#06b6d4', // E2: Cyan
        '#8b5cf6', // E3: Purple
        '#f97316', // E4: Orange
        '#10b981', // E5: Emerald
        '#eab308', // E6: Gold
        '#3b82f6', // E7: Blue
      ];
      const openEdgesBy3DKey = new Map();

      for (const node of this.orderedNodes) {
        node.zipEdges = [];
        for (const dirName of dirPriority) {
          const cfg = DIRS_2D[dirName];
          const nx = node.gx + cfg.dx;
          const nz = node.gz + cfg.dz;
          const nk = this.key(nx, nz);
          if (!this.squares.has(nk)) {
            const adjFrame = stepOrientationFrame(node.frame, dirName);
            const adjFace = getFaceNameFromNormal(adjFrame.n[0], adjFrame.n[1], adjFrame.n[2]);
            const edge3DKey = [node.targetFace, adjFace].sort().join('-');
            if (!openEdgesBy3DKey.has(edge3DKey)) {
              openEdgesBy3DKey.set(edge3DKey, []);
            }
            openEdgesBy3DKey.get(edge3DKey).push({ node, dirName, adjFace, edge3DKey });
          }
        }
      }

      let zipPairIdx = 0;
      this.zipEdgePairs = [];
      for (const [edge3DKey, edges] of openEdgesBy3DKey.entries()) {
        if (edges.length === 2 && edges[0].node.key !== edges[1].node.key) {
          const color = ZIP_EDGE_COLORS[zipPairIdx % ZIP_EDGE_COLORS.length];
          const tag = `E${zipPairIdx + 1}`;
          zipPairIdx++;
          edges[0].node.zipEdges.push({ dir: edges[0].dirName, tag, color, edge3DKey });
          edges[1].node.zipEdges.push({ dir: edges[1].dirName, tag, color, edge3DKey });
          this.zipEdgePairs.push({
            tag,
            color,
            nodeA: edges[0].node,
            nodeB: edges[1].node,
          });
        }
      }

      // Create nested 3D DOM hierarchy
      for (const node of this.orderedNodes) {
        const el = this.createSquareNodeDOM(node, node.key === newlyAddedKey);
        node.el = el;

        if (node.parentKey === null) {
          this.treeContainer.appendChild(el);
        } else {
          const parentNode = this.nodeMap.get(node.parentKey);
          if (parentNode && parentNode.el) {
            parentNode.el.appendChild(el);
          }
        }
      }

      // Render 2D candidate "+" slots around perimeter
      this.renderCandidateSlots();

      // Apply initial flat transform (angles = 0)
      this.applyFoldAngles(0);

      if (this.onNetChange) {
        this.onNetChange();
      }
    }

    createSquareNodeDOM(node, animateSpawn = false) {
      const nodeEl = document.createElement('div');
      nodeEl.className = 'square-node' + (node.stepIndex === 0 ? ' is-base-node' : '');
      if (node.isColliding) {
        nodeEl.classList.add('collision-warning');
      }
      nodeEl.dataset.key = node.key;
      nodeEl.dataset.gx = node.gx;
      nodeEl.dataset.gz = node.gz;
      nodeEl.dataset.stepIndex = node.stepIndex;
      nodeEl.dataset.targetFace = node.targetFace;
      if (node.dir) {
        nodeEl.dataset.dir = node.dir;
      }

      // Hinge Crease visual line along parent-child shared edge
      if (node.dir) {
        const crease = document.createElement('div');
        crease.className = 'hinge-crease';
        nodeEl.appendChild(crease);
      }

      const tileEl = document.createElement('div');
      tileEl.className = 'square-tile' + (animateSpawn ? ' spawn-anim' : '');
      tileEl.dataset.key = node.key;
      tileEl.dataset.gx = node.gx;
      tileEl.dataset.gz = node.gz;
      tileEl.style.setProperty('--sq-color', node.color);

      const lightBg = isLightColor(node.color);
      tileEl.style.setProperty('--symbol-color', lightBg ? '#0f172a' : '#f8fafc');

      // Opposite Pair Group styling for Quiz Mode Opposite-Pairs Hint
      const oppGroupMap = {
        TOP:    { label: 'OPP A', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.22)' },
        BOTTOM: { label: 'OPP A', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.22)' },
        FRONT:  { label: 'OPP B', color: '#059669', bg: 'rgba(5, 150, 105, 0.22)' },
        BACK:   { label: 'OPP B', color: '#059669', bg: 'rgba(5, 150, 105, 0.22)' },
        LEFT:   { label: 'OPP C', color: '#d97706', bg: 'rgba(217, 119, 6, 0.22)' },
        RIGHT:  { label: 'OPP C', color: '#d97706', bg: 'rgba(217, 119, 6, 0.22)' },
      };
      const oppCfg = oppGroupMap[node.targetFace] || oppGroupMap.TOP;
      tileEl.style.setProperty('--opp-color', oppCfg.color);
      tileEl.style.setProperty('--opp-bg', oppCfg.bg);

      const symCfg = getSymbolConfig(node.pip);

      // Build both Inner (+Z) and Outer (-Z) faces so symbols & badges are visible from both sides
      ['tile-inner', 'tile-outer'].forEach((faceClass) => {
        const faceEl = document.createElement('div');
        faceEl.className = `tile-face ${faceClass}`;

        // Top-left badge: Base or Step #
        const stepBadge = document.createElement('span');
        if (node.stepIndex === 0) {
          stepBadge.className = 'step-order-badge base-badge';
          stepBadge.textContent = '⚓ BASE';
        } else {
          stepBadge.className = 'step-order-badge';
          stepBadge.textContent = `#${node.stepIndex}`;
        }
        faceEl.appendChild(stepBadge);

        // Top-right Opposite Pair badge (shown when Opposite Pairs hint is active)
        const oppBadge = document.createElement('span');
        oppBadge.className = 'opp-pair-badge';
        oppBadge.textContent = oppCfg.label;
        faceEl.appendChild(oppBadge);

        // Open Perimeter Zip Edge Bars (shown when Zip Edges hint is active)
        if (node.zipEdges && node.zipEdges.length > 0) {
          node.zipEdges.forEach((z) => {
            const edgeBar = document.createElement('div');
            edgeBar.className = `zip-edge-bar edge-${z.dir}`;
            edgeBar.style.setProperty('--edge-color', z.color);
            const tagSpan = document.createElement('span');
            tagSpan.className = 'zip-edge-tag';
            tagSpan.textContent = z.tag;
            edgeBar.appendChild(tagSpan);
            faceEl.appendChild(edgeBar);
          });
        }

        // Center Geometric Die Symbol SVG (+, □, ■, ○, ●, ⚃)
        if (symCfg.svg) {
          const symWrap = document.createElement('div');
          symWrap.className = 'face-symbol-wrap';
          symWrap.dataset.symbolId = symCfg.id;
          symWrap.innerHTML = symCfg.svg;
          faceEl.appendChild(symWrap);
        }

        // Bottom Target 3D Face Badge
        const targetBadge = document.createElement('span');
        if (node.isColliding) {
          targetBadge.className = 'target-face-badge overlap-badge';
          targetBadge.textContent = `⚠️ ${node.targetFace}`;
        } else {
          targetBadge.className = 'target-face-badge';
          targetBadge.textContent = node.targetFace;
        }
        faceEl.appendChild(targetBadge);

        tileEl.appendChild(faceEl);
      });

      nodeEl.appendChild(tileEl);
      return nodeEl;
    }

    renderCandidateSlots() {
      this.slotsContainer.innerHTML = '';
      const slots = this.getCandidateSlots();

      slots.forEach((slot) => {
        const slotEl = document.createElement('div');
        slotEl.className = 'candidate-slot';
        slotEl.dataset.gx = slot.gx;
        slotEl.dataset.gz = slot.gz;
        slotEl.title = `Click to add Square #${this.squares.size + 1} here`;

        const px = slot.gx * SQUARE_SIZE - HALF_SIZE;
        const py = HALF_SIZE;
        const pz = slot.gz * SQUARE_SIZE - HALF_SIZE;
        slotEl.style.transform = `translate3d(${px}px, ${py}px, ${pz}px) rotateX(90deg)`;

        const plus = document.createElement('div');
        plus.className = 'slot-plus';
        plus.textContent = '+';
        slotEl.appendChild(plus);

        slotEl.addEventListener('pointerup', (e) => {
          if (e.button !== 0) return;
          if (this.onCandidateClick) {
            this.onCandidateClick(slot.gx, slot.gz, e);
          }
        });

        this.slotsContainer.appendChild(slotEl);
      });
    }

    // Apply continuous fold progress (0 .. totalSteps) to every node in the kinematic tree
    applyFoldAngles(foldProgress, activeStepHighlight = null) {
      for (const node of this.orderedNodes) {
        if (!node.el) continue;

        if (node.stepIndex === 0) {
          // Root / Base Square sits flat on the ground plane at Y = +HALF_SIZE
          const px = node.gx * SQUARE_SIZE - HALF_SIZE;
          const py = HALF_SIZE;
          const pz = node.gz * SQUARE_SIZE - HALF_SIZE;
          node.el.style.transformOrigin = '0px 0px 0px';
          node.el.style.transform = `translate3d(${px}px, ${py}px, ${pz}px) rotateX(90deg)`;
          continue;
        }

        // Compute local progress t in [0, 1] for this stepIndex (1..N-1)
        const rawT = Math.max(0, Math.min(1, foldProgress - (node.stepIndex - 1)));
        // Smooth ease-in-out cubic curve within each step
        const easedT = rawT < 0.5
          ? 4 * rawT * rawT * rawT
          : 1 - Math.pow(-2 * rawT + 2, 3) / 2;
        const theta = easedT * 90;

        // Highlight the square if it's currently in motion or selected
        const isActivelyMoving = (rawT > 0.01 && rawT < 0.99) || activeStepHighlight === node.stepIndex;
        node.el.classList.toggle('active-folding', isActivelyMoving);

        // Apply exact kinematic hinge transform relative to parent square
        const S = SQUARE_SIZE;
        switch (node.dir) {
          case 'east':
            node.el.style.transformOrigin = '0px 0px 0px';
            node.el.style.transform = `translate3d(${S}px, 0px, 0px) rotateY(${-theta.toFixed(2)}deg)`;
            break;
          case 'west':
            node.el.style.transformOrigin = `${S}px 0px 0px`;
            node.el.style.transform = `translate3d(${-S}px, 0px, 0px) rotateY(${theta.toFixed(2)}deg)`;
            break;
          case 'south':
            node.el.style.transformOrigin = '0px 0px 0px';
            node.el.style.transform = `translate3d(0px, ${S}px, 0px) rotateX(${theta.toFixed(2)}deg)`;
            break;
          case 'north':
            node.el.style.transformOrigin = `0px ${S}px 0px`;
            node.el.style.transform = `translate3d(0px, ${-S}px, 0px) rotateX(${-theta.toFixed(2)}deg)`;
            break;
        }
      }
    }

    getBounds(isFolded = false) {
      if (this.squares.size === 0) {
        return { centerX: 0, centerY: 0, centerZ: 0 };
      }

      if (isFolded) {
        // When folded into a 3D cube, the cube is centered right above the Base Square!
        const baseNode = this.orderedNodes[0];
        return {
          centerX: baseNode.gx * SQUARE_SIZE,
          centerY: 0,
          centerZ: baseNode.gz * SQUARE_SIZE,
        };
      }

      let minX = Infinity, maxX = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;
      for (const sq of this.squares.values()) {
        if (sq.gx < minX) minX = sq.gx;
        if (sq.gx > maxX) maxX = sq.gx;
        if (sq.gz < minZ) minZ = sq.gz;
        if (sq.gz > maxZ) maxZ = sq.gz;
      }

      return {
        centerX: ((minX + maxX) / 2) * SQUARE_SIZE,
        centerY: 0,
        centerZ: ((minZ + maxZ) / 2) * SQUARE_SIZE,
      };
    }
  }

  // --- Main Application Controller ---
  class App {
    constructor() {
      this.viewport = document.getElementById('viewport');
      this.world = document.getElementById('world');
      this.treeContainer = document.getElementById('net-tree-container');
      this.slotsContainer = document.getElementById('candidate-slots-container');

      // UI Elements
      this.squareCountEl = document.getElementById('square-count');
      this.netStatusBadge = document.getElementById('net-status-badge');
      this.netStatusText = document.getElementById('net-status-text');
      this.zoomIndicator = document.getElementById('zoom-indicator');
      this.btnUndo = document.getElementById('btn-undo');
      this.btnRedo = document.getElementById('btn-redo');
      this.btnSymbols = document.getElementById('btn-symbols');
      this.btnFaceLabels = document.getElementById('btn-face-labels');
      this.btnXray = document.getElementById('btn-xray');
      this.btnSound = document.getElementById('btn-sound');
      this.soundIconOn = document.getElementById('sound-icon-on');
      this.soundIconOff = document.getElementById('sound-icon-off');

      this.archBanner = document.getElementById('arch-banner');
      this.archBannerTitle = document.getElementById('arch-banner-title');
      this.btnExitArch = document.getElementById('btn-exit-arch');

      // Folding Controller Elements
      this.foldStageBadge = document.getElementById('fold-stage-badge');
      this.foldStepTitle = document.getElementById('fold-step-title');
      this.stepPillsContainer = document.getElementById('step-pills-container');
      this.foldSlider = document.getElementById('fold-progress-slider');
      this.btnUnfoldAll = document.getElementById('btn-unfold-all');
      this.btnStepBackward = document.getElementById('btn-step-backward');
      this.btnStepForward = document.getElementById('btn-step-forward');
      this.btnAutoFold = document.getElementById('btn-auto-fold');
      this.btnAutoFoldLabel = document.getElementById('btn-auto-fold-label');

      // Quiz Mode Elements
      this.btnQuizMode = document.getElementById('btn-quiz-mode');
      this.quizSidebar = document.getElementById('quiz-sidebar');
      this.builderSidebar = document.getElementById('builder-sidebar');
      this.quizScorePill = document.getElementById('quiz-score-pill');
      this.quizStreakPill = document.getElementById('quiz-streak-pill');
      this.btnExitQuiz = document.getElementById('btn-exit-quiz');
      this.quizOptionsGrid = document.getElementById('quiz-options-grid');
      this.quizFeedbackBox = document.getElementById('quiz-feedback-box');
      this.quizFeedbackTitle = document.getElementById('quiz-feedback-title');
      this.quizFeedbackDesc = document.getElementById('quiz-feedback-desc');
      this.btnQuizProgressiveHint = document.getElementById('btn-quiz-progressive-hint');
      this.btnHintCorner = document.getElementById('btn-hint-corner');
      this.btnHintOpposites = document.getElementById('btn-hint-opposites');
      this.btnHintEdges = document.getElementById('btn-hint-edges');
      this.btnHintEliminate = document.getElementById('btn-hint-eliminate');
      this.quizHintInfo = document.getElementById('quiz-hint-info');
      this.btnNextQuestion = document.getElementById('btn-next-question');

      // State
      this.currentMode = 'add'; // 'add', 'delete', 'paint', 'anchor'
      this.currentColor = PALETTE_COLORS[0]; // Crisp white (#ffffff) for high-contrast black symbols
      this.isAutoColor = false;
      this.selectedPipMode = 'auto'; // 'auto' or 0..6 (symbol ID)

      // Quiz State
      this.isQuizMode = false;
      this.quizScore = 0;
      this.quizTotal = 0;
      this.quizStreak = 0;
      this.quizSolvedCurrent = false;
      this.currentQuizOptions = [];
      this.currentQuizFaceMap = {};
      this.currentQuizCorner = null;
      this.eliminatedOptionIndices = new Set();

      // Folding Animation State
      this.foldProgress = 0;       // Current continuous step value in [0, totalSteps]
      this.targetFoldProgress = 0; // Target step value
      this.isAutoPlaying = false;
      this.autoPlayDirection = 1;  // +1 folding in, -1 unfolding out
      this.stepPauseTimer = null;
      this.foldSpeed = 'slow';     // 'slow', 'normal', 'fast'
      this.hoveredStepIndex = null;

      // Subsystems
      this.sound = new SoundManager();
      this.net = new NetManager(this.treeContainer, this.slotsContainer, this.sound);
      this.camera = new CameraController(this.viewport, this.world, (cam) => {
        this.zoomIndicator.textContent = Math.round(cam.targetZoom * 100) + '%';
      });

      this.init();
    }

    init() {
      document.body.dataset.activeMode = this.currentMode;

      this.net.onNetChange = () => {
        // Clamp fold progress if square count decreased
        const maxSteps = this.getTotalSteps();
        if (this.foldProgress > maxSteps) {
          this.foldProgress = maxSteps;
          this.targetFoldProgress = maxSteps;
        }
        this.updateNetStatusUI();
        this.renderStepPills();
        this.updateFoldControlsUI();
        this.updateCompassPositions();
      };

      this.net.onHistoryChange = (canUndo, canRedo) => {
        this.btnUndo.disabled = !canUndo;
        this.btnRedo.disabled = !canRedo;
      };

      this.net.onCandidateClick = (gx, gz) => {
        if (this.camera.hasDragged || this.isQuizMode) return;
        this.handleAddSquareAt(gx, gz);
      };

      this.camera.onProjectionChange = (mode) => {
        if (mode === 'perspective') {
          this.archBanner.classList.add('hidden');
          const activePill = document.querySelector('.pill-btn.active');
          if (activePill && activePill.dataset.view !== 'iso') {
            document.querySelectorAll('.pill-btn').forEach((p) => p.classList.remove('active'));
            const isoPill = document.querySelector('.pill-btn[data-view="iso"]');
            if (isoPill) isoPill.classList.add('active');
          }
        }
      };

      this.setupPaletteAndPips();
      this.setupToolButtons();
      this.setupFoldingControls();
      this.setupQuizControls();
      this.setupCameraButtons();
      this.setupPresets();
      this.setupExportImport();
      this.setupSquareInteractions();
      this.setupKeyboardShortcuts();
      this.setupHelpModal();
      this.setupDirectionIndicators();
      this.startFoldingAnimationLoop();

      // Check URL parameters (e.g., ?preset=cross or ?quiz=1)
      const params = new URLSearchParams(window.location.search);
      const presetParam = params.get('preset');
      const quizParam = params.get('quiz');

      if (quizParam) {
        this.setQuizMode(true);
      } else if (presetParam && this.presets && this.presets[presetParam]) {
        this.loadPreset(presetParam);
      } else {
        // Start with 1 white square with the Plus (+) symbol on the 2D surface
        this.net.addSquare(0, 0, '#ffffff', 1, false, false);
        this.camera.resetView(this.net.getBounds(false));
      }
    }

    getTotalSteps() {
      return Math.max(0, this.net.orderedNodes.length - 1);
    }

    getNextAutoColor() {
      const idx = this.net.squares.size % AUTO_SQUARE_COLORS.length;
      return AUTO_SQUARE_COLORS[idx];
    }

    getNextAutoPip() {
      // Pick the lowest unused symbol ID in 1..6
      const used = new Set();
      for (const sq of this.net.squares.values()) {
        used.add(sq.pip);
      }
      for (let p = 1; p <= 6; p++) {
        if (!used.has(p)) return p;
      }
      return (this.net.squares.size % 6) + 1;
    }

    handleAddSquareAt(gx, gz) {
      if (this.net.squares.size >= MAX_SQUARES) return;
      const color = this.isAutoColor ? this.getNextAutoColor() : this.currentColor;
      const pip = this.selectedPipMode === 'auto' ? this.getNextAutoPip() : Number(this.selectedPipMode);
      const added = this.net.addSquare(gx, gz, color, pip, true, true);
      if (added) {
        // Gently recenter camera pan to keep the growing 2D net centered
        const bounds = this.net.getBounds(false);
        this.camera.targetPanX = -bounds.centerX;
        this.camera.targetPanY = -bounds.centerY;
      }
    }

    updateNetStatusUI() {
      const count = this.net.squares.size;
      this.squareCountEl.textContent = `${count} / ${MAX_SQUARES}`;

      this.netStatusBadge.classList.remove('status-valid', 'status-invalid');

      if (this.net.hasOverlap) {
        this.netStatusBadge.classList.add('status-invalid');
        this.netStatusText.textContent = '⚠️ Overlap! Two squares fold to the same 3D face';
      } else if (count === MAX_SQUARES) {
        this.netStatusBadge.classList.add('status-valid');
        this.netStatusText.textContent = '✅ Valid 6-Square Dice Net! Ready to fold into 3D';
      } else {
        const remaining = MAX_SQUARES - count;
        this.netStatusText.textContent = `Add ${remaining} more square${remaining > 1 ? 's' : ''} for a 6-sided dice`;
      }
    }

    // --- Step-by-Step Folding Controls & Animation Loop ---
    setupFoldingControls() {
      // Speed buttons
      document.querySelectorAll('.speed-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.speed-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.foldSpeed = btn.dataset.speed;
        });
      });

      // Flatten 2D (Unfold All)
      this.btnUnfoldAll.addEventListener('click', () => {
        this.stopAutoPlay();
        if (this.foldProgress > 0) {
          this.sound.playFoldStep(1, false);
        }
        this.targetFoldProgress = 0;
      });

      // Fold Out Step (Step - 1)
      this.btnStepBackward.addEventListener('click', () => {
        this.stopAutoPlay();
        this.stepBackwardOne();
      });

      // Fold Next Step (Step + 1)
      this.btnStepForward.addEventListener('click', () => {
        this.stopAutoPlay();
        this.stepForwardOne();
      });

      // Auto Fold / Unfold All Sequentially
      this.btnAutoFold.addEventListener('click', () => {
        if (this.isAutoPlaying) {
          this.stopAutoPlay();
          return;
        }
        const totalSteps = this.getTotalSteps();
        if (totalSteps === 0) return;

        // If already folded at max step, Auto Fold will unfold step-by-step back to 2D!
        if (this.foldProgress >= totalSteps - 0.02) {
          this.startAutoPlay(-1);
        } else {
          this.startAutoPlay(1);
        }
      });

      // Continuous Scrub Slider
      this.foldSlider.addEventListener('input', (e) => {
        this.stopAutoPlay();
        const totalSteps = this.getTotalSteps();
        if (totalSteps === 0) {
          this.foldProgress = 0;
          this.targetFoldProgress = 0;
          return;
        }
        const val = Number(e.target.value) / 100;
        this.foldProgress = Math.max(0, Math.min(totalSteps, val));
        this.targetFoldProgress = this.foldProgress;
        this.net.applyFoldAngles(this.foldProgress);
        this.updateFoldControlsUI();
      });
    }

    stepForwardOne() {
      const totalSteps = this.getTotalSteps();
      if (totalSteps === 0) return;

      // Advance to the next integer step
      const currentInt = Math.floor(this.targetFoldProgress + 0.05);
      const nextStep = Math.min(totalSteps, currentInt + 1);
      if (nextStep > this.targetFoldProgress) {
        this.targetFoldProgress = nextStep;
        this.sound.playFoldStep(nextStep, true);
      }
    }

    stepBackwardOne() {
      const totalSteps = this.getTotalSteps();
      if (totalSteps === 0) return;

      const currentInt = Math.ceil(this.targetFoldProgress - 0.05);
      const prevStep = Math.max(0, currentInt - 1);
      if (prevStep < this.targetFoldProgress) {
        this.sound.playFoldStep(currentInt, false);
        this.targetFoldProgress = prevStep;
      }
    }

    startAutoPlay(direction = 1) {
      const totalSteps = this.getTotalSteps();
      if (totalSteps === 0) return;

      this.isAutoPlaying = true;
      this.autoPlayDirection = direction;
      this.btnAutoFold.classList.add('playing');

      // Trigger first step immediately
      if (direction > 0) {
        const nextStep = Math.min(totalSteps, Math.floor(this.foldProgress + 0.02) + 1);
        this.targetFoldProgress = nextStep;
        this.sound.playFoldStep(nextStep, true);
      } else {
        const prevStep = Math.max(0, Math.ceil(this.foldProgress - 0.02) - 1);
        this.targetFoldProgress = prevStep;
        this.sound.playFoldStep(prevStep + 1, false);
      }
      this.updateFoldControlsUI();
    }

    stopAutoPlay() {
      this.isAutoPlaying = false;
      if (this.stepPauseTimer) {
        clearTimeout(this.stepPauseTimer);
        this.stepPauseTimer = null;
      }
      this.btnAutoFold.classList.remove('playing');
      this.updateFoldControlsUI();
    }

    getStepSpeedPerFrame() {
      switch (this.foldSpeed) {
        case 'slow':   return 0.0145;
        case 'normal': return 0.025;
        case 'fast':   return 0.052;
        default:       return 0.016;
      }
    }

    startFoldingAnimationLoop() {
      let lastTime = performance.now();

      const tick = (now) => {
        const dt = Math.min(50, now - lastTime);
        lastTime = now;
        const frameScale = dt / 16.667;

        const diff = this.targetFoldProgress - this.foldProgress;
        if (Math.abs(diff) > 0.0005) {
          const stepDelta = this.getStepSpeedPerFrame() * frameScale;
          if (Math.abs(diff) <= stepDelta) {
            const prevProgress = this.foldProgress;
            this.foldProgress = this.targetFoldProgress;

            // Check if we just finished folding into a complete 6-square valid 3D dice!
            const totalSteps = this.getTotalSteps();
            if (
              totalSteps === MAX_SQUARES - 1 &&
              prevProgress < totalSteps &&
              this.foldProgress === totalSteps &&
              !this.net.hasOverlap
            ) {
              this.sound.playCompleteDice();
            }

            // If auto-playing, queue the next step after a brief educational pause
            if (this.isAutoPlaying && !this.stepPauseTimer) {
              if (this.autoPlayDirection > 0 && this.foldProgress < totalSteps) {
                this.stepPauseTimer = setTimeout(() => {
                  this.stepPauseTimer = null;
                  if (!this.isAutoPlaying) return;
                  const next = Math.min(totalSteps, Math.round(this.foldProgress) + 1);
                  this.targetFoldProgress = next;
                  this.sound.playFoldStep(next, true);
                }, 220);
              } else if (this.autoPlayDirection < 0 && this.foldProgress > 0) {
                this.stepPauseTimer = setTimeout(() => {
                  this.stepPauseTimer = null;
                  if (!this.isAutoPlaying) return;
                  const prev = Math.max(0, Math.round(this.foldProgress) - 1);
                  this.sound.playFoldStep(Math.round(this.foldProgress), false);
                  this.targetFoldProgress = prev;
                }, 220);
              } else {
                this.stopAutoPlay();
              }
            }
          } else {
            this.foldProgress += Math.sign(diff) * stepDelta;
          }

          this.net.applyFoldAngles(this.foldProgress, this.hoveredStepIndex);
          this.updateFoldControlsUI();
        } else if (this.hoveredStepIndex !== null) {
          this.net.applyFoldAngles(this.foldProgress, this.hoveredStepIndex);
        }

        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    }

    renderStepPills() {
      this.stepPillsContainer.innerHTML = '';
      const totalSteps = this.getTotalSteps();

      this.foldSlider.max = Math.max(100, totalSteps * 100);
      this.foldSlider.disabled = totalSteps === 0;

      // Step 0 pill (2D Flat)
      const pill0 = document.createElement('button');
      pill0.className = 'step-pill';
      pill0.dataset.step = 0;
      pill0.textContent = '0: 2D Flat';
      pill0.title = 'Step 0: Unfolded flat on 2D surface';
      pill0.addEventListener('click', () => {
        this.stopAutoPlay();
        this.targetFoldProgress = 0;
      });
      this.stepPillsContainer.appendChild(pill0);

      // Step 1..N-1 pills (one for each folding square)
      for (let i = 1; i <= totalSteps; i++) {
        const node = this.net.orderedNodes[i];
        const symShort = getSymbolConfig(node.pip).short;
        const pill = document.createElement('button');
        pill.className = 'step-pill';
        pill.dataset.step = i;
        pill.textContent = `Step ${i} (${symShort} → ${node.targetFace})`;
        pill.title = `Fold Square #${i} (${getSymbolConfig(node.pip).name}) into ${node.targetFace} face (90°)`;

        pill.addEventListener('click', () => {
          this.stopAutoPlay();
          const goingUp = i > this.foldProgress;
          this.targetFoldProgress = i;
          this.sound.playFoldStep(i, goingUp);
        });

        pill.addEventListener('pointerenter', () => {
          this.hoveredStepIndex = i;
          this.net.applyFoldAngles(this.foldProgress, i);
        });

        pill.addEventListener('pointerleave', () => {
          this.hoveredStepIndex = null;
          this.net.applyFoldAngles(this.foldProgress, null);
        });

        this.stepPillsContainer.appendChild(pill);
      }
    }

    updateFoldControlsUI() {
      const totalSteps = this.getTotalSteps();
      const progress = this.foldProgress;
      const roundedStep = Math.round(progress);

      // Hide candidate slots when net is folded (progress > 0.01)
      this.viewport.classList.toggle('is-folded', progress > 0.01);

      // Update slider position
      this.foldSlider.value = Math.round(progress * 100);

      // Update Step Pills active/completed state
      this.stepPillsContainer.querySelectorAll('.step-pill').forEach((pill) => {
        const s = Number(pill.dataset.step);
        pill.classList.toggle('current', s === roundedStep);
        pill.classList.toggle('completed', s > 0 && s < roundedStep);
      });

      // Update Stage Badge & Step Description Title
      this.foldStageBadge.classList.remove('stage-folding', 'stage-3d');
      if (totalSteps === 0) {
        this.foldStageBadge.textContent = '2D SURFACE';
        this.foldStepTitle.textContent = 'Click any + slot on the 2D surface to add squares (up to 6)';
      } else if (progress <= 0.01) {
        this.foldStageBadge.textContent = '2D SURFACE';
        this.foldStepTitle.textContent = `Step 0 of ${totalSteps} — Flat 2D Net (${this.net.squares.size} squares)`;
      } else if (progress >= totalSteps - 0.01) {
        this.foldStageBadge.classList.add('stage-3d');
        this.foldStageBadge.textContent = this.net.squares.size === 6 && !this.net.hasOverlap ? '🎲 3D DICE' : '3D SHAPE';
        this.foldStepTitle.textContent = `Step ${totalSteps} of ${totalSteps} — All ${totalSteps} hinges folded 90° into 3D!`;
      } else {
        this.foldStageBadge.classList.add('stage-folding');
        this.foldStageBadge.textContent = 'FOLDING 3D';
        const activeIdx = Math.min(totalSteps, Math.floor(progress) + 1);
        const activeNode = this.net.orderedNodes[activeIdx];
        const localDeg = Math.round(((progress - (activeIdx - 1)) % 1 || 1) * 90);
        if (Math.abs(progress - roundedStep) < 0.02) {
          const doneNode = this.net.orderedNodes[roundedStep];
          const doneSym = getSymbolConfig(doneNode.pip).name;
          this.foldStepTitle.textContent = `Step ${roundedStep} of ${totalSteps} — ${doneSym} folded to ${doneNode.targetFace} (90°)`;
        } else if (activeNode) {
          const actSym = getSymbolConfig(activeNode.pip).name;
          this.foldStepTitle.textContent = `Step ${activeIdx} of ${totalSteps} — Folding ${actSym} → ${activeNode.targetFace} (${localDeg}°)`;
        }
      }

      // Enable / Disable buttons
      this.btnUnfoldAll.disabled = totalSteps === 0 || progress <= 0.005;
      this.btnStepBackward.disabled = totalSteps === 0 || progress <= 0.005;
      this.btnStepForward.disabled = totalSteps === 0 || progress >= totalSteps - 0.005;
      this.btnAutoFold.disabled = totalSteps === 0;

      if (this.isAutoPlaying) {
        this.btnAutoFoldLabel.textContent = 'Pause';
      } else if (totalSteps > 0 && progress >= totalSteps - 0.02) {
        this.btnAutoFoldLabel.textContent = 'Auto Fold Out';
      } else {
        this.btnAutoFoldLabel.textContent = 'Auto Fold 3D';
      }
    }

    // --- Spatial Reasoning Quiz Mode & Non-Folding 2D Visual Hints ---
    setupQuizControls() {
      if (this.btnQuizMode) {
        this.btnQuizMode.addEventListener('click', () => {
          this.setQuizMode(!this.isQuizMode);
        });
      }

      if (this.btnExitQuiz) {
        this.btnExitQuiz.addEventListener('click', () => {
          this.setQuizMode(false);
        });
      }

      if (this.btnHintCorner) {
        this.btnHintCorner.addEventListener('click', () => {
          this.toggleQuizVisualHint('corner');
        });
      }

      if (this.btnHintOpposites) {
        this.btnHintOpposites.addEventListener('click', () => {
          this.toggleQuizVisualHint('opposites');
        });
      }

      if (this.btnHintEdges) {
        this.btnHintEdges.addEventListener('click', () => {
          this.toggleQuizVisualHint('edges');
        });
      }

      if (this.btnHintEliminate) {
        this.btnHintEliminate.addEventListener('click', () => {
          this.triggerEliminateOneHint();
        });
      }

      if (this.btnQuizProgressiveHint) {
        this.btnQuizProgressiveHint.addEventListener('click', () => {
          this.triggerProgressiveQuizHint();
        });
      }

      if (this.btnNextQuestion) {
        this.btnNextQuestion.addEventListener('click', () => {
          this.generateQuizQuestion();
        });
      }
    }

    clearQuizVisualHints() {
      document.body.classList.remove('quiz-hint-corner', 'quiz-hint-opposites', 'quiz-hint-edges');
      if (this.btnHintCorner) this.btnHintCorner.classList.remove('active');
      if (this.btnHintOpposites) this.btnHintOpposites.classList.remove('active');
      if (this.btnHintEdges) this.btnHintEdges.classList.remove('active');
      if (this.btnHintEliminate) {
        this.btnHintEliminate.classList.remove('active');
        this.btnHintEliminate.disabled = false;
      }
      if (this.quizHintInfo) {
        this.quizHintInfo.classList.add('hidden');
        this.quizHintInfo.innerHTML = '';
      }
      this.eliminatedOptionIndices.clear();
    }

    findEdgeDirTowardFace(node, targetFaceName) {
      for (const dirName of ['north', 'south', 'west', 'east']) {
        const adjFrame = stepOrientationFrame(node.frame, dirName);
        const adjFace = getFaceNameFromNormal(adjFrame.n[0], adjFrame.n[1], adjFrame.n[2]);
        if (adjFace === targetFaceName) return dirName;
      }
      return null;
    }

    getVertexFromDirs(dir1, dir2) {
      const set = new Set([dir1, dir2]);
      if (set.has('north') && set.has('west')) return 'nw';
      if (set.has('north') && set.has('east')) return 'ne';
      if (set.has('south') && set.has('west')) return 'sw';
      if (set.has('south') && set.has('east')) return 'se';
      return null;
    }

    applyQuizCornerDecorations(T, FL, FR) {
      // Remove any existing corner hint lines/vertices
      this.treeContainer.querySelectorAll('.corner-hint-line, .corner-hint-vertex').forEach((el) => el.remove());

      const fm = this.currentQuizFaceMap;
      const nodeT = fm[T]?.node;
      const nodeFL = fm[FL]?.node;
      const nodeFR = fm[FR]?.node;
      if (!nodeT || !nodeFL || !nodeFR) return;

      // 3 directional lines meeting at the corner:
      // Direction 1 (Cyan #06b6d4): Top <-> Front-Left edge
      // Direction 2 (Amber #f59e0b): Top <-> Front-Right edge
      // Direction 3 (Pink #ec4899): Front-Left <-> Front-Right vertical edge
      const COLOR_DIR_1 = '#06b6d4'; // Cyan
      const COLOR_DIR_2 = '#f59e0b'; // Amber
      const COLOR_DIR_3 = '#ec4899'; // Pink

      const addCornerOverlayToNode = (node, dirA, colorA, dirB, colorB) => {
        if (!node || !node.el || !dirA || !dirB) return;
        const vertex = this.getVertexFromDirs(dirA, dirB);
        const faces = node.el.querySelectorAll(':scope > .square-tile > .tile-face');
        faces.forEach((faceEl) => {
          const lineA = document.createElement('div');
          lineA.className = `corner-hint-line line-${dirA}`;
          lineA.style.setProperty('--corner-line-color', colorA);
          faceEl.appendChild(lineA);

          const lineB = document.createElement('div');
          lineB.className = `corner-hint-line line-${dirB}`;
          lineB.style.setProperty('--corner-line-color', colorB);
          faceEl.appendChild(lineB);

          if (vertex) {
            const vDot = document.createElement('div');
            vDot.className = `corner-hint-vertex vertex-${vertex}`;
            faceEl.appendChild(vDot);
          }
        });
      };

      const dirT_FL = this.findEdgeDirTowardFace(nodeT, FL);
      const dirT_FR = this.findEdgeDirTowardFace(nodeT, FR);
      addCornerOverlayToNode(nodeT, dirT_FL, COLOR_DIR_1, dirT_FR, COLOR_DIR_2);

      const dirFL_T = this.findEdgeDirTowardFace(nodeFL, T);
      const dirFL_FR = this.findEdgeDirTowardFace(nodeFL, FR);
      addCornerOverlayToNode(nodeFL, dirFL_T, COLOR_DIR_1, dirFL_FR, COLOR_DIR_3);

      const dirFR_T = this.findEdgeDirTowardFace(nodeFR, T);
      const dirFR_FL = this.findEdgeDirTowardFace(nodeFR, FL);
      addCornerOverlayToNode(nodeFR, dirFR_T, COLOR_DIR_2, dirFR_FL, COLOR_DIR_3);
    }

    toggleQuizVisualHint(hintType) {
      if (!this.isQuizMode) return;
      this.sound.playPaint();

      if (hintType === 'corner') {
        const active = document.body.classList.toggle('quiz-hint-corner');
        if (this.btnHintCorner) this.btnHintCorner.classList.toggle('active', active);
        if (active) {
          this.showQuizHintMessage(
            `<strong>📐 Corner 3-Lines Hint:</strong><br>` +
            `Highlights the <strong>3 lines meeting at a 3D corner</strong> in each direction:<br>` +
            `• <span style="color:#22d3ee;font-weight:800">Cyan Line:</span> Top &harr; Left edge<br>` +
            `• <span style="color:#fbbf24;font-weight:800">Amber Line:</span> Top &harr; Right edge<br>` +
            `• <span style="color:#f472b6;font-weight:800">Pink Line:</span> Left &harr; Right vertical edge<br>` +
            `<em>The glowing dots on the 2D net fold together to form the center Y-corner on the 3D cube!</em>`
          );
        } else {
          this.refreshQuizHintInfoIfAnyActive();
        }
      } else if (hintType === 'opposites') {
        const active = document.body.classList.toggle('quiz-hint-opposites');
        if (this.btnHintOpposites) this.btnHintOpposites.classList.toggle('active', active);
        if (active) {
          const fm = this.currentQuizFaceMap;
          const pA1 = getSymbolConfig(fm.TOP?.pip).short;
          const pA2 = getSymbolConfig(fm.BOTTOM?.pip).short;
          const pB1 = getSymbolConfig(fm.FRONT?.pip).short;
          const pB2 = getSymbolConfig(fm.BACK?.pip).short;
          const pC1 = getSymbolConfig(fm.LEFT?.pip).short;
          const pC2 = getSymbolConfig(fm.RIGHT?.pip).short;
          this.showQuizHintMessage(
            `<strong>🎨 Opposite Pairs:</strong><br>` +
            `• <span style="color:#60a5fa;font-weight:800">OPP A:</span> ${pA1} &harr; ${pA2} &nbsp; ` +
            `• <span style="color:#34d399;font-weight:800">OPP B:</span> ${pB1} &harr; ${pB2} &nbsp; ` +
            `• <span style="color:#fbbf24;font-weight:800">OPP C:</span> ${pC1} &harr; ${pC2}<br>` +
            `<em>Rule: Two symbols in the same opposite pair fold to opposite sides of the die and can NEVER appear together on a 3D option!</em>`
          );
        } else {
          this.refreshQuizHintInfoIfAnyActive();
        }
      } else if (hintType === 'edges') {
        const active = document.body.classList.toggle('quiz-hint-edges');
        if (this.btnHintEdges) this.btnHintEdges.classList.toggle('active', active);
        if (active) {
          this.showQuizHintMessage(
            `<strong>🔗 Zip Edges (E1, E2, ...):</strong><br>` +
            `Open perimeter edges on the flat 2D net with the <strong>same color &amp; tag</strong> (e.g. <strong>E1 &harr; E1</strong>) zip directly together when folded into 3D!`
          );
        } else {
          this.refreshQuizHintInfoIfAnyActive();
        }
      }
    }

    triggerEliminateOneHint() {
      if (!this.isQuizMode || this.quizSolvedCurrent) return;
      const letters = ['A', 'B', 'C', 'D'];
      const candidates = [];
      this.currentQuizOptions.forEach((opt, idx) => {
        if (!opt.isCorrect && !this.eliminatedOptionIndices.has(idx)) {
          candidates.push(idx);
        }
      });

      // Allow eliminating up to 2 of the 3 wrong options
      if (candidates.length === 0 || this.eliminatedOptionIndices.size >= 2) {
        if (this.btnHintEliminate) this.btnHintEliminate.disabled = true;
        return;
      }

      const pickIdx = candidates[Math.floor(Math.random() * candidates.length)];
      this.eliminatedOptionIndices.add(pickIdx);
      this.sound.playPaint();

      const cardEl = this.quizOptionsGrid.querySelector(`.quiz-option-card[data-index="${pickIdx}"]`);
      if (cardEl) {
        cardEl.classList.add('option-eliminated');
        const statusEl = cardEl.querySelector('.quiz-option-status');
        if (statusEl) statusEl.textContent = '🚫';
      }

      if (this.btnHintEliminate) {
        this.btnHintEliminate.classList.add('active');
        if (this.eliminatedOptionIndices.size >= 2) {
          this.btnHintEliminate.disabled = true;
        }
      }

      const opt = this.currentQuizOptions[pickIdx];
      this.showQuizHintMessage(
        `<strong>❌ Eliminated Option ${letters[pickIdx]}:</strong><br>${opt.reason}`
      );
    }

    triggerProgressiveQuizHint() {
      if (!this.isQuizMode) return;
      if (!document.body.classList.contains('quiz-hint-corner')) {
        this.toggleQuizVisualHint('corner');
      } else if (!document.body.classList.contains('quiz-hint-opposites')) {
        this.toggleQuizVisualHint('opposites');
      } else if (!document.body.classList.contains('quiz-hint-edges')) {
        this.toggleQuizVisualHint('edges');
      } else if (this.eliminatedOptionIndices.size < 2 && !this.quizSolvedCurrent) {
        this.triggerEliminateOneHint();
      }
    }

    showQuizHintMessage(html) {
      if (!this.quizHintInfo) return;
      this.quizHintInfo.classList.remove('hidden');
      this.quizHintInfo.innerHTML = html;
    }

    refreshQuizHintInfoIfAnyActive() {
      if (!this.quizHintInfo) return;
      if (document.body.classList.contains('quiz-hint-corner')) {
        document.body.classList.remove('quiz-hint-corner');
        this.toggleQuizVisualHint('corner');
      } else if (document.body.classList.contains('quiz-hint-opposites')) {
        document.body.classList.remove('quiz-hint-opposites');
        this.toggleQuizVisualHint('opposites');
      } else if (document.body.classList.contains('quiz-hint-edges')) {
        document.body.classList.remove('quiz-hint-edges');
        this.toggleQuizVisualHint('edges');
      } else {
        this.quizHintInfo.classList.add('hidden');
      }
    }

    setQuizMode(active) {
      this.isQuizMode = active;
      document.body.classList.toggle('quiz-active', active);
      document.body.classList.remove('quiz-revealed');
      this.clearQuizVisualHints();

      if (this.btnQuizMode) {
        this.btnQuizMode.classList.toggle('active', active);
      }
      if (this.quizSidebar) {
        this.quizSidebar.classList.toggle('hidden', !active);
      }
      if (this.builderSidebar) {
        this.builderSidebar.classList.toggle('hidden', active);
      }

      if (active) {
        // Ensure symbols are visible in Quiz Mode
        this.viewport.classList.remove('hide-symbols');
        if (this.btnSymbols) {
          this.btnSymbols.classList.add('active');
        }
        document.querySelectorAll('.mode-selector .tool-btn:not(.quiz-mode-btn)').forEach((b) => {
          b.classList.remove('active');
        });
        this.generateQuizQuestion();
      } else {
        this.setMode(this.currentMode || 'add');
      }
    }

    generateQuizQuestion() {
      this.stopAutoPlay();
      this.foldProgress = 0;
      this.targetFoldProgress = 0;
      this.quizSolvedCurrent = false;
      document.body.classList.remove('quiz-revealed');
      this.clearQuizVisualHints();

      if (this.quizFeedbackBox) {
        this.quizFeedbackBox.classList.add('hidden');
      }

      // 1. Pick one of the 11 valid hexomino cube nets with a random 2D rotation & flip
      const chosenNet = ALL_11_VALID_NETS[Math.floor(Math.random() * ALL_11_VALID_NETS.length)];
      const rot = Math.floor(Math.random() * 4);
      const flip = Math.random() < 0.5 ? -1 : 1;

      const transformed = chosenNet.coords.map(([x, z]) => {
        let rx = x * flip;
        let rz = z;
        for (let r = 0; r < rot; r++) {
          const tmp = rx;
          rx = -rz;
          rz = tmp;
        }
        return [rx, rz];
      });

      // 2. Shuffle the 6 geometric symbols (+, □, ■, ○, ●, ⚃) randomly across the 6 white squares
      const symbolIds = [1, 2, 3, 4, 5, 6];
      for (let i = symbolIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [symbolIds[i], symbolIds[j]] = [symbolIds[j], symbolIds[i]];
      }

      const list = transformed.map(([gx, gz], idx) => {
        const symId = symbolIds[idx];
        return {
          gx,
          gz,
          color: '#ffffff', // Crisp white squares so filled black square (■) & black circle (●) pop clearly
          pip: symId,
        };
      });

      // Pick a random square in the net as the Base square
      const randomBaseIdx = Math.floor(Math.random() * transformed.length);
      const baseKey = `${transformed[randomBaseIdx][0]},${transformed[randomBaseIdx][1]}`;

      this.net.loadState({ baseKey, list }, false);
      this.camera.resetView(this.net.getBounds(false));

      // 3. Map each of the 6 folded 3D faces to its square data { pip, color }
      const faceMap = {};
      for (const node of this.net.orderedNodes) {
        faceMap[node.targetFace] = {
          pip: node.pip,
          color: node.color,
          face: node.targetFace,
          node,
        };
      }
      this.currentQuizFaceMap = faceMap;

      const oppositeFace = {
        TOP: 'BOTTOM',
        BOTTOM: 'TOP',
        FRONT: 'BACK',
        BACK: 'FRONT',
        LEFT: 'RIGHT',
        RIGHT: 'LEFT',
      };

      // 4. Choose 1 of the 4 upright 3D corner views of the folded cube as the Correct Answer:
      // Each corner has (topFace, frontLeftFace, frontRightFace) satisfying N_top x N_left = N_right
      const validCorners = [
        { top: 'TOP', left: 'FRONT', right: 'RIGHT', camRotX: -32, camRotY: -42 },
        { top: 'TOP', left: 'LEFT',  right: 'FRONT', camRotX: -32, camRotY: 42 },
        { top: 'TOP', left: 'RIGHT', right: 'BACK',  camRotX: -32, camRotY: -138 },
        { top: 'TOP', left: 'BACK',  right: 'LEFT',  camRotX: -32, camRotY: 138 },
      ];
      const winningCorner = validCorners[Math.floor(Math.random() * validCorners.length)];
      const T = winningCorner.top;
      const FL = winningCorner.left;
      const FR = winningCorner.right;
      const oppT = oppositeFace[T];
      const oppFL = oppositeFace[FL];
      this.currentQuizCorner = { T, FL, FR };

      // Build the 3 directional corner lines & vertex dots on the flat 2D net for the Corner Hint
      this.applyQuizCornerDecorations(T, FL, FR);

      const symT = getSymbolConfig(faceMap[T].pip).name;
      const symFL = getSymbolConfig(faceMap[FL].pip).name;
      const symFR = getSymbolConfig(faceMap[FR].pip).name;
      const symOppT = getSymbolConfig(faceMap[oppT].pip).name;
      const symOppFL = getSymbolConfig(faceMap[oppFL].pip).name;

      const correctOpt = {
        isCorrect: true,
        top: faceMap[T],
        front: faceMap[FL],
        right: faceMap[FR],
        camRotX: winningCorner.camRotX,
        camRotY: winningCorner.camRotY,
        reason: `Correct! When the 2D net folds up, ${symT} is on Top, ${symFL} is on the Front-Left, and ${symFR} is on the Front-Right!`,
      };

      // 5. Generate 3 mathematically impossible distractors (none can be formed under any 3D rotation)
      const distractor1 = {
        isCorrect: false,
        top: faceMap[T],
        front: faceMap[oppT],
        right: faceMap[FR],
        reason: `Impossible! ${symT} (${T}) and ${symOppT} (${oppT}) fold to opposite sides of the die, so they can never share an edge!`,
      };

      const distractor2 = {
        isCorrect: false,
        top: faceMap[T],
        front: faceMap[FR],
        right: faceMap[FL],
        reason: `Mirror-image trap! With ${symT} on Top, ${symFL} folds to the left of ${symFR}, not the right. Try "📐 Corner Hint" to trace the 3 corner lines!`,
      };

      const distractor3 = {
        isCorrect: false,
        top: faceMap[T],
        front: faceMap[oppFL],
        right: faceMap[FR],
        reason: `Wrong adjacent face! ${symOppFL} and ${symFL} are opposite faces, so ${symOppFL} folds to the back side opposite ${symFL}.`,
      };

      const options = [correctOpt, distractor1, distractor2, distractor3];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      this.currentQuizOptions = options;
      this.renderQuizOptions();
    }

    renderQuizOptions() {
      if (!this.quizOptionsGrid) return;
      this.quizOptionsGrid.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];

      this.currentQuizOptions.forEach((opt, idx) => {
        const card = document.createElement('div');
        card.className = 'quiz-option-card';
        card.dataset.index = idx;

        const letterBadge = document.createElement('span');
        letterBadge.className = 'quiz-option-letter';
        letterBadge.textContent = letters[idx];
        card.appendChild(letterBadge);

        const statusIcon = document.createElement('span');
        statusIcon.className = 'quiz-option-status';
        card.appendChild(statusIcon);

        // 3D Isometric Mini-Cube showing Top, Front-Left, and Front-Right faces with SVG symbols
        const scene = document.createElement('div');
        scene.className = 'option-cube-scene';
        const cube = document.createElement('div');
        cube.className = 'option-cube';

        const createMiniFace = (cls, faceData) => {
          const f = document.createElement('div');
          f.className = `opt-face ${cls}`;
          f.style.backgroundColor = faceData.color;
          f.style.color = isLightColor(faceData.color) ? '#0f172a' : '#f8fafc';
          const symCfg = getSymbolConfig(faceData.pip);
          f.innerHTML = symCfg.svg;
          return f;
        };

        cube.appendChild(createMiniFace('opt-top', opt.top));
        cube.appendChild(createMiniFace('opt-front', opt.front));
        cube.appendChild(createMiniFace('opt-right', opt.right));
        scene.appendChild(cube);
        card.appendChild(scene);

        const summary = document.createElement('div');
        summary.className = 'option-faces-summary';
        const sTop = getSymbolConfig(opt.top.pip).short;
        const sLeft = getSymbolConfig(opt.front.pip).short;
        const sRight = getSymbolConfig(opt.right.pip).short;
        summary.textContent = `Top: ${sTop} · L: ${sLeft} · R: ${sRight}`;
        card.appendChild(summary);

        card.addEventListener('click', () => {
          this.handleQuizOptionClick(idx, card, statusIcon);
        });

        this.quizOptionsGrid.appendChild(card);
      });
    }

    handleQuizOptionClick(idx, cardEl, statusIconEl) {
      const opt = this.currentQuizOptions[idx];
      if (!opt) return;

      this.quizFeedbackBox.classList.remove('hidden', 'feedback-correct', 'feedback-wrong');

      if (opt.isCorrect) {
        cardEl.classList.add('option-correct');
        statusIconEl.textContent = '✅';
        document.body.classList.add('quiz-revealed');

        if (!this.quizSolvedCurrent) {
          this.quizSolvedCurrent = true;
          this.quizScore += 1;
          this.quizTotal += 1;
          this.quizStreak += 1;
          this.updateQuizScoreUI();
        }

        this.quizFeedbackBox.classList.add('feedback-correct');
        this.quizFeedbackTitle.textContent = `🎉 Correct! Option ${['A', 'B', 'C', 'D'][idx]} is a valid 3D cube!`;
        this.quizFeedbackDesc.textContent = opt.reason;

        // Celebrate by folding the 2D net into the 3D cube and orbiting camera to match the winning perspective!
        const bounds = this.net.getBounds(true);
        this.camera.setProjection('perspective');
        this.camera.targetRotX = opt.camRotX;
        this.camera.targetRotY = opt.camRotY;
        this.camera.targetPanX = -bounds.centerX;
        this.camera.targetPanY = -bounds.centerY;

        if (this.foldProgress < this.getTotalSteps() - 0.05) {
          this.startAutoPlay(1);
        } else {
          this.sound.playCompleteDice();
        }
      } else {
        if (!cardEl.classList.contains('option-wrong') && !this.quizSolvedCurrent) {
          this.quizTotal += 1;
          this.quizStreak = 0;
          this.updateQuizScoreUI();
        }
        cardEl.classList.add('option-wrong');
        statusIconEl.textContent = '❌';
        this.sound.playError();

        this.quizFeedbackBox.classList.add('feedback-wrong');
        this.quizFeedbackTitle.textContent = `❌ Not quite! Option ${['A', 'B', 'C', 'D'][idx]} cannot be formed.`;
        this.quizFeedbackDesc.textContent = opt.reason;
      }
    }

    updateQuizScoreUI() {
      if (this.quizScorePill) {
        this.quizScorePill.textContent = `Score: ${this.quizScore} / ${this.quizTotal}`;
      }
      if (this.quizStreakPill) {
        this.quizStreakPill.textContent = `🔥 ${this.quizStreak}`;
      }
    }

    // --- Interactive Clicks on Existing Squares ---
    setupSquareInteractions() {
      this.treeContainer.addEventListener('pointerup', (e) => {
        if (this.camera.hasDragged) return;

        const tile = e.target.closest('.square-tile');
        if (!tile) return;

        const gx = parseInt(tile.dataset.gx, 10);
        const gz = parseInt(tile.dataset.gz, 10);

        // In Quiz Mode, clicking a square folds or unfolds up to that square's step
        if (this.isQuizMode) {
          if (e.button !== 0) return;
          const node = this.net.nodeMap.get(`${gx},${gz}`);
          if (node) {
            this.stopAutoPlay();
            if (node.stepIndex === 0) {
              if (this.foldProgress > 0.05) {
                this.sound.playFoldStep(1, false);
                this.targetFoldProgress = 0;
              }
            } else if (this.foldProgress >= node.stepIndex - 0.05) {
              this.sound.playFoldStep(node.stepIndex, false);
              this.targetFoldProgress = node.stepIndex - 1;
            } else {
              this.sound.playFoldStep(node.stepIndex, true);
              this.targetFoldProgress = node.stepIndex;
            }
          }
          return;
        }

        // Right-click or Shift+Left-click deletes the square
        if (e.button === 2 || (e.button === 0 && (e.shiftKey || this.currentMode === 'delete'))) {
          e.preventDefault();
          const res = this.net.removeSquare(gx, gz, true);
          if (!res.ok && res.reason === 'bridge_square') {
            this.netStatusBadge.classList.add('status-invalid');
            this.netStatusText.textContent = '⚠️ Delete outer leaf squares first so the net stays connected!';
          } else if (!res.ok && res.reason === 'last_square') {
            this.netStatusText.textContent = 'At least 1 base square must remain on the surface.';
          }
          return;
        }

        if (e.button !== 0) return;

        if (this.currentMode === 'anchor') {
          this.stopAutoPlay();
          this.foldProgress = 0;
          this.targetFoldProgress = 0;
          this.net.setBaseSquare(gx, gz, true);
          return;
        }

        if (this.currentMode === 'paint') {
          const sq = this.net.get(gx, gz);
          if (!sq) return;
          const newColor = this.currentColor;
          const newPip = this.selectedPipMode === 'auto'
            ? ((sq.pip % 6) + 1)
            : Number(this.selectedPipMode);
          this.net.styleSquare(gx, gz, newColor, newPip, true);
          return;
        }

        // If in Add mode and clicking a folded square, toggle its fold step
        if (this.currentMode === 'add' && this.foldProgress > 0.05) {
          const node = this.net.nodeMap.get(`${gx},${gz}`);
          if (node && node.stepIndex > 0) {
            this.stopAutoPlay();
            if (this.foldProgress >= node.stepIndex) {
              this.sound.playFoldStep(node.stepIndex, false);
              this.targetFoldProgress = node.stepIndex - 1;
            } else {
              this.sound.playFoldStep(node.stepIndex, true);
              this.targetFoldProgress = node.stepIndex;
            }
          }
        }
      });
    }

    // --- Left Palette, Symbol Selector & Presets ---
    setupPaletteAndPips() {
      const swatchesContainer = document.getElementById('color-swatches');
      const customPicker = document.getElementById('custom-color-picker');
      const customPreview = document.getElementById('custom-color-preview');
      const autoToggle = document.getElementById('auto-color-toggle');

      PALETTE_COLORS.forEach((color, idx) => {
        const swatch = document.createElement('div');
        swatch.className = 'swatch' + (idx === 0 ? ' active' : '');
        swatch.style.backgroundColor = color;
        swatch.dataset.color = color;
        swatch.title = color;

        swatch.addEventListener('click', () => {
          this.setColor(color);
          autoToggle.checked = false;
          this.isAutoColor = false;
        });

        swatchesContainer.appendChild(swatch);
      });

      customPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        customPreview.style.backgroundColor = color;
        this.setColor(color);
        autoToggle.checked = false;
        this.isAutoColor = false;
      });

      autoToggle.addEventListener('change', (e) => {
        this.isAutoColor = e.target.checked;
      });

      // Symbol Selector buttons
      const pipBtns = document.querySelectorAll('.pip-btn');
      pipBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          pipBtns.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectedPipMode = btn.dataset.pip;
        });
      });

      // "Assign All 6" button to distribute all 6 unique geometric symbols
      const btnAssignSymbols = document.getElementById('btn-assign-symbols');
      if (btnAssignSymbols) {
        btnAssignSymbols.addEventListener('click', () => {
          this.net.autoAssignSum7Pips(true);
        });
      }
    }

    setColor(color) {
      this.currentColor = color;
      document.querySelectorAll('.swatch').forEach((s) => {
        s.classList.toggle('active', s.dataset.color === color);
      });
      document.getElementById('custom-color-preview').style.backgroundColor = color;
    }

    setupToolButtons() {
      document.querySelectorAll('.mode-selector .tool-btn:not(.quiz-mode-btn)').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (this.isQuizMode) {
            this.setQuizMode(false);
          }
          this.setMode(btn.dataset.mode);
        });
      });

      this.btnUndo.addEventListener('click', () => {
        if (this.isQuizMode) return;
        this.stopAutoPlay();
        this.foldProgress = 0;
        this.targetFoldProgress = 0;
        this.net.undo();
      });

      this.btnRedo.addEventListener('click', () => {
        if (this.isQuizMode) return;
        this.stopAutoPlay();
        this.foldProgress = 0;
        this.targetFoldProgress = 0;
        this.net.redo();
      });

      document.getElementById('btn-clear').addEventListener('click', () => {
        this.loadPreset('single');
      });

      // Toggle Die Symbols (+, □, ■, ○, ●, ⚃)
      if (this.btnSymbols) {
        this.btnSymbols.addEventListener('click', () => {
          const hidden = this.viewport.classList.toggle('hide-symbols');
          this.btnSymbols.classList.toggle('active', !hidden);
        });
      }

      // Toggle 3D Target Face Labels
      this.btnFaceLabels.addEventListener('click', () => {
        const hidden = this.viewport.classList.toggle('hide-face-labels');
        this.btnFaceLabels.classList.toggle('active', !hidden);
      });

      // Toggle X-Ray Mode
      this.btnXray.addEventListener('click', () => {
        const isXray = this.viewport.classList.toggle('xray-mode');
        this.btnXray.classList.toggle('active', isXray);
      });

      // Toggle Sound
      this.btnSound.addEventListener('click', () => {
        this.sound.enabled = !this.sound.enabled;
        this.soundIconOn.classList.toggle('hidden', !this.sound.enabled);
        this.soundIconOff.classList.toggle('hidden', this.sound.enabled);
      });

      // Exit Architecture 2D Banner
      this.btnExitArch.addEventListener('click', () => {
        this.camera.setViewPreset('iso', this.net.getBounds(this.foldProgress > 2));
        document.querySelectorAll('.pill-btn').forEach((p) => p.classList.remove('active'));
        const isoPill = document.querySelector('.pill-btn[data-view="iso"]');
        if (isoPill) isoPill.classList.add('active');
        this.archBanner.classList.add('hidden');
      });
    }

    setMode(mode) {
      this.currentMode = mode;
      document.body.dataset.activeMode = mode;
      document.querySelectorAll('.mode-selector .tool-btn:not(.quiz-mode-btn)').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
      });

      // If switching to Add mode while folded, unfold to 2D so candidate "+" slots appear
      if (mode === 'add' && this.foldProgress > 0.01 && this.net.squares.size < MAX_SQUARES) {
        this.stopAutoPlay();
        this.targetFoldProgress = 0;
      }
    }

    // --- Presets & Random Valid Cube Net Generator ---
    setupPresets() {
      const buildStateFromCoords = (coords) => {
        const list = coords.map(([gx, gz], idx) => ({
          gx,
          gz,
          color: this.isAutoColor ? AUTO_SQUARE_COLORS[idx % AUTO_SQUARE_COLORS.length] : this.currentColor,
          pip: idx + 1,
        }));
        return { baseKey: `${coords[0][0]},${coords[0][1]}`, list };
      };

      this.presets = {
        single: () => buildStateFromCoords([[0, 0]]),
        cross: () => buildStateFromCoords(ALL_11_VALID_NETS[0].coords),
        tnet: () => buildStateFromCoords(ALL_11_VALID_NETS[1].coords),
        stairs: () => buildStateFromCoords(ALL_11_VALID_NETS[9].coords),
        znet: () => buildStateFromCoords(ALL_11_VALID_NETS[6].coords),
        lnet: () => buildStateFromCoords(ALL_11_VALID_NETS[3].coords),
        threeThree: () => buildStateFromCoords(ALL_11_VALID_NETS[10].coords),
        invalidOverlap: () => buildStateFromCoords([
          [0, 0], [1, 0], [1, 1], [0, 1], [-1, 0], [0, -1]
        ]),
      };

      document.querySelectorAll('.preset-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.loadPreset(btn.dataset.preset);
        });
      });

      document.getElementById('btn-random-net').addEventListener('click', () => {
        this.loadRandomValidNet();
      });
    }

    loadPreset(presetName) {
      if (!this.presets[presetName]) return;
      this.stopAutoPlay();
      this.foldProgress = 0;
      this.targetFoldProgress = 0;

      const state = this.presets[presetName]();
      this.net.loadState(state, true);
      if (!this.net.hasOverlap && this.net.squares.size === 6) {
        this.net.autoAssignSum7Pips(false);
      }
      this.camera.resetView(this.net.getBounds(false));
    }

    loadRandomValidNet() {
      this.stopAutoPlay();
      this.foldProgress = 0;
      this.targetFoldProgress = 0;

      const chosen = ALL_11_VALID_NETS[Math.floor(Math.random() * ALL_11_VALID_NETS.length)];
      // Apply a random 90-degree rotation and optional flip on the 2D grid
      const rot = Math.floor(Math.random() * 4);
      const flip = Math.random() < 0.5 ? -1 : 1;

      const transformed = chosen.coords.map(([x, z]) => {
        let rx = x * flip;
        let rz = z;
        for (let r = 0; r < rot; r++) {
          const tmp = rx;
          rx = -rz;
          rz = tmp;
        }
        return [rx, rz];
      });

      const list = transformed.map(([gx, gz], idx) => ({
        gx,
        gz,
        color: this.isAutoColor ? AUTO_SQUARE_COLORS[idx % AUTO_SQUARE_COLORS.length] : this.currentColor,
        pip: idx + 1,
      }));

      this.net.loadState({ baseKey: `${transformed[0][0]},${transformed[0][1]}`, list }, true);
      this.net.autoAssignSum7Pips(false);
      this.camera.resetView(this.net.getBounds(false));
    }

    // --- Camera & Compass Indicators ---
    setupCameraButtons() {
      document.getElementById('btn-zoom-in').addEventListener('click', () => this.camera.zoomIn());
      document.getElementById('btn-zoom-out').addEventListener('click', () => this.camera.zoomOut());
      document.getElementById('btn-recenter').addEventListener('click', () => {
        this.camera.resetView(this.net.getBounds(this.foldProgress > 2));
      });

      const btnAuto = document.getElementById('btn-auto-rotate');
      btnAuto.addEventListener('click', () => {
        const active = this.camera.toggleAutoRotate();
        btnAuto.classList.toggle('active', active);
      });

      const pills = document.querySelectorAll('.pill-btn');
      pills.forEach((pill) => {
        pill.addEventListener('click', () => {
          pills.forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
          const view = pill.dataset.view;
          this.camera.setViewPreset(view, this.net.getBounds(this.foldProgress > 2));
          this.updateCompassPositions();

          if (view === 'iso') {
            this.archBanner.classList.add('hidden');
          } else {
            this.archBanner.classList.remove('hidden');
            const titles = {
              top: '2D Top Surface (Plan View)',
              bottom: 'Bottom View (Under)',
              front: 'Front Elevation View',
              back: 'Back Elevation View',
              left: 'Left Side Elevation View',
              right: 'Right Side Elevation View',
            };
            this.archBannerTitle.textContent = titles[view] || 'Orthogonal View';
          }
        });
      });
    }

    updateCompassPositions() {
      const compass = document.getElementById('ground-compass');
      if (!compass) return;

      let minX = -1, maxX = 1;
      let minZ = -1, maxZ = 1;

      if (this.net.squares.size > 0) {
        minX = Infinity; maxX = -Infinity;
        minZ = Infinity; maxZ = -Infinity;
        for (const sq of this.net.squares.values()) {
          if (sq.gx < minX) minX = sq.gx;
          if (sq.gx > maxX) maxX = sq.gx;
          if (sq.gz < minZ) minZ = sq.gz;
          if (sq.gz > maxZ) maxZ = sq.gz;
        }
      }

      const cx = ((minX + maxX) / 2) * SQUARE_SIZE;
      const cz = ((minZ + maxZ) / 2) * SQUARE_SIZE;
      const floorY = HALF_SIZE + 3;

      const spanX = (maxX - minX + 1) * SQUARE_SIZE;
      const spanZ = (maxZ - minZ + 1) * SQUARE_SIZE;
      const radiusX = Math.max(210, spanX * 0.5 + 140);
      const radiusZ = Math.max(210, spanZ * 0.5 + 140);

      const indFront = compass.querySelector('.dir-front');
      const indBack = compass.querySelector('.dir-back');
      const indLeft = compass.querySelector('.dir-left');
      const indRight = compass.querySelector('.dir-right');

      if (indFront) indFront.style.transform = `translate3d(${cx}px, ${floorY}px, ${cz + radiusZ}px) rotateX(90deg)`;
      if (indBack)  indBack.style.transform  = `translate3d(${cx}px, ${floorY}px, ${cz - radiusZ}px) rotateX(90deg) rotateZ(180deg)`;
      if (indLeft)  indLeft.style.transform  = `translate3d(${cx - radiusX}px, ${floorY}px, ${cz}px) rotateX(90deg) rotateZ(90deg)`;
      if (indRight) indRight.style.transform = `translate3d(${cx + radiusX}px, ${floorY}px, ${cz}px) rotateX(90deg) rotateZ(-90deg)`;
    }

    setupDirectionIndicators() {
      document.querySelectorAll('.dir-indicator').forEach((ind) => {
        ind.addEventListener('click', (e) => {
          e.stopPropagation();
          const view = ind.dataset.view;
          const pill = document.querySelector(`.pill-btn[data-view="${view}"]`);
          if (pill) pill.click();
        });
      });

      const btnHome = document.getElementById('btn-viewcube-home');
      if (btnHome) {
        btnHome.addEventListener('click', (e) => {
          e.stopPropagation();
          const isoPill = document.querySelector('.pill-btn[data-view="iso"]');
          if (isoPill) isoPill.click();
        });
      }

      const attachHoverPairing = (elements, attrName) => {
        elements.forEach((el) => {
          el.addEventListener('pointerenter', () => {
            const view = el.getAttribute(attrName);
            if (!view || view === 'iso') return;
            document.querySelectorAll(`[data-view="${view}"]`).forEach((m) => m.classList.add('highlighted'));
          });
          el.addEventListener('pointerleave', () => {
            const view = el.getAttribute(attrName);
            if (!view) return;
            document.querySelectorAll(`[data-view="${view}"]`).forEach((m) => m.classList.remove('highlighted'));
          });
        });
      };

      attachHoverPairing(document.querySelectorAll('.pill-btn'), 'data-view');
      attachHoverPairing(document.querySelectorAll('.vface'), 'data-view');
      attachHoverPairing(document.querySelectorAll('.dir-indicator'), 'data-view');
    }

    // --- Export & Import ---
    setupExportImport() {
      const btnExport = document.getElementById('btn-export');
      const btnImport = document.getElementById('btn-import');
      const fileInput = document.getElementById('import-file-input');

      btnExport.addEventListener('click', () => {
        const data = JSON.stringify(this.net.snapshot(), null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `folding-dice-net-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });

      btnImport.addEventListener('click', () => {
        fileInput.value = '';
        fileInput.click();
      });

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            this.stopAutoPlay();
            this.foldProgress = 0;
            this.targetFoldProgress = 0;
            this.net.loadState(parsed, true);
            this.camera.resetView(this.net.getBounds(false));
          } catch (err) {
            alert('Failed to parse JSON file.');
          }
        };
        reader.readAsText(file);
      });
    }

    // --- Keyboard Shortcuts ---
    setupKeyboardShortcuts() {
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          this.stopAutoPlay();
          this.foldProgress = 0;
          this.targetFoldProgress = 0;
          if (e.shiftKey) {
            this.net.redo();
          } else {
            this.net.undo();
          }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
          e.preventDefault();
          this.stopAutoPlay();
          this.foldProgress = 0;
          this.targetFoldProgress = 0;
          this.net.redo();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.stopAutoPlay();
          this.stepForwardOne();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.stopAutoPlay();
          this.stepBackwardOne();
        } else if (e.key.toLowerCase() === 'f') {
          e.preventDefault();
          this.btnAutoFold.click();
        } else if (e.key.toLowerCase() === 'h') {
          if (this.isQuizMode) {
            e.preventDefault();
            this.triggerProgressiveQuizHint();
          }
        } else if (e.key.toLowerCase() === 'q') {
          e.preventDefault();
          this.setQuizMode(!this.isQuizMode);
        } else if (e.key === '1') {
          if (this.isQuizMode) this.setQuizMode(false);
          this.setMode('add');
        } else if (e.key === '2') {
          if (this.isQuizMode) this.setQuizMode(false);
          this.setMode('delete');
        } else if (e.key === '3') {
          if (this.isQuizMode) this.setQuizMode(false);
          this.setMode('paint');
        } else if (e.key === '4') {
          if (this.isQuizMode) this.setQuizMode(false);
          this.setMode('anchor');
        } else if (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'n') {
          if (this.btnSymbols) this.btnSymbols.click();
        } else if (e.key.toLowerCase() === 'l') {
          this.btnFaceLabels.click();
        } else if (e.key.toLowerCase() === 'x') {
          this.btnXray.click();
        } else if (e.key.toLowerCase() === 'r') {
          this.camera.resetView(this.net.getBounds(this.foldProgress > 2));
        } else if (e.key === ' ') {
          e.preventDefault();
          const active = this.camera.toggleAutoRotate();
          document.getElementById('btn-auto-rotate').classList.toggle('active', active);
        } else if (e.key === '+' || e.key === '=') {
          this.camera.zoomIn();
        } else if (e.key === '-' || e.key === '_') {
          this.camera.zoomOut();
        }
      });
    }

    setupHelpModal() {
      const modal = document.getElementById('help-modal');
      const btnHelp = document.getElementById('btn-help');
      const btnClose = document.getElementById('btn-close-modal');
      const btnGotIt = document.getElementById('btn-modal-gotit');

      const openModal = () => modal.classList.remove('hidden');
      const closeModal = () => modal.classList.add('hidden');

      btnHelp.addEventListener('click', openModal);
      btnClose.addEventListener('click', closeModal);
      btnGotIt.addEventListener('click', closeModal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.__app = new App();
  });
})();

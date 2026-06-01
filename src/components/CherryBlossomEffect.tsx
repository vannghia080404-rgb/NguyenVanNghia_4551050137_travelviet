import { useEffect, useRef, useCallback } from 'react';

interface SparkleEffectProps {
  active: boolean;
  onComplete?: () => void;
}

const S = 300; // canvas size
const C = S / 2;
const DURATION = 900; // ms

// ─── Easing ────────────────────────────────────────────────────────────────
function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

// ─── Types ─────────────────────────────────────────────────────────────────
interface Ray {
  angle: number;
  speed: number;      // px/s at z=0
  tailLen: number;
  lw: number;
  r: number; g: number; b: number;
  maxDist: number;
  phase: number;      // twinkle phase
  tw: number;         // twinkle speed
  z: number;          // simulated depth -1..1 (affects size+opacity)
}

interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  vz: number;         // depth velocity
  z: number;          // depth
  r: number; g: number; b: number;
  sz: number;
  maxLife: number;
  phase: number;
  born: number;       // time (s) when born
}

// ─── Pre-allocated, NEVER recreated ────────────────────────────────────────
const COLORS: [number,number,number][] = [
  [255, 230, 80],
  [255, 170, 210],
  [255, 255, 255],
  [180, 220, 255],
  [220, 180, 255],
  [255, 200, 120],
];

function randColor(): [number,number,number] {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

const RAYS: Ray[] = Array.from({ length: 28 }, (_, i) => {
  const [r, g, b] = randColor();
  const z = (Math.random() - 0.5) * 1.6;
  return {
    angle: (i / 28) * Math.PI * 2 + (Math.random() - 0.5) * 0.22,
    speed: (90 + Math.random() * 90) * (1 - Math.abs(z) * 0.3),
    tailLen: 14 + Math.random() * 28,
    lw: 1 + Math.random() * 2.2,
    r, g, b,
    maxDist: 55 + Math.random() * 65,
    phase: Math.random() * Math.PI * 2,
    tw: 9 + Math.random() * 12,
    z,
  };
});

// Sparks are reinitialized every trigger (lightweight)
function makeSparks(now: number): Spark[] {
  return Array.from({ length: 55 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const spd = 35 + Math.random() * 110;
    const [r, g, b] = randColor();
    return {
      x: C, y: C,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      vz: (Math.random() - 0.5) * 80,
      z: 0,
      r, g, b,
      sz: 0.6 + Math.random() * 2.8,
      maxLife: 0.2 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
      born: now,
    };
  });
}

// ─── Ring pulse ────────────────────────────────────────────────────────────
interface Ring { born: number; r: number; g: number; b: number; }
const RINGS: Ring[] = [
  { born: 0, r: 255, g: 220, b: 80 },
  { born: 0.06, r: 255, g: 170, b: 210 },
  { born: 0.12, r: 255, g: 255, b: 255 },
];

export default function SparkleEffect({ active, onComplete }: SparkleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef   = useRef<number>(0);
  const activeRef = useRef(false);

  const run = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true })!;
    ctx.clearRect(0, 0, S, S);

    cancelAnimationFrame(rafRef.current);
    activeRef.current = true;

    const startWall = performance.now();
    let sparks = makeSparks(0);
    const ringStart = startWall;

    function frame(now: number) {
      if (!activeRef.current) return;

      const elapsed = now - startWall;
      const T = Math.min(elapsed / DURATION, 1);          // 0→1 total
      const eT = easeOutExpo(T);                          // eased total
      const timeS = elapsed / 1000;
      const dt = Math.min(1 / 60, timeS < 0.001 ? 1/60 : (now - (startWall + elapsed - (1000/60))) / 1000);

      ctx.clearRect(0, 0, S, S);

      // ── Rings ────────────────────────────────────────────────────
      RINGS.forEach(ring => {
        const age = (now - ringStart) / 1000 - ring.born;
        if (age < 0 || age > 0.5) return;
        const rp = age / 0.5;
        const rr = rp * 90;
        const alpha = (1 - rp) * 0.6;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.arc(C, C, rr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ring.r},${ring.g},${ring.b},${alpha})`;
        ctx.lineWidth = 2.5 * (1 - rp);
        ctx.stroke();
        ctx.restore();
      });

      // ── Rays ─────────────────────────────────────────────────────
      RAYS.forEach(ray => {
        const dist = easeOutExpo(Math.min(timeS / (ray.maxDist / ray.speed), 1)) * ray.maxDist;
        if (dist <= 0.5) return;

        const progress = dist / ray.maxDist;
        const fade = progress < 0.55 ? progress / 0.55 : 1 - (progress - 0.55) / 0.45;
        const twk = 0.6 + 0.4 * Math.sin(timeS * ray.tw + ray.phase);
        const depthScale = 0.5 + 0.5 * (1 - Math.abs(ray.z) * 0.5); // farther = smaller
        const alpha = fade * twk * depthScale;
        if (alpha < 0.02) return;

        const curDist = dist * depthScale;
        const tx = C + Math.cos(ray.angle) * curDist;
        const ty = C + Math.sin(ray.angle) * curDist;
        const tailD = Math.max(0, curDist - ray.tailLen * depthScale);
        const tx2 = C + Math.cos(ray.angle) * tailD;
        const ty2 = C + Math.sin(ray.angle) * tailD;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const gr = ctx.createLinearGradient(tx2, ty2, tx, ty);
        gr.addColorStop(0, `rgba(${ray.r},${ray.g},${ray.b},0)`);
        gr.addColorStop(0.6, `rgba(${ray.r},${ray.g},${ray.b},${alpha * 0.5})`);
        gr.addColorStop(1, `rgba(${ray.r},${ray.g},${ray.b},${alpha})`);
        ctx.strokeStyle = gr;
        ctx.lineWidth = ray.lw * depthScale * (1 - progress * 0.35);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tx2, ty2);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        // Head glow
        if (progress < 0.8) {
          const hw = ray.lw * 5 * depthScale;
          const hg = ctx.createRadialGradient(tx, ty, 0, tx, ty, hw);
          hg.addColorStop(0, `rgba(${ray.r},${ray.g},${ray.b},${alpha * 0.9})`);
          hg.addColorStop(1, `rgba(${ray.r},${ray.g},${ray.b},0)`);
          ctx.beginPath();
          ctx.arc(tx, ty, hw, 0, Math.PI * 2);
          ctx.fillStyle = hg;
          ctx.fill();
        }
        ctx.restore();
      });

      // ── Sparks ───────────────────────────────────────────────────
      sparks.forEach(sp => {
        const age = timeS - sp.born;
        if (age < 0 || age > sp.maxLife) return;

        const lt = age / sp.maxLife;                       // 0→1 lifeRatio
        const easedLt = easeInOutSine(lt);

        sp.x  += sp.vx * dt;
        sp.y  += sp.vy * dt;
        sp.vy += 55 * dt;                                  // gravity
        sp.vx *= 0.985;
        sp.z  += sp.vz * dt;
        sp.vz *= 0.97;

        const depthS = 0.6 + 0.4 * Math.min(1, Math.max(0, (sp.z + 40) / 80));
        const twk = 0.5 + 0.5 * Math.sin(timeS * 20 + sp.phase);
        const alpha = (1 - easedLt) * twk * depthS;
        if (alpha < 0.03) return;

        const sz = sp.sz * depthS * (1 - easedLt * 0.4);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.translate(sp.x, sp.y);
        ctx.rotate(timeS * 5 + sp.phase);

        const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, sz * 3.5);
        sg.addColorStop(0, `rgba(${sp.r},${sp.g},${sp.b},${alpha})`);
        sg.addColorStop(1, `rgba(${sp.r},${sp.g},${sp.b},0)`);
        ctx.fillStyle = sg;

        // 4-point star
        for (let k = 0; k < 4; k++) {
          ctx.beginPath();
          ctx.ellipse(0, 0, sz * 0.22, sz * 1.9, (k * Math.PI) / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // ── Center glow ──────────────────────────────────────────────
      const ga = Math.sin(T * Math.PI) * 0.5;
      if (ga > 0.01) {
        const gr2 = ctx.createRadialGradient(C, C, 0, C, C, 22 + eT * 22);
        gr2.addColorStop(0, `rgba(255,230,100,${ga})`);
        gr2.addColorStop(0.5, `rgba(255,120,180,${ga * 0.45})`);
        gr2.addColorStop(1, 'rgba(255,120,180,0)');
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.arc(C, C, 22 + eT * 22, 0, Math.PI * 2);
        ctx.fillStyle = gr2;
        ctx.fill();
        ctx.restore();
      }

      if (T < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, S, S);
        activeRef.current = false;
        onComplete?.();
      }
    }

    rafRef.current = requestAnimationFrame(frame);
  }, [onComplete]);

  useEffect(() => {
    if (active) {
      run();
    } else {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, S, S);
      }
    }
  }, [active, run]);

  return (
    <canvas
      ref={canvasRef}
      width={S}
      height={S}
      className="pointer-events-none absolute"
      style={{
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 99999,
        opacity: active ? 1 : 0,
        transition: 'opacity 0.15s ease-out',
        willChange: 'opacity',
      }}
    />
  );
}

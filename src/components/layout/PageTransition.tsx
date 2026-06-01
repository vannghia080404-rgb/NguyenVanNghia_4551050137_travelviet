import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

const ROWS = 10;
const COLS = 14;
const DURATION = 900;
const PIECE_DURATION = 600;

const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

const PageTransition = ({ children }: PageTransitionProps) => {
  const { pathname } = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isShattering, setIsShattering] = useState(false);
  const isPresent = useIsPresent();

  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const fxCanvasRef = useRef<HTMLCanvasElement>(null);
  const partCanvasRef = useRef<HTMLCanvasElement>(null);

  const stars = useRef<{ x: number; y: number; size: number; phase: number }[]>([]);

  useEffect(() => {
    stars.current = Array.from({ length: 80 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  const runShatter = (snapCanvas: HTMLCanvasElement) => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    [bgCanvasRef.current, fxCanvasRef.current, partCanvasRef.current].forEach(c => {
      if (c) { c.width = w; c.height = h; }
    });

    const ctxBG = bgCanvasRef.current?.getContext("2d");
    const ctxFX = fxCanvasRef.current?.getContext("2d");
    const ctxPart = partCanvasRef.current?.getContext("2d");
    if (!ctxBG || !ctxFX || !ctxPart) return;

    const pieceW = w / COLS;
    const pieceH = h / ROWS;
    const maxDist = Math.hypot(w / 2, h / 2);
    const accentColor = "#fbbf24";

    const pieces = Array.from({ length: ROWS * COLS }, (_, i) => {
      const r = Math.floor(i / COLS);
      const c = i % COLS;
      const sx = c * pieceW;
      const sy = r * pieceH;
      const cx = sx + pieceW / 2;
      const cy = sy + pieceH / 2;
      const angle = Math.atan2(cy - h / 2, cx - w / 2);
      const dist = Math.hypot(cx - w / 2, cy - h / 2);
      return {
        sx, sy, cx, cy, angle, dist,
        delay: (dist / maxDist) * (0.15 + Math.random() * 0.2),
        rot0: (Math.random() - 0.5) * 2.5,
        speed: 1.8 + dist / 200,
        mass: 0.7 + Math.random() * 0.8,
        particles: [] as any[],
        spawned: false
      };
    });

    setIsShattering(true);
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);

      ctxBG.clearRect(0, 0, w, h);
      ctxFX.clearRect(0, 0, w, h);
      ctxPart.clearRect(0, 0, w, h);

      // Stars
      stars.current.forEach(s => {
        const alpha = 0.3 + 0.7 * Math.abs(Math.sin(now / 1000 + s.phase));
        ctxBG.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctxBG.beginPath(); ctxBG.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2); ctxBG.fill();
      });

      pieces.forEach(p => {
        const t = Math.max(0, Math.min((elapsed / PIECE_DURATION) - p.delay, 1));
        if (t <= 0) {
          ctxFX.drawImage(snapCanvas, p.sx, p.sy, pieceW, pieceH, p.sx, p.sy, pieceW, pieceH);
          return;
        }

        const et = easeInOut(t);
        const tx = Math.cos(p.angle) * et * w * 0.5 * p.speed * p.mass;
        const ty = Math.sin(p.angle) * et * h * 0.5 * p.speed * p.mass;
        const alpha = Math.max(0, 1 - et * 1.3);
        if (alpha <= 0) return;

        // Particles
        if (!p.spawned && t > 0.05) {
          p.spawned = true;
          for (let i = 0; i < 6; i++) {
            const pa = Math.random() * Math.PI * 2;
            const ps = 1 + Math.random() * 4;
            p.particles.push({ x: p.cx + tx, y: p.cy + ty, vx: Math.cos(pa) * ps, vy: Math.sin(pa) * ps, grav: 0.1, drag: 0.97, life: 1 });
          }
        }

        ctxFX.save();
        ctxFX.translate(p.cx + tx, p.cy + ty);
        ctxFX.rotate(p.rot0 * et);
        ctxFX.scale(Math.max(0, 1 - et * 0.9), Math.max(0, 1 - et * 0.9));
        ctxFX.globalAlpha = alpha;

        // Glow
        if (et > 0.1) {
          const g = ctxFX.createRadialGradient(0, 0, 0, 0, 0, pieceW);
          g.addColorStop(0, accentColor + "44"); g.addColorStop(1, "transparent");
          ctxFX.fillStyle = g; ctxFX.beginPath(); ctxFX.arc(0, 0, pieceW, 0, Math.PI * 2); ctxFX.fill();
        }

        ctxFX.drawImage(snapCanvas, p.sx, p.sy, pieceW, pieceH, -pieceW / 2, -pieceH / 2, pieceW, pieceH);
        ctxFX.strokeStyle = accentColor + "66"; ctxFX.lineWidth = 0.5; ctxFX.strokeRect(-pieceW / 2, -pieceH / 2, pieceW, pieceH);
        ctxFX.restore();

        p.particles.forEach((part, idx) => {
          part.vx *= part.drag; part.vy += part.grav; part.x += part.vx; part.y += part.vy; part.life -= 0.02;
          if (part.life <= 0) { p.particles.splice(idx, 1); return; }
          ctxPart.fillStyle = accentColor; ctxPart.globalAlpha = part.life * alpha * 0.5;
          ctxPart.beginPath(); ctxPart.arc(part.x, part.y, 2, 0, Math.PI * 2); ctxPart.fill();
        });
      });

      if (progress < 1) requestAnimationFrame(frame);
      else setIsShattering(false);
    };
    requestAnimationFrame(frame);
  };

  useEffect(() => {
    // When isPresent becomes false, we are EXITING. Snapshot and shatter!
    if (!isPresent && containerRef.current) {
      html2canvas(containerRef.current, { backgroundColor: null, useCORS: true, logging: false }).then(runShatter);
    }
  }, [isPresent]);

  return (
    <div className="relative w-full">
      <AnimatePresence>
        {isShattering && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] pointer-events-none">
            <canvas ref={bgCanvasRef} className="absolute inset-0" />
            <canvas ref={fxCanvasRef} className="absolute inset-0" />
            <canvas ref={partCanvasRef} className="absolute inset-0" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={containerRef}
        key={pathname}
        className="animate-button-fall"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.05, duration: 0.3, ease: "easeOut" } }}
        exit={{ opacity: 0, transition: { duration: 0.5 } }} // Adjusted for smoother exit
        style={{ width: "100%", minHeight: "100vh" }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PageTransition;

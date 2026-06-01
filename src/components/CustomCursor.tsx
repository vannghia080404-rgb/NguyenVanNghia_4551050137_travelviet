import React, { useEffect, useState, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

const CustomCursor = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const trailId = useRef(0);

  // 1. SPRING CHO TIA CHÍNH (Nhanh, nhạy)
  const mainSpringConfig = { damping: 30, stiffness: 350 };
  const mainX = useSpring(mouseX, mainSpringConfig);
  const mainY = useSpring(mouseY, mainSpringConfig);

  // 2. SPRING CHO TIA PHỤ VÀ QUẦNG SÁNG (Chậm hơn để tạo độ trễ)
  const subSpringConfig = { damping: 20, stiffness: 100 };
  const subX = useSpring(mouseX, subSpringConfig);
  const subY = useSpring(mouseY, subSpringConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      mouseX.set(x);
      mouseY.set(y);

      trailId.current += 1;
      const newPoint = { x, y, id: trailId.current };
      
      setTrail((prev) => {
        const updated = [...prev, newPoint];
        if (updated.length > 15) return updated.slice(1); 
        return updated;
      });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("a")) setIsHovered(true);
      else setIsHovered(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* VỆT NẮNG NHỎ THEO SAU (The Tail) */}
      {trail.map((point, index) => (
        <motion.div
          key={point.id}
          className="absolute rounded-full bg-yellow-300/30 blur-[1px]"
          initial={{ opacity: 0.4, scale: 0.6 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            left: point.x,
            top: point.y,
            width: 3 + index / 3,
            height: 3 + index / 3,
            translateX: "-50%",
            translateY: "-50%",
          }}
        />
      ))}

      {/* TIA PHỤ & QUẦNG SÁNG (Chạy theo sau tia chính) */}
      <motion.div
        className="absolute w-24 h-24 rounded-full bg-orange-400/15 blur-[20px]"
        style={{
          left: subX,
          top: subY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />

      {/* TIA CHÍNH LẤP LÁNH (Twinkling Main Ray) */}
      <motion.div
        className="absolute w-3 h-3 flex items-center justify-center"
        style={{
          left: mainX,
          top: mainY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        {/* Core sáng rực */}
        <motion.div 
          className="absolute w-full h-full bg-white rounded-full blur-[0.5px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ boxShadow: "0 0 10px 2px white, 0 0 20px 5px rgba(255,200,100,0.5)" }}
        />

        {/* CÁC TIA LẤP LÁNH DẠNG SAU (Cross Flare) */}
        {[0, 45, 90, 135].map((angle) => (
          <motion.div
            key={angle}
            className="absolute w-[1.5px] h-[30px] bg-white"
            style={{ 
              rotate: angle, 
              background: "linear-gradient(to top, transparent, white, transparent)",
              opacity: 0.7 
            }}
            animate={{ 
              scaleY: [0.5, 1.5, 0.5], 
              opacity: [0.2, 0.8, 0.2] 
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: angle / 100 }}
          />
        ))}

        {/* HẠT LẤP LÁNH XOAY QUANH TÂM (Orbital Sparkles) */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full blur-[0.5px]"
            animate={{ 
              x: [Math.cos(i) * 10, Math.cos(i + 2) * 20, Math.cos(i) * 10],
              y: [Math.sin(i) * 10, Math.sin(i + 2) * 20, Math.sin(i) * 10],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </motion.div>

      {/* HẠT LẤP LÁNH RƠI TRÊN ĐƯỜNG ĐI */}
      {trail.filter((_, i) => i % 5 === 0).map((point) => (
        <motion.div
          key={`sparkle-${point.id}`}
          className="absolute w-0.5 h-0.5 bg-white rounded-full"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 0, y: 10 }}
          transition={{ duration: 0.8 }}
          style={{ left: point.x, top: point.y }}
        />
      ))}
    </div>
  );
};

export default CustomCursor;

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";

const BirdSystem = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasRef.current.appendChild(renderer.domElement);

    function createBird() {
      const bird = new THREE.Group();
      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, 0);
      wingShape.quadraticCurveTo(0.1, 0.05, 0.22, 0.01);
      wingShape.quadraticCurveTo(0.1, -0.01, 0, 0);
      const wingGeom = new THREE.ShapeGeometry(wingShape);
      const wingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      
      const leftWing = new THREE.Mesh(wingGeom, wingMat);
      bird.add(leftWing);
      const rightWing = new THREE.Mesh(wingGeom, wingMat);
      rightWing.scale.x = -1;
      bird.add(rightWing);
      
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 4), wingMat);
      body.scale.set(1, 0.6, 2.5);
      bird.add(body);
      
      return bird;
    }

    const birds: THREE.Group[] = [];
    for (let i = 0; i < 30; i++) {
      const bird = createBird();
      const x = (Math.random() - 0.5) * 15;
      const y = 1.5 + Math.random() * 3.5;
      const z = -2 - Math.random() * 7;
      bird.position.set(x, y, z);
      
      const baseScale = 0.4 + Math.random() * 0.4;
      bird.scale.setScalar(baseScale);
      
      bird.userData = {
        baseScale,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.015, 0, (Math.random() - 0.5) * 0.015),
        baseSpeed: 0.006 + Math.random() * 0.006,
        scareSpeed: 0.1 + Math.random() * 0.06,
        flapSpeed: 1.8,
        phase: Math.random() * Math.PI * 2
      };
      scene.add(bird);
      birds.push(bird);
    }

    const clock = new THREE.Clock();
    let requestID: number;
    const animate = () => {
      requestID = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      birds.forEach((bird, i) => {
        const ud = bird.userData;
        const distToMouse = bird.position.distanceTo(new THREE.Vector3(mousePos.current.x * 10, mousePos.current.y * 5, -3));
        const isScared = mousePos.current.active && distToMouse < 3.5;
        
        const burstFactor = Math.sin(time * 3 + i); 
        const isCurrentlyFlapping = isScared ? (burstFactor > -0.2) : (Math.sin(time * 1.5 + i) > 0);
        
        const targetFlapSpeed = isScared ? 4 : 1.5;
        ud.flapSpeed = THREE.MathUtils.lerp(ud.flapSpeed, targetFlapSpeed, 0.05);
        
        const flapCycle = (time * ud.flapSpeed + ud.phase) % (Math.PI * 2);
        let flapAngle = Math.sin(flapCycle);
        if (flapAngle > 0) flapAngle = Math.pow(flapAngle, 0.6); 
        else flapAngle = -Math.pow(Math.abs(flapAngle), 1.4);
        
        const finalAngle = isCurrentlyFlapping ? flapAngle * 1.1 : 0.1;
        
        if (isScared) {
          const evadeForce = bird.position.clone().sub(new THREE.Vector3(mousePos.current.x * 10, mousePos.current.y * 5, -3)).normalize();
          evadeForce.y += 0.25;
          const targetVel = ud.velocity.clone().add(evadeForce.multiplyScalar(0.035)).normalize().multiplyScalar(ud.scareSpeed);
          ud.velocity.lerp(targetVel, 0.04);
        } else {
          const drift = new THREE.Vector3(Math.sin(time * 0.1 + i) * 0.01, Math.cos(time * 0.15 + i) * 0.004, 0.012);
          ud.velocity.lerp(drift, 0.02);
        }

        bird.position.add(ud.velocity);
        
        const scaleFactor = THREE.MathUtils.mapLinear(bird.position.z, -15, 0, 0.4, 1.8);
        bird.scale.setScalar(ud.baseScale * scaleFactor);

        bird.children[0].rotation.y = finalAngle;
        bird.children[1].rotation.y = -finalAngle;
        
        const bank = ud.velocity.x * 4;
        const pitch = -ud.velocity.y * 2.5;
        bird.rotation.z = THREE.MathUtils.lerp(bird.rotation.z, -bank, 0.1);
        bird.rotation.x = THREE.MathUtils.lerp(bird.rotation.x, pitch, 0.1);
        
        if (Math.abs(bird.position.x) > 15) bird.position.x *= -0.98;
        if (bird.position.z > 2 || bird.position.z < -15) bird.position.z = -5;
        if (bird.position.y < 0.5 || bird.position.y > 7) bird.position.y = 3.5;

        bird.lookAt(bird.position.clone().add(ud.velocity));
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      mousePos.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePos.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mousePos.current.active = true;
    };
    const handleMouseLeave = () => { mousePos.current.active = false; };

    window.addEventListener("mousemove", handleMouseMove);
    canvasRef.current?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(requestID);
      window.removeEventListener("mousemove", handleMouseMove);
      if (canvasRef.current) canvasRef.current.innerHTML = "";
    };
  }, []);

  return <div ref={canvasRef} className="absolute inset-0 z-50 pointer-events-none" />;
};

const Hero4D = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 45, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 22 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {/* NỀN VIDEO FULL SCREEN - MUTED & LOOP */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{
          x: useTransform(springX, [-0.5, 0.5], [-25, 25]),
          y: useTransform(springY, [-0.5, 0.5], [-25, 25]),
          scale: 1.1
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          src="/dreamina-hero.mp4"
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedMetadata={(e) => { e.currentTarget.playbackRate = 0.4; }}
        />
        {/* Lớp phủ Gradient nhẹ nhàng để hài hòa với UI */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
      </motion.div>

      {/* ĐÀN CHIM CHUYÊN NGHIỆP OVERLAY */}
      <BirdSystem />

      {/* HIỆU ỨNG TIA SÁNG THIÊN ĐƯỜNG (God Rays) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden opacity-25">
        <div 
          className="absolute -top-[20%] -left-[10%] w-[150%] h-[150%] rotate-[-15deg]"
          style={{
            background: "repeating-linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 5%, rgba(255,255,200,0.05) 7%, rgba(255,255,255,0) 10%)",
          }}
        />
      </div>

      {/* GRADIENTS HÒA QUYỆN */}
      <div className="absolute inset-0 z-40 bg-gradient-to-r from-black/70 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

export default Hero4D;

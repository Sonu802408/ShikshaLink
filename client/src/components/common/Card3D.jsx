import React, { useRef, useState, useEffect } from 'react';

/**
 * Reusable 3D Perspective Card Wrapper
 * Adds subtle interactive 3D tilt & dynamic specular glare on desktop,
 * with graceful fallback to CSS translateY lift on mobile / touch.
 */
export const Card3D = ({
  children,
  className = '',
  maxTilt = 7,
  scale = 1.015,
  glare = true
}) => {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check for touch device or reduced motion
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsTouchDevice(hasTouch || reducedMotion);
  }, []);

  const handleMouseMove = (e) => {
    if (isTouchDevice || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to card center (-1 to 1)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    // Invert Y for standard natural 3D tilt
    const rotateX = -mouseY * maxTilt * 2;
    const rotateY = mouseX * maxTilt * 2;

    setTilt({ x: rotateX, y: rotateY });

    if (glare) {
      setGlarePos({
        x: ((e.clientX - rect.left) / width) * 100,
        y: ((e.clientY - rect.top) / height) * 100,
        opacity: 0.12
      });
    }
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      style={{ perspective: '1000px' }}
      className="h-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered && !isTouchDevice
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${scale}) translateY(-4px)`
            : 'rotateX(0deg) rotateY(0deg) scale(1) translateY(0px)',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
          transformStyle: 'preserve-3d'
        }}
        className={`relative h-full transition-shadow duration-300 ${className}`}
      >
        {children}

        {/* Specular Glare / Sheen Layer */}
        {glare && isHovered && !isTouchDevice && (
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300 overflow-hidden"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 65%)`,
              opacity: glarePos.opacity,
              zIndex: 30
            }}
          />
        )}
      </div>
    </div>
  );
};

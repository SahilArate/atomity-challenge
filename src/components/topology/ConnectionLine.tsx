"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface ConnectionLineProps {
  isActive: boolean;
}

export default function ConnectionLine({ isActive }: ConnectionLineProps) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        flex: 1,
        height: "2px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        minWidth: "40px",
      }}
      aria-hidden="true"
    >
      {/* Dotted line track */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isVisible ? { scaleX: 1 } : { scaleX: 0 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.6, ease: "easeOut" }
        }
        style={{
          width: "100%",
          height: "2px",
          backgroundImage: isActive
            ? "repeating-linear-gradient(90deg, var(--color-accent-success) 0px, var(--color-accent-success) 4px, transparent 4px, transparent 10px)"
            : "repeating-linear-gradient(90deg, var(--color-border-primary) 0px, var(--color-border-primary) 4px, transparent 4px, transparent 10px)",
          transformOrigin: "left",
          transition: `background-image 300ms ease`,
        }}
      />

      {/* Traveling pulse dot */}
      {isVisible && !shouldReduceMotion && (
        <motion.div
          animate={{
            x: ["0%", "100%"],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 1,
          }}
          style={{
            position: "absolute",
            left: 0,
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: isActive
              ? "var(--color-accent-success)"
              : "var(--color-text-muted)",
            boxShadow: isActive
              ? "0 0 8px var(--color-accent-success)"
              : "none",
            transform: "translateY(-50%)",
            top: "50%",
          }}
        />
      )}
    </div>
  );
}
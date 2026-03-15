import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { tokens } from "@/tokens";
import type { ResourceMetric } from "@/types";

interface ResourceBarProps {
  metric: ResourceMetric;
  maxValue: number;
  isHighlighted?: boolean;
  index: number;
}

function useCountUp(target: number, duration: number = 1200, shouldStart: boolean = false) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [target, duration, shouldStart]);

  return current;
}

export default function ResourceBar({
  metric,
  maxValue,
  isHighlighted = true,
  index,
}: ResourceBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const heightPercent = maxValue > 0 ? (metric.value / maxValue) * 100 : 0;
  const animatedCost = useCountUp(metric.cost, 1000, isVisible);

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
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // "spring" typed as const so TypeScript knows it's a literal, not just string
  const barVariants: Variants = {
    hidden: { scaleY: 0, opacity: 0 },
    visible: {
      scaleY: 1,
      opacity: isHighlighted ? 1 : 0.3,
      transition: {
        scaleY: {
          type: "spring" as const,
          stiffness: 120,
          damping: 20,
          delay: index * 0.08,
        },
        opacity: {
          duration: 0.2,
          delay: index * 0.08,
        },
      },
    },
  };

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: tokens.spacing.sm,
        flex: 1,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: tokens.font.sm,
          color: isHighlighted ? tokens.colors.textPrimary : tokens.colors.textMuted,
          fontWeight: 600,
          transition: `color ${tokens.transition.base}`,
          fontVariantNumeric: "tabular-nums",
        }}
        aria-live="polite"
      >
        ${animatedCost}
      </span>

      <div
        style={{
          width: "100%",
          height: "120px",
          display: "flex",
          alignItems: "flex-end",
          background: "var(--color-bg-secondary)",
          borderRadius: tokens.radius.sm,
          overflow: "hidden",
          position: "relative",
        }}
        role="meter"
        aria-label={`${metric.type} usage: ${metric.value} ${metric.unit}`}
        aria-valuenow={metric.value}
        aria-valuemin={0}
        aria-valuemax={maxValue}
      >
        <motion.div
          variants={shouldReduceMotion ? undefined : barVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          style={{
            width: "100%",
            height: `${heightPercent}%`,
            background: isHighlighted
              ? "var(--color-accent-success)"
              : "var(--color-text-muted)",
            borderRadius: `${tokens.radius.sm} ${tokens.radius.sm} 0 0`,
            transformOrigin: "bottom",
            boxShadow: isHighlighted ? "0 -2px 12px var(--color-node-glow)" : "none",
            transition: `background ${tokens.transition.base}, box-shadow ${tokens.transition.base}`,
          }}
        />
      </div>

      <span
        style={{
          fontSize: tokens.font.sm,
          color: isHighlighted ? tokens.colors.textSecondary : tokens.colors.textMuted,
          fontWeight: 500,
          transition: `color ${tokens.transition.base}`,
          textAlign: "center",
        }}
      >
        {metric.type}
      </span>
    </div>
  );
}
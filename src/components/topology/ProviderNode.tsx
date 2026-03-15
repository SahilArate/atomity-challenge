"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { tokens } from "@/tokens";
import Badge from "@/components/ui/Badge";
import type { CloudNode } from "@/types";

interface ProviderNodeProps {
  node: CloudNode;
  isActive: boolean;
  index: number;
  onSelect: (id: string) => void;
}

// SVG icons for each provider — built from scratch, no image imports
function ProviderIcon({ provider }: { provider: CloudNode["provider"] }) {
  const size = 32;

  if (provider === "aws") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="AWS">
        <path
          d="M9 19.5c-2.5 1-4 2.5-4 4 0 2.2 2.8 4 7 4s7-1.8 7-4c0-1.5-1.5-3-4-4"
          stroke="var(--color-accent-warning)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M16 8L8 12v8l8 4 8-4v-8L16 8z"
          stroke="var(--color-accent-warning)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M8 12l8 4 8-4"
          stroke="var(--color-accent-warning)"
          strokeWidth="1.5"
          fill="none"
        />
        <line
          x1="16" y1="16" x2="16" y2="24"
          stroke="var(--color-accent-warning)"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (provider === "azure") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="Azure">
        <path
          d="M14 6L6 26h6l4-8 4 4 4-16H14z"
          stroke="var(--color-accent-primary)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M18 18l4 4H8"
          stroke="var(--color-accent-primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }

  if (provider === "gcp") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="Google Cloud">
        <circle
          cx="16" cy="16" r="8"
          stroke="var(--color-accent-success)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M16 8 A8 8 0 0 1 24 16"
          stroke="var(--color-accent-error)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M24 16 A8 8 0 0 1 16 24"
          stroke="var(--color-accent-warning)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="16" cy="16" r="3" fill="var(--color-accent-primary)" />
      </svg>
    );
  }

  // On-Premise
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="On-Premise">
      <rect
        x="6" y="10" width="20" height="5"
        rx="1"
        stroke="var(--color-text-secondary)"
        strokeWidth="1.5"
        fill="none"
      />
      <rect
        x="6" y="17" width="20" height="5"
        rx="1"
        stroke="var(--color-text-secondary)"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="23" cy="12.5" r="1" fill="var(--color-accent-success)" />
      <circle cx="23" cy="19.5" r="1" fill="var(--color-accent-success)" />
    </svg>
  );
}

// Mini pod dots shown inside each node
function PodGrid({ count }: { count: number }) {
  const dots = Math.min(count, 9);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 8px)",
        gap: "3px",
      }}
      aria-label={`${count} pods running`}
    >
      {Array.from({ length: dots }).map((_, i) => (
        <div
          key={i}
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "2px",
            background: i < Math.floor(dots * 0.7)
              ? "var(--color-accent-success)"
              : "var(--color-border-primary)",
          }}
        />
      ))}
    </div>
  );
}

export default function ProviderNode({
  node,
  isActive,
  index,
  onSelect,
}: ProviderNodeProps) {
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
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const nodeVariants: Variants = {
    hidden: { opacity: 0, y: 24, scale: 0.92 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 18,
        delay: index * 0.12,
      },
    },
  };

  const statusVariantMap: Record<CloudNode["status"], "success" | "warning" | "error"> = {
    healthy: "success",
    warning: "warning",
    critical: "error",
  };

  return (
    <motion.div
      ref={ref}
      variants={shouldReduceMotion ? undefined : nodeVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="provider-node node-container"
      data-status={node.status}
      onClick={() => onSelect(node.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(node.id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isActive}
      aria-label={`${node.label} — ${node.region}. ${node.podCount} pods. Click to view details.`}
      style={{
        padding: tokens.spacing.lg,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacing.md,
        cursor: "pointer",
        outline: "none",
        opacity: isActive ? 1 : 0.75,
        transform: isActive ? "scale(1.02)" : "scale(1)",
        transition: `opacity ${tokens.transition.base}, transform ${tokens.transition.base}`,
        borderColor: isActive
          ? "var(--color-border-accent)"
          : "var(--color-border-primary)",
        boxShadow: isActive
          ? "0 0 0 2px var(--color-accent-success-muted), var(--shadow-hover)"
          : "var(--shadow-node)",
      }}
    >
      {/* Node header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: tokens.spacing.sm,
        }}
      >
        <ProviderIcon provider={node.provider} />
        <Badge
          label={node.status}
          variant={statusVariantMap[node.status]}
          size="sm"
        />
      </div>

      {/* Provider name and region */}
      <div>
        <h3
          className="node-region"
          style={{
            fontSize: tokens.font.md,
            fontWeight: 700,
            color: tokens.colors.textPrimary,
            marginBottom: "2px",
          }}
        >
          {node.label}
        </h3>
        <p
          style={{
            fontSize: tokens.font.sm,
            color: tokens.colors.textMuted,
          }}
        >
          {node.region}
        </p>
      </div>

      {/* Pod grid */}
      <PodGrid count={node.podCount} />

      {/* Cost */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: tokens.spacing.sm,
          borderTop: "1px solid var(--color-border-primary)",
        }}
      >
        <span
          style={{
            fontSize: tokens.font.sm,
            color: tokens.colors.textMuted,
          }}
        >
          Monthly
        </span>
        <span
          style={{
            fontSize: tokens.font.md,
            fontWeight: 700,
            color: tokens.colors.textPrimary,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          ${node.totalCost.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}
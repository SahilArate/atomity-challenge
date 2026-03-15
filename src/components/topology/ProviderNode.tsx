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

function ProviderIcon({ provider }: { provider: CloudNode["provider"] }) {
  const size = 28;

  if (provider === "aws") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="AWS">
        <path d="M16 8L8 12v8l8 4 8-4v-8L16 8z" stroke="#FF9900" strokeWidth="1.5" fill="none" />
        <path d="M8 12l8 4 8-4" stroke="#FF9900" strokeWidth="1.5" fill="none" />
        <line x1="16" y1="16" x2="16" y2="24" stroke="#FF9900" strokeWidth="1.5" />
        <path d="M9 22c-2 0.8-3 2-3 3 0 1.8 2.2 3 5 3s5-1.2 5-3c0-1-1-2-3-3" stroke="#FF9900" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  if (provider === "azure") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="Azure">
        <path d="M14 6L6 26h6l4-8 4 4 4-16H14z" stroke="#0078D4" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path d="M18 18l4 4H8" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  if (provider === "gcp") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="Google Cloud">
        <circle cx="16" cy="16" r="8" stroke="#4285F4" strokeWidth="1.5" fill="none" />
        <path d="M16 8 A8 8 0 0 1 24 16" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M24 16 A8 8 0 0 1 16 24" stroke="#FBBC04" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <circle cx="16" cy="16" r="3" fill="#34A853" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="On-Premise">
      <rect x="6" y="9" width="20" height="5" rx="1" stroke="var(--color-text-secondary)" strokeWidth="1.5" fill="none" />
      <rect x="6" y="16" width="20" height="5" rx="1" stroke="var(--color-text-secondary)" strokeWidth="1.5" fill="none" />
      <circle cx="23" cy="11.5" r="1" fill="var(--color-accent-success)" />
      <circle cx="23" cy="18.5" r="1" fill="var(--color-accent-success)" />
    </svg>
  );
}

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
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: i * 0.06,
            type: "spring" as const,
            stiffness: 260,
            damping: 20,
          }}
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
    hidden: { opacity: 0, y: 32, scale: 0.88 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 90,
        damping: 14,
        delay: index * 0.15,
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
      whileHover={shouldReduceMotion ? undefined : {
        scale: 1.04,
        y: -4,
        boxShadow: "var(--shadow-hover)",
        transition: { type: "spring" as const, stiffness: 300, damping: 20 },
      }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
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
        width: "175px",
        minWidth: "175px",
        background: isActive
          ? "var(--color-accent-success-muted)"
          : "var(--color-bg-node)",
        border: `1.5px solid ${isActive
          ? "var(--color-border-accent)"
          : "var(--color-border-primary)"}`,
        borderRadius: tokens.radius.lg,
        boxShadow: isActive ? "var(--shadow-hover)" : "var(--shadow-node)",
        transition: `background ${tokens.transition.base}, border-color ${tokens.transition.base}`,
      }}
    >
      {/* Node header — icon + badge */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: tokens.spacing.sm,
      }}>
        <ProviderIcon provider={node.provider} />
        <Badge label={node.status} variant={statusVariantMap[node.status]} size="sm" />
      </div>

      {/* Provider name */}
      <div>
        <h3 style={{
          fontSize: tokens.font.md,
          fontWeight: 700,
          color: tokens.colors.textPrimary,
          marginBottom: "2px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {node.label}
        </h3>
        <p style={{
          fontSize: tokens.font.sm,
          color: tokens.colors.textMuted,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {node.region}
        </p>
      </div>

      {/* Pod grid */}
      <PodGrid count={node.podCount} />

      {/* Cost row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: tokens.spacing.sm,
        borderTop: "1px solid var(--color-border-primary)",
        gap: tokens.spacing.sm,
      }}>
        <span style={{
          fontSize: tokens.font.sm,
          color: tokens.colors.textMuted,
          flexShrink: 0,
        }}>
          Monthly
        </span>
        <span style={{
          fontSize: tokens.font.md,
          fontWeight: 700,
          color: tokens.colors.textPrimary,
          fontVariantNumeric: "tabular-nums",
        }}>
          ${node.totalCost.toLocaleString()}
        </span>
      </div>

      {/* Savings pill */}
      <div style={{
        background: "var(--color-accent-success-muted)",
        border: "1px solid var(--color-border-accent)",
        borderRadius: tokens.radius.full,
        padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: tokens.spacing.xs,
      }}>
        <span style={{
          fontSize: tokens.font.sm,
          color: "var(--color-accent-success)",
          fontWeight: 600,
        }}>
          ↓ Save {node.savingsPercent}%
        </span>
      </div>
    </motion.div>
  );
}
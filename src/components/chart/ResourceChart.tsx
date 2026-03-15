"use client";

import { motion, useReducedMotion } from "framer-motion";
import { tokens } from "@/tokens";
import type { CloudNode } from "@/types";
import ResourceBar from "@/components/ui/ResourceBar";

interface ResourceChartProps {
  nodes: CloudNode[];
  activeNodeId: string | null;
}

function getAggregatedResources(nodes: CloudNode[], activeNodeId: string | null) {
  const sourceNodes = activeNodeId
    ? nodes.filter((n) => n.id === activeNodeId)
    : nodes;

  if (sourceNodes.length === 0) return [];

  const resourceTypes = sourceNodes[0].resources.map((r) => r.type);

  return resourceTypes.map((type) => {
    const total = sourceNodes.reduce((sum, node) => {
      const match = node.resources.find((r) => r.type === type);
      return sum + (match?.value ?? 0);
    }, 0);

    const totalCost = sourceNodes.reduce((sum, node) => {
      const match = node.resources.find((r) => r.type === type);
      return sum + (match?.cost ?? 0);
    }, 0);

    return {
      type,
      value: Math.round(total * 10) / 10,
      cost: totalCost,
      unit: sourceNodes[0].resources.find((r) => r.type === type)?.unit ?? "",
    };
  });
}

export default function ResourceChart({ nodes, activeNodeId }: ResourceChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const resources = getAggregatedResources(nodes, activeNodeId);
  const maxValue = Math.max(...resources.map((r) => r.value), 1);

  const activeNode = activeNodeId
    ? nodes.find((n) => n.id === activeNodeId)
    : null;

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        background: "var(--color-bg-card)",
        border: "1.5px solid var(--color-border-primary)",
        borderRadius: tokens.radius.xl,
        padding: tokens.spacing.xl,
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacing.lg,
        minWidth: "280px",
        maxWidth: "420px",
        width: "100%",
      }}
      role="region"
      aria-label="Resource usage chart"
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: tokens.spacing.sm,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: tokens.font.lg,
              fontWeight: 700,
              color: tokens.colors.textPrimary,
              marginBottom: "2px",
            }}
          >
            {activeNode ? activeNode.label : "All Providers"}
          </h3>
          <p
            style={{
              fontSize: tokens.font.sm,
              color: tokens.colors.textMuted,
            }}
          >
            {activeNode ? activeNode.region : "Aggregated view"}
          </p>
        </div>

        <div
          style={{
            background: "var(--color-accent-success-muted)",
            border: "1px solid var(--color-border-accent)",
            borderRadius: tokens.radius.md,
            padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
            textAlign: "right",
          }}
        >
          <p
            style={{
              fontSize: tokens.font.sm,
              color: "var(--color-accent-success)",
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            ${activeNode
              ? activeNode.totalCost.toLocaleString()
              : nodes.reduce((s, n) => s + n.totalCost, 0).toLocaleString()}
          </p>
          <p
            style={{
              color: tokens.colors.textMuted,
              fontSize: "0.7rem",
            }}
          >
            /month
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "6px",
          paddingTop: tokens.spacing.sm,
          overflowX: "auto",
          paddingBottom: tokens.spacing.xs,
        }}
        role="list"
        aria-label="Resource breakdown"
      >
        {resources.map((metric, i) => (
          <div key={metric.type} role="listitem" style={{ flex: 1, minWidth: 0 }}>
            <ResourceBar
              metric={metric}
              maxValue={maxValue}
              isHighlighted={true}
              index={i}
            />
          </div>
        ))}
      </div>

      {activeNode && (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: tokens.spacing.md,
            background: "var(--color-accent-success-muted)",
            borderRadius: tokens.radius.md,
            border: "1px solid var(--color-border-accent)",
          }}
        >
          <span
            style={{
              fontSize: tokens.font.sm,
              color: tokens.colors.textSecondary,
              fontWeight: 500,
            }}
          >
            Potential savings
          </span>
          <span
            style={{
              fontSize: tokens.font.lg,
              color: "var(--color-accent-success)",
              fontWeight: 700,
            }}
          >
            {activeNode.savingsPercent}%
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
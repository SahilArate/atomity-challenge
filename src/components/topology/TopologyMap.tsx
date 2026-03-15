"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { tokens } from "@/tokens";
import type { TopologyData } from "@/types";
import ProviderNode from "@/components/topology/ProviderNode";
import ConnectionLine from "@/components/topology/ConnectionLine";
import ResourceChart from "@/components/chart/ResourceChart";

interface TopologyMapProps {
  data: TopologyData;
}

function useScreenSize() {
  const [width, setWidth] = useState(1280);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return {
    isMobile: width < 640,
    isTablet: width >= 640 && width < 1024,
    isDesktop: width >= 1024,
  };
}

export default function TopologyMap({ data }: TopologyMapProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const { isMobile, isTablet, isDesktop } = useScreenSize();

  const handleNodeClick = useCallback((id: string) => {
    setActiveNodeId((prev) => (prev === id ? null : id));
  }, []);

  const [topLeft, topRight, bottomLeft, bottomRight] = data.nodes;

  const headerVariants = {
    hidden: { opacity: 0, y: -16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  const statsVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
        delay: 0.3,
      },
    },
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacing.xl,
        width: "100%",
      }}
    >
      <motion.div
        variants={shouldReduceMotion ? undefined : headerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: tokens.spacing.sm,
        }}
      >
        <span
          style={{
            fontSize: tokens.font.sm,
            fontWeight: 600,
            color: "var(--color-accent-success)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Multi-Cloud Intelligence
        </span>
        <h2
          className="text-fluid-hero"
          style={{
            fontWeight: 800,
            color: tokens.colors.textPrimary,
            lineHeight: 1.1,
            maxWidth: "600px",
          }}
        >
          Your entire infrastructure.{" "}
          <span style={{ color: "var(--color-accent-success)" }}>
            One view.
          </span>
        </h2>
        <p
          className="text-fluid-lg"
          style={{
            color: tokens.colors.textSecondary,
            maxWidth: "500px",
            lineHeight: 1.6,
          }}
        >
          Connects across AWS, Azure, GCP and on-premise clusters
          surfacing exactly where your cloud spend goes.
        </p>

        {isMobile && (
          <p
            style={{
              fontSize: tokens.font.sm,
              color: tokens.colors.textMuted,
              marginTop: tokens.spacing.xs,
            }}
          >
            Tap a provider to filter resources ↓
          </p>
        )}
      </motion.div>

      {isDesktop && (
        <div className="topology-container" style={{ width: "100%" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "175px 1fr auto 1fr 175px",
              gridTemplateRows: "auto auto",
              gap: tokens.spacing.lg,
              alignItems: "center",
              width: "100%",
            }}
          >
            <div style={{ gridColumn: 1, gridRow: 1 }}>
              <ProviderNode node={topLeft} isActive={activeNodeId === topLeft.id} onSelect={handleNodeClick} index={0} />
            </div>
            <div style={{ gridColumn: 2, gridRow: 1 }}>
              <ConnectionLine isActive={activeNodeId === topLeft.id} />
            </div>
            <div style={{ gridColumn: 3, gridRow: "1 / 3", alignSelf: "center" }}>
              <ResourceChart nodes={data.nodes} activeNodeId={activeNodeId} />
            </div>
            <div style={{ gridColumn: 4, gridRow: 1 }}>
              <ConnectionLine isActive={activeNodeId === topRight.id} />
            </div>
            <div style={{ gridColumn: 5, gridRow: 1 }}>
              <ProviderNode node={topRight} isActive={activeNodeId === topRight.id} onSelect={handleNodeClick} index={1} />
            </div>
            <div style={{ gridColumn: 1, gridRow: 2 }}>
              <ProviderNode node={bottomLeft} isActive={activeNodeId === bottomLeft.id} onSelect={handleNodeClick} index={2} />
            </div>
            <div style={{ gridColumn: 2, gridRow: 2 }}>
              <ConnectionLine isActive={activeNodeId === bottomLeft.id} />
            </div>
            <div style={{ gridColumn: 4, gridRow: 2 }}>
              <ConnectionLine isActive={activeNodeId === bottomRight.id} />
            </div>
            <div style={{ gridColumn: 5, gridRow: 2 }}>
              <ProviderNode node={bottomRight} isActive={activeNodeId === bottomRight.id} onSelect={handleNodeClick} index={3} />
            </div>
          </div>
        </div>
      )}

      {isTablet && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.spacing.xl,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: tokens.spacing.lg,
              width: "100%",
              maxWidth: "480px",
            }}
          >
            {data.nodes.map((node, i) => (
              <ProviderNode
                key={node.id}
                node={node}
                isActive={activeNodeId === node.id}
                onSelect={handleNodeClick}
                index={i}
              />
            ))}
          </div>

          <div style={{ width: "100%", maxWidth: "480px" }}>
            <ResourceChart nodes={data.nodes} activeNodeId={activeNodeId} />
          </div>
        </div>
      )}

      {isMobile && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.spacing.lg,
            alignItems: "stretch",
          }}
        >
       
          <ResourceChart nodes={data.nodes} activeNodeId={activeNodeId} />

          
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: tokens.spacing.md,
            }}
          >
            {data.nodes.map((node, i) => (
              <ProviderNode
                key={node.id}
                node={node}
                isActive={activeNodeId === node.id}
                onSelect={handleNodeClick}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      <motion.div
        variants={shouldReduceMotion ? undefined : statsVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : isTablet
            ? "1fr 1fr"
            : "repeat(3, 1fr)",
          gap: tokens.spacing.md,
        }}
      >
        {[
          {
            label: "Total Monthly Cost",
            value: `$${data.totalMonthlyCost.toLocaleString()}`,
            sub: "across all providers",
            highlight: false,
          },
          {
            label: "Potential Savings",
            value: `$${data.totalSavings.toLocaleString()}`,
            sub: "identified by Atomity",
            highlight: true,
          },
          {
            label: "Active Providers",
            value: `${data.nodes.length}`,
            sub: "connected clusters",
            highlight: false,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: stat.highlight
                ? "var(--color-accent-success-muted)"
                : "var(--color-bg-card)",
              border: `1.5px solid ${stat.highlight
                ? "var(--color-border-accent)"
                : "var(--color-border-primary)"}`,
              borderRadius: tokens.radius.lg,
              padding: tokens.spacing.lg,
              boxShadow: "var(--shadow-card)",
            }}
          >
            <p
              style={{
                fontSize: tokens.font.sm,
                color: tokens.colors.textMuted,
                marginBottom: tokens.spacing.xs,
              }}
            >
              {stat.label}
            </p>
            <p
              className="text-fluid-xl"
              style={{
                fontWeight: 800,
                color: stat.highlight
                  ? "var(--color-accent-success)"
                  : tokens.colors.textPrimary,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {stat.value}
            </p>
            <p
              style={{
                fontSize: tokens.font.sm,
                color: tokens.colors.textMuted,
                marginTop: "2px",
              }}
            >
              {stat.sub}
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { tokens } from "@/tokens";
import { useCloudData } from "@/hooks/useCloudData";
import TopologyMap from "@/components/topology/TopologyMap";
import ThemeToggle from "@/components/ui/ThemeToggle";

// Loading skeleton — shown while data is fetching
function LoadingSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacing.xl,
        width: "100%",
      }}
      aria-label="Loading cloud data"
      aria-busy="true"
    >
      {/* Header skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.md }}>
        <div
          style={{
            width: "160px",
            height: "14px",
            borderRadius: tokens.radius.full,
            background: "var(--color-bg-secondary)",
          }}
          className="skeleton-pulse"
        />
        <div
          style={{
            width: "400px",
            maxWidth: "100%",
            height: "40px",
            borderRadius: tokens.radius.md,
            background: "var(--color-bg-secondary)",
          }}
          className="skeleton-pulse"
        />
        <div
          style={{
            width: "320px",
            maxWidth: "100%",
            height: "20px",
            borderRadius: tokens.radius.md,
            background: "var(--color-bg-secondary)",
          }}
          className="skeleton-pulse"
        />
      </div>

      {/* Grid skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: tokens.spacing.lg,
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: "180px",
              borderRadius: tokens.radius.lg,
              background: "var(--color-bg-secondary)",
              animationDelay: `${i * 0.1}s`,
            }}
            className="skeleton-pulse"
          />
        ))}
      </div>
    </div>
  );
}

// Error state — shown when API fetch fails
function ErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: tokens.spacing.md,
        padding: tokens.spacing.xxl,
        background: "color-mix(in srgb, var(--color-accent-error) 8%, transparent)",
        border: "1.5px solid color-mix(in srgb, var(--color-accent-error) 25%, transparent)",
        borderRadius: tokens.radius.xl,
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: "2rem" }} aria-hidden="true">⚠️</span>
      <h3
        style={{
          fontSize: tokens.font.lg,
          fontWeight: 700,
          color: tokens.colors.textPrimary,
        }}
      >
        Failed to load infrastructure data
      </h3>
      <p
        style={{
          fontSize: tokens.font.sm,
          color: tokens.colors.textMuted,
          maxWidth: "400px",
        }}
      >
        {message}
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
          background: "var(--color-accent-error)",
          color: "#ffffff",
          border: "none",
          borderRadius: tokens.radius.full,
          fontSize: tokens.font.sm,
          fontWeight: 600,
          cursor: "pointer",
          transition: `opacity ${tokens.transition.fast}`,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        Retry
      </button>
    </div>
  );
}

export default function FeatureSection() {
  const shouldReduceMotion = useReducedMotion();
  const { topology, isLoading, isError, errorMessage, lastUpdated } = useCloudData();

  return (
    <section
      className="section-wrapper"
      aria-labelledby="topology-heading"
      style={{ minHeight: "100vh" }}
    >
      {/* Top navigation bar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: tokens.spacing.xxl,
          flexWrap: "wrap",
          gap: tokens.spacing.md,
        }}
        aria-label="Page navigation"
      >
        {/* Logo */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.spacing.sm,
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: tokens.radius.md,
              background: "var(--color-accent-success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-hidden="true"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <circle cx="9" cy="9" r="3" fill="white" />
              <circle cx="9" cy="3" r="1.5" fill="white" opacity="0.7" />
              <circle cx="9" cy="15" r="1.5" fill="white" opacity="0.7" />
              <circle cx="3" cy="9" r="1.5" fill="white" opacity="0.7" />
              <circle cx="15" cy="9" r="1.5" fill="white" opacity="0.7" />
            </svg>
          </div>
          <span
            style={{
              fontSize: tokens.font.lg,
              fontWeight: 800,
              color: tokens.colors.textPrimary,
              letterSpacing: "-0.02em",
            }}
          >
            atomity
          </span>
        </motion.div>

        {/* Right side — last updated + theme toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.spacing.md,
          }}
        >
          {lastUpdated && (
            <motion.span
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                fontSize: tokens.font.sm,
                color: tokens.colors.textMuted,
              }}
              aria-label={`Data last updated at ${lastUpdated}`}
            >
              Updated {lastUpdated}
            </motion.span>
          )}
          <ThemeToggle />
        </div>
      </nav>

      {/* Main content */}
      <main id="topology-heading">
        {isLoading && <LoadingSkeleton />}
        {isError && (
          <ErrorState message={errorMessage ?? "An unexpected error occurred."} />
        )}
        {topology && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <TopologyMap data={topology} />
          </motion.div>
        )}
      </main>
    </section>
  );
}
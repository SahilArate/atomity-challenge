"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { tokens } from "@/tokens";

function useTheme() {
  const theme = useSyncExternalStore(
    (onStoreChange) => {
      const observer = new MutationObserver(onStoreChange);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      return () => observer.disconnect();
    },
    () => document.documentElement.getAttribute("data-theme") ?? "light",
    () => "light"
  );

  return theme;
}

export default function ThemeToggle() {
  const shouldReduceMotion = useReducedMotion();
  const theme = useTheme();
  const isDark = theme === "dark";

  const toggle = useCallback(() => {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("atomity-theme", next);
  }, [isDark]);

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: tokens.spacing.sm,
        padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
        background: "var(--color-bg-card)",
        border: "1.5px solid var(--color-border-primary)",
        borderRadius: tokens.radius.full,
        cursor: "pointer",
        color: tokens.colors.textSecondary,
        fontSize: tokens.font.sm,
        fontWeight: 500,
        transition: `all ${tokens.transition.base}`,
      }}
    >
      <motion.span
        key={isDark ? "moon" : "sun"}
        initial={shouldReduceMotion ? false : { opacity: 0, rotate: -30, scale: 0.7 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{ display: "inline-flex", fontSize: "1rem" }}
        aria-hidden="true"
      >
        {isDark ? "☀️" : "🌙"}
      </motion.span>
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
import { tokens } from "@/tokens";

type BadgeVariant = "success" | "warning" | "error" | "neutral" | "primary";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  success: {
    background: "var(--color-accent-success-muted)",
    color: "var(--color-accent-success)",
    border: "1px solid var(--color-border-accent)",
  },
  warning: {
    background: "color-mix(in srgb, var(--color-accent-warning) 12%, transparent)",
    color: "var(--color-accent-warning)",
    border: "1px solid color-mix(in srgb, var(--color-accent-warning) 30%, transparent)",
  },
  error: {
    background: "color-mix(in srgb, var(--color-accent-error) 12%, transparent)",
    color: "var(--color-accent-error)",
    border: "1px solid color-mix(in srgb, var(--color-accent-error) 30%, transparent)",
  },
  neutral: {
    background: "var(--color-bg-secondary)",
    color: "var(--color-text-muted)",
    border: "1px solid var(--color-border-primary)",
  },
  primary: {
    background: "color-mix(in srgb, var(--color-accent-primary) 12%, transparent)",
    color: "var(--color-accent-primary)",
    border: "1px solid color-mix(in srgb, var(--color-accent-primary) 30%, transparent)",
  },
};

const sizeStyles = {
  sm: {
    fontSize: tokens.font.sm,
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    borderRadius: tokens.radius.full,
  },
  md: {
    fontSize: tokens.font.md,
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    borderRadius: tokens.radius.full,
  },
};

export default function Badge({ label, variant = "neutral", size = "sm" }: BadgeProps) {
  return (
    <span
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        display: "inline-flex",
        alignItems: "center",
        gap: tokens.spacing.xs,
        fontWeight: 500,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
      aria-label={`Status: ${label}`}
    >
      <span
        className="status-dot"
        style={{
          width: "6px",
          height: "6px",
          borderRadius: tokens.radius.full,
          background: "currentColor",
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
import { cn } from "@/lib/utils";
import React from "react";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number; // px
  thickness?: number; // border width in px
  variant?: "primary" | "secondary" | "ghost";
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 32,
  thickness = 3,
  variant = "primary",
  label,
  className,
  ...rest
}) => {
  const colorClasses = {
    primary: "border-primary/30 border-t-primary",
    secondary: "border-muted-foreground/30 border-t-muted-foreground",
    ghost: "border-white/20 border-t-white/80",
  }[variant];

  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)} {...rest}>
      <div
        aria-label={label || "Loading"}
        role="status"
        className={cn(
          "animate-spin rounded-full",
          colorClasses
        )}
        style={{
          width: size,
          height: size,
          borderWidth: thickness,
        }}
      />
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
};

export default Spinner;

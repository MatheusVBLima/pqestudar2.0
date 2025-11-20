import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface LinkButtonProps {
  to: string;
  external?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  variant?: "solid" | "outline";
  dataId: string;
  className?: string;
}

const LinkButton = ({
  to,
  external = false,
  icon,
  children,
  variant = "outline",
  dataId,
  className,
}: LinkButtonProps) => {
  const buttonClasses = cn(
    "group w-full block rounded-2xl py-4 md:py-5 px-5 md:px-6",
    "flex items-center justify-between gap-3",
    "transition-all duration-300 will-change-transform",
    "hover:-translate-y-1 hover:shadow-elegant",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
    "active:translate-y-0",
    variant === "solid"
      ? "bg-gradient-primary text-primary-foreground hover:opacity-95 shadow-lg border-0"
      : "border-2 border-primary/40 bg-background text-foreground hover:bg-primary/5 hover:border-primary",
    className
  );

  const content = (
    <>
      <span className="flex items-center gap-3 text-base md:text-lg font-medium text-left leading-snug">
        {icon && <span className="text-xl shrink-0">{icon}</span>}
        <span>{children}</span>
      </span>
      <ArrowRight className="w-5 h-5 shrink-0 opacity-80 transition-opacity group-hover:opacity-100" />
    </>
  );

  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses}
        data-evt="links_click"
        data-id={dataId}
        aria-label={typeof children === "string" ? children : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={to}
      className={buttonClasses}
      data-evt="links_click"
      data-id={dataId}
      aria-label={typeof children === "string" ? children : undefined}
    >
      {content}
    </Link>
  );
};

export default LinkButton;

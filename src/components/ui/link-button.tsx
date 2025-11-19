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
    "w-full h-auto min-h-[64px] px-6 py-4 text-base md:text-lg font-semibold rounded-2xl transition-all duration-300",
    "hover:-translate-y-0.5 hover:shadow-glow",
    "focus-visible:ring-4 focus-visible:ring-primary/30",
    variant === "solid"
      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
      : "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground",
    className
  );

  const content = (
    <span className="flex items-center justify-between gap-3 w-full">
      <span className="flex items-center gap-3">
        {icon && <span className="text-xl md:text-2xl shrink-0">{icon}</span>}
        <span className="text-left leading-tight">{children}</span>
      </span>
      <ArrowRight className="w-5 h-5 shrink-0 opacity-70" />
    </span>
  );

  if (external) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
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
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to={to}
        className={buttonClasses}
        data-evt="links_click"
        data-id={dataId}
        aria-label={typeof children === "string" ? children : undefined}
      >
        {content}
      </Link>
    </motion.div>
  );
};

export default LinkButton;

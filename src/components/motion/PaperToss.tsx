"use client";

import { motion } from "motion/react";

import { useMotionMode } from "@/lib/hooks/useReducedMotion";

/**
 * A sheet tossed onto the table: it drops in tilted and settles at a slight
 * angle, once, the first time it scrolls into view. Under reduced motion it
 * is simply there, already settled.
 */
export function PaperToss({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const mode = useMotionMode();
  const settled = { opacity: 1, y: 0, rotate: -0.4 };

  if (mode !== "full") {
    return (
      <div className={className} style={{ transform: "rotate(-0.4deg)" }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -48, rotate: -5 }}
      whileInView={settled}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ type: "spring", stiffness: 140, damping: 16, mass: 0.9 }}
    >
      {children}
    </motion.div>
  );
}

"use client";

import type { HTMLMotionProps, Transition, Variants } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

function offsetFor(direction: Direction, distance: number) {
  switch (direction) {
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    case "none":
      return {};
    case "up":
    default:
      return { y: distance };
  }
}

function revealVariants(direction: Direction, distance: number): Variants {
  return {
    hidden: {
      opacity: 0,
      ...offsetFor(direction, distance),
    },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };
}

function useRecoveredReveal() {
  const [isRecovered, setIsRecovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement | null>(null);

  const markRecovered = () => {
    setIsRecovered(true);
  };

  useEffect(() => {
    const recoverIfVisible = () => {
      const node = nodeRef.current;

      if (!node) {
        return;
      }

      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const isVisible =
        rect.bottom >= 0 &&
        rect.right >= 0 &&
        rect.top <= viewportHeight &&
        rect.left <= viewportWidth;

      if (isVisible) {
        markRecovered();
      }
    };

    const handlePageShow = () => {
      requestAnimationFrame(() => {
        recoverIfVisible();
        window.requestAnimationFrame(() => {
          recoverIfVisible();
        });
      });
    };
    const handlePopState = handlePageShow;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handlePageShow();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return { isRecovered, markRecovered, nodeRef };
}

export function MotionReveal({
  children,
  direction = "up",
  distance = 28,
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.2,
  className,
  ...props
}: HTMLMotionProps<"div"> & {
  children: ReactNode;
  direction?: Direction;
  distance?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  const { isRecovered, markRecovered, nodeRef } = useRecoveredReveal();
  const transition: Transition = reduce
    ? { duration: 0 }
    : { duration, delay, ease: [0.22, 1, 0.36, 1] };

  return (
    <motion.div
      ref={nodeRef}
      className={className}
      initial="hidden"
      whileInView="show"
      animate={isRecovered ? "show" : undefined}
      viewport={{ once, amount }}
      variants={reduce ? revealVariants("none", 0) : revealVariants(direction, distance)}
      transition={transition}
      onViewportEnter={() => {
        markRecovered();
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionStagger({
  children,
  delayChildren = 0.08,
  staggerChildren = 0.08,
  once = true,
  amount = 0.2,
  className,
  ...props
}: HTMLMotionProps<"div"> & {
  children: ReactNode;
  delayChildren?: number;
  staggerChildren?: number;
  once?: boolean;
  amount?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        show: {
          transition: reduce
            ? { duration: 0 }
            : {
                delayChildren,
                staggerChildren,
              },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({
  children,
  direction = "up",
  distance = 24,
  duration = 0.5,
  className,
  ...props
}: HTMLMotionProps<"div"> & {
  children: ReactNode;
  direction?: Direction;
  distance?: number;
  duration?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={reduce ? revealVariants("none", 0) : revealVariants(direction, distance)}
      transition={reduce ? { duration: 0 } : { duration, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionFloat({
  children,
  y = 10,
  duration = 4.5,
  delay = 0,
  className,
  ...props
}: HTMLMotionProps<"div"> & {
  children: ReactNode;
  y?: number;
  duration?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      animate={reduce ? undefined : { y: [0, -y, 0] }}
      transition={
        reduce
          ? undefined
          : { duration, delay, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}

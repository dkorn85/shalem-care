"use client";

// SmoothReveal · CSS-Animation bei Sichtbarkeit (IntersectionObserver-basiert).
//
// Nutzt nur native Browser-APIs — keine framer-motion-Dependency. Wenn der
// User `prefers-reduced-motion` aktiviert hat, sind die Übergänge sofort
// (kein Fade), damit barrierefrei.
//
// Verwendung:
//   <SmoothReveal>
//     <Komponente />
//   </SmoothReveal>
//
// Optional: delay (ms), direction ('up' | 'left' | 'right' | 'fade').

import { useEffect, useRef, useState } from "react";

export type SmoothRevealProps = {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "fade" | "scale";
  threshold?: number;
  once?: boolean;
  as?: "div" | "section" | "article" | "li";
  className?: string;
};

export function SmoothReveal({
  children,
  delay = 0,
  direction = "up",
  threshold = 0.15,
  once = true,
  as: Tag = "div",
  className = "",
}: SmoothRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [reducedMotion, once, threshold]);

  const baseStyle: React.CSSProperties = {
    transitionProperty: "opacity, transform",
    transitionDuration: "700ms",
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)", // smooth ease-out-quart
    transitionDelay: `${delay}ms`,
    willChange: visible ? "auto" : "opacity, transform",
  };

  const hiddenTransform =
    direction === "up"    ? "translate3d(0, 14px, 0)" :
    direction === "left"  ? "translate3d(-14px, 0, 0)" :
    direction === "right" ? "translate3d(14px, 0, 0)"  :
    direction === "scale" ? "scale(0.97)"                :
                            "none";

  const style: React.CSSProperties = visible
    ? { ...baseStyle, opacity: 1, transform: "none" }
    : { ...baseStyle, opacity: 0, transform: hiddenTransform };

  return (
    // @ts-expect-error — generischer Tag-Prop
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}

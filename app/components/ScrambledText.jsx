"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import "./ScrambledText.css";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

export default function ScrambledText({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = ".:",
  className = "",
  style = {},
  disableAnimations = false,
  children,
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const paragraph = root?.querySelector("p");
    if (!root || !paragraph) return undefined;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(pointer: coarse)");
    if (disableAnimations || motionQuery.matches || pointerQuery.matches) {
      return undefined;
    }

    const split = SplitText.create(paragraph, {
      type: "words,chars",
      charsClass: "scrambled-char",
      wordsClass: "scrambled-word",
    });
    const chars = split.chars;
    let centers = [];
    let pendingFrame = null;
    let pointer = { x: 0, y: 0 };
    const lastTriggered = new WeakMap();

    chars.forEach((character) => {
      const content = character.textContent || "";
      gsap.set(character, {
        display: "inline-block",
        attr: { "data-content": content },
      });
    });

    const measure = () => {
      centers = chars.map((character) => {
        const rect = character.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      });
    };

    const renderPointer = () => {
      pendingFrame = null;
      const now = performance.now();

      chars.forEach((character, index) => {
        const center = centers[index];
        if (!center) return;
        const distance = Math.hypot(pointer.x - center.x, pointer.y - center.y);
        if (distance >= radius || now - (lastTriggered.get(character) || 0) < 110) {
          return;
        }

        lastTriggered.set(character, now);
        gsap.to(character, {
          overwrite: true,
          duration: Math.max(0.12, duration * (1 - distance / radius)),
          scrambleText: {
            text: character.dataset.content || "",
            chars: scrambleChars,
            speed,
          },
          ease: "none",
        });
      });
    };

    const handleEnter = () => measure();
    const handleMove = (event) => {
      if (event.pointerType !== "mouse") return;
      pointer = { x: event.clientX, y: event.clientY };
      if (pendingFrame == null) pendingFrame = requestAnimationFrame(renderPointer);
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(root);
    measure();
    root.addEventListener("pointerenter", handleEnter);
    root.addEventListener("pointermove", handleMove, { passive: true });

    return () => {
      root.removeEventListener("pointerenter", handleEnter);
      root.removeEventListener("pointermove", handleMove);
      resizeObserver.disconnect();
      if (pendingFrame != null) cancelAnimationFrame(pendingFrame);
      gsap.killTweensOf(chars);
      split.revert();
    };
  }, [children, disableAnimations, duration, radius, scrambleChars, speed]);

  return (
    <div
      ref={rootRef}
      className={`scrambled-text${className ? ` ${className}` : ""}`}
      style={style}
    >
      <p>{children}</p>
    </div>
  );
}

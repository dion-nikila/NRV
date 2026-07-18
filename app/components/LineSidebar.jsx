"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./LineSidebar.css";

const FALLOFF_CURVES = {
  linear: (progress) => progress,
  smooth: (progress) => progress * progress * (3 - 2 * progress),
  sharp: (progress) => progress * progress * progress,
};

const DEFAULT_ITEMS = ["Overview", "Components", "Animations", "Showcase"];

export default function LineSidebar({
  items = DEFAULT_ITEMS,
  accentColor = "#9FE1CB",
  textColor = "#F4EAD9",
  markerColor = "rgba(244, 234, 217, 0.24)",
  showIndex = true,
  showMarker = true,
  proximityRadius = 100,
  maxShift = 30,
  falloff = "smooth",
  markerLength = 60,
  markerGap = 0,
  tickScale = 0.5,
  scaleTick = true,
  itemGap = 20,
  fontSize = 1.1,
  smoothing = 100,
  defaultActive = 0,
  onItemClick,
  className = "",
  ariaLabel = "Choose a capability",
}) {
  const listRef = useRef(null);
  const itemRefs = useRef([]);
  const buttonRefs = useRef([]);
  const targetsRef = useRef([]);
  const currentRef = useRef([]);
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const activeRef = useRef(defaultActive);
  const smoothingRef = useRef(smoothing);
  const reduceMotionRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(defaultActive);

  const applySettledState = useCallback(() => {
    itemRefs.current.forEach((item, index) => {
      if (!item) return;
      const value = activeRef.current === index ? 1 : 0;
      currentRef.current[index] = value;
      item.style.setProperty("--effect", String(value));
    });
  }, []);

  const startLoop = useCallback(() => {
    if (reduceMotionRef.current) {
      applySettledState();
      return;
    }
    if (rafRef.current != null) return;

    const runFrame = (now) => {
      const delta = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      const tau = Math.max(smoothingRef.current, 1) / 1000;
      const easing = 1 - Math.exp(-delta / tau);
      let moving = false;

      itemRefs.current.forEach((item, index) => {
        if (!item) return;
        const target = Math.max(
          targetsRef.current[index] || 0,
          activeRef.current === index ? 1 : 0,
        );
        const current = currentRef.current[index] || 0;
        const next = current + (target - current) * easing;
        const settled = Math.abs(target - next) < 0.0015;
        const value = settled ? target : next;
        currentRef.current[index] = value;
        item.style.setProperty("--effect", value.toFixed(4));
        if (!settled) moving = true;
      });

      rafRef.current = moving ? requestAnimationFrame(runFrame) : null;
    };

    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [applySettledState]);

  const handlePointerMove = useCallback(
    (event) => {
      if (
        event.pointerType !== "mouse" ||
        reduceMotionRef.current ||
        !window.matchMedia("(pointer: fine)").matches
      ) {
        return;
      }

      const list = listRef.current;
      if (!list) return;
      const rect = list.getBoundingClientRect();
      const pointerY = event.clientY - rect.top;
      const ease = FALLOFF_CURVES[falloff] ?? FALLOFF_CURVES.linear;

      itemRefs.current.forEach((item, index) => {
        if (!item) return;
        const center = item.offsetTop + item.offsetHeight / 2;
        const distance = Math.abs(pointerY - center);
        targetsRef.current[index] = ease(
          Math.max(0, 1 - distance / proximityRadius),
        );
      });
      startLoop();
    },
    [falloff, proximityRadius, startLoop],
  );

  const handlePointerLeave = useCallback(() => {
    targetsRef.current = items.map(() => 0);
    startLoop();
  }, [items, startLoop]);

  const chooseItem = useCallback(
    (index) => {
      const label = items[index];
      if (label == null) return;
      activeRef.current = index;
      setActiveIndex(index);
      onItemClick?.(index, label);
    },
    [items, onItemClick],
  );

  const handleKeyDown = useCallback(
    (event, index) => {
      let nextIndex = null;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        nextIndex = (index + 1) % items.length;
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        nextIndex = (index - 1 + items.length) % items.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = items.length - 1;
      }

      if (nextIndex == null) return;
      event.preventDefault();
      chooseItem(nextIndex);
      buttonRefs.current[nextIndex]?.focus();
    },
    [chooseItem, items.length],
  );

  useEffect(() => {
    activeRef.current = activeIndex;
    smoothingRef.current = smoothing;
  }, [activeIndex, smoothing]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      reduceMotionRef.current = query.matches;
      if (query.matches && rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      applySettledState();
    };

    syncMotion();
    query.addEventListener("change", syncMotion);
    return () => query.removeEventListener("change", syncMotion);
  }, [applySettledState]);

  useEffect(() => {
    startLoop();
  }, [activeIndex, startLoop]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  return (
    <nav
      className={`line-sidebar${showMarker ? " line-sidebar--markers" : ""}${scaleTick ? " line-sidebar--scale-tick" : ""}${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel}
      style={{
        "--accent-color": accentColor,
        "--text-color": textColor,
        "--marker-color": markerColor,
        "--marker-length": `${markerLength}px`,
        "--marker-gap": `${markerGap}px`,
        "--tick-scale": tickScale,
        "--max-shift": `${maxShift}px`,
        "--item-gap": `${itemGap}px`,
        "--font-size": `${fontSize}rem`,
      }}
    >
      <ul
        ref={listRef}
        className="line-sidebar__list"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {items.map((label, index) => (
          <li
            key={`${label}-${index}`}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            className="line-sidebar__item"
          >
            {showMarker && (
              <span className="line-sidebar__marker" aria-hidden="true" />
            )}
            <button
              ref={(element) => {
                buttonRefs.current[index] = element;
              }}
              type="button"
              className="line-sidebar__button"
              aria-pressed={activeIndex === index}
              onClick={() => chooseItem(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {showIndex && (
                <span className="line-sidebar__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
              <span className="line-sidebar__text">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./Cubes.css";

const Cubes = ({
  gridSize = 10,
  cubeSize,
  maxAngle = 45,
  radius = 3,
  easing = "power3.out",
  duration = { enter: 0.3, leave: 0.6 },
  cellGap,
  borderStyle = "1px solid #fff",
  faceColor = "#120F17",
  shadow = false,
  autoAnimate = true,
  rippleOnClick = true,
  rippleColor = "#fff",
  rippleSpeed = 2,
  className = "",
  style,
  ariaLabel,
}) => {
  const sceneRef = useRef(null);
  const rafRef = useRef(null);
  const userActiveRef = useRef(false);
  const lastUserInputRef = useRef(0);
  const activeCubesRef = useRef(new Set());
  const isVisibleRef = useRef(true);
  const simPosRef = useRef({ x: 0, y: 0 });
  const simTargetRef = useRef({ x: 0, y: 0 });
  const simRAFRef = useRef(null);
  const touchGestureRef = useRef(null);
  const ignoreClickUntilRef = useRef(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const colGap =
    typeof cellGap === "number"
      ? `${cellGap}px`
      : cellGap?.col !== undefined
        ? `${cellGap.col}px`
        : "5%";
  const rowGap =
    typeof cellGap === "number"
      ? `${cellGap}px`
      : cellGap?.row !== undefined
        ? `${cellGap.row}px`
        : "5%";

  const enterDur = duration?.enter ?? 0.3;
  const leaveDur = duration?.leave ?? 0.6;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener?.("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener?.("change", updatePreference);
    };
  }, []);

  const markUserActive = useCallback(() => {
    userActiveRef.current = true;
    lastUserInputRef.current = performance.now();
  }, []);

  const tiltAt = useCallback(
    (rowCenter, colCenter) => {
      if (!sceneRef.current || prefersReducedMotion) return;

      const nextActive = new Set();
      sceneRef.current.querySelectorAll(".cube").forEach((cube) => {
        const r = Number(cube.dataset.row);
        const c = Number(cube.dataset.col);
        const dist = Math.hypot(r - rowCenter, c - colCenter);

        if (dist <= radius) {
          nextActive.add(cube);
          const pct = radius > 0 ? 1 - dist / radius : 1;
          const angle = pct * maxAngle;
          gsap.to(cube, {
            duration: enterDur,
            ease: easing,
            overwrite: true,
            rotateX: -angle,
            rotateY: angle,
          });
        }
      });

      activeCubesRef.current.forEach((cube) => {
        if (nextActive.has(cube)) return;
        gsap.to(cube, {
          duration: leaveDur,
          ease: "power3.out",
          overwrite: true,
          rotateX: 0,
          rotateY: 0,
        });
      });
      activeCubesRef.current = nextActive;
    },
    [radius, maxAngle, enterDur, leaveDur, easing, prefersReducedMotion],
  );

  const tiltFromPoint = useCallback(
    (clientX, clientY) => {
      const scene = sceneRef.current;
      if (!scene || prefersReducedMotion) return false;

      const rect = scene.getBoundingClientRect();
      const isInside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;

      if (!isInside || rect.width === 0 || rect.height === 0) return false;

      const cellW = rect.width / gridSize;
      const cellH = rect.height / gridSize;
      const colCenter = (clientX - rect.left) / cellW;
      const rowCenter = (clientY - rect.top) / cellH;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));
      return true;
    },
    [gridSize, prefersReducedMotion, tiltAt],
  );

  const onPointerMove = useCallback(
    (event) => {
      if (event.pointerType === "touch" || prefersReducedMotion) return;
      markUserActive();
      tiltFromPoint(event.clientX, event.clientY);
    },
    [markUserActive, prefersReducedMotion, tiltFromPoint],
  );

  const resetAll = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const cubes = scene.querySelectorAll(".cube");
    if (prefersReducedMotion) {
      gsap.set(cubes, { rotateX: 0, rotateY: 0 });
      activeCubesRef.current = new Set();
      return;
    }

    gsap.to(cubes, {
      duration: leaveDur,
      rotateX: 0,
      rotateY: 0,
      ease: "power3.out",
      overwrite: true,
    });
    activeCubesRef.current = new Set();
  }, [leaveDur, prefersReducedMotion]);

  const rippleAt = useCallback(
    (clientX, clientY) => {
      const scene = sceneRef.current;
      if (!rippleOnClick || !scene || prefersReducedMotion) return;

      const rect = scene.getBoundingClientRect();
      const isInside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;
      if (!isInside || rect.width === 0 || rect.height === 0) return;

      const cellW = rect.width / gridSize;
      const cellH = rect.height / gridSize;
      const colHit = Math.floor((clientX - rect.left) / cellW);
      const rowHit = Math.floor((clientY - rect.top) / cellH);

      const speed = Math.max(0.01, rippleSpeed);
      const spreadDelay = 0.15 / speed;
      const animDuration = 0.3 / speed;
      const holdTime = 0.6 / speed;
      const rings = {};

      scene.querySelectorAll(".cube").forEach((cube) => {
        const r = Number(cube.dataset.row);
        const c = Number(cube.dataset.col);
        const dist = Math.hypot(r - rowHit, c - colHit);
        const ring = Math.round(dist);
        if (!rings[ring]) rings[ring] = [];
        rings[ring].push(cube);
      });

      Object.keys(rings)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach((ring) => {
          const delay = ring * spreadDelay;
          const faces = rings[ring].flatMap((cube) =>
            Array.from(cube.querySelectorAll(".cube-face")),
          );

          gsap.to(faces, {
            backgroundColor: rippleColor,
            duration: animDuration,
            delay,
            ease: "power3.out",
            overwrite: "auto",
          });
          gsap.to(faces, {
            backgroundColor: faceColor,
            duration: animDuration,
            delay: delay + animDuration + holdTime,
            ease: "power3.out",
            overwrite: "auto",
          });
        });
    },
    [
      rippleOnClick,
      gridSize,
      faceColor,
      rippleColor,
      rippleSpeed,
      prefersReducedMotion,
    ],
  );

  const onClick = useCallback(
    (event) => {
      if (performance.now() < ignoreClickUntilRef.current) return;
      markUserActive();
      rippleAt(event.clientX, event.clientY);
    },
    [markUserActive, rippleAt],
  );

  const onTouchStart = useCallback(
    (event) => {
      if (event.touches.length !== 1) return;

      const touch = event.touches[0];
      const scene = sceneRef.current;
      if (!scene) return;
      const rect = scene.getBoundingClientRect();
      const isInside =
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom;
      if (!isInside) return;

      touchGestureRef.current = {
        active: true,
        scrolling: false,
        startX: touch.clientX,
        startY: touch.clientY,
        lastX: touch.clientX,
        lastY: touch.clientY,
        startedAt: performance.now(),
      };

      markUserActive();
      tiltFromPoint(touch.clientX, touch.clientY);
    },
    [markUserActive, tiltFromPoint],
  );

  const onTouchMove = useCallback(
    (event) => {
      const gesture = touchGestureRef.current;
      if (!gesture?.active || event.touches.length !== 1) return;

      const touch = event.touches[0];
      const dx = touch.clientX - gesture.startX;
      const dy = touch.clientY - gesture.startY;
      gesture.lastX = touch.clientX;
      gesture.lastY = touch.clientY;

      // Let vertical gestures become ordinary page scrolling. The listener is
      // passive, so Cubes never cancels the browser's native scroll behavior.
      if (
        !gesture.scrolling &&
        Math.abs(dy) > 10 &&
        Math.abs(dy) > Math.abs(dx) * 1.15
      ) {
        gesture.scrolling = true;
        resetAll();
      }

      if (gesture.scrolling) return;

      markUserActive();
      if (!tiltFromPoint(touch.clientX, touch.clientY)) resetAll();
    },
    [markUserActive, resetAll, tiltFromPoint],
  );

  const finishTouch = useCallback(
    (event, cancelled = false) => {
      const gesture = touchGestureRef.current;
      if (!gesture?.active) return;

      const touch = event.changedTouches?.[0];
      const clientX = touch?.clientX ?? gesture.lastX;
      const clientY = touch?.clientY ?? gesture.lastY;
      const travel = Math.hypot(
        clientX - gesture.startX,
        clientY - gesture.startY,
      );
      const elapsed = performance.now() - gesture.startedAt;

      if (!cancelled && !gesture.scrolling && travel <= 12 && elapsed <= 700) {
        rippleAt(clientX, clientY);
        // Mobile browsers may synthesize a click after touchend. Ignore that
        // duplicate so a single tap creates a single ripple.
        ignoreClickUntilRef.current = performance.now() + 750;
      }

      touchGestureRef.current = null;
      resetAll();
    },
    [resetAll, rippleAt],
  );

  const onTouchEnd = useCallback(
    (event) => finishTouch(event),
    [finishTouch],
  );

  const onTouchCancel = useCallback(
    (event) => finishTouch(event, true),
    [finishTouch],
  );

  useEffect(() => {
    if (!autoAnimate || prefersReducedMotion || !sceneRef.current) return;

    const scene = sceneRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = Boolean(entry?.isIntersecting);
        if (!entry?.isIntersecting) resetAll();
      },
      { rootMargin: "100px 0px", threshold: 0.01 },
    );
    observer.observe(scene);

    simPosRef.current = {
      x: Math.random() * gridSize,
      y: Math.random() * gridSize,
    };
    simTargetRef.current = {
      x: Math.random() * gridSize,
      y: Math.random() * gridSize,
    };

    const speed = 0.035;
    let lastUpdate = 0;
    const loop = (now) => {
      if (!isVisibleRef.current || document.hidden) {
        simRAFRef.current = requestAnimationFrame(loop);
        return;
      }

      if (userActiveRef.current && now - lastUserInputRef.current > 3000) {
        userActiveRef.current = false;
      }

      if (now - lastUpdate < 42) {
        simRAFRef.current = requestAnimationFrame(loop);
        return;
      }
      lastUpdate = now;

      if (!userActiveRef.current) {
        const pos = simPosRef.current;
        const target = simTargetRef.current;
        pos.x += (target.x - pos.x) * speed;
        pos.y += (target.y - pos.y) * speed;
        tiltAt(pos.y, pos.x);

        if (Math.hypot(pos.x - target.x, pos.y - target.y) < 0.1) {
          simTargetRef.current = {
            x: Math.random() * gridSize,
            y: Math.random() * gridSize,
          };
        }
      }

      simRAFRef.current = requestAnimationFrame(loop);
    };

    simRAFRef.current = requestAnimationFrame(loop);
    return () => {
      observer.disconnect();
      if (simRAFRef.current != null) cancelAnimationFrame(simRAFRef.current);
    };
  }, [autoAnimate, gridSize, prefersReducedMotion, resetAll, tiltAt]);

  useEffect(() => {
    const element = sceneRef.current;
    if (!element) return;

    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerleave", resetAll);
    element.addEventListener("click", onClick);
    element.addEventListener("touchmove", onTouchMove, { passive: true });
    element.addEventListener("touchstart", onTouchStart, { passive: true });
    element.addEventListener("touchend", onTouchEnd, { passive: true });
    element.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerleave", resetAll);
      element.removeEventListener("click", onClick);
      element.removeEventListener("touchmove", onTouchMove);
      element.removeEventListener("touchstart", onTouchStart);
      element.removeEventListener("touchend", onTouchEnd);
      element.removeEventListener("touchcancel", onTouchCancel);

      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      gsap.killTweensOf(element.querySelectorAll(".cube, .cube-face"));
    };
  }, [
    onPointerMove,
    resetAll,
    onClick,
    onTouchMove,
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
  ]);

  useEffect(() => {
    if (prefersReducedMotion) resetAll();
  }, [prefersReducedMotion, resetAll]);

  const cells = Array.from({ length: gridSize });
  const sceneStyle = {
    gridTemplateColumns: cubeSize
      ? `repeat(${gridSize}, ${cubeSize}px)`
      : `repeat(${gridSize}, 1fr)`,
    gridTemplateRows: cubeSize
      ? `repeat(${gridSize}, ${cubeSize}px)`
      : `repeat(${gridSize}, 1fr)`,
    columnGap: colGap,
    rowGap,
  };
  const wrapperStyle = {
    ...style,
    "--cube-face-border": borderStyle,
    "--cube-face-bg": faceColor,
    "--cube-face-shadow":
      shadow === true ? "0 0 6px rgba(0,0,0,.5)" : shadow || "none",
    ...(cubeSize
      ? {
          width: `${gridSize * cubeSize}px`,
          height: `${gridSize * cubeSize}px`,
        }
      : {}),
  };

  return (
    <div
      className={`default-animation ${className}`.trim()}
      style={wrapperStyle}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel || undefined}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <div
        ref={sceneRef}
        className="default-animation--scene"
        style={sceneStyle}
      >
        {cells.map((_, row) =>
          cells.map((__, column) => (
            <div
              key={`${row}-${column}`}
              className="cube"
              data-row={row}
              data-col={column}
            >
              <div className="cube-face cube-face--top" />
              <div className="cube-face cube-face--bottom" />
              <div className="cube-face cube-face--left" />
              <div className="cube-face cube-face--right" />
              <div className="cube-face cube-face--front" />
              <div className="cube-face cube-face--back" />
            </div>
          )),
        )}
      </div>
    </div>
  );
};

export default Cubes;

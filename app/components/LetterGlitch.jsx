"use client";

import { useEffect, useRef, useState } from "react";

const LetterGlitch = ({
  glitchColors = ["#2b4539", "#61dca3", "#61b3dc"],
  className = "",
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789",
  backgroundColor = "#000000",
  style,
  ariaLabel,
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const letters = useRef([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const canvasSize = useRef({ width: 0, height: 0 });
  const context = useRef(null);
  const lastGlitchTime = useRef(0);
  const lastFrameTime = useRef(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const lettersAndSymbols = Array.from(characters);

  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener?.("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener?.("change", updatePreference);
    };
  }, []);

  const getRandomChar = () => {
    return lettersAndSymbols[
      Math.floor(Math.random() * lettersAndSymbols.length)
    ];
  };

  const getRandomColor = () => {
    return glitchColors[Math.floor(Math.random() * glitchColors.length)];
  };

  const parseColor = (value) => {
    const rgbMatch = value.match(
      /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i,
    );
    if (rgbMatch) {
      return {
        r: Number(rgbMatch[1]),
        g: Number(rgbMatch[2]),
        b: Number(rgbMatch[3]),
      };
    }

    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const expandedHex = value.replace(shorthandRegex, (match, r, g, b) => {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
      expandedHex,
    );
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const interpolateColor = (start, end, factor) => {
    const result = {
      r: Math.round(start.r + (end.r - start.r) * factor),
      g: Math.round(start.g + (end.g - start.g) * factor),
      b: Math.round(start.b + (end.b - start.b) * factor),
    };
    return `rgb(${result.r}, ${result.g}, ${result.b})`;
  };

  const calculateGrid = (width, height) => {
    const columns = Math.ceil(width / charWidth);
    const rows = Math.ceil(height / charHeight);
    return { columns, rows };
  };

  const initializeLetters = (columns, rows) => {
    grid.current = { columns, rows };
    const totalLetters = columns * rows;
    letters.current = Array.from({ length: totalLetters }, () => ({
      char: getRandomChar(),
      color: getRandomColor(),
      targetColor: getRandomColor(),
      colorProgress: 1,
    }));
  };

  const drawLetters = () => {
    const canvas = canvasRef.current;
    if (!context.current || !canvas || letters.current.length === 0) return;

    const ctx = context.current;
    const { width, height } = canvasSize.current;
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";

    letters.current.forEach((letter, index) => {
      const x = (index % grid.current.columns) * charWidth;
      const y = Math.floor(index / grid.current.columns) * charHeight;
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, x, y);
    });
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = parent.getBoundingClientRect();
    canvasSize.current = { width: rect.width, height: rect.height };
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (context.current) {
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const { columns, rows } = calculateGrid(rect.width, rect.height);
    initializeLetters(columns, rows);
    drawLetters();
  };

  const updateLetters = () => {
    if (!letters.current || letters.current.length === 0) return;

    const updateCount = Math.max(
      1,
      Math.floor(letters.current.length * 0.035),
    );

    for (let i = 0; i < updateCount; i += 1) {
      const index = Math.floor(Math.random() * letters.current.length);
      if (!letters.current[index]) continue;

      letters.current[index].char = getRandomChar();
      letters.current[index].targetColor = getRandomColor();

      if (!smooth) {
        letters.current[index].color = letters.current[index].targetColor;
        letters.current[index].colorProgress = 1;
      } else {
        letters.current[index].colorProgress = 0;
      }
    }
  };

  const handleSmoothTransitions = () => {
    let needsRedraw = false;
    letters.current.forEach((letter) => {
      if (letter.colorProgress < 1) {
        letter.colorProgress += 0.05;
        if (letter.colorProgress > 1) letter.colorProgress = 1;

        const startRgb = parseColor(letter.color);
        const endRgb = parseColor(letter.targetColor);
        if (startRgb && endRgb) {
          letter.color = interpolateColor(
            startRgb,
            endRgb,
            letter.colorProgress,
          );
          needsRedraw = true;
        }
      }
    });

    if (needsRedraw) drawLetters();
  };

  const animate = (now) => {
    if (now - lastFrameTime.current < 32) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    lastFrameTime.current = now;

    if (now - lastGlitchTime.current >= glitchSpeed) {
      updateLetters();
      drawLetters();
      lastGlitchTime.current = now;
    }

    if (smooth) handleSmoothTransitions();
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    context.current = canvas.getContext("2d");
    if (!context.current) return;

    let isInView = true;
    const canAnimate = () =>
      !prefersReducedMotion && isInView && !document.hidden;
    const stopAnimation = () => {
      if (animationRef.current != null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
    const startAnimation = () => {
      if (!canAnimate() || animationRef.current != null) return;
      lastGlitchTime.current = performance.now();
      lastFrameTime.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        stopAnimation();
        resizeCanvas();
        startAnimation();
      }, 100);
    };

    const parent = canvas.parentElement;
    const resizeObserver =
      parent && "ResizeObserver" in window
        ? new ResizeObserver(handleResize)
        : null;
    if (parent) resizeObserver?.observe(parent);
    const visibilityObserver =
      parent && "IntersectionObserver" in window
        ? new IntersectionObserver(
            ([entry]) => {
              isInView = Boolean(entry?.isIntersecting);
              if (isInView) startAnimation();
              else stopAnimation();
            },
            { rootMargin: "100px 0px", threshold: 0.01 },
          )
        : null;
    if (parent) visibilityObserver?.observe(parent);

    const handleVisibility = () => {
      if (document.hidden) stopAnimation();
      else startAnimation();
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);
    startAnimation();

    return () => {
      stopAnimation();
      clearTimeout(resizeTimeout);
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // React Bits keeps its canvas loop local to this effect. Color/character
    // updates rebuild the canvas through the dependency list below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    glitchSpeed,
    smooth,
    prefersReducedMotion,
    characters,
    glitchColors,
  ]);

  const containerStyle = {
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundColor,
    overflow: "hidden",
    ...style,
  };

  const canvasStyle = {
    display: "block",
    width: "100%",
    height: "100%",
  };

  const outerVignetteStyle = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background:
      "radial-gradient(circle, rgba(22,36,31,0) 58%, rgba(22,36,31,0.98) 100%)",
  };

  const centerVignetteStyle = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background:
      "radial-gradient(circle, rgba(22,36,31,0.88) 0%, rgba(22,36,31,0) 62%)",
  };

  return (
    <div
      style={containerStyle}
      className={className}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel || undefined}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <canvas ref={canvasRef} style={canvasStyle} role="presentation" />
      {outerVignette && <div aria-hidden="true" style={outerVignetteStyle} />}
      {centerVignette && (
        <div aria-hidden="true" style={centerVignetteStyle} />
      )}
    </div>
  );
};

export default LetterGlitch;

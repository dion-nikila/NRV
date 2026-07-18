"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import "./Carousel.css";

const DRAG_BUFFER = 18;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 32 };

function CarouselItem({
  item,
  index,
  itemWidth,
  round,
  trackItemOffset,
  x,
  transition,
  reduceMotion,
  hidden,
  slideLabel,
}) {
  const range = [
    -(index + 1) * trackItemOffset,
    -index * trackItemOffset,
    -(index - 1) * trackItemOffset,
  ];
  const rotateY = useTransform(
    x,
    range,
    reduceMotion ? [0, 0, 0] : [16, 0, -16],
    { clamp: false },
  );

  return (
    <motion.article
      className={`carousel-item${round ? " round" : ""}`}
      style={{
        width: itemWidth,
        height: round ? itemWidth : "100%",
        rotateY,
        ...(round && { borderRadius: "50%" }),
      }}
      transition={transition}
      role="group"
      aria-roledescription="slide"
      aria-label={slideLabel}
      aria-hidden={hidden || undefined}
    >
      <div className={`carousel-item-header${round ? " round" : ""}`}>
        <span className="carousel-icon-container" aria-hidden="true">
          {item.icon}
        </span>
        {item.meta && <span className="carousel-item-meta">{item.meta}</span>}
      </div>
      <div className="carousel-item-content">
        <h3 className="carousel-item-title">{item.title}</h3>
        <p className="carousel-item-description">{item.description}</p>
      </div>
    </motion.article>
  );
}

export default function Carousel({
  items = [],
  baseWidth = 1000,
  autoplay = false,
  autoplayDelay = 4000,
  pauseOnHover = true,
  loop = false,
  round = false,
  ariaLabel = "Carousel",
}) {
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const [availableWidth, setAvailableWidth] = useState(baseWidth);
  const [position, setPosition] = useState(loop ? 1 : 0);
  const [isPaused, setIsPaused] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const itemWidth = Math.max(260, Math.min(baseWidth, availableWidth));
  const trackItemOffset = itemWidth + GAP;
  const itemsForRender = useMemo(() => {
    if (!loop || items.length === 0) return items;
    return [items[items.length - 1], ...items, items[0]];
  }, [items, loop]);

  const activeIndex =
    items.length === 0
      ? 0
      : loop
        ? (position - 1 + items.length) % items.length
        : Math.min(position, items.length - 1);

  const effectiveTransition = isJumping || reduceMotion
    ? { duration: 0 }
    : SPRING_OPTIONS;

  const moveTo = useCallback(
    (direction) => {
      if (isAnimating || itemsForRender.length <= 1) return;
      setPosition((current) => {
        const next = current + direction;
        const max = itemsForRender.length - 1;
        return Math.max(0, Math.min(next, max));
      });
    },
    [isAnimating, itemsForRender.length],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const measure = () => {
      setAvailableWidth(Math.max(260, container.clientWidth));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    measure();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduceMotion(query.matches);
    syncMotion();
    query.addEventListener("change", syncMotion);
    return () => query.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    x.set(-position * trackItemOffset);
  }, [position, trackItemOffset, x]);

  useEffect(() => {
    if (!autoplay || reduceMotion || isPaused || itemsForRender.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      if (!document.hidden) moveTo(1);
    }, autoplayDelay);
    return () => window.clearInterval(timer);
  }, [autoplay, autoplayDelay, isPaused, itemsForRender.length, moveTo, reduceMotion]);

  const handleAnimationComplete = () => {
    if (!loop || itemsForRender.length <= 1) {
      setIsAnimating(false);
      return;
    }

    const lastCloneIndex = itemsForRender.length - 1;
    if (position === lastCloneIndex || position === 0) {
      const target = position === lastCloneIndex ? 1 : items.length;
      setIsJumping(true);
      setPosition(target);
      x.set(-target * trackItemOffset);
      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });
      return;
    }
    setIsAnimating(false);
  };

  const handleDragEnd = (_, info) => {
    const { offset, velocity } = info;
    const direction =
      offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD
        ? 1
        : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD
          ? -1
          : 0;
    if (direction !== 0) moveTo(direction);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveTo(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveTo(-1);
    }
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * Math.max(itemsForRender.length - 1, 0),
          right: 0,
        },
      };

  if (items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`carousel-container${round ? " round" : ""}`}
      style={{ maxWidth: `${baseWidth}px` }}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="carousel-viewport">
        <motion.div
          className="carousel-track"
          drag={isAnimating ? false : "x"}
          dragElastic={0.12}
          {...dragProps}
          style={{
            width: itemWidth,
            gap: `${GAP}px`,
            perspective: 1000,
            perspectiveOrigin: `${position * trackItemOffset + itemWidth / 2}px 50%`,
            x,
          }}
          onDragEnd={handleDragEnd}
          animate={{ x: -(position * trackItemOffset) }}
          transition={effectiveTransition}
          onAnimationStart={() => setIsAnimating(true)}
          onAnimationComplete={handleAnimationComplete}
        >
          {itemsForRender.map((item, index) => {
            const isClone = loop && (index === 0 || index === itemsForRender.length - 1);
            const realIndex = loop
              ? (index - 1 + items.length) % items.length
              : index;
            return (
              <CarouselItem
                key={`${item.id ?? index}-${index}`}
                item={item}
                index={index}
                itemWidth={itemWidth}
                round={round}
                trackItemOffset={trackItemOffset}
                x={x}
                transition={effectiveTransition}
                reduceMotion={reduceMotion}
                hidden={isClone || realIndex !== activeIndex}
                slideLabel={`${realIndex + 1} of ${items.length}`}
              />
            );
          })}
        </motion.div>
      </div>

      <div className="carousel-controls">
        <div className="carousel-buttons" aria-label="Carousel controls">
          <button
            type="button"
            className="carousel-arrow"
            onClick={() => moveTo(-1)}
            disabled={!loop && activeIndex === 0}
            aria-label="Previous slide"
          >
            ←
          </button>
          <button
            type="button"
            className="carousel-arrow"
            onClick={() => moveTo(1)}
            disabled={!loop && activeIndex === items.length - 1}
            aria-label="Next slide"
          >
            →
          </button>
        </div>

        <div className="carousel-indicators" aria-label="Choose a slide">
          {items.map((item, index) => (
            <button
              type="button"
              key={item.id ?? index}
              className={`carousel-indicator${activeIndex === index ? " active" : ""}`}
              aria-label={`Go to ${item.title}`}
              aria-current={activeIndex === index ? "true" : undefined}
              onClick={() => setPosition(loop ? index + 1 : index)}
            >
              <span />
            </button>
          ))}
        </div>

        <p className="carousel-status" aria-live="polite">
          {items[activeIndex]?.title}
        </p>
      </div>
    </div>
  );
}

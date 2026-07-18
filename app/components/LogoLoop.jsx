"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./LogoLoop.css";

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2,
};

const toCssLength = (value) =>
  typeof value === "number" ? `${value}px` : (value ?? undefined);

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(query.matches);
    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
};

const useResizeObserver = (callback, elements, dependencies) => {
  useEffect(() => {
    if (!window.ResizeObserver) {
      const handleResize = () => callback();
      window.addEventListener("resize", handleResize, { passive: true });
      callback();
      return () => window.removeEventListener("resize", handleResize);
    }

    const observers = elements.map((ref) => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(callback);
      observer.observe(ref.current);
      return observer;
    });

    callback();
    return () => observers.forEach((observer) => observer?.disconnect());
  }, [callback, elements, dependencies]);
};

const useImageLoader = (seqRef, onLoad, dependencies) => {
  useEffect(() => {
    const images = seqRef.current?.querySelectorAll("img") ?? [];
    if (images.length === 0) {
      onLoad();
      return undefined;
    }

    let remainingImages = images.length;
    const handleImageLoad = () => {
      remainingImages -= 1;
      if (remainingImages === 0) onLoad();
    };

    images.forEach((image) => {
      if (image.complete) {
        handleImageLoad();
      } else {
        image.addEventListener("load", handleImageLoad, { once: true });
        image.addEventListener("error", handleImageLoad, { once: true });
      }
    });

    return () => {
      images.forEach((image) => {
        image.removeEventListener("load", handleImageLoad);
        image.removeEventListener("error", handleImageLoad);
      });
    };
  }, [onLoad, seqRef, dependencies]);
};

const useAnimationLoop = (
  trackRef,
  targetVelocity,
  seqWidth,
  seqHeight,
  isInteracting,
  hoverSpeed,
  isVertical,
  prefersReducedMotion,
) => {
  const rafRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const reduceMotionNow =
      prefersReducedMotion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotionNow) {
      track.style.transform = "translate3d(0, 0, 0)";
      velocityRef.current = 0;
      lastTimestampRef.current = null;
      return undefined;
    }

    const seqSize = isVertical ? seqHeight : seqWidth;

    if (seqSize > 0) {
      offsetRef.current =
        ((offsetRef.current % seqSize) + seqSize) % seqSize;
      const transformValue = isVertical
        ? `translate3d(0, ${-offsetRef.current}px, 0)`
        : `translate3d(${-offsetRef.current}px, 0, 0)`;
      track.style.transform = transformValue;
    }

    const animate = (timestamp) => {
      if (document.hidden) {
        lastTimestampRef.current = timestamp;
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaTime =
        Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const target =
        isInteracting && hoverSpeed !== undefined
          ? hoverSpeed
          : targetVelocity;
      const easingFactor =
        1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
      velocityRef.current +=
        (target - velocityRef.current) * easingFactor;

      if (seqSize > 0) {
        let nextOffset =
          offsetRef.current + velocityRef.current * deltaTime;
        nextOffset = ((nextOffset % seqSize) + seqSize) % seqSize;
        offsetRef.current = nextOffset;

        const transformValue = isVertical
          ? `translate3d(0, ${-offsetRef.current}px, 0)`
          : `translate3d(${-offsetRef.current}px, 0, 0)`;
        track.style.transform = transformValue;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimestampRef.current = null;
    };
  }, [
    targetVelocity,
    seqWidth,
    seqHeight,
    isInteracting,
    hoverSpeed,
    isVertical,
    prefersReducedMotion,
    trackRef,
  ]);
};

export const LogoLoop = memo(
  ({
    logos,
    speed = 120,
    direction = "left",
    width = "100%",
    logoHeight = 28,
    gap = 32,
    pauseOnHover,
    hoverSpeed,
    fadeOut = false,
    fadeOutColor,
    scaleOnHover = false,
    renderItem,
    ariaLabel = "Partner logos",
    className,
    style,
  }) => {
    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const seqRef = useRef(null);

    const [seqWidth, setSeqWidth] = useState(0);
    const [seqHeight, setSeqHeight] = useState(0);
    const [copyCount, setCopyCount] = useState(
      ANIMATION_CONFIG.MIN_COPIES,
    );
    const [isInteracting, setIsInteracting] = useState(false);
    const prefersReducedMotion = usePrefersReducedMotion();

    const effectiveHoverSpeed = useMemo(() => {
      if (hoverSpeed !== undefined) return hoverSpeed;
      if (pauseOnHover === true) return 0;
      if (pauseOnHover === false) return undefined;
      return 0;
    }, [hoverSpeed, pauseOnHover]);

    const isVertical = direction === "up" || direction === "down";

    const targetVelocity = useMemo(() => {
      const magnitude = Math.abs(speed);
      const directionMultiplier = isVertical
        ? direction === "up"
          ? 1
          : -1
        : direction === "left"
          ? 1
          : -1;
      const speedMultiplier = speed < 0 ? -1 : 1;
      return magnitude * directionMultiplier * speedMultiplier;
    }, [speed, direction, isVertical]);

    const updateDimensions = useCallback(() => {
      const containerWidth = containerRef.current?.clientWidth ?? 0;
      const sequenceRect = seqRef.current?.getBoundingClientRect?.();
      const sequenceWidth = sequenceRect?.width ?? 0;
      const sequenceHeight = sequenceRect?.height ?? 0;

      if (isVertical) {
        const parentHeight =
          containerRef.current?.parentElement?.clientHeight ?? 0;
        if (containerRef.current && parentHeight > 0) {
          const targetHeight = Math.ceil(parentHeight);
          if (containerRef.current.style.height !== `${targetHeight}px`) {
            containerRef.current.style.height = `${targetHeight}px`;
          }
        }

        if (sequenceHeight > 0) {
          setSeqHeight(Math.ceil(sequenceHeight));
          const viewport =
            containerRef.current?.clientHeight ??
            parentHeight ??
            sequenceHeight;
          const copiesNeeded =
            Math.ceil(viewport / sequenceHeight) +
            ANIMATION_CONFIG.COPY_HEADROOM;
          setCopyCount(
            Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded),
          );
        }
      } else if (sequenceWidth > 0) {
        setSeqWidth(Math.ceil(sequenceWidth));
        const copiesNeeded =
          Math.ceil(containerWidth / sequenceWidth) +
          ANIMATION_CONFIG.COPY_HEADROOM;
        setCopyCount(
          Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded),
        );
      }
    }, [isVertical]);

    const observedElements = useMemo(
      () => [containerRef, seqRef],
      [],
    );
    const dimensionDependencies = useMemo(
      () => [logos, gap, logoHeight, isVertical],
      [logos, gap, logoHeight, isVertical],
    );

    useResizeObserver(
      updateDimensions,
      observedElements,
      dimensionDependencies,
    );
    useImageLoader(seqRef, updateDimensions, dimensionDependencies);

    useAnimationLoop(
      trackRef,
      targetVelocity,
      seqWidth,
      seqHeight,
      isInteracting,
      effectiveHoverSpeed,
      isVertical,
      prefersReducedMotion,
    );

    const cssVariables = useMemo(
      () => ({
        "--nrv-logoloop-gap": `${gap}px`,
        "--nrv-logoloop-logo-height": `${logoHeight}px`,
        ...(fadeOutColor && {
          "--nrv-logoloop-fade-color": fadeOutColor,
        }),
      }),
      [gap, logoHeight, fadeOutColor],
    );

    const rootClassName = useMemo(
      () =>
        [
          "nrv-logoloop",
          isVertical
            ? "nrv-logoloop--vertical"
            : "nrv-logoloop--horizontal",
          fadeOut && "nrv-logoloop--fade",
          scaleOnHover && "nrv-logoloop--scale-hover",
          prefersReducedMotion && "nrv-logoloop--reduced",
          className,
        ]
          .filter(Boolean)
          .join(" "),
      [
        isVertical,
        fadeOut,
        scaleOnHover,
        prefersReducedMotion,
        className,
      ],
    );

    const beginInteraction = useCallback(() => {
      if (effectiveHoverSpeed !== undefined && !prefersReducedMotion) {
        setIsInteracting(true);
      }
    }, [effectiveHoverSpeed, prefersReducedMotion]);

    const endInteraction = useCallback(() => {
      setIsInteracting(false);
    }, []);

    const handlePointerEnter = useCallback(
      (event) => {
        if (event.pointerType === "mouse") beginInteraction();
      },
      [beginInteraction],
    );

    const handlePointerLeave = useCallback(() => {
      endInteraction();
    }, [endInteraction]);

    const handlePointerDown = useCallback(
      (event) => {
        if (event.pointerType !== "mouse") beginInteraction();
      },
      [beginInteraction],
    );

    const handleFocus = useCallback(() => {
      beginInteraction();
    }, [beginInteraction]);

    const handleBlur = useCallback(
      (event) => {
        if (!trackRef.current?.contains(event.relatedTarget)) endInteraction();
      },
      [endInteraction],
    );

    const renderLogoItem = useCallback(
      (item, key) => {
        if (renderItem) {
          return (
            <li className="nrv-logoloop__item" key={key} role="listitem">
              {renderItem(item, key)}
            </li>
          );
        }

        const isNodeItem = "node" in item;
        const accessibleLabel =
          item.ariaLabel ?? item.title ?? item.alt ?? "Technology logo";

        const content = isNodeItem ? (
          <span
            className="nrv-logoloop__node"
            role={item.href ? undefined : "img"}
            aria-label={item.href ? undefined : accessibleLabel}
            aria-hidden={item.href ? "true" : undefined}
            title={item.title}
          >
            {item.node}
          </span>
        ) : (
          // LogoLoop intentionally supports arbitrary image sources and srcsets.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.src}
            srcSet={item.srcSet}
            sizes={item.sizes}
            width={item.width}
            height={item.height}
            alt={item.alt ?? item.title ?? ""}
            title={item.title}
            loading="lazy"
            decoding="async"
            draggable="false"
          />
        );

        const itemContent = item.href ? (
          <a
            className="nrv-logoloop__link"
            href={item.href}
            aria-label={accessibleLabel}
            target="_blank"
            rel="noreferrer noopener"
          >
            {content}
          </a>
        ) : (
          content
        );

        return (
          <li className="nrv-logoloop__item" key={key} role="listitem">
            {itemContent}
          </li>
        );
      },
      [renderItem],
    );

    const logoLists = useMemo(
      () =>
        Array.from({ length: copyCount }, (_, copyIndex) => (
          <ul
            className="nrv-logoloop__list"
            key={`copy-${copyIndex}`}
            role="list"
            aria-hidden={copyIndex > 0 ? "true" : undefined}
            ref={copyIndex === 0 ? seqRef : undefined}
          >
            {logos.map((item, itemIndex) =>
              renderLogoItem(item, `${copyIndex}-${itemIndex}`),
            )}
          </ul>
        )),
      [copyCount, logos, renderLogoItem],
    );

    const containerStyle = useMemo(
      () => ({
        width: isVertical
          ? toCssLength(width) === "100%"
            ? undefined
            : toCssLength(width)
          : (toCssLength(width) ?? "100%"),
        ...cssVariables,
        ...style,
      }),
      [width, cssVariables, style, isVertical],
    );

    return (
      <div
        ref={containerRef}
        className={rootClassName}
        style={containerStyle}
        role="region"
        aria-label={ariaLabel}
      >
        <div
          className="nrv-logoloop__track"
          ref={trackRef}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
          onPointerUp={endInteraction}
          onPointerCancel={endInteraction}
          onLostPointerCapture={endInteraction}
          onFocusCapture={handleFocus}
          onBlurCapture={handleBlur}
        >
          {logoLists}
        </div>
      </div>
    );
  },
);

LogoLoop.displayName = "LogoLoop";

export default LogoLoop;

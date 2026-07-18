"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { gsap } from "gsap";
import "./PillNav.css";

const PillNav = ({
  logo,
  logoAlt = "Logo",
  logoHref = "#top",
  items = [],
  activeHref,
  className = "",
  ease = "power3.out",
  baseColor = "#16241F",
  pillColor = "#CBAB70",
  hoveredPillTextColor = "#F4EAD9",
  pillTextColor = "#16241F",
  onMobileMenuClick,
  initialLoadAnimation = true,
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuId = `pill-nav-menu-${useId().replace(/:/g, "")}`;
  const containerRef = useRef(null);
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);

  const animateMobileMenu = useCallback(
    (open, { returnFocus = false } = {}) => {
      const hamburger = hamburgerRef.current;
      const menu = mobileMenuRef.current;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const lineDuration = reduceMotion ? 0 : 0.25;
      const menuDuration = reduceMotion ? 0 : open ? 0.3 : 0.2;

      setIsMobileMenuOpen(open);

      if (hamburger) {
        const lines = hamburger.querySelectorAll(".hamburger-line");
        if (lines.length >= 2) {
          gsap.to(lines[0], {
            rotation: open ? 45 : 0,
            y: open ? 3 : 0,
            duration: lineDuration,
            ease,
            overwrite: "auto",
          });
          gsap.to(lines[1], {
            rotation: open ? -45 : 0,
            y: open ? -3 : 0,
            duration: lineDuration,
            ease,
            overwrite: "auto",
          });
        }
      }

      if (menu) {
        gsap.killTweensOf(menu);
        if (open) {
          gsap.set(menu, { visibility: "visible" });
          gsap.fromTo(
            menu,
            { opacity: 0, y: 10, scale: 0.985 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: menuDuration,
              ease,
              transformOrigin: "top center",
              overwrite: "auto",
            },
          );
        } else {
          gsap.to(menu, {
            opacity: 0,
            y: 10,
            scale: 0.985,
            duration: menuDuration,
            ease,
            transformOrigin: "top center",
            overwrite: "auto",
            onComplete: () => {
              gsap.set(menu, { visibility: "hidden" });
              if (returnFocus) hamburgerRef.current?.focus();
            },
          });
        }
      } else if (!open && returnFocus) {
        hamburgerRef.current?.focus();
      }
    },
    [ease],
  );

  const closeMobileMenu = useCallback(
    (options) => {
      if (!isMobileMenuOpen) return;
      animateMobileMenu(false, options);
    },
    [animateMobileMenu, isMobileMenuOpen],
  );

  const toggleMobileMenu = () => {
    animateMobileMenu(!isMobileMenuOpen);
    onMobileMenuClick?.();
  };

  useEffect(() => {
    let active = true;
    const timelines = tlRefs.current;
    const activeTweens = activeTweenRefs.current;

    const layout = () => {
      if (!active) return;

      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (!w || !h) return;

        const radius = ((w * w) / 4 + h * h) / (2 * h);
        const diameter = Math.ceil(2 * radius) + 2;
        const delta =
          Math.ceil(
            radius - Math.sqrt(Math.max(0, radius * radius - (w * w) / 4)),
          ) + 1;
        const originY = diameter - delta;

        circle.style.width = `${diameter}px`;
        circle.style.height = `${diameter}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector(".pill-label");
        const hoverLabel = pill.querySelector(".pill-label-hover");
        if (label) gsap.set(label, { y: 0 });
        if (hoverLabel) gsap.set(hoverLabel, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const timeline = gsap.timeline({ paused: true });

        timeline.to(
          circle,
          {
            scale: 1.2,
            xPercent: -50,
            duration: 2,
            ease,
            overwrite: "auto",
          },
          0,
        );

        if (label) {
          timeline.to(
            label,
            { y: -(h + 8), duration: 2, ease, overwrite: "auto" },
            0,
          );
        }

        if (hoverLabel) {
          gsap.set(hoverLabel, { y: Math.ceil(h + 100), opacity: 0 });
          timeline.to(
            hoverLabel,
            { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" },
            0,
          );
        }

        tlRefs.current[index] = timeline;
      });
    };

    layout();
    window.addEventListener("resize", layout, { passive: true });
    document.fonts?.ready.then(layout).catch(() => {});

    const menu = mobileMenuRef.current;
    if (menu) gsap.set(menu, { visibility: "hidden", opacity: 0, y: 10 });

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const logoElement = logoRef.current;
    const navItems = navItemsRef.current;

    if (initialLoadAnimation && !reduceMotion) {
      if (logoElement) {
        gsap.set(logoElement, { scale: 0 });
        gsap.to(logoElement, { scale: 1, duration: 0.6, ease });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: "hidden" });
        gsap.to(navItems, {
          width: "auto",
          duration: 0.6,
          ease,
          onComplete: () => gsap.set(navItems, { clearProps: "overflow" }),
        });
      }
    } else {
      if (logoElement) gsap.set(logoElement, { scale: 1 });
      if (navItems) gsap.set(navItems, { width: "auto", clearProps: "overflow" });
    }

    return () => {
      active = false;
      window.removeEventListener("resize", layout);
      timelines.forEach((timeline) => timeline?.kill());
      activeTweens.forEach((tween) => tween?.kill());
      logoTweenRef.current?.kill();
      if (menu) gsap.killTweensOf(menu);
      if (logoElement) gsap.killTweensOf(logoElement);
      if (navItems) gsap.killTweensOf(navItems);
    };
  }, [items, ease, initialLoadAnimation]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileMenu({ returnFocus: true });
      }
    };

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        closeMobileMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeMobileMenu, isMobileMenuOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 769px)");
    const closeAtDesktop = (event) => {
      if (event.matches && isMobileMenuOpen) animateMobileMenu(false);
    };
    media.addEventListener("change", closeAtDesktop);
    return () => media.removeEventListener("change", closeAtDesktop);
  }, [animateMobileMenu, isMobileMenuOpen]);

  const handleEnter = (index) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timeline = tlRefs.current[index];
    if (!timeline) return;
    activeTweenRefs.current[index]?.kill();
    activeTweenRefs.current[index] = timeline.tweenTo(timeline.duration(), {
      duration: 0.3,
      ease,
      overwrite: "auto",
    });
  };

  const handleLeave = (index) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timeline = tlRefs.current[index];
    if (!timeline) return;
    activeTweenRefs.current[index]?.kill();
    activeTweenRefs.current[index] = timeline.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const handleLogoEnter = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const image = logoImgRef.current;
    if (!image) return;
    logoTweenRef.current?.kill();
    gsap.set(image, { rotate: 0 });
    logoTweenRef.current = gsap.to(image, {
      rotate: 360,
      duration: 0.35,
      ease,
      overwrite: "auto",
    });
  };

  const cssVars = {
    "--base": baseColor,
    "--pill-bg": pillColor,
    "--hover-text": hoveredPillTextColor,
    "--pill-text": resolvedPillTextColor,
  };

  return (
    <div className="pill-nav-container" ref={containerRef}>
      <nav
        className={`pill-nav ${className}`.trim()}
        aria-label="Primary navigation"
        style={cssVars}
      >
        <a
          className="pill-logo"
          href={logoHref}
          aria-label="NRV home"
          onMouseEnter={handleLogoEnter}
          onFocus={handleLogoEnter}
          ref={logoRef}
        >
          {/* The component accepts arbitrary local or remote logo sources. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt={logoAlt} ref={logoImgRef} draggable="false" />
        </a>

        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list">
            {items.map((item, index) => (
              <li key={item.href || `item-${index}`}>
                <a
                  href={item.href}
                  className={`pill${activeHref === item.href ? " is-active" : ""}`}
                  aria-label={item.ariaLabel || item.label}
                  aria-current={activeHref === item.href ? "location" : undefined}
                  onMouseEnter={() => handleEnter(index)}
                  onMouseLeave={() => handleLeave(index)}
                  onFocus={() => handleEnter(index)}
                  onBlur={() => handleLeave(index)}
                >
                  <span
                    className="hover-circle"
                    aria-hidden="true"
                    ref={(element) => {
                      circleRefs.current[index] = element;
                    }}
                  />
                  <span className="label-stack">
                    <span className="pill-label">{item.label}</span>
                    <span className="pill-label-hover" aria-hidden="true">
                      {item.label}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <button
          className="mobile-menu-button mobile-only"
          type="button"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls={mobileMenuId}
          ref={hamburgerRef}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      <div
        id={mobileMenuId}
        className="mobile-menu-popover mobile-only"
        ref={mobileMenuRef}
        style={cssVars}
        aria-hidden={!isMobileMenuOpen}
      >
        <ul className="mobile-menu-list">
          {items.map((item, index) => (
            <li key={item.href || `mobile-item-${index}`}>
              <a
                href={item.href}
                className={`mobile-menu-link${activeHref === item.href ? " is-active" : ""}`}
                aria-current={activeHref === item.href ? "location" : undefined}
                onClick={() => closeMobileMenu()}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;

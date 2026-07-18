"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import "./PillNav.css";

const PillNav = ({
  logo,
  logoAlt = "NRV",
  logoHref = "#top",
  items = [],
  activeHref,
  className = "",
  onMobileMenuClick,
  initialLoadAnimation = true,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuId = `studio-nav-menu-${useId().replace(/:/g, "")}`;
  const containerRef = useRef(null);
  const menuButtonRef = useRef(null);

  const closeMenu = useCallback(({ returnFocus = false } = {}) => {
    setIsMobileMenuOpen(false);
    if (returnFocus) requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  const toggleMenu = () => {
    setIsMobileMenuOpen((open) => !open);
    onMobileMenuClick?.();
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu({ returnFocus: true });
      }
    };

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) closeMenu();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeMenu, isMobileMenuOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 769px)");
    const closeAtDesktop = (event) => {
      if (event.matches) closeMenu();
    };

    media.addEventListener("change", closeAtDesktop);
    return () => media.removeEventListener("change", closeAtDesktop);
  }, [closeMenu]);

  const renderLinks = (mobile = false) => (
    <ul className={mobile ? "studio-nav__mobile-list" : "studio-nav__list"}>
      {items.map((item) => {
        const isActive = activeHref === item.href;
        return (
          <li key={item.href}>
            <a
              href={item.href}
              className={`${mobile ? "studio-nav__mobile-link" : "studio-nav__link"}${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "location" : undefined}
              onClick={mobile ? () => closeMenu() : undefined}
            >
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <header
      className={`studio-nav${initialLoadAnimation ? " studio-nav--enter" : ""} ${className}`.trim()}
      ref={containerRef}
    >
      <nav className="studio-nav__inner" aria-label="Primary navigation">
        <a className="studio-nav__logo" href={logoHref} aria-label="NRV home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt={logoAlt} draggable="false" />
        </a>

        <div className="studio-nav__desktop">{renderLinks()}</div>

        <button
          className={`studio-nav__menu-button${isMobileMenuOpen ? " is-open" : ""}`}
          type="button"
          onClick={toggleMenu}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls={menuId}
          ref={menuButtonRef}
        >
          <span />
          <span />
        </button>
      </nav>

      <div id={menuId} className="studio-nav__mobile" hidden={!isMobileMenuOpen}>
        {renderLinks(true)}
      </div>
    </header>
  );
};

export default PillNav;

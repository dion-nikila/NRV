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
  const menuId = `nrv-nav-menu-${useId().replace(/:/g, "")}`;
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
    <ul className={mobile ? "nrv-nav__mobile-list" : "nrv-nav__list"}>
      {items.map((item) => {
        const isActive = activeHref === item.href;
        return (
          <li key={item.href}>
            <a
              href={item.href}
              className={`${mobile ? "nrv-nav__mobile-link" : "nrv-nav__link"}${isActive ? " is-active" : ""}`}
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
      className={`nrv-nav${initialLoadAnimation ? " nrv-nav--enter" : ""} ${className}`.trim()}
      ref={containerRef}
    >
      <nav className="nrv-nav__rail" aria-label="Primary navigation">
        <a className="nrv-nav__logo" href={logoHref} aria-label="NRV home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt={logoAlt} draggable="false" />
        </a>

        <div className="nrv-nav__desktop">{renderLinks()}</div>

        <button
          className={`nrv-nav__menu-button${isMobileMenuOpen ? " is-open" : ""}`}
          type="button"
          onClick={toggleMenu}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls={menuId}
          ref={menuButtonRef}
        >
          <span className="nrv-nav__menu-label">{isMobileMenuOpen ? "Close" : "Menu"}</span>
          <span className="nrv-nav__menu-icon" aria-hidden="true"><i /><i /></span>
        </button>
      </nav>

      <div id={menuId} className="nrv-nav__mobile" hidden={!isMobileMenuOpen}>
        {renderLinks(true)}
        <a className="nrv-nav__mobile-email" href="mailto:hello@nrv.studio">hello@nrv.studio</a>
      </div>
    </header>
  );
};

export default PillNav;

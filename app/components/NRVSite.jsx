"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import Cubes from "./Cubes";
import LetterGlitch from "./LetterGlitch";
import LogoLoop from "./LogoLoop";
import MagicBento from "./MagicBento";
import PillNav from "./PillNav";

const BUILD_WORDS = [
  "web platforms",
  "ops software",
  "mobile apps",
  "custom tools",
];

const NAV_ITEMS = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Products", href: "#products" },
  { label: "Contact", href: "#contact" },
];

const STACK = [
  { node: <span className="stack-mark">Next.js</span>, title: "Next.js" },
  { node: <span className="stack-mark">React</span>, title: "React" },
  { node: <span className="stack-mark">TypeScript</span>, title: "TypeScript" },
  { node: <span className="stack-mark">Node</span>, title: "Node.js" },
  { node: <span className="stack-mark">Postgres</span>, title: "PostgreSQL" },
  { node: <span className="stack-mark">Cloudflare</span>, title: "Cloudflare" },
  { node: <span className="stack-mark">Figma</span>, title: "Figma" },
  { node: <span className="stack-mark">GSAP</span>, title: "GSAP" },
];

function SectionIndex({ children }) {
  return <span className="section-index" aria-hidden="true">{children}</span>;
}

export default function NRVSite() {
  const rootRef = useRef(null);
  const cursorRef = useRef(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeHref, setActiveHref] = useState("");

  useEffect(() => {
    const viewportQuery = window.matchMedia("(max-width: 767px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncPreferences = () => {
      setIsMobile(viewportQuery.matches);
      setReducedMotion(motionQuery.matches);
    };

    syncPreferences();
    viewportQuery.addEventListener("change", syncPreferences);
    motionQuery.addEventListener("change", syncPreferences);

    return () => {
      viewportQuery.removeEventListener("change", syncPreferences);
      motionQuery.removeEventListener("change", syncPreferences);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      setWordIndex((current) => (current + 1) % BUILD_WORDS.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  useEffect(() => {
    const sections = ["services", "products", "work", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveHref(`#${visible.target.id}`);
      },
      { rootMargin: "-28% 0px -58%", threshold: [0, 0.1, 0.3] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || !rootRef.current) return undefined;

    let scrollTrigger;
    let context;
    let disposed = false;

    const setup = async () => {
      const scrollTriggerModule = await import("gsap/ScrollTrigger");
      if (disposed) return;
      scrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(scrollTrigger);

      context = gsap.context(() => {
        gsap.utils.toArray("[data-resolve]").forEach((element) => {
          gsap.fromTo(
            element,
            { autoAlpha: 0, y: 44, filter: "blur(16px)", scale: 0.985 },
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              scale: 1,
              duration: 0.95,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 84%",
                once: true,
              },
            },
          );
        });
      }, rootRef);
    };

    setup();

    return () => {
      disposed = true;
      context?.revert();
    };
  }, [reducedMotion]);

  useEffect(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!cursor || !finePointer || reducedMotion) return undefined;

    const moveX = gsap.quickTo(cursor, "x", { duration: 0.55, ease: "power3.out" });
    const moveY = gsap.quickTo(cursor, "y", { duration: 0.55, ease: "power3.out" });
    const show = () => gsap.to(cursor, { opacity: 0.32, duration: 0.25 });
    const hide = () => gsap.to(cursor, { opacity: 0, duration: 0.35 });
    const move = (event) => {
      moveX(event.clientX);
      moveY(event.clientY);
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseenter", show);
    document.documentElement.addEventListener("mouseleave", hide);

    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseenter", show);
      document.documentElement.removeEventListener("mouseleave", hide);
    };
  }, [reducedMotion]);

  const currentWord = useMemo(() => BUILD_WORDS[wordIndex], [wordIndex]);

  return (
    <main ref={rootRef} id="top" className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div ref={cursorRef} className="ink-cursor" aria-hidden="true" />

      <PillNav
        logo="/nrv-mark.svg"
        logoAlt="NRV home"
        items={NAV_ITEMS}
        activeHref={activeHref}
        baseColor="#16241F"
        pillColor="#CBAB70"
        pillTextColor="#16241F"
        hoveredPillTextColor="#F4EAD9"
        initialLoadAnimation={!reducedMotion}
      />

      <div id="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-cubes" aria-hidden="true">
            <Cubes
              gridSize={isMobile ? 6 : 10}
              maxAngle={35}
              radius={3}
              faceColor="#CBAB70"
              borderStyle="1px solid rgba(43,107,109,0.4)"
              rippleColor="#2B6B6D"
              rippleOnClick
              autoAnimate={!reducedMotion}
            />
          </div>

          <div className="hero-wash" aria-hidden="true" />
          <div className="hero-layout">
            <div className="hero-panel" data-resolve>
              <p className="eyebrow">
                <span className="eyebrow-dot" />
                Independent software studio
              </p>
              <h1 id="hero-title">
                We build
                <span className="hero-word-wrap" aria-live="polite">
                  <span key={currentWord} className="hero-word">{currentWord}</span>
                </span>
                <span className="hero-title-tail">that hold up.</span>
              </h1>
              <p className="hero-subhead">
                NRV turns rough briefs into thoughtful, working software — shaped with care, shipped with conviction.
              </p>
              <div className="hero-actions">
                <a className="button button--rust" href="#work">See our work <span aria-hidden="true">↘</span></a>
                <a className="button button--ghost" href="#contact">Talk to us <span aria-hidden="true">→</span></a>
              </div>
            </div>

            <div className="hero-note" data-resolve>
              <span className="hero-note-mark" aria-hidden="true">✦</span>
              <span>Touch, tilt, or click the grid</span>
            </div>
          </div>

          <div className="hero-footerline" aria-hidden="true">
            <span>Ideas in</span>
            <span className="hero-footerline-rule" />
            <span>Working software out</span>
          </div>
        </section>

        <section id="services" className="section section--ink build-section" aria-labelledby="build-title">
          <div className="section-inner">
            <div className="section-heading section-heading--light" data-resolve>
              <SectionIndex>01</SectionIndex>
              <div>
                <p className="eyebrow eyebrow--light">What we build</p>
                <h2 id="build-title">Software, finished properly.</h2>
              </div>
              <p className="section-intro">
                From a first sketch to the stubborn final detail, we make digital products that feel clear, useful, and distinctly yours.
              </p>
            </div>

            <div id="products" className="anchor-target" data-resolve>
              <MagicBento
                glowColor="43, 107, 109"
                enableTilt
                enableMagnetism
                clickEffect
                enableSpotlight
                enableBorderGlow
                enableStars
                disableAnimations={reducedMotion}
              />
            </div>
          </div>
        </section>

        <section className="section section--paper craft-section" aria-labelledby="precision-title">
          <div className="section-inner">
            <div className="precision-frame" data-resolve>
              <LetterGlitch
                glitchColors={["#16241F", "#2B6B6D", "#9FE1CB"]}
                glitchSpeed={70}
                centerVignette
                outerVignette
                smooth
                backgroundColor="#16241F"
              />
              <div className="precision-copy">
                <p className="eyebrow eyebrow--light">Under the hood</p>
                <h2 id="precision-title">Built to be precise.</h2>
                <p>
                  Clean architecture, careful testing, and decisions that survive the real world. The quiet work matters most.
                </p>
                <div className="precision-points" aria-label="Engineering principles">
                  <span>Clear systems</span>
                  <span>Measured performance</span>
                  <span>Maintainable by design</span>
                </div>
              </div>
            </div>

            <div className="stack-section" data-resolve>
              <div className="stack-heading">
                <p className="eyebrow">A flexible stack, chosen on purpose</p>
                <span>Tools follow the problem — never the other way around.</span>
              </div>
              <LogoLoop
                logos={STACK}
                speed={80}
                hoverSpeed={20}
                logoHeight={34}
                gap={52}
                fadeOut
                fadeOutColor="#CBAB70"
                scaleOnHover
                ariaLabel="Technology stack"
              />
            </div>
          </div>
        </section>

        <section id="work" className="section section--paper work-section" aria-labelledby="work-title">
          <div className="section-inner">
            <div className="section-heading" data-resolve>
              <SectionIndex>02</SectionIndex>
              <div>
                <p className="eyebrow">Selected work</p>
                <h2 id="work-title">Made for the messy middle.</h2>
              </div>
              <p className="section-intro">
                The best software disappears into the work: fewer handoffs, clearer decisions, calmer days.
              </p>
            </div>

            <div className="work-grid">
              <article className="project-card project-card--bayflow" data-resolve>
                <div className="project-card-topline">
                  <span>Selected practice</span>
                  <span>Operational systems</span>
                </div>
                <div className="bayflow-visual" aria-hidden="true">
                  <div className="bayflow-sidebar">
                    <span className="bayflow-logo">B</span>
                    <i /><i /><i /><i />
                  </div>
                  <div className="bayflow-screen">
                    <div className="bayflow-screen-head"><b /><span /></div>
                    <div className="bayflow-metrics"><i /><i /><i /></div>
                    <div className="bayflow-lines"><i /><i /><i /><i /></div>
                  </div>
                </div>
                <div className="project-card-copy">
                  <p className="eyebrow eyebrow--light">Workflow software</p>
                  <h3>Connected operations.</h3>
                  <p>Purpose-built systems that bring jobs, customers, teams, and decisions into one legible flow.</p>
                </div>
              </article>

              <article className="project-card project-card--custom" data-resolve>
                <div className="project-card-topline">
                  <span>Client systems</span>
                  <span>Designed around the work</span>
                </div>
                <div className="system-map" aria-hidden="true">
                  <span className="system-node system-node--one">Brief</span>
                  <span className="system-path system-path--one" />
                  <span className="system-node system-node--two">Build</span>
                  <span className="system-path system-path--two" />
                  <span className="system-node system-node--three">Ship</span>
                  <span className="system-bloom" />
                </div>
                <div className="project-card-copy project-card-copy--dark">
                  <p className="eyebrow">Custom platforms</p>
                  <h3>Your workflow, made legible.</h3>
                  <p>Purpose-built portals, tools, and products — without forcing your business into someone else’s template.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section" aria-labelledby="contact-title">
          <div className="contact-ink" aria-hidden="true" />
          <div className="contact-inner" data-resolve>
            <p className="eyebrow eyebrow--light">Have something in mind?</p>
            <h2 id="contact-title">Bring us the rough sketch.</h2>
            <p>We’ll help turn it into something clear, useful, and ready for the world.</p>
            <a className="button button--rust button--large" href="mailto:hello@nrv.studio">
              Start a conversation <span aria-hidden="true">↗</span>
            </a>
          </div>

          <footer className="site-footer">
            <a className="footer-wordmark" href="#top" aria-label="Back to top">NRV</a>
            <div className="footer-details">
              <a href="mailto:hello@nrv.studio">hello@nrv.studio</a>
              <span>Small studio. Serious build quality.</span>
            </div>
            <a className="back-to-top" href="#top">Back to top ↑</a>
          </footer>
        </section>
      </div>
    </main>
  );
}

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
  { label: "Services", href: "#services" },
  { label: "Craft", href: "#precision" },
  { label: "Approach", href: "#approach" },
  { label: "Contact", href: "#contact" },
];

const ACTIVE_SECTIONS = ["services", "precision", "approach", "contact"];

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

const APPROACH = [
  {
    label: "Understand",
    title: "Start with the real work.",
    description:
      "We learn the people, handoffs, constraints, and exceptions before deciding what the product should be.",
  },
  {
    label: "Resolve",
    title: "Make the complex part clear.",
    description:
      "We turn the essential decisions into one coherent system, without sanding away what makes the work specific.",
  },
  {
    label: "Build",
    title: "Ship something built to last.",
    description:
      "We design, engineer, test, and refine the product as one team—then leave it straightforward to evolve.",
  },
];

export default function NRVSite() {
  const rootRef = useRef(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeHref, setActiveHref] = useState("");

  useEffect(() => {
    const viewportQuery = window.matchMedia("(max-width: 768px)");
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
    const sections = ACTIVE_SECTIONS.map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveHref(`#${visible.target.id}`);
      },
      { rootMargin: "-25% 0px -62%", threshold: [0, 0.1, 0.3] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || !rootRef.current) return undefined;

    let context;
    let disposed = false;

    const setup = async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);

      context = gsap.context(() => {
        gsap.utils.toArray("[data-resolve]").forEach((element) => {
          gsap.fromTo(
            element,
            { autoAlpha: 0, y: 28 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.72,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 88%",
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

  const currentWord = useMemo(() => BUILD_WORDS[wordIndex], [wordIndex]);

  return (
    <main ref={rootRef} id="top" className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>

      <PillNav
        logo="/nrv-mark.svg"
        logoAlt="NRV"
        items={NAV_ITEMS}
        activeHref={activeHref}
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
            <div className="hero-copy" data-resolve>
              <h1 id="hero-title">
                <span className="hero-title-lead">We build</span>
                <span className="hero-word-wrap" aria-live="polite">
                  <span key={currentWord} className="hero-word">{currentWord}</span>
                </span>
                <span className="hero-title-tail">that hold up.</span>
              </h1>
              <p className="hero-subhead">
                NRV designs and builds custom software for teams whose work has outgrown generic tools.
              </p>
              <div className="hero-actions">
                <a className="button button--rust" href="#contact">Start a project <span aria-hidden="true">↗</span></a>
              </div>
            </div>
          </div>
        </section>

        <section className="studio-bridge" aria-labelledby="studio-bridge-title">
          <div className="studio-bridge__inner" data-resolve>
            <h2 id="studio-bridge-title">Software should fit the work. Not the other way around.</h2>
            <p>We get close to the process, learn where it breaks, and build around what people actually need.</p>
          </div>
        </section>

        <section id="services" className="section section--ink services-section" aria-labelledby="services-title">
          <div className="section-inner">
            <header className="services-heading" data-resolve>
              <div>
                <p className="section-kicker section-kicker--light">What we build</p>
                <h2 id="services-title">Software, finished properly.</h2>
              </div>
              <div className="services-intro">
                <p>Good software should make demanding work feel direct, dependable, and easier to move through.</p>
                <p>We bring product thinking, design, and engineering into one focused build—then stay close enough to make the final details count.</p>
              </div>
            </header>

            <div data-resolve>
              <MagicBento
                glowColor="43, 107, 109"
                enableTilt={false}
                enableMagnetism={false}
                clickEffect={false}
                enableSpotlight={false}
                enableBorderGlow={false}
                enableStars={false}
                disableAnimations={reducedMotion}
              />
            </div>

            <div className="services-promise" data-resolve>
              <p>One studio from the first useful question to the product people rely on.</p>
              <a href="#precision">See how we build <span aria-hidden="true">↓</span></a>
            </div>
          </div>
        </section>

        <section id="precision" className="section section--paper craft-section" aria-labelledby="precision-title">
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
                <span>Tools follow the problem—never the other way around.</span>
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

        <section id="approach" className="section approach-section" aria-labelledby="approach-title">
          <div className="section-inner">
            <header className="approach-heading" data-resolve>
              <p className="section-kicker">How we work</p>
              <h2 id="approach-title">Close to the work. Clear about what matters.</h2>
              <p>There is one continuous path from understanding the problem to shipping a system that can keep evolving.</p>
            </header>

            <div className="approach-list">
              {APPROACH.map((item) => (
                <article key={item.label} data-resolve>
                  <span>{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section" aria-labelledby="contact-title">
          <div className="contact-inner" data-resolve>
            <div>
              <p className="section-kicker section-kicker--light">Have something in mind?</p>
              <h2 id="contact-title">Bring us the rough sketch.</h2>
            </div>
            <div className="contact-action">
              <p>Tell us what is slow, fragile, unclear, or held together by workarounds. We’ll help shape the next useful version.</p>
              <a className="button button--cream button--large" href="mailto:hello@nrv.studio">
                Start a conversation <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand-row">
            <a className="footer-wordmark" href="#top" aria-label="NRV — back to top">NRV</a>
            <p>Thoughtful software for work that deserves a better system.</p>
          </div>

          <div className="footer-links-row">
            <a className="footer-email" href="mailto:hello@nrv.studio">hello@nrv.studio</a>
            <nav aria-label="Footer navigation">
              <a href="#services">Services</a>
              <a href="#precision">Craft</a>
              <a href="#approach">Approach</a>
              <a href="#top">Back to top ↑</a>
            </nav>
          </div>

          <div className="footer-meta">
            <span>© {new Date().getFullYear()} NRV</span>
            <span>Small studio. Serious build quality.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

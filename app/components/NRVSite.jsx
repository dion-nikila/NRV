"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Cubes from "./Cubes";
import LetterGlitch from "./LetterGlitch";
import PillNav from "./PillNav";

const NAV_ITEMS = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const SERVICES = [
  {
    number: "01",
    title: "Web platforms",
    description:
      "Focused digital products built to make complex work feel direct and dependable.",
  },
  {
    number: "02",
    title: "Internal and operations software",
    description:
      "Purpose-built systems that replace scattered tools, handoffs, and workarounds.",
  },
  {
    number: "03",
    title: "Mobile applications",
    description:
      "Useful, resilient experiences designed around what people need while in motion.",
  },
  {
    number: "04",
    title: "Product design and ongoing support",
    description:
      "Clear product direction, thoughtful interfaces, and steady improvement after launch.",
  },
];

const PROCESS = [
  {
    number: "01",
    title: "Start with real work",
    description: "We learn how the work happens now, including the parts nobody documented.",
  },
  {
    number: "02",
    title: "Define what matters",
    description: "We separate the essential problem from everything that can wait.",
  },
  {
    number: "03",
    title: "Build the clearest version",
    description: "We design and ship the smallest complete system that solves the real need.",
  },
  {
    number: "04",
    title: "Make it easier to evolve",
    description: "We leave the product stable, understandable, and ready for what comes next.",
  },
];

const ACTIVE_SECTIONS = ["work", "services", "about", "contact"];
const GLITCH_COLORS = ["#16241F", "#2B6B6D", "#9FE1CB"];
const GLITCH_CHARACTERS = "NRV01{}[]<>/";

export default function NRVSite() {
  const rootRef = useRef(null);
  const [isCompact, setIsCompact] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeHref, setActiveHref] = useState("");

  useEffect(() => {
    const viewportQuery = window.matchMedia("(max-width: 767px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncPreferences = () => {
      setIsCompact(viewportQuery.matches);
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
    const sections = ACTIVE_SECTIONS.map((id) => document.getElementById(id)).filter(Boolean);
    let frame = null;

    const updateActiveSection = () => {
      frame = null;
      const marker = Math.min(180, window.innerHeight * 0.25);
      const current = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= marker && rect.bottom > marker;
      });

      setActiveHref(current?.id ? `#${current.id}` : "");
    };

    const requestUpdate = () => {
      if (frame == null) frame = requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame != null) cancelAnimationFrame(frame);
    };
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
        gsap.utils.toArray("[data-reveal]").forEach((element) => {
          gsap.fromTo(
            element,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.68,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 90%",
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
          <div className="hero-layout">
            <div className="hero-copy" data-reveal>
              <h1 id="hero-title">
                Software built around
                <span>the way you work.</span>
              </h1>
              <p className="hero-subhead">
                NRV designs and builds custom software for teams whose work has outgrown generic tools.
              </p>
              <div className="hero-actions">
                <a className="button button--rust" href="#contact">Start a project</a>
                <a className="text-link" href="#work">View our work</a>
              </div>
            </div>

            <figure className="hero-figure" aria-label="An interactive architectural grid representing a system taking shape">
              <div className="hero-sculpture" aria-hidden="true">
                <div className="hero-cubes">
                  <Cubes
                    gridSize={isCompact ? 5 : 6}
                    maxAngle={isCompact ? 5 : 9}
                    radius={1.8}
                    faceColor="#CBAB70"
                    borderStyle="1px solid rgba(43,107,109,0.78)"
                    rippleOnClick={false}
                    autoAnimate={false}
                  />
                </div>
                <span className="sculpture-square sculpture-square--teal" />
                <span className="sculpture-square sculpture-square--rust" />
              </div>
            </figure>
          </div>
        </section>

        <section id="about" className="studio-statement" aria-labelledby="studio-title">
          <div className="section-inner studio-statement__grid" data-reveal>
            <p className="section-note">NRV is a small, independent software studio.</p>
            <h2 id="studio-title">
              Software should fit the work—<span>not make the work fit the software.</span>
            </h2>
            <p className="studio-statement__body">
              We work closely with teams to understand the real problem, shape the right system, and build it with care.
            </p>
          </div>
        </section>

        <section id="services" className="section capabilities-section" aria-labelledby="services-title">
          <div className="section-inner">
            <header className="section-heading" data-reveal>
              <h2 id="services-title">What we build.</h2>
              <p>
                Custom products and operational systems that become a clear, useful part of the day.
              </p>
            </header>

            <ol className="capability-list">
              {SERVICES.map((service) => (
                <li key={service.number} data-reveal>
                  <span className="list-number">{service.number}</span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section precision-section" aria-labelledby="precision-title">
          <div className="section-inner">
            <div className="precision-frame" data-reveal>
              <LetterGlitch
                glitchColors={GLITCH_COLORS}
                glitchSpeed={90}
                centerVignette
                outerVignette
                smooth
                backgroundColor="#16241F"
                characters={GLITCH_CHARACTERS}
              />
              <div className="precision-copy">
                <h2 id="precision-title">Built to be precise.</h2>
                <p>
                  We understand the complexity first, then turn it into software that is clear, stable, and usable.
                </p>
                <div className="precision-principles" aria-label="Engineering principles">
                  <span>Clear systems</span>
                  <span>Measured performance</span>
                  <span>Maintainable by design</span>
                </div>
              </div>
            </div>

            <div className="technology" data-reveal>
              <div>
                <h2>Tools are choices, not trophies.</h2>
                <p>
                  We choose the technology that best fits the product, team, and constraints.
                </p>
              </div>
              <p className="technology-list" aria-label="Technology stack">
                TypeScript <span>·</span> React <span>·</span> Next.js <span>·</span> Node <span>·</span> Postgres <span>·</span> Cloudflare <span>·</span> Figma
              </p>
            </div>
          </div>
        </section>

        <section id="work" className="section messy-section" aria-labelledby="work-title">
          <div className="section-inner">
            <header className="section-heading section-heading--wide" data-reveal>
              <h2 id="work-title">Made for the messy middle.</h2>
              <p>
                The point where generic tools stop fitting, the workaround starts running the business, and the right answer is not obvious yet.
              </p>
            </header>

            <div className="system-diagram" data-reveal>
              <div className="diagram-context">
                <span>Fragmented tools</span>
                <span>Manual process</span>
                <span>Scattered decisions</span>
              </div>
              <div className="diagram-flow" aria-label="Input leads to a decision, which leads to action">
                <div><small>01</small><strong>Input</strong></div>
                <span className="diagram-arrow" aria-hidden="true">→</span>
                <div><small>02</small><strong>Decision</strong></div>
                <span className="diagram-arrow" aria-hidden="true">→</span>
                <div><small>03</small><strong>Action</strong></div>
              </div>
              <div className="diagram-result">
                <span>One workflow</span>
                <span>Visible state</span>
                <span>Clear next action</span>
              </div>
            </div>

            <div className="work-principles">
              <article data-reveal>
                <span className="list-number">01</span>
                <h3>From scattered inputs to one clear flow</h3>
                <p>
                  We turn fragmented processes, spreadsheets, and workarounds into a system people can actually use.
                </p>
              </article>
              <article data-reveal>
                <span className="list-number">02</span>
                <h3>From a good idea to something people rely on</h3>
                <p>
                  We shape the product, build the right version, and keep improving it after launch.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section process-section" aria-labelledby="process-title">
          <div className="section-inner">
            <header className="process-heading" data-reveal>
              <h2 id="process-title">How we work.</h2>
              <p>A direct path from a real problem to software that can keep evolving.</p>
            </header>
            <ol className="process-list">
              {PROCESS.map((step) => (
                <li key={step.number} data-reveal>
                  <span className="list-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>

      <footer id="contact" className="site-footer" aria-labelledby="contact-title">
        <div className="contact-cta">
          <div className="cta-geometry" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => <span key={index} />)}
          </div>
          <div className="contact-cta__inner">
            <div data-reveal>
              <h2 id="contact-title">Bring us the rough sketch.</h2>
              <p>Tell us what is slow, fragile, unclear, or held together by workarounds.</p>
            </div>
            <a className="button button--cream button--large" href="mailto:hello@nrv.studio">
              Start a conversation
            </a>
          </div>
        </div>

        <div className="footer-main">
          <a className="footer-wordmark" href="#top" aria-label="NRV — back to top">NRV</a>
          <div className="footer-links">
            <a className="footer-email" href="mailto:hello@nrv.studio">hello@nrv.studio</a>
            <nav aria-label="Footer navigation">
              <a href="#work">Work</a>
              <a href="#services">Services</a>
              <a href="#about">About</a>
              <a href="https://github.com/dion-nikila/NRV" target="_blank" rel="noreferrer">GitHub</a>
            </nav>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} NRV</span>
            <span>Independent software studio</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

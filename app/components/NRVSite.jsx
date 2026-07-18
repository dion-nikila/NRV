"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Cubes from "./Cubes";
import LetterGlitch from "./LetterGlitch";
import LogoLoop from "./LogoLoop";
import MagicBento from "./MagicBento";
import PillNav from "./PillNav";

const NAV_ITEMS = [
  { label: "Services", href: "#services" },
  { label: "Approach", href: "#precision" },
  { label: "Work", href: "#work" },
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

export default function NRVSite() {
  const rootRef = useRef(null);
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
    const sections = ["services", "precision", "work", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    let frame = null;

    const updateActiveSection = () => {
      frame = null;
      const marker = Math.min(280, window.innerHeight * 0.3);
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

  return (
    <main ref={rootRef} id="top" className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>

      <PillNav
        logo="/nrv-mark.svg"
        logoAlt="NRV home"
        items={NAV_ITEMS}
        activeHref={activeHref}
        baseColor="#16241F"
        pillColor="#CBAB70"
        pillTextColor="#F4EAD9"
        hoveredPillTextColor="#9FE1CB"
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
              <p className="eyebrow">
                <span className="eyebrow-dot" />
                Independent software studio
              </p>
              <h1 id="hero-title">
                Software built around
                <span>the way you work.</span>
              </h1>
              <p className="hero-subhead">
                NRV turns rough ideas, tangled workflows, and ambitious briefs into software that feels clear from the first click.
              </p>
              <div className="hero-actions">
                <a className="button button--rust" href="#work">See how we work <span aria-hidden="true">↘</span></a>
                <a className="text-link" href="#contact">Start a project <span aria-hidden="true">→</span></a>
              </div>
            </div>

            <div className="hero-capabilities" aria-label="NRV capabilities">
              <span>Web platforms</span>
              <span>Operations software</span>
              <span>Mobile apps</span>
              <span>Custom tools</span>
            </div>
          </div>
        </section>

        <section id="services" className="section section--ink build-section" aria-labelledby="build-title">
          <div className="build-arc" aria-hidden="true" />
          <div className="section-inner">
            <div className="editorial-heading editorial-heading--light" data-resolve>
              <div>
                <p className="eyebrow eyebrow--light">What we build</p>
                <h2 id="build-title">Software that earns its place.</h2>
              </div>
              <div className="editorial-aside">
                <p>
                  Useful enough to become part of the day. Thoughtful enough that people do not need a manual to trust it.
                </p>
                <span className="aside-rule" aria-hidden="true" />
                <span>From the first useful version to the one people rely on.</span>
              </div>
            </div>

            <div className="build-stage" data-resolve>
              <MagicBento
                textAutoHide={false}
                glowColor="43, 107, 109"
                enableTilt
                enableMagnetism={false}
                clickEffect
                enableSpotlight
                enableBorderGlow
                enableStars={false}
                particleCount={0}
                disableAnimations={reducedMotion}
              />
            </div>

            <div className="build-method" data-resolve>
              <p>One calm route through the noise.</p>
              <div className="method-line" aria-label="NRV delivery approach">
                <span><i aria-hidden="true" />Find the weight</span>
                <span><i aria-hidden="true" />Shape the system</span>
                <span><i aria-hidden="true" />Ship the useful version</span>
              </div>
            </div>
          </div>
        </section>

        <section id="precision" className="section section--paper craft-section" aria-labelledby="precision-title">
          <div className="section-inner">
            <div className="precision-frame" data-resolve>
              <LetterGlitch
                glitchColors={["#16241F", "#2B6B6D", "#9FE1CB"]}
                glitchSpeed={76}
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
                <div>
                  <p className="eyebrow">A flexible stack, chosen on purpose</p>
                  <h3>Tools are choices, not trophies.</h3>
                </div>
                <p>We choose what makes the product easier to run, extend, and own after launch.</p>
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

        <section id="work" className="section messy-section" aria-labelledby="work-title">
          <div className="section-inner">
            <div className="editorial-heading" data-resolve>
              <div>
                <p className="eyebrow">Where we are useful</p>
                <h2 id="work-title">Made for the messy middle.</h2>
              </div>
              <div className="editorial-aside editorial-aside--dark">
                <p>
                  The point where off-the-shelf stops fitting, the workaround starts running the business, and the right answer is not obvious yet.
                </p>
              </div>
            </div>

            <article className="messy-feature" data-resolve>
              <div className="messy-feature-copy">
                <p className="eyebrow eyebrow--light">Operational systems</p>
                <h3>When the work has outgrown the workaround.</h3>
                <p>
                  We turn scattered jobs, customers, handoffs, and decisions into one legible flow—without sanding away what makes the business work.
                </p>
                <div className="outcome-tags" aria-label="Typical outcomes">
                  <span>One source of truth</span>
                  <span>Fewer manual handoffs</span>
                  <span>Clear next actions</span>
                </div>
              </div>

              <div className="operations-map" aria-hidden="true">
                <div className="map-toolbar"><b>Today</b><span>Live workspace</span><i /></div>
                <div className="map-metrics">
                  <span><small>In motion</small><strong>18</strong></span>
                  <span><small>Needs attention</small><strong>04</strong></span>
                  <span><small>Ready</small><strong>11</strong></span>
                </div>
                <div className="map-flow">
                  <div className="flow-lane"><b>Arrived</b><i /><i /></div>
                  <div className="flow-lane"><b>In progress</b><i /><i /><i /></div>
                  <div className="flow-lane"><b>Ready</b><i /><i /></div>
                </div>
              </div>
            </article>

            <div className="messy-grid">
              <article className="messy-card messy-card--flow" data-resolve>
                <div className="messy-card-copy">
                  <p className="eyebrow">Workflow redesign</p>
                  <h3>From scattered inputs to one calm flow.</h3>
                  <p>We map what is actually happening, remove repeat work, and make the next decision visible.</p>
                </div>
                <div className="before-after" aria-hidden="true">
                  <div className="before-cluster"><i /><i /><i /><i /><i /></div>
                  <span>resolve</span>
                  <div className="after-line"><i /><i /><i /></div>
                </div>
              </article>

              <article className="messy-card messy-card--product" data-resolve>
                <div className="messy-card-copy">
                  <p className="eyebrow">Product direction</p>
                  <h3>From a good idea to something people can use.</h3>
                  <p>We narrow the first version, design the hard moments, and build a foundation that can keep moving.</p>
                </div>
                <div className="release-rail" aria-hidden="true">
                  <span className="is-done"><i />Truth</span>
                  <span className="is-done"><i />Shape</span>
                  <span className="is-live"><i />Build</span>
                  <span><i />Learn</span>
                </div>
              </article>
            </div>

            <div className="work-principles" data-resolve>
              <p>What stays true</p>
              <div>
                <span>Start with the real work.</span>
                <span>Make the next step obvious.</span>
                <span>Leave it easier to own.</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer id="contact" className="site-footer" aria-labelledby="contact-title">
        <div className="footer-cta">
          <div className="footer-cta-copy" data-resolve>
            <p className="eyebrow eyebrow--light">Have something in mind?</p>
            <h2 id="contact-title">Bring us the rough sketch.</h2>
            <p>Tell us what is stuck, what is changing, or what should exist.</p>
          </div>
          <a className="button button--cream button--large" href="mailto:hello@nrv.studio">
            Start a conversation <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="footer-main">
          <a className="footer-wordmark" href="#top" aria-label="NRV — back to top">NRV</a>
          <div className="footer-columns">
            <div>
              <span className="footer-label">Contact</span>
              <a className="footer-email" href="mailto:hello@nrv.studio">hello@nrv.studio</a>
            </div>
            <nav aria-label="Footer navigation">
              <span className="footer-label">Explore</span>
              <a href="#services">Services</a>
              <a href="#precision">Approach</a>
              <a href="#work">Work</a>
            </nav>
            <div>
              <span className="footer-label">Studio</span>
              <p>Independent by design.<br />Working worldwide.</p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} NRV. Software, resolved.</span>
            <span>Small studio. Serious build quality.</span>
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

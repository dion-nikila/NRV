"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import Cubes from "./Cubes";
import Carousel from "./Carousel";
import LetterGlitch from "./LetterGlitch";
import LineSidebar from "./LineSidebar";
import LogoLoop from "./LogoLoop";
import PillNav from "./PillNav";
import ScrambledText from "./ScrambledText";

const BUILD_WORDS = [
  "web platforms",
  "ops software",
  "mobile apps",
  "custom tools",
];

const NAV_ITEMS = [
  { label: "Craft", href: "#precision" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

const ACTIVE_SECTIONS = ["precision", "capabilities", "process", "contact"];

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

const CAPABILITIES = [
  {
    title: "Operational platforms",
    description:
      "Replace scattered handoffs with one clear system built around how the team actually works.",
    scope: "Workflows · permissions · reporting",
  },
  {
    title: "Customer-facing products",
    description:
      "Turn a useful idea into a fast, dependable product customers understand and your team can evolve.",
    scope: "Journeys · integrations · design systems",
  },
  {
    title: "Mobile tools",
    description:
      "Focused apps for work that needs to move beautifully beyond the desk.",
    scope: "iOS + Android · offline states · notifications",
  },
  {
    title: "Product care",
    description:
      "Clarify, harden, and steadily improve software that already matters.",
    scope: "Research · prototyping · ongoing stewardship",
  },
];

const PROCESS = [
  {
    id: "friction",
    meta: "Listen",
    title: "Find the friction",
    description:
      "We get close to the real workflow, the people inside it, and the moments where the current system starts to bend.",
    icon: <span className="process-glyph process-glyph--friction" />,
  },
  {
    id: "shape",
    meta: "Resolve",
    title: "Shape the system",
    description:
      "We turn the essential decisions into one coherent product direction before complexity has a chance to spread.",
    icon: <span className="process-glyph process-glyph--shape" />,
  },
  {
    id: "build",
    meta: "Make",
    title: "Build with care",
    description:
      "Product thinking, interface design, engineering, and testing move together as one focused build—not a chain of handoffs.",
    icon: <span className="process-glyph process-glyph--build" />,
  },
  {
    id: "refine",
    meta: "Finish",
    title: "Refine the finish",
    description:
      "We launch, measure, and keep polishing the details that turn working software into software people trust.",
    icon: <span className="process-glyph process-glyph--refine" />,
  },
];

export default function NRVSite() {
  const rootRef = useRef(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeHref, setActiveHref] = useState("");
  const [activeCapability, setActiveCapability] = useState(0);

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

        <section id="capabilities" className="section section--ink capabilities-section" aria-labelledby="capabilities-title">
          <div className="section-inner">
            <header className="capabilities-heading" data-resolve>
              <p className="section-kicker section-kicker--light">What we build</p>
              <h2 id="capabilities-title">Software shaped around the work.</h2>
              <p>Choose the kind of problem. The system around it stays specific to you.</p>
            </header>

            <div className="capabilities-interface" data-resolve>
              <LineSidebar
                items={CAPABILITIES.map((item) => item.title)}
                accentColor="#9FE1CB"
                textColor="rgba(244, 234, 217, 0.58)"
                markerColor="rgba(244, 234, 217, 0.2)"
                showIndex={false}
                showMarker
                proximityRadius={100}
                maxShift={18}
                falloff="smooth"
                markerLength={52}
                markerGap={0}
                tickScale={0.45}
                scaleTick
                itemGap={22}
                fontSize={1.55}
                smoothing={140}
                defaultActive={0}
                onItemClick={(index) => setActiveCapability(index)}
                ariaLabel="NRV capabilities"
              />

              <article className="capability-detail" aria-live="polite">
                <span className="capability-detail__signal" aria-hidden="true" />
                <h3>{CAPABILITIES[activeCapability].title}</h3>
                <ScrambledText
                  key={CAPABILITIES[activeCapability].title}
                  radius={110}
                  duration={0.75}
                  speed={0.35}
                  scrambleChars=".:/"
                  disableAnimations={reducedMotion || isMobile}
                  className="capability-description"
                >
                  {CAPABILITIES[activeCapability].description}
                </ScrambledText>
                <p className="capability-scope">{CAPABILITIES[activeCapability].scope}</p>
              </article>
            </div>
          </div>
        </section>

        <section id="process" className="section process-section" aria-labelledby="process-title">
          <div className="section-inner">
            <header className="process-heading" data-resolve>
              <div>
                <p className="section-kicker">How a build moves</p>
                <h2 id="process-title">One path from friction to finished.</h2>
              </div>
              <p>No relay race between strategy, design, and engineering. The same focused team carries the decisions all the way through.</p>
            </header>

            <div data-resolve>
              <Carousel
                items={PROCESS}
                baseWidth={1280}
                autoplay={false}
                pauseOnHover
                loop
                round={false}
                ariaLabel="NRV build process"
              />
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
              <a href="#precision">Craft</a>
              <a href="#capabilities">Capabilities</a>
              <a href="#process">Process</a>
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

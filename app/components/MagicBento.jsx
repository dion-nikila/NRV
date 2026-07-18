'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '43, 107, 109';

const cardData = [
  {
    color: '#16241F',
    kind: 'platform',
    title: 'Web platforms',
    description: 'Reliable browser products with clear structure and room to grow.',
    label: 'Platforms',
    tags: ['Portals', 'Products', 'Admin']
  },
  {
    color: '#16241F',
    kind: 'operations',
    title: 'Ops software',
    description: 'BayFlow — multi-tenant operations software for premium automotive service businesses.',
    label: 'BayFlow',
    tags: ['Workflow', 'Scheduling', 'Reporting']
  },
  {
    color: '#16241F',
    kind: 'mobile',
    title: 'Mobile apps',
    description: 'Focused mobile experiences built around the task in hand.',
    label: 'Mobile',
    tags: ['Field work', 'Mobile UX', 'Alerts']
  },
  {
    color: '#16241F',
    kind: 'tools',
    title: 'Custom tools',
    description: 'Purpose-built tools for the work generic software misses.',
    label: 'Systems',
    tags: ['Automation', 'Integrations', 'Data']
  },
  {
    color: '#16241F',
    kind: 'design',
    title: 'Product design',
    description: 'From rough flow to tested interface and reusable system.',
    label: 'Design',
    tags: ['Flows', 'Prototypes', 'Systems']
  },
  {
    color: '#16241F',
    kind: 'support',
    title: 'Ongoing support',
    description: 'Fixes, improvements, and steady care after launch.',
    label: 'Support',
    tags: ['QA', 'Performance', 'Iteration']
  }
];

const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
  const element = document.createElement('span');
  element.className = 'nrv-magic-bento__particle';
  element.setAttribute('aria-hidden', 'true');
  element.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 3;
    left: ${x}px;
    top: ${y}px;
  `;
  return element;
};

const calculateSpotlightValues = radius => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card, mouseX, mouseY, glow, radius) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty('--nrv-bento-glow-x', `${relativeX}%`);
  card.style.setProperty('--nrv-bento-glow-y', `${relativeY}%`);
  card.style.setProperty('--nrv-bento-glow-intensity', glow.toString());
  card.style.setProperty('--nrv-bento-glow-radius', `${radius}px`);
};

const useDisableMotionEffects = () => {
  // Start disabled so mobile and reduced-motion visitors never receive a flash
  // of cursor-driven animation before media queries are evaluated.
  const [disableMotionEffects, setDisableMotionEffects] = useState(true);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointerQuery = window.matchMedia('(hover: none), (pointer: coarse)');

    const updatePreference = () => {
      setDisableMotionEffects(
        mobileQuery.matches || reducedMotionQuery.matches || coarsePointerQuery.matches
      );
    };

    updatePreference();
    mobileQuery.addEventListener('change', updatePreference);
    reducedMotionQuery.addEventListener('change', updatePreference);
    coarsePointerQuery.addEventListener('change', updatePreference);

    return () => {
      mobileQuery.removeEventListener('change', updatePreference);
      reducedMotionQuery.removeEventListener('change', updatePreference);
      coarsePointerQuery.removeEventListener('change', updatePreference);
    };
  }, []);

  return disableMotionEffects;
};

const ParticleCard = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false
}) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current || particleCount <= 0) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(immediate => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach(particle => {
      gsap.killTweensOf(particle);

      if (immediate) {
        particle.remove();
        return;
      }

      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => particle.remove()
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current || particleCount <= 0) return;

    if (!particlesInitialized.current) initializeParticles();

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = window.setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true);
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
        );

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true
        });

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles, particleCount]);

  useEffect(() => {
    memoizedParticles.current = [];
    particlesInitialized.current = false;
  }, [particleCount, glowColor]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return undefined;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles(false);

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseMove = event => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;

        magnetismAnimationRef.current?.kill();
        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleClick = event => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement('span');
      ripple.className = 'nrv-magic-bento__ripple';
      ripple.setAttribute('aria-hidden', 'true');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 4;
      `;

      element.appendChild(ripple);
      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => ripple.remove()
        }
      );
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      gsap.killTweensOf(element);
      element.querySelectorAll('.nrv-magic-bento__ripple').forEach(ripple => ripple.remove());
      clearAllParticles(true);
    };
  }, [animateParticles, clearAllParticles, clickEffect, disableAnimations, enableMagnetism, enableTilt, glowColor]);

  return (
    <article
      ref={cardRef}
      className={`${className} nrv-magic-bento__particle-container`}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
      role="listitem"
    >
      {children}
    </article>
  );
};

const GlobalSpotlight = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR
}) => {
  const spotlightRef = useRef(null);

  useEffect(() => {
    if (disableAnimations || !gridRef.current || !enabled) return undefined;

    const grid = gridRef.current;
    const section = grid.closest('.nrv-magic-bento');
    if (!section) return undefined;
    const cards = Array.from(grid.querySelectorAll('.nrv-magic-bento__card'));

    const spotlight = document.createElement('div');
    spotlight.className = 'nrv-magic-bento__global-spotlight';
    spotlight.setAttribute('aria-hidden', 'true');
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 20;
      opacity: 0;
      left: 0;
      top: 0;
      transform: translate3d(-400px, -400px, 0);
      mix-blend-mode: screen;
      transition: opacity 160ms ease;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    let pointerX = 0;
    let pointerY = 0;
    let frame = null;
    const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);

    const updateSpotlight = () => {
      frame = null;
      if (!spotlightRef.current) return;

      let minDistance = Infinity;

      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(pointerX - centerX, pointerY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);
        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(card, pointerX, pointerY, glowIntensity, spotlightRadius);
      });

      spotlightRef.current.style.transform =
        `translate3d(${pointerX - 400}px, ${pointerY - 400}px, 0)`;

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      spotlightRef.current.style.opacity = String(targetOpacity);
    };

    const handleMouseMove = event => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame == null) frame = requestAnimationFrame(updateSpotlight);
    };

    const handleMouseLeave = () => {
      if (frame != null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      cards.forEach(card => {
        card.style.setProperty('--nrv-bento-glow-intensity', '0');
      });
      if (spotlightRef.current) {
        spotlightRef.current.style.opacity = '0';
      }
    };

    section.addEventListener('pointermove', handleMouseMove, { passive: true });
    section.addEventListener('pointerleave', handleMouseLeave);

    return () => {
      section.removeEventListener('pointermove', handleMouseMove);
      section.removeEventListener('pointerleave', handleMouseLeave);
      if (frame != null) cancelAnimationFrame(frame);
      if (spotlightRef.current) {
        spotlightRef.current.remove();
        spotlightRef.current = null;
      }
    };
  }, [disableAnimations, enabled, glowColor, gridRef, spotlightRadius]);

  return null;
};

const MagicBento = ({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true
}) => {
  const gridRef = useRef(null);
  const disableMotionEffects = useDisableMotionEffects();
  const shouldDisableAnimations = disableAnimations || disableMotionEffects;

  return (
    <div
      className={`nrv-magic-bento${shouldDisableAnimations ? ' nrv-magic-bento--static' : ''}`}
      style={{ '--nrv-bento-glow-rgb': glowColor }}
    >
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <div className="nrv-magic-bento__grid" ref={gridRef} role="list" aria-label="What NRV builds">
        {cardData.map(card => {
          const baseClassName = [
            'nrv-magic-bento__card',
            textAutoHide && 'nrv-magic-bento__card--text-autohide',
            enableBorderGlow && 'nrv-magic-bento__card--border-glow'
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <ParticleCard
              key={card.title}
              className={baseClassName}
              style={{
                backgroundColor: card.color,
                '--nrv-bento-glow-rgb': glowColor
              }}
              disableAnimations={shouldDisableAnimations}
              particleCount={enableStars ? particleCount : 0}
              glowColor={glowColor}
              enableTilt={enableTilt}
              clickEffect={clickEffect}
              enableMagnetism={enableMagnetism}
            >
              <div className="nrv-magic-bento__card-header">
                <span className="nrv-magic-bento__card-label"><i aria-hidden="true" />{card.label}</span>
                <span className="nrv-magic-bento__card-signal" aria-hidden="true">↗</span>
              </div>
              <div className="nrv-magic-bento__visual" data-kind={card.kind} aria-hidden="true">
                <span /><span /><span /><span /><span /><span />
              </div>
              <div className="nrv-magic-bento__card-content">
                <h3 className="nrv-magic-bento__card-title">{card.title}</h3>
                <p className="nrv-magic-bento__card-description">{card.description}</p>
                <div className="nrv-magic-bento__card-tags" aria-label={`${card.title} capabilities`}>
                  {card.tags.map(tag => <span key={tag}>{tag}</span>)}
                </div>
              </div>
            </ParticleCard>
          );
        })}
      </div>
    </div>
  );
};

export default MagicBento;

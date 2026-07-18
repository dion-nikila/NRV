# NRV — Software, resolved

The public website for NRV, an independent software studio that turns rough ideas into thoughtful, working products.

The site’s visual system is called **Patina**: warm paper, dark ink, teal blooms, and interfaces that resolve from soft marks into precise structure. It is a single responsive page built to feel equally complete on desktop and mobile.

## Experience

- Interactive Cubes hero with desktop pointer and mobile touch support
- Animated PillNav with an accessible mobile menu
- Patina-themed MagicBento services grid
- LetterGlitch engineering band
- Touch-aware LogoLoop technology marquee
- GSAP blur-to-crisp section entrances
- Reduced-motion fallbacks throughout
- Bespoke Open Graph sharing artwork

## Stack

- Next.js 16 and React 19
- TypeScript/JavaScript client components
- Tailwind CSS 4 and custom CSS
- GSAP
- Vinext/Vite for the Sites deployment target

## Local development

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Validation:

```bash
npm run lint
npm test
```

`npm run build` produces the Cloudflare Worker-compatible Sites build. A standard Next.js production build is also supported for Vercel.

## Brand palette

| Token | Value |
| --- | --- |
| Paper | `#CBAB70` |
| Paper shadow | `#AD8A52` |
| Ink | `#16241F` |
| Teal | `#2B6B6D` |
| Teal light | `#9FE1CB` |
| Rust | `#A8543C` |
| Cream | `#F4EAD9` |

Display typography is Fraunces; body and interface typography is Inter.

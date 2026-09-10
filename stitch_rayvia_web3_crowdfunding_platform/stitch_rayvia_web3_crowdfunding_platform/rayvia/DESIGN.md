---
name: Rayvia
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#46464c'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#76767d'
  outline-variant: '#c7c6cd'
  surface-tint: '#595e70'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#161b2b'
  on-primary-container: '#7f8397'
  inverse-primary: '#c2c6db'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#23005c'
  on-tertiary-container: '#9466ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dee1f7'
  primary-fixed-dim: '#c2c6db'
  on-primary-fixed: '#161b2b'
  on-primary-fixed-variant: '#414658'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
typography:
  display-xl:
    fontFamily: Manrope
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  code-md:
    fontFamily: Geist Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.2'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-lg: 80px
  stack-md: 48px
---

## Brand & Style
The design system for this platform blends the intellectual rigor of high-end editorial design with the forward-looking technological optimism of Web3. The brand persona is "The Architect of the Future"—visionary yet grounded, creative yet professional.

The style is **Modern Editorial with a Technical Edge**. It utilizes extreme whitespace and a strict typographic scale to establish authority, while introducing subtle Web3 cues through restrained gradients and glassmorphism. The interface should feel like a premium printed journal that has been digitized for a decentralized era. We prioritize clarity and "breathing room" to ensure complex financial/blockchain information feels accessible and high-end.

## Colors
The palette is rooted in a "Warm Paper vs. Deep Space" contrast.
- **Primary:** An ink-like near-black navy used for text and structural elements to maintain a premium feel.
- **Surface:** A warm, gallery-style off-white that prevents the "clinical" look of pure white.
- **Accents:** A spectrum of Electric Blue, Purple, and Cyan used sparingly for high-action items, progress indicators, and interactive states.
- **Functional:** Use the deep navy background for immersive states or "dark mode" sections within the light-themed UI to signal focus or exclusivity.

## Typography
The typographic hierarchy is the primary driver of the design's "Editorial" feel.
- **Headlines:** Manrope is used with tight letter-spacing and bold weights to create a sense of structure and impact.
- **Body:** Inter provides a neutral, highly readable foundation for long-form project descriptions.
- **Technical Data:** All wallet addresses, transaction hashes, and numerical data must use **Geist Mono** to evoke a precise, technical "Web3" atmosphere.
- **Hierarchy:** Use `label-caps` for eyebrows and category tags to create a rhythmic separation between sections.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for desktop to maintain editorial control over line lengths and image placement. 
- **Grid:** 12-column grid with a 1280px max-width.
- **Vertical Rhythm:** Generous stack spacing (48px to 80px) is used between sections to emphasize the premium, unhurried nature of the platform.
- **Mobile:** Elements reflow to a single column with reduced horizontal margins (20px). Large display type should scale down significantly while maintaining its weight.

## Elevation & Depth
This design system avoids heavy shadows in favor of **Tonal Layering** and **Low-Contrast Outlines**. 
- **Borders:** Use 1px solid borders in a muted version of the primary ink color (approx 10-15% opacity) to define containers.
- **Depth:** Surfaces use the background color (`#F9F7F2`). High-priority cards may use a subtle "elevation shadow": a very large blur (32px), low opacity (4%), with a slight blue-ink tint.
- **Glassmorphism:** Reserved for persistent navigation and modal overlays. Apply a 20px backdrop blur with a 70% transparent surface color to maintain legibility without losing the futuristic feel.

## Shapes
The shape language is **Soft (0.25rem)**. This provides enough rounding to feel modern and human without the playfulness of fully rounded UI. 
- **Buttons:** Use `rounded-lg` (0.5rem) to differentiate interactive elements from structural containers.
- **Images:** Large editorial imagery should use the base `0.25rem` radius to maintain a crisp, sophisticated edge.

## Components
- **Navbar:** Sticky glassmorphic bar with a 1px bottom border. Include a "Wallet Connection" status on the far right using a `code-md` typeface for the truncated address.
- **ProjectCard:** Large aspect-ratio images (16:9). Titles should be `headline-sm`. The card itself should have no shadow, defined only by a thin border until hovered, where it gains a subtle tint shift.
- **ProgressBar:** A sleek 6px height track. The fill should be a horizontal linear gradient: `Purple (#8B5CF6)` to `Blue (#6366F1)` to `Cyan (#06B6D4)`.
- **WalletButton:** A "dual-state" button. When disconnected: Solid Primary Navy. When connected: Ghost style (border only) with a small green dot indicator for "Network Active."
- **FormField:** Minimalist design with only a bottom border that transitions to a Primary Navy 2px border on focus. Labels should use the `label-caps` style.
- **Chips/Tags:** Small, pill-shaped elements using the `background-dark` color with `surface` text for high contrast in categories like "DAO" or "DeFi."
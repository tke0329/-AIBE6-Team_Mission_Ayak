---
name: AYAK
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#424656'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#727687'
  outline-variant: '#c2c6d8'
  surface-tint: '#0054d6'
  primary: '#0050cb'
  on-primary: '#ffffff'
  primary-container: '#0066ff'
  on-primary-container: '#f8f7ff'
  inverse-primary: '#b3c5ff'
  secondary: '#00677f'
  on-secondary: '#ffffff'
  secondary-container: '#00ccf9'
  on-secondary-container: '#005266'
  tertiary: '#00681a'
  on-tertiary: '#ffffff'
  tertiary-container: '#008423'
  on-tertiary-container: '#e5ffdc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#003fa4'
  secondary-fixed: '#b7eaff'
  secondary-fixed-dim: '#4cd6ff'
  on-secondary-fixed: '#001f28'
  on-secondary-fixed-variant: '#004e60'
  tertiary-fixed: '#70ff76'
  tertiary-fixed-dim: '#42e355'
  on-tertiary-fixed: '#002204'
  on-tertiary-fixed-variant: '#005313'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter-desktop: 24px
  margin-desktop: 40px
  gutter-mobile: 16px
  margin-mobile: 16px
---

## Brand & Style
The design system for this healthcare platform is built on the pillars of **Precision, Vitality, and Trust**. It adopts a **Modern Minimalist** aesthetic tailored for a high-stakes medical SaaS environment. The visual language prioritizes cognitive ease, reducing the stress of data-heavy medical information through expansive whitespace, a calming palette, and a clear hierarchy. 

The target audience ranges from healthcare providers requiring quick data synthesis to patients seeking clarity and reassurance. The UI evokes a sense of "digital hygiene"—clean, organized, and responsive—moving away from the cluttered, legacy systems of the past toward a forward-thinking, approachable clinical experience.

## Colors
The palette is centered around a "Clinical Blue" primary color, chosen for its association with authority and stability in the healthcare sector. 

- **Primary (#0066FF):** Used for primary actions, active navigation states, and critical medical data points.
- **Secondary (#00D1FF):** A brighter cyan used for supporting data visualizations and interactive accents.
- **Tertiary (#32D74B):** A "Vitals Green" reserved strictly for positive health indicators and success states.
- **Neutrals:** A range of cool-toned grays that maintain a clean, "sterile but warm" environment.
- **Backgrounds:** Use a pure white (`#FFFFFF`) for cards and surfaces, with a very subtle off-white (`#F8FAFC`) for the application background to create soft depth.

## Typography
This design system utilizes a dual-font strategy. **Manrope** is used for headlines to provide a modern, friendly, and balanced character that feels contemporary. **Inter** is used for all UI components, labels, and body copy due to its exceptional legibility at small sizes and its systematic, utilitarian nature.

Maintain high contrast between headlines and body text to ensure skim-ability. In data-heavy views, prefer `label-md` for metadata to maximize screen real estate without sacrificing readability.

## Layout & Spacing
The layout follows a **8px square grid system** to ensure mathematical consistency. 

- **Desktop:** A 12-column fixed-width grid (max 1280px) centered in the viewport. 
- **Mobile:** A 4-column fluid grid. 
- **Consistency:** Use 24px (3x base) for gutters between major dashboard cards on desktop, and 16px (2x base) for mobile. 

Margins should be generous; the "Minimal Healthcare" style relies on breathing room to prevent the interface from feeling "heavy" or "urgent" unless necessary.

## Elevation & Depth
Depth is created using **Tonal Layering** combined with **Ambient Shadows**. 

1. **Floor:** The application background is the lowest level (`#F8FAFC`).
2. **Surface:** Main dashboard cards sit on the floor with a very soft, diffused shadow (Blur: 20px, Y: 4px, Color: `rgba(0, 102, 255, 0.05)`). This blue-tinted shadow keeps the UI feeling fresh and medical rather than muddy.
3. **Overlay:** Modals and dropdowns use a more pronounced shadow and a 1px soft border (`#E2E8F0`) to ensure separation from the content below.

Avoid heavy black shadows. All elevation should feel light, airy, and "cloud-like."

## Shapes
The shape language is consistently **Rounded** (Level 2). This softens the technical nature of medical data, making the platform feel more accessible and less intimidating.

- **Standard Elements:** Buttons, input fields, and small widgets use a `0.5rem` radius.
- **Large Elements:** Dashboard cards and containers use a `1rem` (rounded-lg) radius.
- **Data Points:** Status indicators and avatars should be fully circular (pill-shaped) to contrast against the structured rectangular grid.

## Components

- **Buttons:** Primary buttons are solid Blue (#0066FF) with white text. Secondary buttons use a light blue ghost style (Background: #E6F0FF, Text: #0066FF).
- **Cards:** White backgrounds, 1rem corner radius, and subtle ambient shadows. Headers within cards should have a subtle bottom border (`1px solid #F1F5F9`).
- **Input Fields:** Use a light gray background (`#F8FAFC`) with a 1px border. On focus, the border transitions to Primary Blue with a 3px soft outer glow.
- **Vitals Chips:** Small, rounded badges used to display health metrics (e.g., "Normal", "Elevated"). Use Tertiary Green for normal and a soft red for alerts.
- **Lists:** Data lists should have generous vertical padding (16px) between rows and use subtle dividers rather than alternating row colors.
- **Progress Bars:** Thin, rounded bars using the Primary-to-Secondary gradient to show health goals or treatment completion.
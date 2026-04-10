# Design System Specification

## 1. Overview & Creative North Star: "The Kinetic Pulse"
The Creative North Star for this design system is **"The Kinetic Pulse."** We are moving away from the static, rigid nature of traditional fitness apps and toward an interface that feels alive, rhythmic, and editorial. 

By leveraging the "Spotify Light Mode" aesthetic—extreme cleanliness met with bursts of saturated energy—we create a "High-End Playground." We break the "standard app" mold through intentional asymmetry, massive typographic scales for performance data, and a "No-Line" philosophy that relies on tonal depth rather than structural borders. Every interaction should feel like a reward, utilizing "pill" and "bubble" geometries to soften the digital experience into something tactile and premium.

---

## 2. Color Strategy
Our palette is rooted in a crisp, off-white foundation (`surface`), allowing our "Action Colors" to vibrate with maximum energy.

### The "No-Line" Rule
**Standard 1px borders are strictly prohibited.** To define sections, use background color shifts. A `surface-container-low` section sitting on a `surface` background provides all the separation the eye needs without the visual clutter of "boxes."

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of "Frosted Acrylic."
*   **Base:** `surface` (#f5f6f7)
*   **Elevated Sections:** `surface-container-low` (#eff1f2)
*   **Interactive Cards:** `surface-container-lowest` (#ffffff) for maximum "pop" and lift.
*   **Nested Elements:** Use `surface-container-high` for inset elements like search bars or inactive progress tracks.

### The "Glass & Gradient" Rule
To elevate the "Pill" elements from flat to premium, use **Signature Textures**. 
*   **Primary CTAs:** Instead of flat `primary`, use a subtle linear gradient from `primary` (#00675d) to `primary_container` (#6af2de). 
*   **Floating Elements:** Utilize Glassmorphism. Apply `surface_container_lowest` at 70% opacity with a `20px` backdrop-blur for floating navigation or overlays.

---

## 3. Typography: Editorial Impact
We use **Plus Jakarta Sans** for its geometric clarity and modern, friendly "aperture."

*   **Performance Numerals (`display-lg`):** Push-up counts and targets should use the `display-lg` scale. These aren't just labels; they are the hero of the screen.
*   **Directives (`headline-sm`):** Instructions should be punchy and bold, creating a clear hierarchy that guides the user through high-intensity workouts.
*   **Body & Labels:** Use `body-md` for standard info. Maintain generous letter-spacing (0.02em) on `label-sm` to ensure a premium, "spaced-out" editorial feel even at small sizes.

---

## 4. Elevation & Depth
We define space through **Tonal Layering**, not lines.

*   **The Layering Principle:** A workout stat card (`surface-container-lowest`) sits on the main dashboard (`surface`). The contrast in brightness creates the "lift."
*   **Ambient Shadows:** For floating action buttons or high-priority cards, use a "Sunlight Shadow."
    *   *Value:* `0px 20px 40px`
    *   *Color:* `on_surface` at **6% opacity**. 
    *   *Intent:* It should feel like a soft glow, not a dark smudge.
*   **The Ghost Border Fallback:** If accessibility requires a stroke (e.g., in a high-glare outdoor environment), use `outline_variant` at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components

### Buttons (The "Power Pill")
*   **Primary:** Full-rounded (`rounded-full`), `primary` to `primary_container` gradient. 48px minimum height. High-energy, bold text.
*   **Secondary:** `surface-container-highest` background with `on_surface` text. No border.
*   **Tertiary:** Ghost style. No background, `primary` colored text, bold weight.

### Progress Elements (The "Vibrant Ring")
*   **Track:** Use `surface-container-high`.
*   **Indicator:** Use `primary` (Teal), `secondary` (Coral), or `tertiary` (Yellow) depending on the metric. Indicators must use `rounded-full` caps to maintain the "bubble" language.

### Cards & Data Lists
*   **Forbid Dividers:** Do not use lines to separate list items. Use 16px or 24px of vertical whitespace or alternating `surface-container` shifts.
*   **The "Target Bubble":** Workout targets should be encased in a large, `xl` rounded container with a subtle `secondary_container` tint to denote importance.

### Inputs
*   **Text Fields:** Use a "Pill" shape (`rounded-full`). Background: `surface-container-low`. On focus, transition the background to `surface-container-lowest` and apply the "Ambient Shadow."

---

## 6. Do’s and Don’ts

### Do:
*   **DO** use "Aggressive Whitespace." If a section feels crowded, double the padding. This is a premium experience; it needs room to breathe.
*   **DO** use "Asymmetric Balance." Place a massive `display-lg` number on the left and a small `label-md` descriptive text on the right to create visual interest.
*   **DO** ensure every tap target is at least 44x44px, even for small "Close" or "Edit" actions.

### Don't:
*   **DON'T** use black (#000000) for text. Use `on_surface` (#2c2f30) to maintain a soft, sophisticated contrast.
*   **DON'T** use "Standard" 4px or 8px corners. If it’s not `xl` (3rem) or `full` (pill), it doesn't belong in this system.
*   **DON'T** use 1px dividers. If you feel the need for a line, your layout needs more whitespace or a subtle background color shift instead.
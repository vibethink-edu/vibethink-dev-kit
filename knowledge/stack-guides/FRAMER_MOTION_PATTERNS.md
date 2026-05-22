# Framer Motion Animation Patterns

**Status:** Harvested from `V4-ovi-Portal`
**Category:** UI/UX Design System

## 1. The "Editorial Ease"
VibeThink uses a custom cubic-bezier easing providing a premium, "Apple-like" feel.
**Value:** `[0.16, 1, 0.3, 1]`

## 2. Text Reveal Pattern
Used for headlines and hero text. It combines opacity, Y-axis movement, scale, and blur.

```tsx
<motion.div
  initial={{
    opacity: 0,
    y: 30,
    scale: 0.98,
    filter: "blur(4px)"
  }}
  animate={{
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)"
  }}
  transition={{
    duration: 1,
    ease: [0.16, 1, 0.3, 1] // Editorial Ease
  }}
>
  {children}
</motion.div>
```

## 3. Scramble Text Effect
Used for dynamic tech-feeling text (e.g., loading states or hacker-style headers).
*(Requires custom hook)*

## 4. Performance Best Practices
-   Use `will-change` on complex animations (though Framer handles most).
-   Use `whileInView` for scroll-triggered entrance animations.
-   Set `viewport={{ margin: "-10%" }}` to trigger slightly before the element is fully visible.

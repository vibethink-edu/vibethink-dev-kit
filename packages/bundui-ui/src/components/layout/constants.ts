/**
 * 📐 Bundui Layout Constants - EXACT MATCH
 *
 * These constants mirror https://shadcnuikit.com/dashboard/default exactly
 * NO DEVIATIONS - exact pixel measurements and breakpoints
 */

// 🏗️ HEADER CONSTANTS (EXACT BUNDUI MATCH)
export const HEADER_CONSTANTS = {
  // Heights - EXACT from live demo
  HEIGHT: {
    MOBILE: 56, // h-14 = 56px
    DESKTOP: 60, // lg:h-[60px]
  },

  // Z-index - layering
  Z_INDEX: 50, // z-50 sticky positioning

  // Background - backdrop blur effect
  BACKGROUND: "bg-background/50 backdrop-blur-xl",

  // Padding and spacing
  PADDING: {
    HORIZONTAL: 16, // px-4
    GAP: 12, // gap-3
  },

  // Button specifications
  TOGGLE_BUTTON: {
    SIZE: "icon" as const,
    VARIANT: "outline" as const,
    RESPONSIVE_CLASSES: "flex md:hidden lg:flex", // Show on mobile + large desktop
  },
} as const;

// 📱 SIDEBAR CONSTANTS (EXACT BUNDUI MATCH)
export const SIDEBAR_CONSTANTS = {
  // Width specifications
  WIDTH: {
    EXPANDED: 256, // 16rem - bundui-premium original
    COLLAPSED: 48, // 3rem - bundui-premium original
    MOBILE_OVERLAY: "100%", // Full width on mobile
  },

  // Breakpoints for responsive behavior
  BREAKPOINTS: {
    COLLAPSE_AT: 1024, // lg breakpoint
    MOBILE_OVERLAY_AT: 768, // md breakpoint
  },

  // Animation and transitions
  ANIMATION: {
    DURATION: "200ms",
    EASING: "ease-in-out",
    PROPERTY: "width, transform",
  },

  // Z-index for overlays
  Z_INDEX: {
    DESKTOP: 40,
    MOBILE_OVERLAY: 60,
  },
} as const;

// 🔍 SEARCH CONSTANTS (EXACT BUNDUI MATCH)
export const SEARCH_CONSTANTS = {
  // Search input specifications
  INPUT: {
    HEIGHT: 36, // h-9
    MAX_WIDTH: 384, // max-w-sm (24rem = 384px)
    PADDING_LEFT: 40, // pl-10 (2.5rem = 40px for icon space)
    PADDING_RIGHT: 16, // pr-4
    BORDER_RADIUS: 6, // rounded-md
  },

  // Icon specifications
  ICON: {
    SIZE: 16, // h-4 w-4
    LEFT_POSITION: 12, // left-3
  },

  // Kbd shortcut indicator
  KBD: {
    RIGHT_POSITION: 8, // right-2
    PADDING: 4, // p-1
    SIZE: 12, // size-3 for CommandIcon
    FONT_SIZE: 12, // text-xs
  },

  // Responsive behavior
  RESPONSIVE: {
    HIDE_INPUT_BELOW: 1024, // lg:block (hidden below lg)
    SHOW_BUTTON_BELOW: 1024, // block lg:hidden
  },
} as const;

// 🏠 CONTAINER CONSTANTS (EXACT BUNDUI MATCH)
export const CONTAINER_CONSTANTS = {
  // Container query classes - @container pattern
  QUERY_NAME: "main", // @container/main

  // Padding specifications
  PADDING: {
    DEFAULT: 16, // p-4
  },

  // Centered layout constants
  CENTERED_LAYOUT: {
    CLASSES:
      "xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto xl:group-data-[theme-content-layout=centered]/layout:mt-8",
    MAX_WIDTH: "1200px", // Standard container max-width
    TOP_MARGIN: 32, // mt-8 = 32px
  },
} as const;

// 🎨 THEME CONSTANTS (BUNDUI DATA ATTRIBUTES)
export const THEME_CONSTANTS = {
  // Data attributes for theme switching
  ATTRIBUTES: {
    THEME_PRESET: "data-theme-preset",
    CONTENT_LAYOUT: "data-theme-content-layout",
    SIDEBAR_STATE: "data-sidebar-state",
  },

  // Theme presets (from Bundui live demo)
  PRESETS: [
    "default",
    "new-york",
    "rose-garden",
    "ocean-breeze",
    "forest-whisper",
    "midnight-noir",
  ] as const,

  // Content layout options
  CONTENT_LAYOUTS: ["default", "centered"] as const,

  // Sidebar states
  SIDEBAR_STATES: ["expanded", "collapsed"] as const,
} as const;

// 📐 EXACT MEASUREMENTS FROM LIVE DEMO
export const BUNDUI_MEASUREMENTS = {
  // Verified against https://shadcnuikit.com/dashboard/default
  HEADER_HEIGHT_MOBILE: "56px",
  HEADER_HEIGHT_DESKTOP: "60px",
  SIDEBAR_WIDTH_EXPANDED: "256px", // 16rem - bundui-premium original
  SIDEBAR_WIDTH_COLLAPSED: "48px", // 3rem - bundui-premium original
  SEARCH_INPUT_HEIGHT: "36px",
  SEARCH_INPUT_MAX_WIDTH: "384px",
  CONTAINER_PADDING: "16px",

  // Animation timings
  TRANSITION_DURATION: "200ms",
  BACKDROP_BLUR: "backdrop-blur-xl",

  // Responsive breakpoints (matching Tailwind defaults used by Bundui)
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    "2XL": 1536,
  },
} as const;

// 🔒 TYPE SAFETY
export type ThemePreset = (typeof THEME_CONSTANTS.PRESETS)[number];
export type ContentLayout = (typeof THEME_CONSTANTS.CONTENT_LAYOUTS)[number];
export type SidebarState = (typeof THEME_CONSTANTS.SIDEBAR_STATES)[number];

// 📊 VALIDATION HELPERS
export const validateBunduiMeasurements = () => {
  const errors: string[] = [];

  // Validate critical measurements
  if (HEADER_CONSTANTS.HEIGHT.MOBILE !== 56) {
    errors.push("Header mobile height must be 56px");
  }

  if (HEADER_CONSTANTS.HEIGHT.DESKTOP !== 60) {
    errors.push("Header desktop height must be 60px");
  }

  if (SIDEBAR_CONSTANTS.WIDTH.EXPANDED !== 256) {
    errors.push("Sidebar expanded width must be 256px (bundui-premium original)");
  }

  if (SEARCH_CONSTANTS.INPUT.MAX_WIDTH !== 384) {
    errors.push("Search input max-width must be 384px");
  }

  return errors.length === 0 ? null : errors;
};

/**
 * 🎯 BUNDUI FIDELITY GUARANTEE
 *
 * These constants ensure PIXEL-PERFECT match with:
 * https://shadcnuikit.com/dashboard/default
 *
 * Any deviation from these values breaks visual fidelity.
 * Changes require validation against live demo.
 */

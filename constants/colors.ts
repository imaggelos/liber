/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#0a0a0a',
    tint: '#0a0a0a',

    // Core surfaces
    background: '#ffffff',
    foreground: '#0a0a0a',

    // Cards / elevated surfaces
    card: '#f6f6f4',
    cardForeground: '#0a0a0a',

    // Primary action color (buttons, links, active states)
    primary: '#0a0a0a',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#ededeb',
    secondaryForeground: '#1a1a1a',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#ededeb',
    mutedForeground: '#737373',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#e4e4e1',
    accentForeground: '#1a1a1a',

    // Destructive actions (delete, error states)
    destructive: '#0a0a0a',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#d8d8d4',
    input: '#d8d8d4',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;

/**
 * Design system tokens for the Fleet Management System.
 * Primary brand color: #164CA1 (MBTA Commuter Blue)
 */

import { Platform } from 'react-native';

// ─── Brand Colors ───────────────────────────────────────────────────────────

export const Brand = {
  primary: '#164CA1',
  primaryLight: '#1E63CC',
  primaryDark: '#0F3A7A',
  primaryAlpha10: 'rgba(22, 76, 161, 0.10)',
  primaryAlpha20: 'rgba(22, 76, 161, 0.20)',
  primaryAlpha50: 'rgba(22, 76, 161, 0.50)',
} as const;

// ─── Semantic Colors ────────────────────────────────────────────────────────

export const Colors = {
  light: {
    text: '#0A0E14',
    textSecondary: '#4A5568',
    textTertiary: '#8896AA',
    background: '#F5F7FA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    border: '#E2E8F0',
    borderLight: '#EDF2F7',
    tint: Brand.primary,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: Brand.primary,
    skeleton: '#E2E8F0',
    skeletonHighlight: '#F1F5F9',
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#DC2626',
    errorBackground: '#FEF2F2',
  },
  dark: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    background: '#0B0F1A',
    surface: '#141B2D',
    surfaceElevated: '#1C2438',
    border: '#1E293B',
    borderLight: '#1A2332',
    tint: '#4B8BF5',
    icon: '#64748B',
    tabIconDefault: '#475569',
    tabIconSelected: '#4B8BF5',
    skeleton: '#1E293B',
    skeletonHighlight: '#2D3A50',
    success: '#22C55E',
    warning: '#FBBF24',
    error: '#EF4444',
    errorBackground: '#1C1517',
  },
} as const;

// ─── Spacing ────────────────────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// ─── Border Radius ──────────────────────────────────────────────────────────

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
} as const;

// ─── Font Sizes ─────────────────────────────────────────────────────────────

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  title: 34,
} as const;

// ─── Font Weights ───────────────────────────────────────────────────────────

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

// ─── Shadows ────────────────────────────────────────────────────────────────

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

// ─── Fonts ──────────────────────────────────────────────────────────────────

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

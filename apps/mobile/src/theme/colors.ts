// MITO Platform Color Palette
// Patriotic colors (green, yellow, blue) in dark tones with gold accents

export const colors = {
  // Primary colors - patriotic dark tones
  primary: {
    green: '#006633', // Dark green
    greenDark: '#004422',
    greenLight: '#008844',
    yellow: '#FFB800', // Dark yellow/gold
    yellowDark: '#CC9600',
    yellowLight: '#FFD54F',
    blue: '#003366', // Dark blue
    blueDark: '#002244',
    blueLight: '#004488',
  },
  
  // Accent color
  accent: {
    gold: '#FFD700', // Gold for highlights
    goldDark: '#DAA520',
    goldLight: '#FFE55C',
  },
  
  // Background colors
  background: {
    primary: '#0A0E1A', // Very dark blue-black
    secondary: '#151B2E', // Dark blue-grey
    card: '#1A2238', // Card background
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B8CC',
    tertiary: '#6C7489',
    inverse: '#0A0E1A',
  },
  
  // System colors
  system: {
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
  },
  
  // Interactive elements
  interactive: {
    active: '#FFD700', // Gold
    inactive: '#6C7489',
    disabled: '#3A3F54',
  },
  
  // Common
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type Colors = typeof colors;

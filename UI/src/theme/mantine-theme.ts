import { createTheme, MantineColorsTuple } from '@mantine/core';

// Preserve exact custom colors from globals.css
const primary: MantineColorsTuple = [
  '#fff9e6', // lightest
  '#fff3cc',
  '#ffe9a6',
  '#ffdf80',
  '#ffd966',
  '#fab422', // main color (var(--primary) - orange)
  '#e0a31f',
  '#c6921b',
  '#ad8018',
  '#936f15', // darkest
];

const secondary: MantineColorsTuple = [
  '#f0e8ff', // lightest
  '#ddc7ff',
  '#caa6ff',
  '#b885ff',
  '#a864ff',
  '#5e22fa', // main color (var(--secondary) - purple, replaces indigo-500)
  '#551fe0',
  '#4b1bc6',
  '#4118ad',
  '#371593', // darkest
];

const accent: MantineColorsTuple = [
  '#e8ffe6', // lightest
  '#ccffca',
  '#a6ffa0',
  '#80ff77',
  '#66ff5c',
  '#3dfa22', // main color (var(--accent) - green)
  '#37e01f',
  '#30c61b',
  '#2aad18',
  '#249315', // darkest
];

// Info color (gray) for replacing gray-400, gray-500, etc.
const info: MantineColorsTuple = [
  '#f8f9fa',
  '#f1f3f5',
  '#e9ecef',
  '#dee2e6',
  '#ced4da',
  '#adb5bd', // main gray shade
  '#868e96',
  '#495057',
  '#343a40',
  '#212529',
];

export const theme = createTheme({
  primaryColor: 'primary',
  colors: {
    primary,
    secondary,
    accent,
    info,
  },
  defaultRadius: 'md', // matches --radius: 0.625rem (10px)
  fontFamily: 'var(--font-barlow), sans-serif',
  fontFamilyMonospace: 'var(--font-cousine), monospace',
  headings: {
    fontFamily: 'var(--font-barlow), sans-serif',
  },
  // Additional theme settings
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },
});

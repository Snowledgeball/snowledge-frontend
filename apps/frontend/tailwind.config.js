const ui = require('@repo/ui/tailwind.config');

module.exports = {
  ...ui,
  content: [
    ...ui.content,
    './app/**/*.{js,ts,jsx,tsx,css,mdx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx,css,mdx}',
    '../../packages/ui-core/**/*.{js,ts,jsx,tsx,css,mdx}',
  ],
};

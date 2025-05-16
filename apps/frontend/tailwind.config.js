const ui = require('@repo/ui/tailwind.config');

module.exports = {
  ...ui,
  content: [
    ...ui.content,
    './app/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui-core/**/*.{js,ts,jsx,tsx}',
  ],
};

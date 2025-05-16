const uiCore = require('@repo/ui-core/tailwind.config');

module.exports = {
  ...uiCore,
  content: [
    ...uiCore.content,
    './components/**/*.{js,ts,jsx,tsx}',
  ],
};

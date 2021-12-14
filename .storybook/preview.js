import '../styles/global.css';
import '../public/fonts/maru/fonts-maru.css';
import 'normalize.css';
import * as NextImage from 'next/image';

const OriginalNextImage = NextImage.default;

// If we don't do this, Storybook will break when rendering things that use Next/Image
Object.defineProperty(NextImage, 'default', {
  configurable: true,
  value: (props) => <OriginalNextImage {...props} unoptimized />,
});

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

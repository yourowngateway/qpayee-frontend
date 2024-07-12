// eslint-disable-next-line n/no-unpublished-import
import type { CustomProjectConfig } from 'lost-pixel';

// config file
// ts-unused-exports:disable-next-line
export const config: Partial<CustomProjectConfig> = {
  storybookShots: {
    storybookUrl: './storybook-static',
  },
  lostPixelProjectId: process.env.LOST_PIXEL_PROJECT_ID,
  apiKey: process.env.LOST_PIXEL_API_KEY,
  beforeScreenshot: async page => {
    await page.addStyleTag({
      content: `
        /* Hide images from live domains as they may sometimes change or not load properly */
        image[src*="https://images.qpayee.com/"],
        image[src*="https://images-staging.qpayee.com/"] {
          visibility: hidden;
        }

        /* Disable all background images for the same reason */
        * {
          background-image: none !important;
        }
      `,
    });
  },
};

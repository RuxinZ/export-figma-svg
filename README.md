# Import SVGs from Figma as Svelte Components via CLI

### Output

SVGs will be saved as Svelte components in `src/svg` folder

### Setup

1. `yarn install`
2. Select the frame your icons are in ![Screenshot of a sample Figma project](documentation/export-svg-screenshot.png)
3. Copy the URL in the browser; it should look similar to `https://www.figma.com/file/abcASewbASmnas/Test?node-id=1392-3123`
4. Run `ts-node src/setupEnv.ts` and paste in your URL copied from step 3 when prompted. This will generate a `.env` file
5. Generate a DEV_TOKEN a.k.a Personal Access Token by going to Help and Account > Account Settings > Personal Access Token
6. Add your DEV_TOKEN from step 5 into `.env` file.
7. Run `ts-node src/index.ts`, for any icon that does not exist in `src/svg/icons.ts`, a svelte component for that svg will be generated into `src/svg` folder and `src/svg/icons.ts` will update to include the icon name.

### Filtering Private Components (starting with a . or a \_)

1. If you want to ignore / filter private components that start with a . or \_, change the FILTER_PRIVATE_COMPONENTS variable to `true`. Thanks to [lennertVanSever for their contribution to this](https://github.com/jacobtyq/export-figma-svg/pull/27)

### Limitations

Figma API has a fixed number of requests (rate limits) you can call per minute. This script will process a 20 requests per 45 seconds to avoid hitting that limit.

### Credits

Original plugin: jacobtyq/export-figma-svg

## Dev Environment

### formatting

You can configure a eslint plugin to format code on save.
The configuration for vscode is already on the repo, all you need to do is install the eslint plugin.

This project has a husky pre commit hook to format the staged changes using our styleguide.
To take advantage of that make sure to run `git commit` from within this folder.

## Available Scripts

From the root directory (recommended with Turbo):

- `pnpm run dev` - Start development environment
- `pnpm run build` - Build for production
- `pnpm run admin:dev` - Start only admin UI development

In the admin-ui package directory, you can run:

### `pnpm start` or `pnpm run dev`

Runs the app in development mode with Vite.
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### `pnpm test`

Launches the test runner with vitest.

### `pnpm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

# GitHub Pages Deployment Setup

This repository is configured to automatically deploy to GitHub Pages using GitHub Actions.

## How it works

1. **Automatic Deployment**: Every push to the `main` branch triggers the deployment workflow
2. **Build Process**: The workflow builds the React app using Vite
3. **GitHub Pages**: The built app is automatically deployed to GitHub Pages

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Source", select **GitHub Actions**
4. The workflow will be automatically detected

### 2. Repository Settings

Make sure your repository has the correct permissions:
- Go to **Settings** → **Actions** → **General**
- Under "Workflow permissions", select **Read and write permissions**
- Check **Allow GitHub Actions to create and approve pull requests**

### 3. First Deployment

1. Push any commit to the `main` branch
2. Go to the **Actions** tab to monitor the deployment
3. Once complete, your app will be available at: `https://ydahal1.github.io/ff-visualization/`

## Local Development

```bash
# Install dependencies
cd visualization
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build for GitHub Pages specifically
npm run build:gh-pages

# Preview production build
npm run preview
```

## Workflow Details

The deployment workflow (`.github/workflows/deploy-gh-pages.yml`) includes:

- **Node.js 20** setup
- **Dependency installation** with npm ci
- **Production build** with optimizations
- **Automatic deployment** to GitHub Pages

## Configuration

- **Base Path**: The app is configured to work with the `/ff-visualization/` base path on GitHub Pages
- **Build Output**: Generated in the `visualization/dist` directory
- **Asset Optimization**: Code splitting and minification enabled

## Troubleshooting

If deployment fails:
1. Check the **Actions** tab for error details
2. Ensure all dependencies are properly listed in `package.json`
3. Verify the build works locally with `npm run build:gh-pages`
4. Check that GitHub Pages is enabled in repository settings

## Manual Deployment

If you need to deploy manually:
1. Run `npm run build:gh-pages` locally
2. Push the changes to the `main` branch
3. The workflow will automatically trigger
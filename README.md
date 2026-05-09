# Insurgo AI Proposal App

This is a React-based interactive proposal tool built with Vite.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```

## Deployment (Netlify)

1. **Option 1: Drag and Drop**
   - Run `npm run build` locally.
   - Drag the `dist` folder onto the [Netlify Drop](https://app.netlify.com/drop) page.

2. **Option 2: Git Integration (Recommended)**
   - Push this code to a GitHub/GitLab/Bitbucket repository.
   - Connect the repository to Netlify.
   - Netlify will automatically detect the settings from `netlify.toml`:
     - Build command: `npm run build`
     - Publish directory: `dist`

## Features

- Interactive Needs Assessment
- Architecture Guide
- Flow Diagrams (Mermaid.js)
- API Cost Estimator
- Cal.com Booking Integration
- Custom Branding (logo.svg)

# Tow Truck Business Forecaster

A React TypeScript application for forecasting tow truck business financials.

## Features

- **Pricing Configuration**: Set base rates and per-km rates for car and bike towing
- **Volume Projections**: Adjust monthly tow volumes and distance distributions
- **Operational Costs**: Track driver salary, maintenance, and fuel costs
- **Financing Options**: Support for cash purchase, loan, or lease financing
- **Financial Forecasting**: Visualize revenue, costs, and break-even analysis

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization

## Deployment to GitHub Pages

### Option 1: Automated Deployment (Recommended)

1. **Create a GitHub repository** named `f-calculator` (or update `base` in `vite.config.ts` to match your repo name)

2. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/f-calculator.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

4. **Automatic deployment**: Every push to the `main` branch will automatically build and deploy your app!

5. **Access your app** at: `https://YOUR_USERNAME.github.io/f-calculator/`

### Option 2: Manual Deployment

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Deploy manually**:
   ```bash
   npm run deploy
   ```

This will build and push to the `gh-pages` branch.

> **Note**: If your repository name is different from `f-calculator`, update the `base` property in `vite.config.ts` to match: `base: '/your-repo-name/'`

## Project Structure

```
f-calculator/
├── src/
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles with Tailwind
├── tow-truck-forecaster.tsx  # Main component
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json          # Dependencies and scripts
```

## Issue Resolution

The original error **"JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists"** was caused by:

1. Missing TypeScript configuration (`tsconfig.json`)
2. Missing React type definitions
3. No proper project structure

This has been fixed by setting up a complete Vite + React + TypeScript project with all necessary configurations.

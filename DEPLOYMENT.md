# Deployment Setup Guide

This guide explains how to set up GitHub Actions for automatic deployment to Firebase.

## Prerequisites

1. GitHub repository created
2. Two Firebase projects: `piano-coach-dev` and `practice-coach-bb250` (production)
3. Firebase Hosting enabled in both projects

## Setup Steps

### 1. Enable Firebase Hosting

For both dev and production projects:

```bash
# Dev project
firebase use dev
firebase init hosting
# Choose 'dist' as public directory
# Configure as single-page app: Yes
# Set up automatic builds: No

# Production project
firebase use default
firebase init hosting
# Same settings
```

Update `firebase.json` if needed to include hosting configuration.

### 2. Generate Firebase Token

```bash
firebase login:ci
```

Copy the token that's generated. You'll add this to GitHub Secrets.

### 3. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

#### Firebase Token
- `FIREBASE_TOKEN` - The token from step 2

#### API Keys
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `OPENAI_API_KEY` - Your OpenAI API key

#### Dev Environment (piano-coach-dev)
- `DEV_CLOUD_FUNCTION_URL` = `https://us-central1-piano-coach-dev.cloudfunctions.net/generateSession`
- `DEV_FIREBASE_API_KEY` = `your_dev_api_key_here` (get from Firebase Console → Project Settings → General → Web apps)
- `DEV_FIREBASE_AUTH_DOMAIN` = `piano-coach-dev.firebaseapp.com`
- `DEV_FIREBASE_PROJECT_ID` = `piano-coach-dev`
- `DEV_FIREBASE_STORAGE_BUCKET` = `piano-coach-dev.firebasestorage.app`
- `DEV_FIREBASE_MESSAGING_SENDER_ID` = `your_dev_messaging_sender_id`
- `DEV_FIREBASE_APP_ID` = `your_dev_app_id`
- `DEV_FIREBASE_MEASUREMENT_ID` = `your_dev_measurement_id`

#### Production Environment (practice-coach-bb250)
- `PROD_CLOUD_FUNCTION_URL` = `https://us-central1-practice-coach-bb250.cloudfunctions.net/generateSession`
- `PROD_FIREBASE_API_KEY` = `your_prod_api_key_here` (get from Firebase Console → Project Settings → General → Web apps)
- `PROD_FIREBASE_AUTH_DOMAIN` = `practice-coach-bb250.firebaseapp.com`
- `PROD_FIREBASE_PROJECT_ID` = `practice-coach-bb250`
- `PROD_FIREBASE_STORAGE_BUCKET` = `practice-coach-bb250.firebasestorage.app`
- `PROD_FIREBASE_MESSAGING_SENDER_ID` = `your_prod_messaging_sender_id`
- `PROD_FIREBASE_APP_ID` = `your_prod_app_id`
- `PROD_FIREBASE_MEASUREMENT_ID` = `your_prod_measurement_id`

### 4. Create Branches

```bash
# Create dev branch if it doesn't exist
git checkout -b dev
git push -u origin dev

# Go back to main
git checkout main
```

## How It Works

### Automatic Deployments

- **Push to `dev` branch** → Deploys to `piano-coach-dev` (development environment)
- **Push to `main` branch** → Deploys to `practice-coach-bb250` (production environment)

### Workflow Process

1. Code is pushed to GitHub
2. GitHub Actions runs the workflow
3. Installs dependencies
4. Sets environment variables based on branch
5. Builds the application (`npm run build`)
6. Deploys to Firebase Hosting + Functions

## Development Workflow

```bash
# Work on a feature
git checkout -b feature/my-feature

# Make changes, test locally
npm run dev

# Commit and push
git add .
git commit -m "Add my feature"
git push -u origin feature/my-feature

# Create PR to dev branch for testing
# After review, merge to dev → auto-deploys to dev environment

# After testing in dev, create PR from dev → main
# Merge to main → auto-deploys to production
```

## Manual Deployment (if needed)

```bash
# Deploy to dev
firebase use dev
npm run build
firebase deploy

# Deploy to production
firebase use default
npm run build
firebase deploy
```

## Monitoring Deployments

- Check GitHub Actions tab in your repository
- View deployment logs and status
- Monitor Firebase Console for live updates

## Troubleshooting

### Deployment fails with auth error
- Check that `FIREBASE_TOKEN` is set correctly in GitHub Secrets
- Regenerate token: `firebase login:ci`

### Wrong environment variables
- Verify secrets are named correctly in GitHub
- Check branch name matches workflow conditions

### Functions not updating
- Functions config is set during deployment
- May need to manually update: `firebase functions:config:set anthropic.key="..." openai.key="..."`

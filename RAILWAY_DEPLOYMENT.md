# Railway Deployment Guide

This guide will help you deploy your calcapp to Railway.

## Prerequisites

1. A [Railway](https://railway.app) account
2. An [OpenAI API key](https://platform.openai.com/api-keys)
3. Git repository connected to Railway

## Deployment Steps

### 1. Create a New Project on Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your calcapp repository
5. Railway will automatically detect the configuration

### 2. Set Environment Variables

In your Railway project dashboard, go to **Variables** and add:

```
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
NODE_ENV=production
```

**Important:** The `OPENAI_API_KEY` is required for califi to evaluate mathematical expressions.

### 3. Deploy

Railway will automatically:
- Install dependencies using Bun
- Build the Next.js application
- Start the production server
- Assign a public URL

The deployment typically takes 2-5 minutes.

### 4. Access Your App

Once deployed, Railway will provide a public URL like:
```
https://calcapp-production.up.railway.app
```

## Configuration Files

The following files configure the Railway deployment:

### `railway.json`
Defines build and deployment settings for Railway.

### `nixpacks.toml`
Configures the Nixpacks build system used by Railway.

### `turbo.json`
Manages the monorepo build process with Turborepo.

## Build Process

Railway will execute:
```bash
bun install          # Install dependencies
bun run build        # Build all packages (via Turbo)
cd apps/web && bun run start  # Start Next.js in production mode
```

## Troubleshooting

### Build Fails

**Check these common issues:**

1. **Missing `OPENAI_API_KEY`**: The API key must be set in Railway's environment variables
2. **Bun version**: Railway uses the latest stable Bun version specified in `package.json`
3. **Build logs**: Check Railway's build logs for specific error messages

### Runtime Errors

**Check these:**

1. **Environment variables**: Ensure `OPENAI_API_KEY` is correctly set
2. **OpenAI API limits**: Verify your OpenAI account has available credits
3. **Logs**: Check Railway's runtime logs for API errors

### Port Issues

Railway automatically sets the `PORT` environment variable. The app is configured to use this via:
```bash
next start --port=${PORT:-3000}
```

## Custom Domain

To add a custom domain:

1. Go to your Railway project **Settings**
2. Navigate to **Domains**
3. Click **Add Domain**
4. Follow the DNS configuration instructions

## Monitoring

Railway provides built-in monitoring:
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: History of all deployments

## Scaling

Railway automatically handles:
- **Vertical scaling**: Increase resources as needed
- **Auto-restart**: Restarts on failures (max 10 retries)
- **Zero-downtime deployments**: New deployments don't interrupt service

## Cost Estimation

Railway charges based on:
- **Resource usage**: CPU and memory
- **Network**: Data transfer
- **Free tier**: Available for hobby projects

Estimated monthly cost: $5-$10 for a small production app

## CI/CD

Railway automatically deploys when you:
- Push to your main/master branch
- Merge a pull request
- Manually trigger a deployment

## Support

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app)

## Security Best Practices

1. **Never commit** `.env` files with real API keys
2. **Rotate API keys** regularly in Railway's dashboard
3. **Use Railway's secrets** for sensitive data
4. **Enable 2FA** on your Railway account
5. **Monitor usage** to detect unauthorized API calls

## Local Testing

Before deploying, test the production build locally:

```bash
# Build the app
bun run build

# Start in production mode
cd apps/web && bun run start

# Visit http://localhost:3000
```

## Rollback

To rollback to a previous deployment:

1. Go to **Deployments** in Railway dashboard
2. Find the working deployment
3. Click **"Redeploy"**

## Additional Notes

- Railway supports preview deployments for pull requests
- Environment variables can be different per environment (production/preview)
- Railway automatically provides SSL certificates for all domains
- The app uses Bun as the package manager and runtime for optimal performance


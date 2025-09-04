# ZundeNova Platform Deployment Guide

This guide covers multiple deployment strategies for the ZundeNova agri-tech platform.

## Quick Deployment Options

### 1. Vercel (Web Application) - Fastest
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy web app
cd apps/web
vercel --prod
```

### 2. Railway (API Backend)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy API
cd apps/api
railway login
railway deploy
```

### 3. Render (Full Stack)
```bash
# Connect GitHub repository to Render
# Use render.yaml configuration for automatic deployment
```

## Mobile App Deployment

### Prerequisites
- Expo CLI: `npm install -g @expo/cli`
- EAS CLI: `npm install -g eas-cli`

### Build for App Stores
```bash
cd apps/mobile

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for both platforms
eas build --platform all

# Build for specific platform
eas build --platform android
eas build --platform ios
```

### Submit to App Stores
```bash
# Submit to Google Play Store
eas submit --platform android

# Submit to Apple App Store
eas submit --platform ios
```

## Environment Variables

### Web Application (.env.production)
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project
NEXT_PUBLIC_APP_ENV=production
```

### API Backend
```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
MONGODB_URL=mongodb://host:port/db
REDIS_URL=redis://host:port
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
JWT_SECRET=your-jwt-secret
PORT=3001
ALLOWED_ORIGINS=https://your-web-domain.com
```

### Mobile Application
```
EXPO_PUBLIC_API_URL=https://your-api-domain.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project
```

## Kubernetes Deployment

### Prerequisites
- kubectl configured
- Docker images built and pushed to registry

### Deploy to Kubernetes
```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy secrets
kubectl apply -f k8s/secrets.yaml

# Deploy databases
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/redis.yaml

# Deploy applications
kubectl apply -f k8s/api.yaml
kubectl apply -f k8s/web.yaml
```

## CI/CD Pipeline

The GitHub Actions workflow automatically:
- Builds and tests all packages
- Deploys web app to Vercel
- Deploys API to Railway
- Builds mobile apps with EAS

### Required Secrets
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `RAILWAY_TOKEN`
- `EXPO_TOKEN`

## Domain Configuration

### Custom Domains
1. Configure DNS records to point to deployment URLs
2. Set up SSL certificates
3. Update CORS settings in API
4. Update environment variables with new domains

## Monitoring and Logging

### Production Monitoring
- Set up error tracking (Sentry)
- Configure performance monitoring
- Set up uptime monitoring
- Configure log aggregation

## Troubleshooting

### Common Issues
1. **Build Failures**: Check package.json dependencies
2. **Environment Variables**: Verify all required vars are set
3. **CORS Errors**: Update ALLOWED_ORIGINS in API
4. **Mobile Build Issues**: Check EAS configuration

### Support
- Documentation: `/docs`
- Issues: GitHub repository issues
- Email: support@zundenova.com

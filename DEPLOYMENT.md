# HealTrack Deployment

## Vercel Deployment (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fhealtrack)

### Quick Deploy Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/healtrack.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your HealTrack repository
   - Click "Deploy"

### Environment Variables (Optional)

For production, you might want to set these in Vercel dashboard:

```env
NEXT_PUBLIC_APP_NAME=HealTrack
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api
```

## Netlify Deployment (Alternative)

1. **Build for static export**
   ```bash
   npm run build
   npm run export
   ```

2. **Deploy to Netlify**
   - Drag and drop the `out/` folder to [netlify.com/drop](https://app.netlify.com/drop)
   - Or connect your GitHub repository to Netlify

### Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build && npm run export"
  publish = "out"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Features Available After Deployment

- ✅ **Responsive Design** - Works on all devices
- ✅ **PWA Support** - Can be installed as an app
- ✅ **Offline Capable** - Basic functionality works offline
- ✅ **Data Export** - JSON and CSV export functionality
- ✅ **Secure Storage** - Client-side data encryption
- ✅ **Fast Performance** - Optimized build and assets
- ✅ **SEO Friendly** - Proper meta tags and structure

## Post-Deployment Steps

1. **Test Core Functionality**
   - User registration/login
   - Symptom logging
   - Medication tracking
   - Data export

2. **Performance Optimization**
   - Check Lighthouse scores
   - Monitor Core Web Vitals
   - Optimize images if needed

3. **Analytics (Optional)**
   - Add Google Analytics
   - Set up error monitoring
   - Track user engagement

4. **Custom Domain (Optional)**
   - Configure custom domain in Vercel/Netlify
   - Set up SSL certificate (automatic)

## Scaling Considerations

For high-traffic scenarios, consider:

- **Database Migration** - Move from localStorage to MongoDB Atlas, Supabase, or PlanetScale
- **Authentication** - Integrate Auth0, Firebase Auth, or NextAuth.js
- **API Enhancement** - Add rate limiting and validation
- **CDN** - Already included with Vercel/Netlify
- **Monitoring** - Add Sentry for error tracking

## Support

For deployment issues:
- Check the deployment logs in Vercel/Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify Next.js version compatibility

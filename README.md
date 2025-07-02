# HealTrack - Serverless Health & Symptom Tracker

A comprehensive health tracking application built with serverless architecture using only free resources.

## Features

- 🏥 **Symptom Tracking**: Log and monitor health symptoms over time
- 📊 **Visual Analytics**: Charts and graphs to visualize health trends
- 💊 **Medication Reminders**: Track medication schedules
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔐 **Secure**: JWT-based authentication
- ☁️ **Serverless**: Deployed on free hosting platforms

## Technology Stack

### Frontend
- **Next.js 14** - React framework with SSR/SSG
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Chart.js** - Data visualization

### Backend
- **Serverless Functions** - API routes with Next.js
- **Local Storage** - Client-side data persistence (can be upgraded to MongoDB Atlas)
- **JWT Authentication** - Secure user sessions

### Deployment
- **Vercel** - Free hosting for Next.js applications
- **GitHub** - Version control and CI/CD

## Project Structure

```
healtrack/
├── pages/                  # Next.js pages
│   ├── api/               # Serverless API routes
│   ├── _app.tsx          # App wrapper
│   ├── index.tsx         # Home page with splash screen
│   └── dashboard.tsx     # Main application dashboard
├── components/            # React components
│   ├── common/           # Reusable components
│   ├── forms/            # Form components
│   └── charts/           # Chart components
├── lib/                  # Utility functions
├── styles/               # Global styles
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Netlify Alternative
1. Build the project: `npm run build && npm run export`
2. Upload `out/` folder to Netlify

## Features Overview

### 📊 Dashboard
- Health metrics overview
- Recent symptoms timeline
- Medication schedule
- Progress charts

### 📝 Symptom Logging
- Quick symptom entry
- Severity rating (1-10)
- Notes and triggers
- Photo attachments (future)

### 📈 Analytics
- Symptom frequency charts
- Pain level trends
- Medication effectiveness
- Export data (CSV)

### 🔐 Security
- Client-side data encryption
- Secure authentication
- Privacy-focused design
- No sensitive data stored on servers

## Data Storage

Initially uses browser localStorage for simplicity and privacy. Can be easily upgraded to:
- MongoDB Atlas (free tier)
- Supabase (free tier)
- Firebase (free tier)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use and modify for your needs.

## Support

For issues and questions, please open a GitHub issue.

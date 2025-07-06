# HealTrack - Comprehensive Health & Symptom Tracker

A modern, full-featured health tracking application built with Next.js and Supabase, designed to help users monitor their health symptoms, medications, and overall wellness journey.

## Features

- 🏥 **Symptom Tracking**: Log and monitor health symptoms with detailed analytics
- 📊 **Visual Analytics**: Interactive charts and graphs to visualize health trends
- 💊 **Medication Management**: Track medication schedules and effectiveness
- 📱 **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- 🔐 **Secure Authentication**: Email-based authentication with Supabase
- ☁️ **Cloud Storage**: Real-time data synchronization across devices
- ✉️ **Email Confirmation**: Secure account verification system
- 🌙 **Dark Theme**: Modern dark UI for comfortable viewing

## Technology Stack

### Frontend
- **Next.js 14.2.30** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Efficient form handling
- **Recharts** - Modern chart library for data visualization
- **React Hot Toast** - Beautiful notifications

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Supabase Auth** - Authentication and user management
- **Real-time subscriptions** - Live data updates

### Deployment
- **Netlify** - Production hosting with CI/CD
- **GitHub** - Version control and automated deployments

## Project Structure

```
healtrack/
├── pages/                    # Next.js pages
│   ├── api/                 # API routes (minimal - using Supabase)
│   ├── _app.tsx            # App wrapper with auth context
│   ├── index.tsx           # Landing page
│   ├── dashboard.tsx       # Main application dashboard
│   ├── login.tsx           # Authentication page
│   └── register.tsx        # User registration
├── components/              # React components
│   ├── common/             # Reusable components (Header, Footer)
│   ├── dashboard/          # Dashboard-specific components
│   │   ├── SymptomTracker.tsx
│   │   ├── MedicationTracker.tsx
│   │   └── HealthAnalytics.tsx
│   ├── forms/              # Form components
│   └── charts/             # Chart components
├── lib/                    # Utility functions and configurations
│   ├── database.ts         # Supabase client configuration
│   ├── auth.tsx           # Authentication context and helpers
│   └── utils/             # Helper functions
├── styles/                 # Global styles and Tailwind config
├── types/                  # TypeScript type definitions
└── public/                 # Static assets
```

## Environment Setup

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier available)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/kris07hna/HealTrack.git
   cd HealTrack
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create `.env.local` file with your credentials

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser

5. **Build for Production**
   ```bash
   npm run build
   ```

## Deployment

### Netlify (Current)
1. Connect your GitHub repository to Netlify
2. Add environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### Deployment Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features Overview

### � Authentication
- Email/password registration and login
- Email verification system
- Secure session management
- Protected routes and data

### �📊 Dashboard
- Health metrics overview with visual indicators
- Recent symptoms timeline and trends
- Medication adherence tracking
- Interactive analytics charts

### 📝 Symptom Tracking
- Quick symptom entry with severity ratings
- Categorized symptom logging
- Detailed notes and trigger identification
- Historical symptom patterns

### 📈 Health Analytics
- Visual trend analysis with charts
- Symptom frequency and severity tracking
- Medication effectiveness insights
- Exportable health reports

### � Medication Management
- Medication schedule tracking
- Dosage and frequency monitoring
- Adherence rate calculations
- Medication effectiveness correlation

### 🔒 Privacy & Security
- End-to-end encrypted data storage
- GDPR-compliant data handling
- User-controlled data export/deletion
- No third-party data sharing

## Database Schema

HealTrack uses Supabase (PostgreSQL) with the following main tables:

- **users** - User profiles and preferences
- **symptoms** - Symptom logs with severity and notes
- **medications** - Medication tracking and schedules
- **health_metrics** - General health indicators
- **user_settings** - Application preferences

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow the existing component structure
- Use Tailwind CSS for styling
- Write meaningful commit messages

## Troubleshooting

### Common Issues

**Authentication Issues**
- Verify Supabase environment variables
- Check email confirmation settings in Supabase dashboard
- Ensure RLS policies are properly configured

**Build Errors**
- Run `npm run type-check` for TypeScript errors
- Clear `.next` cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**Development Server Issues**
- Check port 3000 is available
- Verify Node.js version (18+)
- Check for conflicting processes

## License

MIT License - feel free to use and modify for your needs.

## Support

- 📫 **Issues**: Open a GitHub issue for bugs or feature requests
- 💬 **Discussions**: Use GitHub Discussions for questions
- 📖 **Documentation**: Check the wiki for detailed guides

## Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Medication reminder notifications
- [ ] Doctor/healthcare provider sharing
- [ ] Advanced analytics and insights
- [ ] Data export to common formats
- [ ] Integration with fitness trackers

### Recent Updates
- ✅ Supabase authentication system
- ✅ Email verification workflow
- ✅ Enhanced dashboard analytics
- ✅ Production deployment on Netlify
- ✅ Responsive design improvements

---

Built with ❤️ for better health tracking and management.

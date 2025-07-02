# 🚀 Quick Supabase Setup Guide for HealTrack

## Step 1: Create Supabase Project (5 minutes)

1. **Go to [supabase.com](https://supabase.com)**
2. **Click "Start your project"**
3. **Sign up with GitHub/Google**
4. **Create a new project**:
   - Project name: `HealTrack`
   - Database password: (choose a strong password)
   - Region: Choose closest to your users

## Step 2: Get Your API Keys (2 minutes)

1. **In your Supabase dashboard, go to Settings > API**
2. **Copy these values**:
   - `Project URL` → NEXT_PUBLIC_SUPABASE_URL
   - `anon public` key → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - `service_role secret` key → SUPABASE_SERVICE_ROLE_KEY

## Step 3: Setup Database Schema (3 minutes)

1. **Go to SQL Editor in your Supabase dashboard**
2. **Copy and paste the entire content from `database/schema.sql`**
3. **Click "Run" to execute the SQL**
4. **Verify tables are created in the Table Editor**

## Step 4: Configure Environment Variables (2 minutes)

1. **Copy `.env.example` to `.env.local`**:
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your Supabase values**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   NEXTAUTH_SECRET=your-random-secret-key
   ```

## Step 5: Enable Authentication (3 minutes)

1. **In Supabase Dashboard → Authentication → Settings**
2. **Enable these providers**:
   - Email (already enabled)
   - Google (optional - follow Google OAuth setup)
   - GitHub (optional - follow GitHub OAuth setup)

3. **Add your site URL**:
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: `http://localhost:3000/auth/callback`

## Step 6: Test Your Setup (5 minutes)

1. **Install missing dependencies** (if any):
   ```bash
   npm install
   ```

2. **Start your development server**:
   ```bash
   npm run dev
   ```

3. **Test database connection**:
   - Go to `http://localhost:3000/dashboard`
   - Check browser console for any errors
   - Try creating a test profile or symptom entry

## Step 7: Optional - Enable Real-time (2 minutes)

1. **In Supabase Dashboard → Database → Replication**
2. **Enable replication for these tables**:
   - `symptoms`
   - `health_goals`
   - `mood_entries`
   - `meditation_sessions`

## 🔧 Troubleshooting

### Common Issues:

**❌ "Invalid API key" error**
- Check your environment variables in `.env.local`
- Restart your development server after changing env vars

**❌ "RLS policy violation" error**
- Make sure you're authenticated when making database calls
- Check that RLS policies are properly created

**❌ "CORS error"**
- Add your domain to allowed origins in Supabase dashboard
- For localhost, add `http://localhost:3000`

**❌ Tables not found**
- Run the SQL schema again in Supabase SQL Editor
- Check that all tables exist in Table Editor

## 🎯 Quick Test Checklist

- [ ] Supabase project created
- [ ] API keys copied to `.env.local`
- [ ] Database schema executed successfully
- [ ] Environment variables configured
- [ ] App starts without errors (`npm run dev`)
- [ ] Can see dashboard at `http://localhost:3000/dashboard`
- [ ] No console errors in browser

## 🚀 Ready for Production?

When you're ready to deploy:

1. **Deploy to Vercel**:
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Add production environment variables in Vercel dashboard**

3. **Update Supabase auth settings**:
   - Add your production URL to Site URL
   - Add production callback URLs

4. **Enable database backups in Supabase**

## 📚 Useful Supabase Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

---

**Total Setup Time: ~20 minutes**
**Monthly Cost: $0 (free tier) to $25 (pro tier)**

You're all set! Your HealTrack app is now powered by Supabase! 🎉

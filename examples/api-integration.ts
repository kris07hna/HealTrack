// API routes for HealTrack application
// These go in pages/api/ directory

// pages/api/profile/index.ts - User profile management
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, {});
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  switch (req.method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
      }
      break;

    case 'PUT':
      try {
        const updates = req.body;
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) throw error;
        res.status(200).json({ message: 'Profile updated successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// pages/api/symptoms/index.ts - Symptoms management
export async function symptomsHandler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, {});
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  switch (req.method) {
    case 'GET':
      try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const { data, error, count } = await supabase
          .from('symptoms')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + Number(limit) - 1);

        if (error) throw error;
        
        res.status(200).json({
          symptoms: data,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count,
            pages: Math.ceil(count! / Number(limit))
          }
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch symptoms' });
      }
      break;

    case 'POST':
      try {
        const symptomData = {
          ...req.body,
          user_id: userId,
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('symptoms')
          .insert([symptomData])
          .select();

        if (error) throw error;
        res.status(201).json(data[0]);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create symptom' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// pages/api/health-goals/index.ts - Health goals management
export async function healthGoalsHandler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, {});
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  switch (req.method) {
    case 'GET':
      try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('health_goals')
          .select('*')
          .eq('user_id', userId)
          .eq('date', targetDate);

        if (error) throw error;
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch health goals' });
      }
      break;

    case 'POST':
      try {
        const goalData = {
          ...req.body,
          user_id: userId,
          date: req.body.date || new Date().toISOString().split('T')[0]
        };

        const { data, error } = await supabase
          .from('health_goals')
          .insert([goalData])
          .select();

        if (error) throw error;
        res.status(201).json(data[0]);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create health goal' });
      }
      break;

    case 'PUT':
      try {
        const { id } = req.query;
        const updates = req.body;

        const { data, error } = await supabase
          .from('health_goals')
          .update(updates)
          .eq('id', id)
          .eq('user_id', userId)
          .select();

        if (error) throw error;
        res.status(200).json(data[0]);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update health goal' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// pages/api/mood/index.ts - Mood tracking
export async function moodHandler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, {});
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  switch (req.method) {
    case 'GET':
      try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(days));

        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Calculate average mood
        const avgMood = data.length > 0 
          ? (data.reduce((sum, entry) => sum + entry.mood_value, 0) / data.length).toFixed(1)
          : 0;

        res.status(200).json({
          entries: data,
          average: avgMood,
          total: data.length
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch mood entries' });
      }
      break;

    case 'POST':
      try {
        const moodData = {
          ...req.body,
          user_id: userId,
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('mood_entries')
          .insert([moodData])
          .select();

        if (error) throw error;
        res.status(201).json(data[0]);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create mood entry' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// pages/api/dashboard/stats.ts - Dashboard statistics
export async function dashboardStatsHandler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, {});
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  try {
    // Get statistics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Parallel queries for better performance
    const [symptomsResult, moodResult, goalsResult, meditationResult] = await Promise.all([
      supabase
        .from('symptoms')
        .select('id, created_at, severity')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString()),
      
      supabase
        .from('mood_entries')
        .select('mood_value, created_at')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString()),
      
      supabase
        .from('health_goals')
        .select('*')
        .eq('user_id', userId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]),
      
      supabase
        .from('meditation_sessions')
        .select('duration, completed, created_at')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
    ]);

    // Process the data
    const stats = {
      symptoms: {
        total: symptomsResult.data?.length || 0,
        avgSeverity: symptomsResult.data?.length 
          ? (symptomsResult.data.reduce((sum, s) => sum + s.severity, 0) / symptomsResult.data.length).toFixed(1)
          : 0
      },
      mood: {
        entries: moodResult.data?.length || 0,
        average: moodResult.data?.length
          ? (moodResult.data.reduce((sum, m) => sum + m.mood_value, 0) / moodResult.data.length).toFixed(1)
          : 0
      },
      goals: {
        total: goalsResult.data?.length || 0,
        achieved: goalsResult.data?.filter(g => g.achieved).length || 0,
        achievementRate: goalsResult.data?.length
          ? ((goalsResult.data.filter(g => g.achieved).length / goalsResult.data.length) * 100).toFixed(1)
          : 0
      },
      meditation: {
        sessions: meditationResult.data?.length || 0,
        totalMinutes: meditationResult.data?.reduce((sum, m) => sum + (m.completed ? m.duration : 0), 0) || 0,
        completedSessions: meditationResult.data?.filter(m => m.completed).length || 0
      }
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}

// Real-time data sync helper
export const setupRealtimeSync = (userId: string) => {
  return supabase
    .channel(`user_${userId}_sync`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      console.log('Real-time update:', payload);
      // Handle real-time updates in your React components
    })
    .subscribe();
};

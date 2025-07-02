// Simple API route to test Supabase connection
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test database connection
    const { data: tables, error: tablesError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })

    if (tablesError) {
      return res.status(500).json({
        success: false,
        error: 'Database connection failed',
        details: tablesError.message
      })
    }

    // Test auth
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    return res.status(200).json({
      success: true,
      message: 'Supabase connected successfully!',
      database: {
        connected: true,
        tablesExist: tables !== null
      },
      auth: {
        available: !authError,
        hasSession: !!session
      }
    })

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Connection test failed',
      details: error.message
    })
  }
}

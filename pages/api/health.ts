import type { NextApiRequest, NextApiResponse } from 'next';

type HealthData = {
  message: string;
  timestamp: string;
  status: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthData>
) {
  if (req.method === 'GET') {
    res.status(200).json({
      message: 'HealTrack API is running',
      timestamp: new Date().toISOString(),
      status: 'healthy'
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

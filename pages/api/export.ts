import type { NextApiRequest, NextApiResponse } from 'next';

type ExportRequest = {
  type: 'json' | 'csv';
  data: any[];
};

type ExportResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExportResponse>
) {
  if (req.method === 'POST') {
    try {
      const { type, data }: ExportRequest = req.body;

      if (!type || !data) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: type and data'
        });
      }

      if (type === 'json') {
        const exportData = {
          exportDate: new Date().toISOString(),
          totalRecords: data.length,
          data: data,
          metadata: {
            application: 'HealTrack',
            version: '1.0.0',
            format: 'json'
          }
        };

        res.status(200).json({
          success: true,
          data: exportData
        });
      } else if (type === 'csv') {
        // For CSV, we'll return the data that can be processed client-side
        res.status(200).json({
          success: true,
          data: {
            type: 'csv',
            records: data,
            totalCount: data.length
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid export type. Supported types: json, csv'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to process export request'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }
}

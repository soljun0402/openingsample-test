// Vercel Serverless Function — 서울 열린데이터 API 프록시
// API 키를 서버사이드에서 주입하여 클라이언트 노출 방지

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SEOUL_API_KEY = process.env.SEOUL_DATA_KEY || '';

const ALLOWED_SERVICES = [
  'VwsmTrdarFlpopQq',  // 유동인구
  'VwsmTrdarStorQq',   // 점포수
  'VwsmTrdarSelngQq',  // 추정매출
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { service, start, end } = req.query;

  if (
    typeof service !== 'string' ||
    typeof start !== 'string' ||
    typeof end !== 'string'
  ) {
    return res.status(400).json({ error: 'Missing parameters: service, start, end' });
  }

  if (!ALLOWED_SERVICES.includes(service)) {
    return res.status(403).json({ error: 'Service not allowed' });
  }

  const startNum = parseInt(start, 10);
  const endNum = parseInt(end, 10);
  if (isNaN(startNum) || isNaN(endNum) || startNum < 1 || endNum < startNum) {
    return res.status(400).json({ error: 'Invalid range' });
  }
  if (endNum - startNum >= 1000) {
    return res.status(400).json({ error: 'Range too large (max 1000)' });
  }

  if (!SEOUL_API_KEY) {
    return res.status(500).json({ error: 'Seoul API key not configured' });
  }

  try {
    const url = `http://openapi.seoul.go.kr:8088/${SEOUL_API_KEY}/json/${service}/${startNum}/${endNum}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: `Seoul API error: ${response.status}` });
    }

    const data = await response.json();

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Seoul API proxy error:', err);
    return res.status(500).json({ error: 'Failed to fetch Seoul data' });
  }
}

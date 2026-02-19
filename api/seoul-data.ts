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

  // WHATWG URL API 사용 (url.parse() deprecation 방지)
  const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const service = reqUrl.searchParams.get('service');
  const start = reqUrl.searchParams.get('start');
  const end = reqUrl.searchParams.get('end');

  console.log(`[서울API 프록시] 요청: service=${service} start=${start} end=${end}`);

  if (!service || !start || !end) {
    return res.status(400).json({ error: 'Missing parameters: service, start, end' });
  }

  if (!ALLOWED_SERVICES.includes(service)) {
    console.warn(`[서울API 프록시] 차단: 허용되지 않은 서비스 "${service}"`);
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
    console.error('[서울API 프록시] SEOUL_DATA_KEY 환경변수 미설정');
    return res.status(500).json({ error: 'Seoul API key not configured' });
  }

  try {
    const apiUrl = `http://openapi.seoul.go.kr:8088/${SEOUL_API_KEY}/json/${service}/${startNum}/${endNum}`;
    console.log(`[서울API 프록시] 외부 호출: ${service}/${startNum}/${endNum}`);
    const startTime = Date.now();
    const response = await fetch(apiUrl);
    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      console.error(`[서울API 프록시] 외부 API 실패: ${response.status} (${elapsed}ms)`);
      return res.status(response.status).json({ error: `Seoul API error: ${response.status}` });
    }

    const data = await response.json();
    const rowCount = data?.[service]?.row?.length ?? 0;
    console.log(`[서울API 프록시] 성공: ${service} ${rowCount}건 (${elapsed}ms)`);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (err) {
    console.error('[서울API 프록시] 에러:', err);
    return res.status(500).json({ error: 'Failed to fetch Seoul data' });
  }
}

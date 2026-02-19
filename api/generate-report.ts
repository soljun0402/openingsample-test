// Vercel Serverless Function — Claude AI 보고서 생성 프록시
// API 키를 서버사이드에서 주입하여 클라이언트 노출 방지

import type { VercelRequest, VercelResponse } from '@vercel/node';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const MAX_BODY_SIZE = 50000; // 50KB 제한

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!ANTHROPIC_API_KEY) {
    console.error('[AI 프록시] ANTHROPIC_API_KEY 환경변수 미설정');
    return res.status(500).json({ error: 'AI API key not configured' });
  }

  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // 기본 요청 유효성 검사 (Claude Messages API 형식)
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return res.status(400).json({ error: 'Missing messages in request' });
    }

    // 요청 크기 제한
    const bodyStr = JSON.stringify(body);
    if (bodyStr.length > MAX_BODY_SIZE) {
      return res.status(413).json({ error: 'Request too large' });
    }

    console.log(`[AI 프록시] Claude API 호출 시작 (model: ${body.model || 'default'})`);
    const startTime = Date.now();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: bodyStr,
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI 프록시] Claude API 실패: ${response.status} (${elapsed}ms)`, errorText.slice(0, 200));
      return res.status(response.status).json({ error: 'AI API error' });
    }

    const data = await response.json();
    console.log(`[AI 프록시] Claude API 성공 (${elapsed}ms)`);
    return res.status(200).json(data);
  } catch (err) {
    console.error('[AI 프록시] 에러:', err);
    return res.status(500).json({ error: 'Failed to generate report' });
  }
}

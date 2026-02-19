// Vercel Serverless Function — Gemini AI 보고서 생성 프록시
// API 키를 서버사이드에서 주입하여 클라이언트 노출 방지

import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MAX_BODY_SIZE = 50000; // 50KB 제한

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // 기본 요청 유효성 검사
    if (!body.contents || !Array.isArray(body.contents) || body.contents.length === 0) {
      return res.status(400).json({ error: 'Missing contents in request' });
    }

    // 요청 크기 제한
    const bodyStr = JSON.stringify(body);
    if (bodyStr.length > MAX_BODY_SIZE) {
      return res.status(413).json({ error: 'Request too large' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyStr,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText.slice(0, 200));
      return res.status(response.status).json({ error: 'Gemini API error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Gemini proxy error:', err);
    return res.status(500).json({ error: 'Failed to generate report' });
  }
}

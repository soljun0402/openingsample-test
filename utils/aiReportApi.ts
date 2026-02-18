// AI 보고서 생성 파이프라인
// Gemini 2.5 Flash API를 사용하여 창업 분석 보고서 생성

import { MarketAnalysisData } from './seoulDataApi';
import { SEOUL_GUS, SEOUL_DONGS, DONG_INFO_ALL } from '../data/seoulDistricts';

// ─── 입력 타입 ───

export interface AIReportInput {
  business: {
    category: string;
    categoryLabel: string;
  };
  location: {
    gu: string;
    dong: string;
  };
  locationContext: {
    guGroup: string;
    guLandmark: string;
    dongLandmark: string;
    dongDescription: string;
  };
  storeSize: number;
  // 서울 열린데이터 API 데이터 (실제 데이터)
  apiData: {
    population: MarketAnalysisData['population'] | null;
    populationSource: 'api' | 'fallback';
    stores: MarketAnalysisData['stores'] | null;
    storesSource: 'api' | 'fallback';
    sales: MarketAnalysisData['sales'] | null;
    salesSource: 'api' | 'fallback';
    footTraffic: string;
    footTrafficRaw: number;
    competitors: number;
    avgRent: number;
  };
  estimatedCosts: { min: number; max: number };
  checklist: {
    id: string;
    title: string;
    category: string;
    description: string;
    status: 'done' | 'worry' | 'unchecked';
    isRequired: boolean;
    estimatedCost: { min: number; max: number; unit: string };
    comment?: string;
  }[];
}

// ─── 출력 타입 (PDF 디자이너용) ───

export interface AIReportOutput {
  summary: {
    title: string;
    oneLiner: string;
    overallComment: string;
    overallScore: number;
    scoreLabel: string;
    keyHighlights: string[];
  };
  locationAnalysis: {
    grade: 'S' | 'A' | 'B' | 'C' | 'D';
    gradeReason: string;
    targetCustomer: string;
    peakHours: string;
    strengths: string[];
    weaknesses: string[];
    nearbyTip: string;
  };
  costAnalysis: {
    totalComment: string;
    savingTips: {
      area: string;
      tip: string;
      savedAmount: string;
    }[];
    budgetPriority: string[];
  };
  checklistAdvice: {
    itemId: string;
    status: 'done' | 'worry' | 'unchecked';
    advice: string;
    actionSteps?: string[];
    costTip?: string;
    timeline?: string;
  }[];
  riskFactors: {
    level: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    mitigation: string;
  }[];
  actionPlan: {
    phases: {
      phase: string;
      duration: string;
      tasks: string[];
    }[];
    totalDuration: string;
  };
  openingTip: string;
}

// ─── 시스템 프롬프트 ───

const SYSTEM_PROMPT = `당신은 한국 소상공인 창업 전문 컨설턴트 'Opening AI'입니다.
사용자가 제공한 창업 정보(업종, 위치, 매장 규모, 상권 데이터, 준비 체크리스트)를
분석하여 PDF 보고서용 맞춤형 콘텐츠를 JSON으로 생성합니다.

## 핵심 규칙
1. 반드시 지정된 JSON 스키마로만 응답하세요. JSON 외 텍스트 금지.
2. 모든 텍스트는 한국어로 작성하세요.
3. 입력된 지역명, 업종, 상권 수치, 체크리스트 항목명을 구체적으로 반영하세요.
4. status가 "worry"인 항목은 실행 가능한 해결 방안을 반드시 제시하세요.
   status가 "unchecked"인 항목은 간단한 안내와 다음 단계만 제시하세요.
   status가 "done"인 항목은 긍정적 피드백과 추가 팁만 제시하세요.
5. 과장 없이 현실적이고 실행 가능한 조언만 제공하세요.
6. riskFactors는 반드시 해당 업종+지역 조합의 실질적 리스크만 포함하세요.

## 중요: 실제 데이터 기반 분석
입력에 "서울 열린데이터 API" 출처의 실제 데이터가 포함됩니다.
이 데이터가 있으면 반드시 이를 기반으로 분석하세요:
- [API 실데이터] 표시 항목: 서울시 공공데이터에서 조회한 실제 수치입니다. 그대로 인용하세요.
- [추정치] 표시 항목: 직접 데이터가 없는 항목입니다. 해당 지역·업종의 일반적 특성으로 추정하세요.
- 추정치는 "약", "추정" 등의 표현을 사용하여 정확한 수치가 아님을 알려주세요.

## 중요: 체크리스트 데이터 연동
각 체크리스트 항목을 분석할 때, 관련된 상권 데이터를 반드시 참고하세요:
- 마케팅/홍보 항목 → 유동인구 데이터, 연령대별 분포, 주말/주중 비율 참고
- 인허가/사업자등록 → 개업률/폐업률 데이터 참고, 해당 지역 신규 진입 난이도
- 경쟁분석/입지 → 동종업종 점포수, 총 점포수, 프랜차이즈 비율 참고
- 비용/자금 → 추정매출 대비 투자 회수 기간 산출, 월매출 vs 월임대료 비교
- 메뉴/상품 → 해당 업종 월평균 매출건수 기반 객단가 분석

## 중요: 지역·상권 특성 반영
반드시 해당 지역의 실제 특성을 반영하세요:
- 상권 유형 (오피스, 주거, 대학가, 역세권, 관광 등)
- 구·동의 랜드마크, 지하철역, 대학교, 오피스 빌딩
- 임대료 수준, 유동인구 패턴, 주 소비층 특성

## 중요: 업종별 맞춤 분석
업종에 따라 핵심 지표를 달리하세요:
- 카페/디저트: 좌석 회전율, 테이크아웃 비중, SNS 마케팅, 카페 밀집도
- 음식점: 점심특선 수요, 배달 비중, 주류매출, 식자재 원가율
- 소매: 유동인구 대비 전환율, 야간 매출, 배후 세대수
- 미용/뷰티: 예약률, 재방문율, 시술 단가, 경쟁 가격대
- 교육/학원: 학군, 학교 수, 학부모 소득, 수강료

## 콘텐츠 풍부도
- 각 필드를 글자 수 제한에 가깝게 풍부하게 작성하세요.
- "좋은 위치입니다" (X) → 구체적 수치·근거 포함한 분석 (O)
- checklistAdvice는 모든 항목에 빠짐없이. actionSteps/costTip/timeline은 worry 필수.
- riskFactors 정확히 3개, savingTips 정확히 3개.
- actionPlan phases 4~5단계, 각 tasks 3~5개.

## overallComment 작성 가이드
보고서 맨 위에 표시되는 "종합 의견" (2~3문장):
- 해당 지역 상권 핵심 특성 1문장
- 이 업종의 강점과 주의점 각 1문장
- 지역명, 업종명, 구체적 수치 포함 필수

## overallScore 채점 기준 (40~95점)
- 상권 입지 (유동인구, 타겟 밀도): 30%
- 경쟁 환경 (점포수, 차별화 가능성): 20%
- 비용 적정성 (임대료 vs 매출 기대치): 20%
- 준비 상태 (체크리스트 완료율): 15%
- 성장 가능성 (지역 트렌드, 업종 트렌드): 15%
점수: 80~95 양호 / 60~79 보통 / 40~59 주의 필요`;

const OUTPUT_SCHEMA_DESCRIPTION = `응답 JSON 스키마:
{
  "summary": {
    "title": "string (30자 이내, 예: '역삼동 카페 창업 분석 보고서')",
    "oneLiner": "string (80자 이내, 핵심 요약 — 구체적 수치와 근거를 포함)",
    "overallComment": "string (200자 이내, 종합 의견 — 강점·약점·핵심 조언을 2~3문장)",
    "overallScore": "number (40~95)",
    "scoreLabel": "string ('양호' | '보통' | '주의 필요')",
    "keyHighlights": ["string (각 50자 이내, 정확히 4개)"]
  },
  "locationAnalysis": {
    "grade": "'S' | 'A' | 'B' | 'C' | 'D'",
    "gradeReason": "string (150자 이내)",
    "targetCustomer": "string (80자 이내)",
    "peakHours": "string (60자 이내)",
    "strengths": ["string (각 60자 이내, 정확히 3개)"],
    "weaknesses": ["string (각 60자 이내, 정확히 2개)"],
    "nearbyTip": "string (120자 이내)"
  },
  "costAnalysis": {
    "totalComment": "string (120자 이내)",
    "savingTips": [{ "area": "string", "tip": "string (120자 이내)", "savedAmount": "string" }] (정확히 3개),
    "budgetPriority": ["string (각 60자 이내, 정확히 3개)"]
  },
  "checklistAdvice": [{
    "itemId": "string (입력 checklist[].id와 정확히 매칭)",
    "status": "'done' | 'worry' | 'unchecked'",
    "advice": "string (100자 이내)",
    "actionSteps": ["string (각 70자 이내, 2~3개)"],
    "costTip": "string (60자 이내, worry 필수)",
    "timeline": "string (worry 필수)"
  }],
  "riskFactors": [{
    "level": "'high' | 'medium' | 'low'",
    "title": "string (20자 이내)",
    "description": "string (120자 이내)",
    "mitigation": "string (120자 이내)"
  }] (정확히 3개, high/medium/low 각 1개씩),
  "actionPlan": {
    "phases": [{
      "phase": "string",
      "duration": "string",
      "tasks": ["string (각 40자 이내, 3~5개)"]
    }] (정확히 4단계),
    "totalDuration": "string"
  },
  "openingTip": "string (200자 이내)"
}`;

// ─── 입력 JSON 조합 함수 ───

interface BuildReportInputParams {
  businessCategory: string;
  businessCategoryLabel: string;
  selectedGu: string;
  dong: string;
  storeSize: number | '';
  marketData: MarketAnalysisData | null;
  estimatedCosts: { min: number; max: number };
  checklist: {
    id: string;
    category: string;
    title: string;
    description: string;
    status: 'done' | 'worry' | 'unchecked';
    isRequired: boolean;
    estimatedCost: { min: number; max: number; unit: string };
    comment?: string;
  }[];
}

export function buildReportInput(params: BuildReportInputParams): AIReportInput {
  const {
    businessCategory,
    businessCategoryLabel,
    selectedGu,
    dong,
    storeSize,
    marketData,
    estimatedCosts,
    checklist,
  } = params;

  const storeSizeNum = typeof storeSize === 'number' ? storeSize : 17;

  // 지역 상세 컨텍스트 조합
  const guInfo = SEOUL_GUS.find(g => g.name === selectedGu);
  const dongList = SEOUL_DONGS[selectedGu] || [];
  const dongInfo = dongList.find(d => d.name === dong);
  const dongMarket = DONG_INFO_ALL[dong];

  return {
    business: {
      category: businessCategory,
      categoryLabel: businessCategoryLabel,
    },
    location: {
      gu: selectedGu,
      dong,
    },
    locationContext: {
      guGroup: guInfo?.group || '',
      guLandmark: guInfo?.landmark || '',
      dongLandmark: dongInfo?.landmark || '',
      dongDescription: dongMarket?.description || marketData?.description || '',
    },
    storeSize: storeSizeNum,
    apiData: {
      population: marketData?.population || null,
      populationSource: marketData?.source || 'fallback',
      stores: marketData?.stores || null,
      storesSource: marketData?.storesSource || 'fallback',
      sales: marketData?.sales || null,
      salesSource: marketData?.salesSource || 'fallback',
      footTraffic: marketData?.footTraffic || dongMarket?.footTraffic || '',
      footTrafficRaw: marketData?.footTrafficRaw || 0,
      competitors: marketData?.competitors ?? dongMarket?.competitors ?? 0,
      avgRent: marketData?.avgRent ?? dongMarket?.avgRent ?? 0,
    },
    estimatedCosts,
    checklist: checklist.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      description: item.description,
      status: item.status,
      isRequired: item.isRequired,
      estimatedCost: item.estimatedCost,
      comment: item.comment,
    })),
  };
}

// ─── 유저 코멘트 sanitize ───

function sanitizeComment(text: string): string {
  if (!text) return '';
  return text
    .slice(0, 200)
    .replace(/\n/g, ' ')
    .replace(/#{2,}/g, '')
    .replace(/^(system|user|assistant):/gi, '')
    .trim();
}

// ─── 유저 메시지 조합 ───

function buildUserMessage(input: AIReportInput): string {
  const { location, locationContext: loc, business, apiData } = input;

  // 유동인구 섹션
  let populationSection = '';
  if (apiData.population) {
    const pop = apiData.population;
    populationSection = `
### 유동인구 [${apiData.populationSource === 'api' ? 'API 실데이터' : '추정치'}]
- 분기 총 유동인구: ${pop.total.toLocaleString()}명
- 일 평균: ${apiData.footTraffic}
- 남성 ${pop.male.toLocaleString()}명 / 여성 ${pop.female.toLocaleString()}명
- 연령대: 10대 ${pop.age10.toLocaleString()} | 20대 ${pop.age20.toLocaleString()} | 30대 ${pop.age30.toLocaleString()} | 40대 ${pop.age40.toLocaleString()} | 50대 ${pop.age50.toLocaleString()} | 60대+ ${pop.age60plus.toLocaleString()}
- 주간(06~17시) ${pop.daytime.toLocaleString()}명 / 야간(17~06시) ${pop.nighttime.toLocaleString()}명`;
  } else {
    populationSection = `
### 유동인구 [추정치]
- ${apiData.footTraffic || '데이터 없음'}`;
  }

  // 점포수 섹션
  let storesSection = '';
  if (apiData.stores) {
    const s = apiData.stores;
    storesSection = `
### 점포 현황 [${apiData.storesSource === 'api' ? 'API 실데이터' : '추정치'}]
- 해당 지역 전체 점포수: ${s.total}개
- 동종업종(${business.categoryLabel}) 점포수: ${s.similarCount}개
- 프랜차이즈 점포: ${s.franchiseCount}개
- 개업률: ${s.openRate}% / 폐업률: ${s.closeRate}%`;
  } else {
    storesSection = `
### 점포 현황 [추정치]
- 동종 경쟁업체: 약 ${apiData.competitors}개 (추정)`;
  }

  // 추정매출 섹션
  let salesSection = '';
  if (apiData.sales) {
    const sl = apiData.sales;
    const monthlyWon = sl.monthlyAmount >= 10000
      ? `${Math.round(sl.monthlyAmount / 10000).toLocaleString()}만원`
      : `${sl.monthlyAmount.toLocaleString()}원`;
    salesSection = `
### 추정매출 [${apiData.salesSource === 'api' ? 'API 실데이터' : '추정치'}]
- 동종업종(${business.categoryLabel}) 월 추정매출: ${monthlyWon}
- 월 추정 거래건수: ${sl.monthlyCount.toLocaleString()}건
- 주중/주말 매출비: ${sl.weekdayRatio}% / ${sl.weekendRatio}%`;
  } else {
    salesSection = `
### 추정매출 [데이터 없음]
- AI가 해당 지역+업종 기반으로 추정해주세요`;
  }

  // 체크리스트 섹션
  const doneItems = input.checklist.filter(c => c.status === 'done');
  const worryItems = input.checklist.filter(c => c.status === 'worry');

  const checklistSection = `
## 체크리스트 현황 (done: ${doneItems.length}개 / worry: ${worryItems.length}개)
${input.checklist.map(c =>
  `- [${c.status}] ${c.title} (${c.category}) — ${c.description}${c.comment ? ` / 사용자 메모: "${sanitizeComment(c.comment)}"` : ''} / 예상비용: ${c.estimatedCost.min}~${c.estimatedCost.max}${c.estimatedCost.unit}`
).join('\n')}`;

  return `다음 창업 정보를 분석하여 보고서 JSON을 생성해주세요.

## 지역 정보
- 지역: 서울시 ${location.gu} ${location.dong}
- 권역: ${loc.guGroup}
- 구 랜드마크: ${loc.guLandmark}
- 동 랜드마크: ${loc.dongLandmark}
- 상권 특성: ${loc.dongDescription}
- 평균 임대료: 평당 약 ${apiData.avgRent}만원 [추정치]

## 업종 정보
- 업종: ${business.categoryLabel} (${business.category})
- 매장 규모: ${input.storeSize}평

## 상권 데이터 (서울 열린데이터 API)
${populationSection}
${storesSection}
${salesSection}

## 비용 정보
- 총 예상 창업비용: ${input.estimatedCosts.min}만원 ~ ${input.estimatedCosts.max}만원
${checklistSection}

## 응답 형식
${OUTPUT_SCHEMA_DESCRIPTION}`;
}

// ─── Gemini API 호출 ───

const IS_DEV = import.meta.env.DEV;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_TIMEOUT = 60000; // 60초
const MAX_RETRIES = 2;

async function callGeminiApi(requestBody: object, signal: AbortSignal): Promise<Response> {
  if (IS_DEV) {
    // 개발: Vite 프록시 (API 키 포함)
    return fetch(`/api/gemini/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify(requestBody),
    });
  }
  // 프로덕션: Vercel Serverless Function (키는 서버에서 주입)
  return fetch('/api/generate-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify(requestBody),
  });
}

export async function generateAIReport(input: AIReportInput): Promise<AIReportOutput | null> {
  if (IS_DEV && !GEMINI_API_KEY) {
    console.warn('VITE_GEMINI_API_KEY가 설정되지 않았습니다. AI 보고서를 건너뜁니다.');
    return null;
  }

  const userMessage = buildUserMessage(input);

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      responseMimeType: 'application/json',
    },
  };

  const controller = new AbortController();
  let timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT);

  try {
    let res: Response | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      // 재시도 시 타임아웃 리셋
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT);

      res = await callGeminiApi(requestBody, controller.signal);

      // 429 Rate Limit → 대기 후 재시도
      if (res.status === 429 && attempt < MAX_RETRIES) {
        const retryAfter = parseInt(res.headers.get('retry-after') || '0', 10);
        const waitMs = Math.max((retryAfter || 10) * 1000, 5000 * (attempt + 1));
        console.warn(`Gemini 429 Rate Limit — ${Math.round(waitMs / 1000)}초 후 재시도 (${attempt + 1}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      break;
    }

    if (!res || !res.ok) {
      if (IS_DEV) console.error('Gemini API 오류:', res?.status);
      return null;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('Gemini 응답에 텍스트가 없습니다:', data);
      return null;
    }

    const cleanText = text.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/i, '');

    let parsed: AIReportOutput;
    try {
      parsed = JSON.parse(cleanText);
    } catch (parseErr) {
      if (IS_DEV) console.error('AI 응답 JSON 파싱 실패:', parseErr, 'Raw:', text.slice(0, 300));
      return null;
    }

    // 유효성 검증
    if (
      !parsed.summary?.title ||
      typeof parsed.summary?.overallScore !== 'number' ||
      !parsed.locationAnalysis?.grade ||
      !parsed.costAnalysis ||
      !Array.isArray(parsed.checklistAdvice) ||
      !Array.isArray(parsed.riskFactors) ||
      !parsed.actionPlan?.phases
    ) {
      console.error('AI 응답 구조가 올바르지 않습니다:', Object.keys(parsed));
      return null;
    }

    return parsed;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.warn('Gemini API 타임아웃 (60초 초과)');
    } else {
      console.error('AI 보고서 생성 실패:', err);
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

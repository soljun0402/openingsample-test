// AI 보고서 생성 파이프라인
// Gemini 2.5 Flash API를 사용하여 창업 분석 보고서 생성

import { MarketAnalysisData } from './seoulDataApi';

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
  storeSize: number;
  marketData: {
    footTraffic: string;
    footTrafficRaw: number;
    competitors: number;
    avgRent: number;
    description: string;
    population?: {
      total: number;
      male: number;
      female: number;
      age10: number;
      age20: number;
      age30: number;
      age40: number;
      age50: number;
      age60plus: number;
      daytime: number;
      nighttime: number;
    };
  } | null;
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
5. 과장 없이 현실적이고 실행 가능한 조언만 제공하세요.
6. riskFactors는 반드시 해당 업종+지역 조합의 실질적 리스크만 포함하세요.

## 중요: 지역·상권 특성 반영
당신은 서울시 각 구·동의 상권 특성을 잘 알고 있습니다.
반드시 해당 지역의 실제 특성을 반영하여 분석하세요:
- 해당 동네의 상권 유형을 파악하세요 (오피스 상권, 주거 상권, 대학가, 역세권, 먹자골목, 관광 상권, 신도시 등)
- 해당 구·동의 주요 랜드마크, 지하철역, 대학교, 오피스 빌딩 등을 구체적으로 언급하세요
- 해당 지역의 임대료 수준, 유동인구 패턴, 주 소비층 특성을 반영하세요
- 예: 강남구 역삼동 → "테헤란로 IT/스타트업 오피스 밀집 지역, 2호선 역삼역 역세권, 평일 점심·저녁 직장인 수요 중심"
- 예: 마포구 연남동 → "경의선숲길 인접 트렌디 카페거리, 20~30대 감성 소비층 중심, 주말 유동인구 급증"
- 예: 관악구 신림동 → "서울대 인근 대학가 상권, 가성비 중심 소비 패턴, 학기 중/방학 유동인구 차이 큼"

## 중요: 업종별 맞춤 분석
업종에 따라 분석 관점을 달리하세요:
- 카페/디저트: 좌석 회전율, 테이크아웃 비중, SNS 마케팅, 주변 카페 밀집도, 평단가
- 음식점: 점심 특선 수요, 배달 비중, 주류 매출 비율, 식자재 원가율, 주방 규모
- 소매/편의점: 유동인구 대비 매출 전환율, 야간 매출 비중, 배후 주거지 세대 수
- 미용/뷰티: 예약률, 재방문율, 시술 단가, 주변 경쟁 매장 가격대
- 교육/학원: 학군, 인근 학교 수, 학부모 소득 수준, 수강료 적정선
- 기타 업종: 해당 업종의 핵심 성공 요인에 맞춰 분석

## 중요: 콘텐츠 풍부도
이 JSON은 PDF 보고서 5페이지를 채우는 데 사용됩니다.
- 각 텍스트 필드를 글자 수 제한에 가깝게 최대한 구체적이고 풍부하게 작성하세요.
- 짧은 한 줄이 아니라, 실제 컨설팅 리포트처럼 구체적 수치·근거·사례를 포함하세요.
- 예: "좋은 위치입니다" (X) → "일 평균 유동인구 8만 명의 강남 핵심 오피스 상권으로, 점심·저녁 피크타임 직장인 수요가 안정적이며, 2호선 역삼역 도보 3분 거리로 접근성이 뛰어납니다." (O)
- checklistAdvice는 입력된 모든 체크리스트 항목에 대해 빠짐없이 조언을 작성하세요.
- actionSteps, costTip, timeline은 worry 항목에 반드시 포함하세요.
- riskFactors는 정확히 3개, savingTips는 정확히 3개 작성하세요.
- actionPlan phases는 4~5단계, 각 단계에 tasks 3~5개를 작성하세요.

## overallComment 작성 가이드
overallComment는 보고서 맨 위에 표시되는 "종합 의견"입니다.
- 해당 지역 상권의 핵심 특성을 1문장으로 요약하고
- 이 업종이 해당 지역에서 갖는 강점과 주의점을 각각 1문장으로 제시하세요
- 반드시 지역명과 업종명을 명시하고, 구체적 수치(유동인구, 경쟁업체 수 등)를 포함하세요

## overallScore 채점 기준 (100점 만점)
이 점수는 "창업 준비도"가 아니라 "이 업종+지역 조합의 창업 잠재력 종합 점수"입니다.
아래 요소를 종합하여 40~95점 범위에서 현실적으로 채점하세요:
- 상권 입지 (유동인구, 타겟 고객 밀도): 30%
- 경쟁 환경 (경쟁업체 수, 차별화 가능성): 20%
- 비용 적정성 (임대료 대비 매출 기대치): 20%
- 준비 상태 (체크리스트 완료율): 15%
- 성장 가능성 (지역 발전 추세, 업종 트렌드): 15%

점수 분포 가이드:
- 80~95: 매우 좋은 조건 (scoreLabel: "양호")
- 60~79: 무난한 조건 (scoreLabel: "보통")
- 40~59: 보완 필요 (scoreLabel: "주의 필요")
절대 40점 미만이나 95점 초과를 주지 마세요.`;

const OUTPUT_SCHEMA_DESCRIPTION = `응답 JSON 스키마:
{
  "summary": {
    "title": "string (30자 이내, 예: '역삼동 카페 창업 분석 보고서')",
    "oneLiner": "string (80자 이내, 핵심 요약 — 구체적 수치와 근거를 포함해 한 문장으로)",
    "overallComment": "string (200자 이내, 종합 의견 — 이 업종+지역 조합에 대한 전문 컨설턴트의 전반적 평가. 강점·약점·핵심 조언을 2~3문장으로 구체적으로 서술)",
    "overallScore": "number (40~95, 창업 잠재력 종합 점수)",
    "scoreLabel": "string ('양호' | '보통' | '주의 필요')",
    "keyHighlights": ["string (각 50자 이내, 정확히 4개 — 입지/경쟁/비용/준비 관점에서 하나씩)"]
  },
  "locationAnalysis": {
    "grade": "'S' | 'A' | 'B' | 'C' | 'D'",
    "gradeReason": "string (150자 이내, 등급 판단 근거를 유동인구·경쟁·입지 수치와 함께 구체적으로)",
    "targetCustomer": "string (80자 이내, 타겟 고객 프로필을 연령/직업/소비패턴까지 구체적으로)",
    "peakHours": "string (60자 이내, 예: '평일 출근길 8~9시, 점심 11:30~13:30, 퇴근 후 17:30~20시 / 주말 오후 13~18시')",
    "strengths": ["string (각 60자 이내, 정확히 3개 — 수치나 근거 포함)"],
    "weaknesses": ["string (각 60자 이내, 정확히 2개 — 수치나 근거 포함)"],
    "nearbyTip": "string (120자 이내, 주변 상권 활용 전략을 구체적 행동 포인트로)"
  },
  "costAnalysis": {
    "totalComment": "string (120자 이내, 총 비용에 대한 평가와 해당 지역 평균 대비 분석)",
    "savingTips": [{ "area": "string", "tip": "string (120자 이내, 구체적 방법과 예상 효과)", "savedAmount": "string (예: '200~500만원')" }] (정확히 3개),
    "budgetPriority": ["string (각 60자 이내, 정확히 3개, 해당 업종에서 절대 아끼면 안 되는 항목과 이유)"]
  },
  "checklistAdvice": [{
    "itemId": "string (입력 checklist[].id와 정확히 매칭 — 모든 항목에 대해 빠짐없이 작성)",
    "status": "'done' | 'worry'",
    "advice": "string (100자 이내, 해당 항목에 대한 구체적 컨설팅 의견)",
    "actionSteps": ["string (각 70자 이내, 2~3개 — worry 항목은 반드시 포함, done 항목도 다음 단계 제안)"],
    "costTip": "string (60자 이내, 비용 관련 팁 — worry 항목 필수)",
    "timeline": "string (예: '1~2주' — worry 항목 필수)"
  }],
  "riskFactors": [{
    "level": "'high' | 'medium' | 'low'",
    "title": "string (20자 이내)",
    "description": "string (120자 이내, 리스크의 구체적 원인과 예상 영향을 수치와 함께)",
    "mitigation": "string (120자 이내, 실행 가능한 대응 방안을 단계별로)"
  }] (정확히 3개, high/medium/low 각 1개씩),
  "actionPlan": {
    "phases": [{
      "phase": "string (예: '1단계: 인허가 준비')",
      "duration": "string (예: '1~2주')",
      "tasks": ["string (각 40자 이내, 3~5개, 구체적 할 일)"]
    }] (정확히 4단계),
    "totalDuration": "string (예: '8~12주')"
  },
  "openingTip": "string (200자 이내, 해당 업종+지역에 특화된 창업 성공 꿀팁 — 실제 사례나 업계 노하우 포함)"
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

  return {
    business: {
      category: businessCategory,
      categoryLabel: businessCategoryLabel,
    },
    location: {
      gu: selectedGu,
      dong,
    },
    storeSize: storeSizeNum,
    marketData: marketData
      ? {
          footTraffic: marketData.footTraffic,
          footTrafficRaw: marketData.footTrafficRaw,
          competitors: marketData.competitors,
          avgRent: marketData.avgRent,
          description: marketData.description,
          population: marketData.population
            ? {
                total: marketData.population.total,
                male: marketData.population.male,
                female: marketData.population.female,
                age10: marketData.population.age10,
                age20: marketData.population.age20,
                age30: marketData.population.age30,
                age40: marketData.population.age40,
                age50: marketData.population.age50,
                age60plus: marketData.population.age60plus,
                daytime: marketData.population.daytime,
                nighttime: marketData.population.nighttime,
              }
            : undefined,
        }
      : null,
    estimatedCosts,
    checklist: checklist.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      description: item.description,
      // unchecked = 도움필요로 AI에게 전달
      status: item.status === 'done' ? 'done' as const : 'worry' as const,
      isRequired: item.isRequired,
      estimatedCost: item.estimatedCost,
      comment: item.comment,
    })),
  };
}

// ─── Gemini API 호출 ───

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_TIMEOUT = 40000; // 40초

export async function generateAIReport(input: AIReportInput): Promise<AIReportOutput | null> {
  if (!GEMINI_API_KEY) {
    console.warn('VITE_GEMINI_API_KEY가 설정되지 않았습니다. AI 보고서를 건너뜁니다.');
    return null;
  }

  const userMessage = `다음 창업 정보를 분석하여 보고서 JSON을 생성해주세요.

## 입력 데이터
${JSON.stringify(input)}

## 응답 형식
${OUTPUT_SCHEMA_DESCRIPTION}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT);

  try {
    const apiUrl = import.meta.env.DEV
      ? '/api/gemini/v1beta/models/gemini-2.5-flash:generateContent'
      : `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

    const res = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
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
      }),
    });

    if (!res.ok) {
      console.error('Gemini API 오류:', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('Gemini 응답에 텍스트가 없습니다:', data);
      return null;
    }

    // LLM이 가끔 markdown 코드 펜스를 포함할 수 있으므로 제거
    const cleanText = text.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/i, '');

    let parsed: AIReportOutput;
    try {
      parsed = JSON.parse(cleanText);
    } catch (parseErr) {
      console.error('AI 응답 JSON 파싱 실패:', parseErr, 'Raw:', text.slice(0, 300));
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
      console.warn('Gemini API 타임아웃 (40초 초과)');
    } else {
      console.error('AI 보고서 생성 실패:', err);
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

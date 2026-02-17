// 서울 열린데이터 API 연동 유틸리티
// API: 유동인구(OA-15568), 점포수(OA-15577), 추정매출(OA-15572)
// Vite 프록시 경로: /api/seoul → openapi.seoul.go.kr:8088
//
// 주의: 점포수(2M+건), 매출(577K+건)은 업종×상권 조합이라
// 전수 조회가 비현실적 → 유동인구만 API 사용, 나머지는 fallback

import { DONG_INFO_ALL } from '../data/seoulDistricts';

const SEOUL_API_KEY = import.meta.env.VITE_SEOUL_DATA_KEY || '';
const CACHE_TTL = 30 * 60 * 1000; // 30분
const API_MAX_ROWS = 1000; // 서울 API 1회 최대 요청 건수

export interface MarketAnalysisData {
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
    nighttime: number;
    daytime: number;
  };
  stores?: {
    total: number;
    openRate: number;
    closeRate: number;
    similarCount: number;
  };
  sales?: {
    monthlyAmount: number;
    monthlyCount: number;
  };
  source: 'api' | 'fallback';
}

// --- 캐시 ---
interface CacheEntry {
  data: MarketAnalysisData;
  timestamp: number;
}

function getCached(dong: string): MarketAnalysisData | null {
  try {
    const raw = sessionStorage.getItem(`market_${dong}`);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(`market_${dong}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache(dong: string, data: MarketAnalysisData): void {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    sessionStorage.setItem(`market_${dong}`, JSON.stringify(entry));
  } catch {
    // sessionStorage full — ignore
  }
}

// --- API 호출 헬퍼 ---
async function fetchSeoulApi(serviceName: string, startIdx: number, endIdx: number): Promise<any> {
  const url = `/api/seoul/${SEOUL_API_KEY}/json/${serviceName}/${startIdx}/${endIdx}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Seoul API ${serviceName}: ${res.status}`);
  return res.json();
}

// --- 전체 건수 조회 (1건만 가져와서 list_total_count 확인) ---
async function getTotalCount(serviceName: string): Promise<number> {
  const data = await fetchSeoulApi(serviceName, 1, 1);
  const serviceData = data?.[serviceName];
  return serviceData?.list_total_count || 0;
}

// --- 최신 분기 데이터 가져오기 (끝에서부터 조회) ---
async function fetchLatestQuarterRows(serviceName: string): Promise<any[]> {
  const total = await getTotalCount(serviceName);
  if (total === 0) return [];

  // 최신 분기는 데이터 끝에 위치. 분기당 ~1,000~1,100건이므로
  // 끝에서 1,000건을 가져오면 최신 분기 데이터를 거의 포함
  const startIdx = Math.max(1, total - API_MAX_ROWS + 1);
  const endIdx = total;

  const data = await fetchSeoulApi(serviceName, startIdx, endIdx);
  const rows = data?.[serviceName]?.row;
  if (!rows || !Array.isArray(rows)) return [];

  // 최신 분기 코드만 필터링 (가장 큰 STDR_YYQU_CD)
  const latestQuarter = rows.reduce((max: string, row: any) => {
    const q = row.STDR_YYQU_CD || '';
    return q > max ? q : max;
  }, '');

  return rows.filter((row: any) => row.STDR_YYQU_CD === latestQuarter);
}

// --- 동 이름으로 상권 코드 매칭 ---
// TRDAR_CD_NM(상권명)은 "역삼역", "강남역" 등이므로
// 동명에서 "동" 접미사를 제거하고 부분 문자열 매칭
function findMatchingRows(rows: any[], dong: string): any[] {
  if (!rows || !Array.isArray(rows)) return [];
  const dongBase = dong.replace(/동$/, '');
  return rows.filter((row: any) => {
    const name = row.TRDAR_CD_NM || '';
    return name.includes(dong) || name.includes(dongBase);
  });
}

// --- 유동인구 데이터 가져오기 (OA-15568) ---
// 전체 ~44K건, 분기당 ~1,000건 → 최신 분기만 조회
async function fetchPopulation(dong: string): Promise<MarketAnalysisData['population'] | null> {
  try {
    const rows = await fetchLatestQuarterRows('VwsmTrdarFlpopQq');
    if (rows.length === 0) return null;

    const matches = findMatchingRows(rows, dong);
    if (matches.length === 0) return null;

    // 매칭된 상권들의 유동인구를 합산 (동 하나에 여러 상권이 있을 수 있음)
    let total = 0, male = 0, female = 0;
    let age10 = 0, age20 = 0, age30 = 0, age40 = 0, age50 = 0, age60plus = 0;
    let daytime = 0, nighttime = 0;

    for (const row of matches) {
      total += Number(row.TOT_FLPOP_CO || 0);
      male += Number(row.ML_FLPOP_CO || 0);
      female += Number(row.FML_FLPOP_CO || 0);
      age10 += Number(row.AGRDE_10_FLPOP_CO || 0);
      age20 += Number(row.AGRDE_20_FLPOP_CO || 0);
      age30 += Number(row.AGRDE_30_FLPOP_CO || 0);
      age40 += Number(row.AGRDE_40_FLPOP_CO || 0);
      age50 += Number(row.AGRDE_50_FLPOP_CO || 0);
      age60plus += Number(row.AGRDE_60_ABOVE_FLPOP_CO || 0);

      // 시간대별: 06~11, 11~14, 14~17 = 주간 / 00~06, 17~21, 21~24 = 야간
      daytime += Number(row.TMZON_06_11_FLPOP_CO || 0)
        + Number(row.TMZON_11_14_FLPOP_CO || 0)
        + Number(row.TMZON_14_17_FLPOP_CO || 0);
      nighttime += Number(row.TMZON_00_06_FLPOP_CO || 0)
        + Number(row.TMZON_17_21_FLPOP_CO || 0)
        + Number(row.TMZON_21_24_FLPOP_CO || 0);
    }

    return { total, male, female, age10, age20, age30, age40, age50, age60plus, nighttime, daytime };
  } catch (e) {
    console.warn('유동인구 API 실패:', e);
    return null;
  }
}

// --- fallback 데이터 생성 ---
function createFallbackData(dong: string): MarketAnalysisData {
  const info = DONG_INFO_ALL[dong];
  if (!info) {
    return {
      footTraffic: '정보 없음',
      footTrafficRaw: 0,
      competitors: 0,
      avgRent: 0,
      description: '해당 지역의 상세 데이터가 없습니다.',
      source: 'fallback',
    };
  }
  // footTraffic 문자열에서 숫자 추출
  const numMatch = info.footTraffic.match(/[\d,]+/);
  const raw = numMatch ? Number(numMatch[0].replace(/,/g, '')) : 0;

  return {
    footTraffic: info.footTraffic,
    footTrafficRaw: raw,
    competitors: info.competitors,
    avgRent: info.avgRent,
    description: info.description,
    source: 'fallback',
  };
}

// --- 메인 함수 ---
export async function getMarketAnalysis(dong: string): Promise<MarketAnalysisData> {
  // 1. 캐시 확인
  const cached = getCached(dong);
  if (cached) return cached;

  // 2. API 키 없으면 바로 fallback
  if (!SEOUL_API_KEY) {
    const fallback = createFallbackData(dong);
    setCache(dong, fallback);
    return fallback;
  }

  // 3. 유동인구 API 호출 (점포수/매출은 데이터 규모상 fallback 사용)
  try {
    const population = await fetchPopulation(dong);

    // fallback 기본값 가져오기
    const fallbackInfo = DONG_INFO_ALL[dong];

    if (!population) {
      const fallback = createFallbackData(dong);
      setCache(dong, fallback);
      return fallback;
    }

    const footTrafficRaw = population.total;

    const result: MarketAnalysisData = {
      footTraffic: footTrafficRaw > 0
        ? `일 평균 ${Math.round(footTrafficRaw / 90).toLocaleString()}명`
        : fallbackInfo?.footTraffic || '정보 없음',
      footTrafficRaw: footTrafficRaw > 0 ? Math.round(footTrafficRaw / 90) : 0,
      competitors: fallbackInfo?.competitors || 0,
      avgRent: fallbackInfo?.avgRent || 0,
      description: fallbackInfo?.description || '',
      population: population,
      source: 'api',
    };

    setCache(dong, result);
    return result;
  } catch (e) {
    console.warn('서울 데이터 API 전체 실패, fallback 사용:', e);
    const fallback = createFallbackData(dong);
    setCache(dong, fallback);
    return fallback;
  }
}

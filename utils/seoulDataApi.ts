// 서울 열린데이터 API 연동 유틸리티
// API: 유동인구(OA-15568), 점포수(OA-15577), 추정매출(OA-15572)
// Vite 프록시 경로: /api/seoul → openapi.seoul.go.kr:8088

import { DONG_INFO_ALL } from '../data/seoulDistricts';

const SEOUL_API_KEY = import.meta.env.VITE_SEOUL_DATA_KEY || '';
const CACHE_TTL = 30 * 60 * 1000; // 30분

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

// --- 동 이름으로 상권 코드 매칭 ---
// 서울 열린데이터의 상권명에서 동명을 부분 문자열 검색
function findMatchingRows(rows: any[], dong: string): any[] {
  if (!rows || !Array.isArray(rows)) return [];
  return rows.filter((row: any) => {
    const name = row.TRDAR_CD_NM || row.SIGNGU_CD_NM || '';
    return name.includes(dong) || name.includes(dong.replace(/동$/, ''));
  });
}

// --- 유동인구 데이터 가져오기 (OA-15568) ---
async function fetchPopulation(dong: string): Promise<MarketAnalysisData['population'] | null> {
  try {
    const data = await fetchSeoulApi('VwsmTrdarFlpopQq', 1, 100);
    const result = data?.VwsmTrdarFlpopQq?.row;
    if (!result) return null;

    const matches = findMatchingRows(result, dong);
    if (matches.length === 0) return null;

    // 최신 분기 데이터 사용 (마지막 row)
    const latest = matches[matches.length - 1];

    const total = Number(latest.TOT_FLPOP_CO || 0);
    const male = Number(latest.ML_FLPOP_CO || 0);
    const female = Number(latest.FML_FLPOP_CO || 0);
    const age10 = Number(latest.AGRDE_10_FLPOP_CO || 0);
    const age20 = Number(latest.AGRDE_20_FLPOP_CO || 0);
    const age30 = Number(latest.AGRDE_30_FLPOP_CO || 0);
    const age40 = Number(latest.AGRDE_40_FLPOP_CO || 0);
    const age50 = Number(latest.AGRDE_50_FLPOP_CO || 0);
    const age60plus = Number(latest.AGRDE_60_ABOVE_FLPOP_CO || 0);

    // 시간대별 유동인구로 주간/야간 추정
    const tmSlots = [
      Number(latest.TMZON_1_FLPOP_CO || 0),  // 00~06
      Number(latest.TMZON_2_FLPOP_CO || 0),  // 06~11
      Number(latest.TMZON_3_FLPOP_CO || 0),  // 11~14
      Number(latest.TMZON_4_FLPOP_CO || 0),  // 14~17
      Number(latest.TMZON_5_FLPOP_CO || 0),  // 17~21
      Number(latest.TMZON_6_FLPOP_CO || 0),  // 21~24
    ];
    const daytime = tmSlots[1] + tmSlots[2] + tmSlots[3]; // 06~17
    const nighttime = tmSlots[0] + tmSlots[4] + tmSlots[5]; // 17~06

    return { total, male, female, age10, age20, age30, age40, age50, age60plus, nighttime, daytime };
  } catch (e) {
    console.warn('유동인구 API 실패:', e);
    return null;
  }
}

// --- 점포수 데이터 가져오기 (OA-15577) ---
async function fetchStores(dong: string): Promise<MarketAnalysisData['stores'] | null> {
  try {
    const data = await fetchSeoulApi('VwsmTrdarStorQq', 1, 100);
    const result = data?.VwsmTrdarStorQq?.row;
    if (!result) return null;

    const matches = findMatchingRows(result, dong);
    if (matches.length === 0) return null;

    const latest = matches[matches.length - 1];
    return {
      total: Number(latest.STOR_CO || 0),
      openRate: Number(latest.OPBIZ_RT || 0),
      closeRate: Number(latest.CLSBIZ_RT || 0),
      similarCount: Number(latest.SIMILR_INDUTY_STOR_CO || 0),
    };
  } catch (e) {
    console.warn('점포수 API 실패:', e);
    return null;
  }
}

// --- 추정매출 데이터 가져오기 (OA-15572) ---
async function fetchSales(dong: string): Promise<MarketAnalysisData['sales'] | null> {
  try {
    const data = await fetchSeoulApi('VwsmTrdarSelngQq', 1, 100);
    const result = data?.VwsmTrdarSelngQq?.row;
    if (!result) return null;

    const matches = findMatchingRows(result, dong);
    if (matches.length === 0) return null;

    const latest = matches[matches.length - 1];
    return {
      monthlyAmount: Number(latest.THSMON_SELNG_AMT || 0),
      monthlyCount: Number(latest.THSMON_SELNG_CO || 0),
    };
  } catch (e) {
    console.warn('매출 API 실패:', e);
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

  // 3. API 병렬 호출
  try {
    const [population, stores, sales] = await Promise.all([
      fetchPopulation(dong),
      fetchStores(dong),
      fetchSales(dong),
    ]);

    // API에서 아무 데이터도 못 가져오면 fallback
    if (!population && !stores && !sales) {
      const fallback = createFallbackData(dong);
      setCache(dong, fallback);
      return fallback;
    }

    // fallback 기본값 가져오기
    const fallbackInfo = DONG_INFO_ALL[dong];
    const footTrafficRaw = population?.total || 0;

    const result: MarketAnalysisData = {
      footTraffic: footTrafficRaw > 0
        ? `일 평균 ${Math.round(footTrafficRaw / 90).toLocaleString()}명`
        : fallbackInfo?.footTraffic || '정보 없음',
      footTrafficRaw: footTrafficRaw > 0 ? Math.round(footTrafficRaw / 90) : 0,
      competitors: stores?.total || fallbackInfo?.competitors || 0,
      avgRent: fallbackInfo?.avgRent || 0,
      description: fallbackInfo?.description || '',
      population: population || undefined,
      stores: stores || undefined,
      sales: sales || undefined,
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

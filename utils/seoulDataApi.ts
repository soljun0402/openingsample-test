// 서울 열린데이터 API 연동 유틸리티
// API: 유동인구(OA-15568), 점포수(OA-15577), 추정매출(OA-15572)
// 프로덕션: /api/seoul-data (Vercel Serverless Function)
// 개발: Vite 프록시 → openapi.seoul.go.kr:8088

import { DONG_INFO_ALL } from '../data/seoulDistricts';

const IS_DEV = import.meta.env.DEV;
const SEOUL_API_KEY = import.meta.env.VITE_SEOUL_DATA_KEY || '';
const CACHE_TTL = 30 * 60 * 1000; // 30분
const API_MAX_ROWS = 1000; // 서울 API 1회 최대 요청 건수

// ─── 업종 키워드 매핑 ───
// 사용자 선택 카테고리 → 서울 API SVC_INDUTY_CD_NM 매칭용
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  cafe: ['커피', '카페', '디저트', '제과', '빵', '베이커리', '음료'],
  restaurant: ['한식', '중식', '일식', '양식', '음식', '분식', '치킨', '피자', '패스트푸드', '주점', '호프', '백반', '한정식', '고기'],
  retail: ['소매', '편의점', '슈퍼', '마트', '잡화', '의류', '핸드폰', '생활용품'],
  beauty: ['미용', '뷰티', '네일', '피부', '화장품', '헤어', '에스테틱'],
  education: ['학원', '교육', '학습', '과외', '어린이', '입시', '보습'],
};

function matchesCategory(industryName: string, category: string): boolean {
  const keywords = CATEGORY_KEYWORDS[category] || [];
  return keywords.some(kw => industryName.includes(kw));
}

// ─── 타입 정의 ───

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
    similarCount: number;
    franchiseCount: number;
    openRate: number;
    closeRate: number;
  };
  sales?: {
    quarterlyAmount: number;
    monthlyAmount: number;
    monthlyCount: number;
    weekdayRatio: number;
    weekendRatio: number;
  };
  source: 'api' | 'fallback';
  storesSource?: 'api' | 'fallback';
  salesSource?: 'api' | 'fallback';
}

// ─── 캐시 ───
interface CacheEntry {
  data: MarketAnalysisData;
  timestamp: number;
}

function getCached(dong: string, category: string): MarketAnalysisData | null {
  try {
    const raw = sessionStorage.getItem(`market_${dong}_${category}`);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(`market_${dong}_${category}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache(dong: string, category: string, data: MarketAnalysisData): void {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    sessionStorage.setItem(`market_${dong}_${category}`, JSON.stringify(entry));
  } catch {
    // sessionStorage full — ignore
  }
}

// ─── API 호출 헬퍼 ───
async function fetchSeoulApi(serviceName: string, startIdx: number, endIdx: number): Promise<any> {
  // 개발: Vite 프록시 (API 키 포함 경로)
  // 프로덕션: Vercel Serverless Function (키는 서버에서 주입)
  const url = IS_DEV
    ? `/api/seoul/${SEOUL_API_KEY}/json/${serviceName}/${startIdx}/${endIdx}`
    : `/api/seoul-data?service=${serviceName}&start=${startIdx}&end=${endIdx}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Seoul API ${serviceName}: ${res.status}`);
  return res.json();
}

async function getTotalCount(serviceName: string): Promise<number> {
  const data = await fetchSeoulApi(serviceName, 1, 1);
  const serviceData = data?.[serviceName];
  return serviceData?.list_total_count || 0;
}

// ─── 최신 분기 데이터 가져오기 (단일 배치) ───
async function fetchLatestQuarterRows(serviceName: string): Promise<any[]> {
  const total = await getTotalCount(serviceName);
  if (total === 0) return [];

  const startIdx = Math.max(1, total - API_MAX_ROWS + 1);
  const endIdx = total;

  const data = await fetchSeoulApi(serviceName, startIdx, endIdx);
  const rows = data?.[serviceName]?.row;
  if (!rows || !Array.isArray(rows)) return [];

  const latestQuarter = rows.reduce((max: string, row: any) => {
    const q = row.STDR_YYQU_CD || '';
    return q > max ? q : max;
  }, '');

  return rows.filter((row: any) => row.STDR_YYQU_CD === latestQuarter);
}

// ─── 최신 분기 데이터 가져오기 (다중 배치, 대용량 데이터용) ───
async function fetchLatestQuarterRowsBatch(serviceName: string, batchCount: number): Promise<any[]> {
  const total = await getTotalCount(serviceName);
  if (total === 0) return [];

  // 끝에서부터 batchCount * 1000 행을 병렬로 가져옴
  const promises: Promise<any[]>[] = [];
  for (let i = 0; i < batchCount; i++) {
    const endIdx = total - i * API_MAX_ROWS;
    const startIdx = Math.max(1, endIdx - API_MAX_ROWS + 1);
    if (startIdx > endIdx) break;
    promises.push(
      fetchSeoulApi(serviceName, startIdx, endIdx)
        .then(data => data?.[serviceName]?.row || [])
        .catch(() => [] as any[])
    );
  }

  const results = await Promise.all(promises);
  const allRows = results.flat();

  // 최신 분기 코드만 필터링
  const latestQuarter = allRows.reduce((max: string, row: any) => {
    const q = row.STDR_YYQU_CD || '';
    return q > max ? q : max;
  }, '');

  return allRows.filter((row: any) => row.STDR_YYQU_CD === latestQuarter);
}

// ─── 최신 분기 데이터 가져오기 (앞에서부터, 최신→과거 정렬 API용) ───
// 점포수 API(VwsmTrdarStorQq)는 최신→과거 순 정렬이므로 앞에서 가져옴
async function fetchFirstRowsBatch(serviceName: string, batchCount: number): Promise<any[]> {
  const total = await getTotalCount(serviceName);
  if (total === 0) return [];

  // 앞에서부터 batchCount * 1000 행을 병렬로 가져옴 (total 상한 적용)
  const promises: Promise<any[]>[] = [];
  for (let i = 0; i < batchCount; i++) {
    const startIdx = i * API_MAX_ROWS + 1;
    const endIdx = Math.min((i + 1) * API_MAX_ROWS, total);
    if (startIdx > total) break;
    promises.push(
      fetchSeoulApi(serviceName, startIdx, endIdx)
        .then(data => data?.[serviceName]?.row || [])
        .catch(() => [] as any[])
    );
  }

  const results = await Promise.all(promises);
  const allRows = results.flat();
  if (allRows.length === 0) return [];

  // 최신 분기 코드만 필터링 (앞쪽이 최신이므로 max로 찾으면 됨)
  const latestQuarter = allRows.reduce((max: string, row: any) => {
    const q = row.STDR_YYQU_CD || '';
    return q > max ? q : max;
  }, '');

  return allRows.filter((row: any) => row.STDR_YYQU_CD === latestQuarter);
}

// ─── 동 이름으로 상권 매칭 ───
function findMatchingRows(rows: any[], dong: string): any[] {
  if (!rows || !Array.isArray(rows)) return [];
  const dongBase = dong.replace(/동$/, '').replace(/\d+가$/, '');
  return rows.filter((row: any) => {
    const name = row.TRDAR_CD_NM || '';
    return name.includes(dong) || name.includes(dongBase);
  });
}

// ─── 유동인구 데이터 (OA-15568, VwsmTrdarFlpopQq) ───
// 전체 ~44K건, 분기당 ~1,000건 → 1배치로 충분
async function fetchPopulation(dong: string): Promise<MarketAnalysisData['population'] | null> {
  try {
    const rows = await fetchLatestQuarterRows('VwsmTrdarFlpopQq');
    if (rows.length === 0) return null;

    const matches = findMatchingRows(rows, dong);
    if (matches.length === 0) return null;

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

// ─── 점포수 데이터 (OA-15577, VwsmTrdarStorQq) ───
// 주의: 점포수 API는 최신→과거 순 정렬 → 앞에서부터 조회
async function fetchStoreData(dong: string, category: string): Promise<MarketAnalysisData['stores'] | null> {
  try {
    const rows = await fetchFirstRowsBatch('VwsmTrdarStorQq', 5);
    if (rows.length === 0) return null;

    const dongMatches = findMatchingRows(rows, dong);
    if (dongMatches.length === 0) return null;

    let totalStores = 0;
    let similarStores = 0;
    let franchiseStores = 0;
    let openRateSum = 0;
    let closeRateSum = 0;
    let rateCount = 0;

    for (const row of dongMatches) {
      const stores = Number(row.STOR_CO || 0);
      totalStores += stores;
      franchiseStores += Number(row.FRC_STOR_CO || 0);

      const industryName = row.SVC_INDUTY_CD_NM || '';
      if (matchesCategory(industryName, category)) {
        similarStores += stores;
      }

      const openRate = Number(row.OPBIZ_RT || 0);
      const closeRate = Number(row.CLSBIZ_RT || 0);
      if (openRate > 0 || closeRate > 0) {
        openRateSum += openRate;
        closeRateSum += closeRate;
        rateCount++;
      }
    }

    return {
      total: totalStores,
      similarCount: similarStores,
      franchiseCount: franchiseStores,
      openRate: rateCount > 0 ? Math.round(openRateSum / rateCount * 10) / 10 : 0,
      closeRate: rateCount > 0 ? Math.round(closeRateSum / rateCount * 10) / 10 : 0,
    };
  } catch (e) {
    console.warn('점포수 API 실패:', e);
    return null;
  }
}

// ─── 추정매출 데이터 (OA-15572, VwsmTrdarSelngQq) ───
// 전체 ~577K건 → 끝에서 5배치(5,000행) 가져와서 동+업종 매칭
async function fetchSalesData(dong: string, category: string): Promise<MarketAnalysisData['sales'] | null> {
  try {
    const rows = await fetchLatestQuarterRowsBatch('VwsmTrdarSelngQq', 5);
    if (rows.length === 0) return null;

    const dongMatches = findMatchingRows(rows, dong);
    if (dongMatches.length === 0) return null;

    // 업종 매칭 (동종 업종의 매출만 합산)
    const catMatches = dongMatches.filter(row =>
      matchesCategory(row.SVC_INDUTY_CD_NM || '', category)
    );

    if (catMatches.length === 0) return null;

    let totalAmount = 0;
    let totalCount = 0;
    let weekdayAmount = 0;
    let weekendAmount = 0;

    for (const row of catMatches) {
      totalAmount += Number(row.THSMON_SELNG_AMT || 0);
      totalCount += Number(row.THSMON_SELNG_CO || 0);
      weekdayAmount += Number(row.MDWK_SELNG_AMT || 0);
      weekendAmount += Number(row.WKEND_SELNG_AMT || 0);
    }

    // 분기 데이터 → 월 평균으로 변환
    return {
      quarterlyAmount: totalAmount,
      monthlyAmount: Math.round(totalAmount / 3),
      monthlyCount: Math.round(totalCount / 3),
      weekdayRatio: totalAmount > 0 ? Math.round(weekdayAmount / totalAmount * 100) : 0,
      weekendRatio: totalAmount > 0 ? Math.round(weekendAmount / totalAmount * 100) : 0,
    };
  } catch (e) {
    console.warn('추정매출 API 실패:', e);
    return null;
  }
}

// ─── fallback 데이터 생성 ───
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

// ─── 메인 함수 ───
export async function getMarketAnalysis(dong: string, category: string = ''): Promise<MarketAnalysisData> {
  // 1. 캐시 확인
  const cached = getCached(dong, category);
  if (cached) return cached;

  // 2. API 키 없으면 바로 fallback
  if (!SEOUL_API_KEY) {
    const fallback = createFallbackData(dong);
    setCache(dong, category, fallback);
    return fallback;
  }

  // 3. 유동인구 + 점포수 + 추정매출 API 병렬 호출
  try {
    const [population, stores, sales] = await Promise.all([
      fetchPopulation(dong),
      category ? fetchStoreData(dong, category) : Promise.resolve(null),
      category ? fetchSalesData(dong, category) : Promise.resolve(null),
    ]);

    const fallbackInfo = DONG_INFO_ALL[dong];

    if (!population && !stores && !sales) {
      const fallback = createFallbackData(dong);
      setCache(dong, category, fallback);
      return fallback;
    }

    const footTrafficRaw = population ? population.total : 0;

    // 경쟁업체 수: 점포수 API 데이터 우선, 없으면 fallback
    const competitors = stores?.similarCount ?? fallbackInfo?.competitors ?? 0;

    const result: MarketAnalysisData = {
      footTraffic: footTrafficRaw > 0
        ? `일 평균 ${Math.round(footTrafficRaw / 90).toLocaleString()}명`
        : fallbackInfo?.footTraffic || '정보 없음',
      footTrafficRaw: footTrafficRaw > 0 ? Math.round(footTrafficRaw / 90) : 0,
      competitors,
      avgRent: fallbackInfo?.avgRent || 0,
      description: fallbackInfo?.description || '',
      population: population || undefined,
      stores: stores || undefined,
      sales: sales || undefined,
      source: population ? 'api' : 'fallback',
      storesSource: stores ? 'api' : 'fallback',
      salesSource: sales ? 'api' : 'fallback',
    };

    setCache(dong, category, result);
    return result;
  } catch (e) {
    console.warn('서울 데이터 API 전체 실패, fallback 사용:', e);
    const fallback = createFallbackData(dong);
    setCache(dong, category, fallback);
    return fallback;
  }
}

// 업종별 맞춤 상권 분석 지표 정의
// "배달 수요"를 모든 업종에 표시하던 버그를 수정하여, 업종별로 의미있는 지표를 표시

export interface CategoryMetric {
  label: string;         // UI에 표시할 지표 이름
  description: string;   // 툴팁/보조 설명
  calculate: (params: MetricParams) => MetricResult;
}

export interface MetricParams {
  // API 데이터 (있을 때만)
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
  // fallback 데이터 (항상 있음)
  avgRent: number;
  competitors: number;
  footTrafficRaw?: number;
}

export interface MetricResult {
  value: string;    // 표시할 값 (e.g. "높음", "72%")
  color: string;    // tailwind 색상 클래스
  detail?: string;  // 부가 설명
}

// 업종별 지표 매핑
export const CATEGORY_METRICS: Record<string, CategoryMetric> = {
  // 음식점/카페/치킨/주점 — 배달 수요
  cafe: {
    label: '배달 수요',
    description: '야간 주거인구 비율 기반 배달 수요 추정',
    calculate: ({ population, avgRent }) => {
      if (population && population.total > 0) {
        const nightRatio = population.nighttime / population.total;
        if (nightRatio > 0.55) return { value: '높음', color: 'text-green-600', detail: `야간인구 ${Math.round(nightRatio * 100)}%` };
        if (nightRatio > 0.45) return { value: '보통', color: 'text-brand-600' };
        return { value: '낮음', color: 'text-gray-500' };
      }
      // fallback
      if (avgRent < 200) return { value: '높음', color: 'text-green-600' };
      if (avgRent < 300) return { value: '보통', color: 'text-brand-600' };
      return { value: '낮음', color: 'text-gray-500' };
    },
  },
  restaurant: {
    label: '배달 수요',
    description: '야간 주거인구 비율 기반 배달 수요 추정',
    calculate: ({ population, avgRent }) => {
      if (population && population.total > 0) {
        const nightRatio = population.nighttime / population.total;
        if (nightRatio > 0.55) return { value: '높음', color: 'text-green-600', detail: `야간인구 ${Math.round(nightRatio * 100)}%` };
        if (nightRatio > 0.45) return { value: '보통', color: 'text-brand-600' };
        return { value: '낮음', color: 'text-gray-500' };
      }
      if (avgRent < 200) return { value: '높음', color: 'text-green-600' };
      if (avgRent < 300) return { value: '보통', color: 'text-brand-600' };
      return { value: '낮음', color: 'text-gray-500' };
    },
  },
  chicken: {
    label: '배달 수요',
    description: '야간 주거인구 비율 기반 배달 수요 추정',
    calculate: ({ population, avgRent }) => {
      if (population && population.total > 0) {
        const nightRatio = population.nighttime / population.total;
        if (nightRatio > 0.55) return { value: '높음', color: 'text-green-600', detail: `야간인구 ${Math.round(nightRatio * 100)}%` };
        if (nightRatio > 0.45) return { value: '보통', color: 'text-brand-600' };
        return { value: '낮음', color: 'text-gray-500' };
      }
      if (avgRent < 200) return { value: '높음', color: 'text-green-600' };
      if (avgRent < 300) return { value: '보통', color: 'text-brand-600' };
      return { value: '낮음', color: 'text-gray-500' };
    },
  },
  pub: {
    label: '배달 수요',
    description: '야간 주거인구 비율 기반 배달 수요 추정',
    calculate: ({ population, avgRent }) => {
      if (population && population.total > 0) {
        const nightRatio = population.nighttime / population.total;
        if (nightRatio > 0.55) return { value: '높음', color: 'text-green-600', detail: `야간인구 ${Math.round(nightRatio * 100)}%` };
        if (nightRatio > 0.45) return { value: '보통', color: 'text-brand-600' };
        return { value: '낮음', color: 'text-gray-500' };
      }
      if (avgRent < 200) return { value: '높음', color: 'text-green-600' };
      if (avgRent < 300) return { value: '보통', color: 'text-brand-600' };
      return { value: '낮음', color: 'text-gray-500' };
    },
  },

  // 미용/뷰티 — 주거 인구 밀도
  beauty: {
    label: '주거 인구 밀도',
    description: '야간(주거) 인구 대비 전체 인구 비율',
    calculate: ({ population, avgRent }) => {
      if (population && population.total > 0) {
        const nightRatio = population.nighttime / population.total;
        if (nightRatio > 0.6) return { value: '높음', color: 'text-green-600', detail: `주거인구 비율 ${Math.round(nightRatio * 100)}%` };
        if (nightRatio > 0.45) return { value: '보통', color: 'text-brand-600' };
        return { value: '낮음 (상업지구)', color: 'text-yellow-600' };
      }
      if (avgRent < 200) return { value: '높음', color: 'text-green-600' };
      if (avgRent < 300) return { value: '보통', color: 'text-brand-600' };
      return { value: '낮음 (상업지구)', color: 'text-yellow-600' };
    },
  },

  // 헬스/운동 — 20-40대 비율
  fitness: {
    label: '20-40대 비율',
    description: '운동 주력 소비층(20~40대) 유동인구 비율',
    calculate: ({ population, avgRent }) => {
      if (population && population.total > 0) {
        const young = population.age20 + population.age30 + population.age40;
        const ratio = young / population.total;
        if (ratio > 0.55) return { value: '높음', color: 'text-green-600', detail: `${Math.round(ratio * 100)}%` };
        if (ratio > 0.4) return { value: '보통', color: 'text-brand-600', detail: `${Math.round(ratio * 100)}%` };
        return { value: '낮음', color: 'text-yellow-600', detail: `${Math.round(ratio * 100)}%` };
      }
      if (avgRent >= 250) return { value: '높음 (추정)', color: 'text-green-600' };
      return { value: '보통 (추정)', color: 'text-brand-600' };
    },
  },

  // 교육/학원 — 학생 밀집도
  education: {
    label: '학생 밀집도',
    description: '10~20대 유동인구 비율',
    calculate: ({ population, avgRent, competitors }) => {
      if (population && population.total > 0) {
        const student = population.age10 + population.age20;
        const ratio = student / population.total;
        if (ratio > 0.35) return { value: '높음', color: 'text-green-600', detail: `10-20대 ${Math.round(ratio * 100)}%` };
        if (ratio > 0.2) return { value: '보통', color: 'text-brand-600', detail: `10-20대 ${Math.round(ratio * 100)}%` };
        return { value: '낮음', color: 'text-yellow-600' };
      }
      // fallback: 학원가는 대체로 임대료 중간대
      if (avgRent >= 200 && avgRent <= 300) return { value: '보통 (추정)', color: 'text-brand-600' };
      return { value: '정보 부족', color: 'text-gray-500' };
    },
  },

  // 사무실 — 오피스 밀집도
  office: {
    label: '오피스 밀집도',
    description: '주간 인구 집중도 (직장인 비율)',
    calculate: ({ population, avgRent }) => {
      if (population && population.total > 0) {
        const dayRatio = population.daytime / population.total;
        if (dayRatio > 0.55) return { value: '높음', color: 'text-green-600', detail: `주간인구 ${Math.round(dayRatio * 100)}%` };
        if (dayRatio > 0.45) return { value: '보통', color: 'text-brand-600' };
        return { value: '낮음', color: 'text-yellow-600' };
      }
      if (avgRent >= 350) return { value: '높음 (추정)', color: 'text-green-600' };
      if (avgRent >= 250) return { value: '보통 (추정)', color: 'text-brand-600' };
      return { value: '낮음 (추정)', color: 'text-yellow-600' };
    },
  },

  // 소매/편의점 — 유동인구 대비 점포
  retail: {
    label: '유동인구 대비 점포',
    description: '유동인구 수 대비 점포 밀도',
    calculate: ({ population, competitors, footTrafficRaw }) => {
      const traffic = footTrafficRaw || (population?.total || 0);
      if (traffic > 0 && competitors > 0) {
        const ratio = traffic / competitors;
        if (ratio > 2000) return { value: '여유', color: 'text-green-600', detail: `인당 점포 비율 양호` };
        if (ratio > 1000) return { value: '보통', color: 'text-brand-600' };
        return { value: '과밀', color: 'text-red-600' };
      }
      if (competitors < 20) return { value: '여유 (추정)', color: 'text-green-600' };
      return { value: '보통 (추정)', color: 'text-brand-600' };
    },
  },

  // PC방/오락시설 — 야간 유동인구
  pcroom: {
    label: '야간 유동인구',
    description: '야간 시간대(21시~06시) 유동인구 비율',
    calculate: ({ population, avgRent }) => {
      if (population && population.total > 0) {
        // 야간인구가 높으면 야간 유동인구도 높을 가능성
        const nightRatio = population.nighttime / population.total;
        if (nightRatio > 0.55) return { value: '높음', color: 'text-green-600', detail: `야간인구 비율 ${Math.round(nightRatio * 100)}%` };
        if (nightRatio > 0.45) return { value: '보통', color: 'text-brand-600' };
        return { value: '낮음', color: 'text-yellow-600' };
      }
      if (avgRent < 250) return { value: '높음 (추정)', color: 'text-green-600' };
      return { value: '보통 (추정)', color: 'text-brand-600' };
    },
  },

  // 호텔/숙박 — 관광객 비율
  hotel: {
    label: '관광객 비율',
    description: '상권 특성 기반 관광 수요 추정',
    calculate: ({ population, avgRent, competitors }) => {
      // API 데이터로는 관광객을 직접 알기 어려움 → 주간 유동 vs 야간 주거 차이로 추정
      if (population && population.total > 0) {
        const dayRatio = population.daytime / population.total;
        // 주간 유동이 높고 야간 주거가 낮으면 → 관광/상업 지역
        if (dayRatio > 0.6) return { value: '높음', color: 'text-green-600', detail: '상업/관광 특성 지역' };
        if (dayRatio > 0.5) return { value: '보통', color: 'text-brand-600' };
        return { value: '낮음', color: 'text-yellow-600' };
      }
      if (avgRent >= 350) return { value: '높음 (추정)', color: 'text-green-600' };
      if (avgRent >= 250) return { value: '보통 (추정)', color: 'text-brand-600' };
      return { value: '낮음 (추정)', color: 'text-yellow-600' };
    },
  },

  // 기타 — 종합 상권 활성도
  etc: {
    label: '종합 상권 활성도',
    description: '임대료 기반 상권 활성도 등급',
    calculate: ({ avgRent }) => {
      if (avgRent >= 350) return { value: '높음', color: 'text-green-600' };
      if (avgRent >= 250) return { value: '보통', color: 'text-brand-600' };
      return { value: '낮음', color: 'text-yellow-600' };
    },
  },
};

// 업종 ID로 지표 가져오기 (없으면 '기타' fallback)
export function getCategoryMetric(businessCategory: string): CategoryMetric {
  return CATEGORY_METRICS[businessCategory] || CATEGORY_METRICS['etc'];
}

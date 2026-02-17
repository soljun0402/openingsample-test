// 서울시 25개 구 전체 데이터

export interface GuInfo {
  name: string;
  landmark: string;
  group: string;
}

export interface DongInfo {
  name: string;
  landmark: string;
}

export interface DongMarketInfo {
  competitors: number;
  footTraffic: string;
  avgRent: number;
  description: string;
}

export interface DongCoord {
  lat: number;
  lng: number;
}

// 권역 그룹
export const GU_GROUPS = ['강남권', '도심권', '동북권', '서북권', '서남권'] as const;

export const GU_GROUP_COLORS: Record<string, string> = {
  '강남권': 'text-blue-700',
  '도심권': 'text-red-700',
  '동북권': 'text-green-700',
  '서북권': 'text-purple-700',
  '서남권': 'text-amber-700',
};

// 25개 구 목록
export const SEOUL_GUS: GuInfo[] = [
  // 강남권
  { name: '강남구', landmark: '강남역, 코엑스', group: '강남권' },
  { name: '서초구', landmark: '교대역, 반포', group: '강남권' },
  { name: '송파구', landmark: '잠실, 롯데타워', group: '강남권' },
  { name: '강동구', landmark: '천호동, 암사동', group: '강남권' },
  // 도심권
  { name: '종로구', landmark: '광화문, 종로', group: '도심권' },
  { name: '중구', landmark: '명동, 남대문시장', group: '도심권' },
  { name: '용산구', landmark: '이태원, 용산역', group: '도심권' },
  // 동북권
  { name: '성동구', landmark: '성수동, 왕십리', group: '동북권' },
  { name: '광진구', landmark: '건대입구, 구의동', group: '동북권' },
  { name: '동대문구', landmark: '회기역, 경희대', group: '동북권' },
  { name: '중랑구', landmark: '면목동, 망우동', group: '동북권' },
  { name: '성북구', landmark: '성신여대, 돈암동', group: '동북권' },
  { name: '강북구', landmark: '수유역, 4.19길', group: '동북권' },
  { name: '도봉구', landmark: '도봉산, 쌍문동', group: '동북권' },
  { name: '노원구', landmark: '노원역, 중계동', group: '동북권' },
  // 서북권
  { name: '은평구', landmark: '연신내, 불광동', group: '서북권' },
  { name: '서대문구', landmark: '신촌, 이화여대', group: '서북권' },
  { name: '마포구', landmark: '홍대, 합정, 망원', group: '서북권' },
  // 서남권
  { name: '양천구', landmark: '목동, 오목교', group: '서남권' },
  { name: '강서구', landmark: '마곡, 발산역', group: '서남권' },
  { name: '구로구', landmark: '구로디지털단지', group: '서남권' },
  { name: '금천구', landmark: '가산디지털단지', group: '서남권' },
  { name: '영등포구', landmark: '여의도, 영등포역', group: '서남권' },
  { name: '동작구', landmark: '사당역, 노량진', group: '서남권' },
  { name: '관악구', landmark: '신림역, 서울대입구', group: '서남권' },
];

// 구별 주요 동 목록
export const SEOUL_DONGS: Record<string, DongInfo[]> = {
  '강남구': [
    { name: '역삼동', landmark: '강남역, 강남역 술집거리' },
    { name: '논현동', landmark: '논현역, 학동역' },
    { name: '신사동', landmark: '가로수길, 압구정로데오' },
    { name: '청담동', landmark: '청담동 명품거리' },
    { name: '삼성동', landmark: '코엑스, 봉은사역' },
    { name: '대치동', landmark: '대치동 학원가' },
    { name: '압구정동', landmark: '압구정역, 현대백화점' },
    { name: '도곡동', landmark: '도곡역, 매봉역' },
    { name: '개포동', landmark: '개포동, 대모산' },
    { name: '일원동', landmark: '삼성서울병원' },
  ],
  '서초구': [
    { name: '서초동', landmark: '교대역, 법원단지' },
    { name: '반포동', landmark: '반포한강공원, 고속터미널' },
    { name: '잠원동', landmark: '신사역, 잠원한강공원' },
    { name: '방배동', landmark: '방배역, 카페거리' },
    { name: '양재동', landmark: '양재역, 양재시민의숲' },
    { name: '내곡동', landmark: '내곡동, 헌릉로' },
  ],
  '송파구': [
    { name: '잠실동', landmark: '잠실역, 롯데월드' },
    { name: '신천동', landmark: '잠실새내역, 석촌호수' },
    { name: '문정동', landmark: '문정법조단지, 가든파이브' },
    { name: '가락동', landmark: '가락시장' },
    { name: '방이동', landmark: '방이동 먹자골목' },
    { name: '송파동', landmark: '송파역, 송파나루공원' },
    { name: '석촌동', landmark: '석촌역, 석촌호수' },
  ],
  '강동구': [
    { name: '천호동', landmark: '천호역, 현대백화점' },
    { name: '성내동', landmark: '강동역, 올림픽공원' },
    { name: '길동', landmark: '길동생태공원' },
    { name: '암사동', landmark: '암사역, 선사유적지' },
    { name: '명일동', landmark: '명일역' },
    { name: '고덕동', landmark: '고덕그라시움' },
  ],
  '종로구': [
    { name: '종로1가', landmark: '종각역, 보신각' },
    { name: '종로2가', landmark: '종로2가, 탑골공원' },
    { name: '관철동', landmark: '젊음의거리' },
    { name: '익선동', landmark: '익선동 한옥거리' },
    { name: '삼청동', landmark: '삼청동길, 국립현대미술관' },
    { name: '북촌', landmark: '북촌한옥마을' },
    { name: '혜화동', landmark: '대학로, 혜화역' },
    { name: '광화문', landmark: '광화문광장, 경복궁' },
  ],
  '중구': [
    { name: '명동', landmark: '명동거리, 눈스퀘어' },
    { name: '충무로', landmark: '충무로역, 대한극장' },
    { name: '을지로', landmark: '을지로3가, 힙지로' },
    { name: '남대문', landmark: '남대문시장' },
    { name: '동대문', landmark: '동대문디자인플라자' },
    { name: '약수동', landmark: '약수역' },
    { name: '신당동', landmark: '떡볶이타운, 중앙시장' },
  ],
  '용산구': [
    { name: '이태원동', landmark: '이태원거리, 경리단길' },
    { name: '한남동', landmark: '한남동 카페거리, 블루스퀘어' },
    { name: '후암동', landmark: '남산타워, 해방촌' },
    { name: '용산동', landmark: '용산역, 아이파크몰' },
    { name: '한강로', landmark: '신용산역, 용산공원' },
    { name: '녹사평', landmark: '녹사평역, 이태원길' },
  ],
  '성동구': [
    { name: '성수동', landmark: '성수동 카페거리, 서울숲' },
    { name: '왕십리', landmark: '왕십리역, 비트플렉스' },
    { name: '금호동', landmark: '금호역, 응봉산' },
    { name: '옥수동', landmark: '옥수역' },
    { name: '행당동', landmark: '행당역, 이마트' },
    { name: '마장동', landmark: '마장동 축산시장' },
  ],
  '광진구': [
    { name: '건대입구', landmark: '건대입구역, 건대 먹자골목' },
    { name: '구의동', landmark: '구의역, 테크노마트' },
    { name: '자양동', landmark: '자양동 양꼬치거리' },
    { name: '화양동', landmark: '건대 앞 카페거리' },
    { name: '군자동', landmark: '군자역, 어린이대공원' },
    { name: '중곡동', landmark: '중곡역' },
  ],
  '동대문구': [
    { name: '회기동', landmark: '회기역, 경희대' },
    { name: '전농동', landmark: '서울시립대' },
    { name: '이문동', landmark: '외대앞역, 한국외대' },
    { name: '장안동', landmark: '장한평역, 중고차시장' },
    { name: '답십리', landmark: '답십리역' },
    { name: '청량리', landmark: '청량리역, 롯데백화점' },
  ],
  '중랑구': [
    { name: '면목동', landmark: '면목역, 먹자골목' },
    { name: '상봉동', landmark: '상봉역, 이마트' },
    { name: '중화동', landmark: '중화역' },
    { name: '묵동', landmark: '묵동, 중랑천' },
    { name: '망우동', landmark: '망우역' },
  ],
  '성북구': [
    { name: '돈암동', landmark: '성신여대입구역' },
    { name: '길음동', landmark: '길음역, 미아리고개' },
    { name: '정릉동', landmark: '정릉, 국민대' },
    { name: '안암동', landmark: '안암역, 고려대' },
    { name: '보문동', landmark: '보문역' },
    { name: '장위동', landmark: '장위뉴타운' },
  ],
  '강북구': [
    { name: '수유동', landmark: '수유역, 수유시장' },
    { name: '미아동', landmark: '미아역, 미아사거리' },
    { name: '번동', landmark: '번동, 북서울꿈의숲' },
    { name: '우이동', landmark: '우이신설선, 북한산' },
    { name: '인수동', landmark: '4.19기념관' },
  ],
  '도봉구': [
    { name: '쌍문동', landmark: '쌍문역' },
    { name: '방학동', landmark: '방학역' },
    { name: '창동', landmark: '창동역, 플랫폼창동61' },
    { name: '도봉동', landmark: '도봉산역, 도봉산' },
    { name: '노해동', landmark: '노해로' },
  ],
  '노원구': [
    { name: '중계동', landmark: '중계역, 은행사거리' },
    { name: '상계동', landmark: '노원역, 노원마두' },
    { name: '하계동', landmark: '하계역' },
    { name: '공릉동', landmark: '공릉역, 서울과학기술대' },
    { name: '월계동', landmark: '월계역, 광운대' },
  ],
  '은평구': [
    { name: '연신내', landmark: '연신내역, 은평시장' },
    { name: '불광동', landmark: '불광역, 이마트' },
    { name: '응암동', landmark: '응암역' },
    { name: '녹번동', landmark: '녹번역' },
    { name: '대조동', landmark: '대조동, 불광천' },
    { name: '진관동', landmark: '은평한옥마을, 진관사' },
  ],
  '서대문구': [
    { name: '신촌동', landmark: '신촌역, 연세대' },
    { name: '이화동', landmark: '이대역, 이화여대' },
    { name: '연희동', landmark: '연희동 카페거리' },
    { name: '홍제동', landmark: '홍제역, 개미마을' },
    { name: '충정로', landmark: '충정로역' },
    { name: '북아현동', landmark: '아현역, 이대부속병원' },
  ],
  '마포구': [
    { name: '홍대앞', landmark: '홍대입구역, 걷고싶은거리' },
    { name: '합정동', landmark: '합정역, 메세나폴리스' },
    { name: '망원동', landmark: '망원역, 망리단길' },
    { name: '연남동', landmark: '연남동 카페거리, 경의선숲길' },
    { name: '상수동', landmark: '상수역, 카페골목' },
    { name: '서교동', landmark: '서교동, 홍대클럽거리' },
    { name: '공덕동', landmark: '공덕역, 마포래미안' },
    { name: '마포동', landmark: '마포역, 마포나루길' },
  ],
  '양천구': [
    { name: '목동', landmark: '목동 학원가, 현대백화점' },
    { name: '신정동', landmark: '오목교역' },
    { name: '신월동', landmark: '신월동, 신정네거리' },
  ],
  '강서구': [
    { name: '마곡동', landmark: '마곡역, 마곡나루' },
    { name: '발산동', landmark: '발산역, 우장산역' },
    { name: '화곡동', landmark: '화곡역, 까치산역' },
    { name: '등촌동', landmark: '등촌역' },
    { name: '공항동', landmark: '김포공항역' },
  ],
  '구로구': [
    { name: '구로동', landmark: '구로디지털단지역, G밸리' },
    { name: '신도림동', landmark: '신도림역, 디큐브시티' },
    { name: '고척동', landmark: '고척스카이돔' },
    { name: '개봉동', landmark: '개봉역' },
    { name: '오류동', landmark: '오류역' },
  ],
  '금천구': [
    { name: '가산동', landmark: '가산디지털단지역, 마리오아울렛' },
    { name: '독산동', landmark: '독산역, 금천구청역' },
    { name: '시흥동', landmark: '시흥사거리' },
  ],
  '영등포구': [
    { name: '여의도동', landmark: '여의도역, IFC몰' },
    { name: '영등포동', landmark: '영등포역, 타임스퀘어' },
    { name: '당산동', landmark: '당산역, 합정역' },
    { name: '신길동', landmark: '신길역, 보라매공원' },
    { name: '문래동', landmark: '문래역, 문래창작촌' },
    { name: '양평동', landmark: '양평역' },
  ],
  '동작구': [
    { name: '사당동', landmark: '사당역, 이수역' },
    { name: '노량진동', landmark: '노량진역, 수산시장' },
    { name: '상도동', landmark: '상도역, 숭실대' },
    { name: '흑석동', landmark: '흑석역, 중앙대' },
    { name: '대방동', landmark: '대방역' },
  ],
  '관악구': [
    { name: '신림동', landmark: '신림역, 먹자골목' },
    { name: '봉천동', landmark: '서울대입구역, 샤로수길' },
    { name: '남현동', landmark: '사당역' },
    { name: '낙성대', landmark: '낙성대역' },
    { name: '서원동', landmark: '서울대 후문' },
  ],
};

// 전체 동별 상권 정보
export const DONG_INFO_ALL: Record<string, DongMarketInfo> = {
  // 강남구
  '역삼동': { competitors: 45, footTraffic: '일 평균 85,000명', avgRent: 350, description: '강남역 상권, 술집거리 밀집, 야간 유동인구 높음' },
  '논현동': { competitors: 28, footTraffic: '일 평균 42,000명', avgRent: 280, description: '학동사거리 중심, 주거+상업 복합' },
  '신사동': { competitors: 35, footTraffic: '일 평균 55,000명', avgRent: 400, description: '가로수길 상권, 젊은층 유동인구' },
  '청담동': { competitors: 18, footTraffic: '일 평균 25,000명', avgRent: 500, description: '고급 상권, 배달보다 매장 중심' },
  '삼성동': { competitors: 32, footTraffic: '일 평균 70,000명', avgRent: 380, description: '코엑스 상권, 직장인 중심' },
  '대치동': { competitors: 22, footTraffic: '일 평균 35,000명', avgRent: 250, description: '학원가 상권, 저녁 시간대 집중' },
  '압구정동': { competitors: 25, footTraffic: '일 평균 40,000명', avgRent: 420, description: '로데오거리, 젊은층+고소득층' },
  '도곡동': { competitors: 15, footTraffic: '일 평균 20,000명', avgRent: 200, description: '주거 중심, 배달 수요 높음' },
  '개포동': { competitors: 12, footTraffic: '일 평균 15,000명', avgRent: 180, description: '재건축 진행중, 배달 위주' },
  '일원동': { competitors: 10, footTraffic: '일 평균 18,000명', avgRent: 170, description: '병원 상권, 안정적 수요' },
  // 서초구
  '서초동': { competitors: 38, footTraffic: '일 평균 65,000명', avgRent: 320, description: '법원단지+교대역, 직장인·법조인 밀집' },
  '반포동': { competitors: 20, footTraffic: '일 평균 45,000명', avgRent: 350, description: '고속터미널, 반포한강공원 인접' },
  '잠원동': { competitors: 15, footTraffic: '일 평균 25,000명', avgRent: 300, description: '신사역 인근, 주거 중심' },
  '방배동': { competitors: 22, footTraffic: '일 평균 30,000명', avgRent: 220, description: '카페거리 유명, 주거+상업' },
  '양재동': { competitors: 25, footTraffic: '일 평균 35,000명', avgRent: 250, description: '양재역 일대, 업무지구' },
  '내곡동': { competitors: 8, footTraffic: '일 평균 10,000명', avgRent: 150, description: '주거 위주, 개발 진행중' },
  // 송파구
  '잠실동': { competitors: 40, footTraffic: '일 평균 90,000명', avgRent: 380, description: '롯데월드·롯데타워, 유동인구 최상위' },
  '신천동': { competitors: 30, footTraffic: '일 평균 50,000명', avgRent: 300, description: '석촌호수 인접, 잠실새내역 상권' },
  '문정동': { competitors: 25, footTraffic: '일 평균 40,000명', avgRent: 280, description: '법조단지·가든파이브, 직장인 중심' },
  '가락동': { competitors: 20, footTraffic: '일 평균 35,000명', avgRent: 220, description: '가락시장 인접, 유통 상권' },
  '방이동': { competitors: 28, footTraffic: '일 평균 30,000명', avgRent: 250, description: '먹자골목 유명, 올림픽공원 인접' },
  '송파동': { competitors: 15, footTraffic: '일 평균 20,000명', avgRent: 200, description: '송파역 일대, 주거 중심' },
  '석촌동': { competitors: 18, footTraffic: '일 평균 25,000명', avgRent: 230, description: '석촌호수 인근, 주거+상업' },
  // 강동구
  '천호동': { competitors: 30, footTraffic: '일 평균 55,000명', avgRent: 250, description: '천호역 상권, 현대백화점 중심' },
  '성내동': { competitors: 20, footTraffic: '일 평균 30,000명', avgRent: 220, description: '강동역, 올림픽공원 인접' },
  '길동': { competitors: 12, footTraffic: '일 평균 18,000명', avgRent: 180, description: '주거 중심, 생태공원' },
  '암사동': { competitors: 15, footTraffic: '일 평균 20,000명', avgRent: 190, description: '암사역 인근, 주거 위주' },
  '명일동': { competitors: 14, footTraffic: '일 평균 16,000명', avgRent: 175, description: '명일역 인근, 주거 중심' },
  '고덕동': { competitors: 18, footTraffic: '일 평균 22,000명', avgRent: 200, description: '신축 아파트 단지, 배달 수요 높음' },
  // 종로구
  '종로1가': { competitors: 35, footTraffic: '일 평균 80,000명', avgRent: 400, description: '종각역, 직장인 밀집 상권' },
  '종로2가': { competitors: 30, footTraffic: '일 평균 60,000명', avgRent: 350, description: '탑골공원 인근, 관광+직장인' },
  '관철동': { competitors: 28, footTraffic: '일 평균 50,000명', avgRent: 380, description: '젊음의거리, 술집·맛집 밀집' },
  '익선동': { competitors: 22, footTraffic: '일 평균 35,000명', avgRent: 320, description: '한옥거리, 인스타 핫플' },
  '삼청동': { competitors: 18, footTraffic: '일 평균 25,000명', avgRent: 280, description: '삼청동길 카페·갤러리, 관광 상권' },
  '북촌': { competitors: 15, footTraffic: '일 평균 30,000명', avgRent: 300, description: '북촌한옥마을, 외국인 관광객 많음' },
  '혜화동': { competitors: 25, footTraffic: '일 평균 45,000명', avgRent: 250, description: '대학로 연극·문화 상권' },
  '광화문': { competitors: 20, footTraffic: '일 평균 70,000명', avgRent: 450, description: '광화문광장, 오피스 밀집' },
  // 중구
  '명동': { competitors: 50, footTraffic: '일 평균 100,000명', avgRent: 500, description: '대한민국 대표 상권, 관광객 집중' },
  '충무로': { competitors: 25, footTraffic: '일 평균 35,000명', avgRent: 280, description: '충무로역, 인쇄골목+먹자골목' },
  '을지로': { competitors: 30, footTraffic: '일 평균 45,000명', avgRent: 300, description: '힙지로, 레트로+트렌디 상권' },
  '남대문': { competitors: 35, footTraffic: '일 평균 60,000명', avgRent: 350, description: '남대문시장, 도매+소매 상권' },
  '동대문': { competitors: 40, footTraffic: '일 평균 55,000명', avgRent: 320, description: 'DDP 인접, 패션+야간 상권' },
  '약수동': { competitors: 15, footTraffic: '일 평균 20,000명', avgRent: 200, description: '주거 중심, 약수역 인근' },
  '신당동': { competitors: 22, footTraffic: '일 평균 30,000명', avgRent: 220, description: '떡볶이타운, 중앙시장 인접' },
  // 용산구
  '이태원동': { competitors: 30, footTraffic: '일 평균 40,000명', avgRent: 300, description: '이태원거리, 다국적 맛집+바' },
  '한남동': { competitors: 22, footTraffic: '일 평균 30,000명', avgRent: 350, description: '한남동 카페·레스토랑, 고급 상권' },
  '후암동': { competitors: 15, footTraffic: '일 평균 20,000명', avgRent: 220, description: '해방촌 상권, 빈티지+카페' },
  '용산동': { competitors: 25, footTraffic: '일 평균 35,000명', avgRent: 280, description: '용산역 인근, 재개발 기대' },
  '한강로': { competitors: 18, footTraffic: '일 평균 25,000명', avgRent: 260, description: '신용산역, 용산공원 개발 호재' },
  '녹사평': { competitors: 12, footTraffic: '일 평균 18,000명', avgRent: 250, description: '녹사평역, 이태원 인접 주거' },
  // 성동구
  '성수동': { competitors: 35, footTraffic: '일 평균 60,000명', avgRent: 350, description: '성수동 카페거리, MZ세대 핫플' },
  '왕십리': { competitors: 25, footTraffic: '일 평균 45,000명', avgRent: 250, description: '왕십리역, 비트플렉스 상권' },
  '금호동': { competitors: 12, footTraffic: '일 평균 15,000명', avgRent: 180, description: '금호역, 주거 중심' },
  '옥수동': { competitors: 10, footTraffic: '일 평균 12,000명', avgRent: 170, description: '옥수역, 한강 인접 주거' },
  '행당동': { competitors: 15, footTraffic: '일 평균 20,000명', avgRent: 200, description: '행당역, 주거+상업' },
  '마장동': { competitors: 18, footTraffic: '일 평균 25,000명', avgRent: 190, description: '축산시장, 특화 상권' },
  // 광진구
  '건대입구': { competitors: 35, footTraffic: '일 평균 65,000명', avgRent: 300, description: '건대 먹자골목, 대학가 상권' },
  '구의동': { competitors: 20, footTraffic: '일 평균 30,000명', avgRent: 220, description: '구의역, 테크노마트 인접' },
  '자양동': { competitors: 25, footTraffic: '일 평균 35,000명', avgRent: 250, description: '양꼬치거리, 다국적 맛집' },
  '화양동': { competitors: 30, footTraffic: '일 평균 40,000명', avgRent: 280, description: '건대 앞 카페·술집 밀집' },
  '군자동': { competitors: 15, footTraffic: '일 평균 22,000명', avgRent: 200, description: '어린이대공원 인접, 가족 상권' },
  '중곡동': { competitors: 12, footTraffic: '일 평균 15,000명', avgRent: 170, description: '중곡역, 주거 위주' },
  // 동대문구
  '회기동': { competitors: 22, footTraffic: '일 평균 35,000명', avgRent: 200, description: '경희대 상권, 대학가' },
  '전농동': { competitors: 15, footTraffic: '일 평균 20,000명', avgRent: 180, description: '서울시립대 인근, 주거+대학가' },
  '이문동': { competitors: 18, footTraffic: '일 평균 25,000명', avgRent: 190, description: '한국외대 상권, 학생 유동인구' },
  '장안동': { competitors: 20, footTraffic: '일 평균 28,000명', avgRent: 200, description: '장한평역, 중고차시장 인접' },
  '답십리': { competitors: 16, footTraffic: '일 평균 22,000명', avgRent: 180, description: '답십리역, 주거+상업' },
  '청량리': { competitors: 28, footTraffic: '일 평균 50,000명', avgRent: 250, description: '청량리역 재개발, 유동인구 높음' },
  // 중랑구
  '면목동': { competitors: 18, footTraffic: '일 평균 22,000명', avgRent: 150, description: '면목역 먹자골목, 서민 상권' },
  '상봉동': { competitors: 15, footTraffic: '일 평균 25,000명', avgRent: 170, description: '상봉역 환승, 이마트 인접' },
  '중화동': { competitors: 10, footTraffic: '일 평균 15,000명', avgRent: 140, description: '중화역, 주거 중심' },
  '묵동': { competitors: 8, footTraffic: '일 평균 12,000명', avgRent: 130, description: '묵동, 중랑천 인근 주거' },
  '망우동': { competitors: 8, footTraffic: '일 평균 10,000명', avgRent: 120, description: '망우역, 주거 위주' },
  // 성북구
  '돈암동': { competitors: 20, footTraffic: '일 평균 30,000명', avgRent: 200, description: '성신여대입구역, 대학가 상권' },
  '길음동': { competitors: 18, footTraffic: '일 평균 28,000명', avgRent: 180, description: '길음역, 미아리고개 상권' },
  '정릉동': { competitors: 12, footTraffic: '일 평균 18,000명', avgRent: 160, description: '국민대 인근, 주거+대학가' },
  '안암동': { competitors: 22, footTraffic: '일 평균 35,000명', avgRent: 200, description: '고려대 상권, 대학가 활성' },
  '보문동': { competitors: 10, footTraffic: '일 평균 15,000명', avgRent: 150, description: '보문역, 주거 중심' },
  '장위동': { competitors: 8, footTraffic: '일 평균 12,000명', avgRent: 130, description: '장위뉴타운, 개발 진행중' },
  // 강북구
  '수유동': { competitors: 20, footTraffic: '일 평균 35,000명', avgRent: 180, description: '수유역 상권, 먹자골목 활성' },
  '미아동': { competitors: 18, footTraffic: '일 평균 30,000명', avgRent: 170, description: '미아사거리역, 현대백화점' },
  '번동': { competitors: 10, footTraffic: '일 평균 15,000명', avgRent: 140, description: '북서울꿈의숲 인접' },
  '우이동': { competitors: 8, footTraffic: '일 평균 12,000명', avgRent: 130, description: '우이신설선, 북한산 등산객' },
  '인수동': { competitors: 6, footTraffic: '일 평균 10,000명', avgRent: 120, description: '4.19기념관 인근, 주거 위주' },
  // 도봉구
  '쌍문동': { competitors: 15, footTraffic: '일 평균 22,000명', avgRent: 160, description: '쌍문역, 주거+상업' },
  '방학동': { competitors: 12, footTraffic: '일 평균 18,000명', avgRent: 150, description: '방학역, 주거 중심' },
  '창동': { competitors: 20, footTraffic: '일 평균 30,000명', avgRent: 180, description: '창동역, 플랫폼창동61 문화상권' },
  '도봉동': { competitors: 8, footTraffic: '일 평균 15,000명', avgRent: 130, description: '도봉산 등산객, 주말 유동인구' },
  '노해동': { competitors: 6, footTraffic: '일 평균 8,000명', avgRent: 120, description: '주거 위주, 소규모 상권' },
  // 노원구
  '중계동': { competitors: 22, footTraffic: '일 평균 35,000명', avgRent: 190, description: '은행사거리 학원가, 학생 상권' },
  '상계동': { competitors: 25, footTraffic: '일 평균 40,000명', avgRent: 180, description: '노원역, 대형 상업지구' },
  '하계동': { competitors: 12, footTraffic: '일 평균 18,000명', avgRent: 160, description: '하계역, 주거 중심' },
  '공릉동': { competitors: 15, footTraffic: '일 평균 22,000명', avgRent: 170, description: '서울과학기술대, 대학가' },
  '월계동': { competitors: 12, footTraffic: '일 평균 18,000명', avgRent: 150, description: '광운대역, 대학가+주거' },
  // 은평구
  '연신내': { competitors: 22, footTraffic: '일 평균 35,000명', avgRent: 200, description: '연신내역, 은평 최대 상권' },
  '불광동': { competitors: 15, footTraffic: '일 평균 22,000명', avgRent: 170, description: '불광역, 이마트 인접' },
  '응암동': { competitors: 12, footTraffic: '일 평균 18,000명', avgRent: 160, description: '응암역, 주거 중심' },
  '녹번동': { competitors: 10, footTraffic: '일 평균 15,000명', avgRent: 150, description: '녹번역, 주거+상업' },
  '대조동': { competitors: 8, footTraffic: '일 평균 10,000명', avgRent: 130, description: '불광천 인근, 주거 위주' },
  '진관동': { competitors: 6, footTraffic: '일 평균 8,000명', avgRent: 120, description: '은평한옥마을, 관광+주거' },
  // 서대문구
  '신촌동': { competitors: 35, footTraffic: '일 평균 60,000명', avgRent: 300, description: '신촌역 상권, 대학가 중심' },
  '이화동': { competitors: 20, footTraffic: '일 평균 30,000명', avgRent: 250, description: '이대역, 여성 타겟 상권' },
  '연희동': { competitors: 15, footTraffic: '일 평균 20,000명', avgRent: 220, description: '연희동 카페거리, 트렌디 상권' },
  '홍제동': { competitors: 12, footTraffic: '일 평균 18,000명', avgRent: 170, description: '홍제역, 주거+상업' },
  '충정로': { competitors: 15, footTraffic: '일 평균 25,000명', avgRent: 200, description: '충정로역, 서대문 업무지구' },
  '북아현동': { competitors: 10, footTraffic: '일 평균 15,000명', avgRent: 180, description: '아현역, 이대부속병원 인접' },
  // 마포구
  '홍대앞': { competitors: 50, footTraffic: '일 평균 95,000명', avgRent: 400, description: '홍대 걷고싶은거리, 클럽·맛집 밀집' },
  '합정동': { competitors: 25, footTraffic: '일 평균 40,000명', avgRent: 300, description: '합정역, 메세나폴리스 상권' },
  '망원동': { competitors: 22, footTraffic: '일 평균 30,000명', avgRent: 250, description: '망리단길, 로컬 맛집·카페' },
  '연남동': { competitors: 28, footTraffic: '일 평균 35,000명', avgRent: 280, description: '경의선숲길, 카페·브런치 상권' },
  '상수동': { competitors: 20, footTraffic: '일 평균 25,000명', avgRent: 260, description: '상수역, 카페골목 트렌디' },
  '서교동': { competitors: 30, footTraffic: '일 평균 45,000명', avgRent: 350, description: '홍대 클럽·술집 상권' },
  '공덕동': { competitors: 20, footTraffic: '일 평균 35,000명', avgRent: 250, description: '공덕역, 오피스+주거 복합' },
  '마포동': { competitors: 12, footTraffic: '일 평균 18,000명', avgRent: 200, description: '마포역, 마포나루 인근' },
  // 양천구
  '목동': { competitors: 25, footTraffic: '일 평균 40,000명', avgRent: 250, description: '목동 학원가, 현대백화점 상권' },
  '신정동': { competitors: 15, footTraffic: '일 평균 22,000명', avgRent: 180, description: '오목교역, 주거+상업' },
  '신월동': { competitors: 10, footTraffic: '일 평균 15,000명', avgRent: 150, description: '신정네거리역, 주거 중심' },
  // 강서구
  '마곡동': { competitors: 20, footTraffic: '일 평균 35,000명', avgRent: 250, description: '마곡 산업단지, 직장인 상권' },
  '발산동': { competitors: 18, footTraffic: '일 평균 28,000명', avgRent: 220, description: '발산역, 주거+상업' },
  '화곡동': { competitors: 22, footTraffic: '일 평균 30,000명', avgRent: 180, description: '화곡역, 서민 상권' },
  '등촌동': { competitors: 12, footTraffic: '일 평균 18,000명', avgRent: 170, description: '등촌역, 주거 중심' },
  '공항동': { competitors: 10, footTraffic: '일 평균 15,000명', avgRent: 160, description: '김포공항 인접, 특수 상권' },
  // 구로구
  '구로동': { competitors: 28, footTraffic: '일 평균 50,000명', avgRent: 220, description: 'G밸리 직장인, IT업계 상권' },
  '신도림동': { competitors: 25, footTraffic: '일 평균 45,000명', avgRent: 250, description: '신도림역 디큐브시티, 환승 상권' },
  '고척동': { competitors: 12, footTraffic: '일 평균 18,000명', avgRent: 170, description: '고척스카이돔, 이벤트 수요' },
  '개봉동': { competitors: 10, footTraffic: '일 평균 15,000명', avgRent: 150, description: '개봉역, 주거 중심' },
  '오류동': { competitors: 8, footTraffic: '일 평균 12,000명', avgRent: 130, description: '오류역, 주거 위주' },
  // 금천구
  '가산동': { competitors: 30, footTraffic: '일 평균 55,000명', avgRent: 230, description: '가산디지털단지, 직장인 밀집' },
  '독산동': { competitors: 15, footTraffic: '일 평균 22,000명', avgRent: 170, description: '금천구청역, 주거+상업' },
  '시흥동': { competitors: 10, footTraffic: '일 평균 15,000명', avgRent: 150, description: '시흥사거리, 주거 중심' },
  // 영등포구
  '여의도동': { competitors: 25, footTraffic: '일 평균 60,000명', avgRent: 400, description: '여의도 금융가, 직장인 상권' },
  '영등포동': { competitors: 30, footTraffic: '일 평균 55,000명', avgRent: 280, description: '영등포역, 타임스퀘어 상권' },
  '당산동': { competitors: 20, footTraffic: '일 평균 35,000명', avgRent: 250, description: '당산역, 직장인+주거' },
  '신길동': { competitors: 15, footTraffic: '일 평균 22,000명', avgRent: 190, description: '신길역, 보라매공원 인접' },
  '문래동': { competitors: 18, footTraffic: '일 평균 25,000명', avgRent: 220, description: '문래창작촌, 예술+맛집' },
  '양평동': { competitors: 10, footTraffic: '일 평균 15,000명', avgRent: 180, description: '양평역, 주거+소규모 상업' },
  // 동작구
  '사당동': { competitors: 25, footTraffic: '일 평균 45,000명', avgRent: 220, description: '사당역, 먹자골목 활성' },
  '노량진동': { competitors: 20, footTraffic: '일 평균 30,000명', avgRent: 200, description: '수산시장+학원가, 수험생 상권' },
  '상도동': { competitors: 18, footTraffic: '일 평균 25,000명', avgRent: 190, description: '숭실대 인근, 대학가' },
  '흑석동': { competitors: 15, footTraffic: '일 평균 22,000명', avgRent: 200, description: '중앙대 상권, 대학가' },
  '대방동': { competitors: 12, footTraffic: '일 평균 18,000명', avgRent: 170, description: '대방역, 주거 중심' },
  // 관악구
  '신림동': { competitors: 30, footTraffic: '일 평균 45,000명', avgRent: 200, description: '신림역 먹자골목, 서민 상권' },
  '봉천동': { competitors: 25, footTraffic: '일 평균 40,000명', avgRent: 220, description: '서울대입구역, 샤로수길 상권' },
  '남현동': { competitors: 12, footTraffic: '일 평균 18,000명', avgRent: 180, description: '사당역 인근, 주거+상업' },
  '낙성대': { competitors: 15, footTraffic: '일 평균 22,000명', avgRent: 190, description: '낙성대역, 대학가 인접' },
  '서원동': { competitors: 8, footTraffic: '일 평균 10,000명', avgRent: 150, description: '서울대 후문, 주거 위주' },
};

// 전체 동별 좌표
export const DONG_COORDINATES_ALL: Record<string, DongCoord> = {
  // 강남구
  '역삼동': { lat: 37.5007, lng: 127.0365 },
  '논현동': { lat: 37.5112, lng: 127.0288 },
  '신사동': { lat: 37.5239, lng: 127.0237 },
  '청담동': { lat: 37.5247, lng: 127.0473 },
  '삼성동': { lat: 37.5088, lng: 127.0628 },
  '대치동': { lat: 37.4946, lng: 127.0576 },
  '압구정동': { lat: 37.5273, lng: 127.0284 },
  '도곡동': { lat: 37.4889, lng: 127.0463 },
  '개포동': { lat: 37.4774, lng: 127.0521 },
  '일원동': { lat: 37.4836, lng: 127.0856 },
  // 서초구
  '서초동': { lat: 37.4920, lng: 127.0167 },
  '반포동': { lat: 37.5050, lng: 127.0007 },
  '잠원동': { lat: 37.5150, lng: 127.0100 },
  '방배동': { lat: 37.4830, lng: 126.9920 },
  '양재동': { lat: 37.4720, lng: 127.0370 },
  '내곡동': { lat: 37.4600, lng: 127.0700 },
  // 송파구
  '잠실동': { lat: 37.5130, lng: 127.0850 },
  '신천동': { lat: 37.5110, lng: 127.0770 },
  '문정동': { lat: 37.4850, lng: 127.1220 },
  '가락동': { lat: 37.4960, lng: 127.1180 },
  '방이동': { lat: 37.5130, lng: 127.1130 },
  '송파동': { lat: 37.5050, lng: 127.1050 },
  '석촌동': { lat: 37.5060, lng: 127.0950 },
  // 강동구
  '천호동': { lat: 37.5390, lng: 127.1240 },
  '성내동': { lat: 37.5280, lng: 127.1200 },
  '길동': { lat: 37.5330, lng: 127.1400 },
  '암사동': { lat: 37.5520, lng: 127.1280 },
  '명일동': { lat: 37.5490, lng: 127.1450 },
  '고덕동': { lat: 37.5580, lng: 127.1530 },
  // 종로구
  '종로1가': { lat: 37.5700, lng: 126.9820 },
  '종로2가': { lat: 37.5700, lng: 126.9870 },
  '관철동': { lat: 37.5690, lng: 126.9850 },
  '익선동': { lat: 37.5720, lng: 126.9900 },
  '삼청동': { lat: 37.5830, lng: 126.9810 },
  '북촌': { lat: 37.5820, lng: 126.9850 },
  '혜화동': { lat: 37.5820, lng: 126.9990 },
  '광화문': { lat: 37.5760, lng: 126.9770 },
  // 중구
  '명동': { lat: 37.5630, lng: 126.9860 },
  '충무로': { lat: 37.5610, lng: 126.9940 },
  '을지로': { lat: 37.5660, lng: 126.9920 },
  '남대문': { lat: 37.5590, lng: 126.9780 },
  '동대문': { lat: 37.5670, lng: 127.0090 },
  '약수동': { lat: 37.5550, lng: 127.0070 },
  '신당동': { lat: 37.5610, lng: 127.0080 },
  // 용산구
  '이태원동': { lat: 37.5340, lng: 126.9940 },
  '한남동': { lat: 37.5340, lng: 127.0050 },
  '후암동': { lat: 37.5470, lng: 126.9770 },
  '용산동': { lat: 37.5330, lng: 126.9670 },
  '한강로': { lat: 37.5290, lng: 126.9650 },
  '녹사평': { lat: 37.5340, lng: 126.9870 },
  // 성동구
  '성수동': { lat: 37.5440, lng: 127.0560 },
  '왕십리': { lat: 37.5610, lng: 127.0370 },
  '금호동': { lat: 37.5540, lng: 127.0190 },
  '옥수동': { lat: 37.5430, lng: 127.0170 },
  '행당동': { lat: 37.5570, lng: 127.0370 },
  '마장동': { lat: 37.5650, lng: 127.0420 },
  // 광진구
  '건대입구': { lat: 37.5404, lng: 127.0694 },
  '구의동': { lat: 37.5380, lng: 127.0870 },
  '자양동': { lat: 37.5340, lng: 127.0740 },
  '화양동': { lat: 37.5420, lng: 127.0700 },
  '군자동': { lat: 37.5570, lng: 127.0780 },
  '중곡동': { lat: 37.5630, lng: 127.0820 },
  // 동대문구
  '회기동': { lat: 37.5890, lng: 127.0570 },
  '전농동': { lat: 37.5780, lng: 127.0540 },
  '이문동': { lat: 37.5930, lng: 127.0580 },
  '장안동': { lat: 37.5700, lng: 127.0650 },
  '답십리': { lat: 37.5660, lng: 127.0520 },
  '청량리': { lat: 37.5800, lng: 127.0470 },
  // 중랑구
  '면목동': { lat: 37.5720, lng: 127.0850 },
  '상봉동': { lat: 37.5960, lng: 127.0850 },
  '중화동': { lat: 37.5930, lng: 127.0770 },
  '묵동': { lat: 37.6000, lng: 127.0780 },
  '망우동': { lat: 37.5970, lng: 127.1020 },
  // 성북구
  '돈암동': { lat: 37.5920, lng: 127.0170 },
  '길음동': { lat: 37.6030, lng: 127.0250 },
  '정릉동': { lat: 37.6050, lng: 127.0080 },
  '안암동': { lat: 37.5860, lng: 127.0280 },
  '보문동': { lat: 37.5800, lng: 127.0210 },
  '장위동': { lat: 37.6120, lng: 127.0460 },
  // 강북구
  '수유동': { lat: 37.6370, lng: 127.0250 },
  '미아동': { lat: 37.6210, lng: 127.0280 },
  '번동': { lat: 37.6370, lng: 127.0360 },
  '우이동': { lat: 37.6570, lng: 127.0110 },
  '인수동': { lat: 37.6450, lng: 127.0130 },
  // 도봉구
  '쌍문동': { lat: 37.6480, lng: 127.0340 },
  '방학동': { lat: 37.6590, lng: 127.0440 },
  '창동': { lat: 37.6530, lng: 127.0470 },
  '도봉동': { lat: 37.6670, lng: 127.0430 },
  '노해동': { lat: 37.6550, lng: 127.0510 },
  // 노원구
  '중계동': { lat: 37.6430, lng: 127.0730 },
  '상계동': { lat: 37.6560, lng: 127.0660 },
  '하계동': { lat: 37.6350, lng: 127.0630 },
  '공릉동': { lat: 37.6250, lng: 127.0770 },
  '월계동': { lat: 37.6200, lng: 127.0600 },
  // 은평구
  '연신내': { lat: 37.6190, lng: 126.9210 },
  '불광동': { lat: 37.6110, lng: 126.9310 },
  '응암동': { lat: 37.5990, lng: 126.9210 },
  '녹번동': { lat: 37.6100, lng: 126.9370 },
  '대조동': { lat: 37.6130, lng: 126.9270 },
  '진관동': { lat: 37.6350, lng: 126.9190 },
  // 서대문구
  '신촌동': { lat: 37.5560, lng: 126.9370 },
  '이화동': { lat: 37.5570, lng: 126.9460 },
  '연희동': { lat: 37.5680, lng: 126.9350 },
  '홍제동': { lat: 37.5850, lng: 126.9380 },
  '충정로': { lat: 37.5590, lng: 126.9620 },
  '북아현동': { lat: 37.5600, lng: 126.9540 },
  // 마포구
  '홍대앞': { lat: 37.5563, lng: 126.9236 },
  '합정동': { lat: 37.5500, lng: 126.9140 },
  '망원동': { lat: 37.5560, lng: 126.9080 },
  '연남동': { lat: 37.5660, lng: 126.9260 },
  '상수동': { lat: 37.5480, lng: 126.9220 },
  '서교동': { lat: 37.5520, lng: 126.9210 },
  '공덕동': { lat: 37.5440, lng: 126.9510 },
  '마포동': { lat: 37.5410, lng: 126.9510 },
  // 양천구
  '목동': { lat: 37.5280, lng: 126.8750 },
  '신정동': { lat: 37.5220, lng: 126.8630 },
  '신월동': { lat: 37.5190, lng: 126.8400 },
  // 강서구
  '마곡동': { lat: 37.5590, lng: 126.8310 },
  '발산동': { lat: 37.5480, lng: 126.8420 },
  '화곡동': { lat: 37.5400, lng: 126.8500 },
  '등촌동': { lat: 37.5530, lng: 126.8560 },
  '공항동': { lat: 37.5660, lng: 126.8100 },
  // 구로구
  '구로동': { lat: 37.4850, lng: 126.8830 },
  '신도림동': { lat: 37.5090, lng: 126.8910 },
  '고척동': { lat: 37.5010, lng: 126.8600 },
  '개봉동': { lat: 37.4940, lng: 126.8560 },
  '오류동': { lat: 37.4940, lng: 126.8380 },
  // 금천구
  '가산동': { lat: 37.4780, lng: 126.8830 },
  '독산동': { lat: 37.4710, lng: 126.8950 },
  '시흥동': { lat: 37.4640, lng: 126.9050 },
  // 영등포구
  '여의도동': { lat: 37.5260, lng: 126.9240 },
  '영등포동': { lat: 37.5160, lng: 126.9070 },
  '당산동': { lat: 37.5330, lng: 126.9020 },
  '신길동': { lat: 37.5060, lng: 126.9170 },
  '문래동': { lat: 37.5170, lng: 126.8930 },
  '양평동': { lat: 37.5270, lng: 126.8940 },
  // 동작구
  '사당동': { lat: 37.4830, lng: 126.9810 },
  '노량진동': { lat: 37.5130, lng: 126.9430 },
  '상도동': { lat: 37.4970, lng: 126.9530 },
  '흑석동': { lat: 37.5080, lng: 126.9570 },
  '대방동': { lat: 37.5080, lng: 126.9260 },
  // 관악구
  '신림동': { lat: 37.4840, lng: 126.9290 },
  '봉천동': { lat: 37.4810, lng: 126.9500 },
  '남현동': { lat: 37.4840, lng: 126.9790 },
  '낙성대': { lat: 37.4770, lng: 126.9630 },
  '서원동': { lat: 37.4660, lng: 126.9430 },
};

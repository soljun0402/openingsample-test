import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { formatPriceMan } from '../utils/formatPrice';
import { Button } from './Components';
import {
  ChevronRight, ChevronLeft, Store, MapPin, Ruler, Wallet,
  Coffee, Utensils, ShoppingBag, Scissors, Dumbbell, GraduationCap,
  Beer, Loader2, CheckCircle, User, Sparkles, Calculator,
  Building, TrendingUp, FileText, Brain, Phone, MessageCircle,
  CreditCard, Rocket, HeartHandshake, Clock, Send, ArrowRight,
  BarChart3, Target, Lightbulb, Shield, Wifi, Wine, Bike, Map,
  BookOpen, Box, Hammer, PaintBucket, SignpostBig, SparklesIcon,
  Check, X, AlertTriangle, HelpCircle, ChevronDown, ChevronUp,
  Wind, Flame, ChefHat, Package, Monitor, Truck, Refrigerator, Armchair,
  Users, TrendingDown, Navigation, MapPinned, CircleDollarSign, Eye,
  Briefcase, MoreHorizontal, ImagePlus
} from 'lucide-react';
import { EstimateResultView } from './EstimateResultView';
import { EstimatePDFProps } from './EstimatePDFView';

interface ServiceJourneyViewProps {
  onBack?: () => void;
  isGuestMode?: boolean;
  onProjectCreated?: () => void;
  onLoginRequired?: () => void;
}

interface ProjectManager {
  id: string;
  name: string;
  phone: string;
  profile_image: string;
  specialties: string[];
  introduction: string;
  greeting_message?: string;
  rating: number;
  completed_projects: number;
}

interface Project {
  id: string;
  status: string;
  business_category: string;
  location_dong: string;
  store_size: number;
  estimated_total: number;
  pm_id: string;
  pm?: ProjectManager;
  current_step: number;
}

interface Message {
  id: string;
  sender_type: 'USER' | 'PM' | 'SYSTEM';
  message: string;
  attachments?: { url: string; type: string; name: string }[];
  is_read?: boolean;
  created_at: string;
}

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: any;
  estimatedCost: { min: number; max: number; unit: string };
  isRequired: boolean;
  status: 'done' | 'worry' | 'unchecked';
  comment?: string; // 항목별 메모/코멘트
}

// 업종 카테고리
const BUSINESS_CATEGORIES = [
  { id: 'cafe', label: '카페/디저트', icon: Coffee, color: 'bg-amber-100 text-amber-700' },
  { id: 'restaurant', label: '음식점', icon: Utensils, color: 'bg-orange-100 text-orange-700' },
  { id: 'chicken', label: '치킨/분식', icon: Utensils, color: 'bg-red-100 text-red-700' },
  { id: 'pub', label: '주점/바', icon: Beer, color: 'bg-purple-100 text-purple-700' },
  { id: 'retail', label: '소매/편의점', icon: ShoppingBag, color: 'bg-blue-100 text-blue-700' },
  { id: 'beauty', label: '미용/뷰티', icon: Scissors, color: 'bg-pink-100 text-pink-700' },
  { id: 'fitness', label: '헬스/운동', icon: Dumbbell, color: 'bg-green-100 text-green-700' },
  { id: 'education', label: '교육/학원', icon: GraduationCap, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'pcroom', label: 'PC방/오락시설', icon: Monitor, color: 'bg-cyan-100 text-cyan-700' },
  { id: 'hotel', label: '호텔/숙박', icon: Building, color: 'bg-rose-100 text-rose-700' },
  { id: 'office', label: '사무실', icon: Briefcase, color: 'bg-slate-100 text-slate-700' },
  { id: 'etc', label: '기타', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700' },
];

// 강남구 동 목록 (주요 랜드마크 포함)
const GANGNAM_DONGS = [
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
];

// 매장 규모
const STORE_SIZES = [
  { id: 'small', label: '소형 (10평 이하)', value: 10 },
  { id: 'medium', label: '중형 (15-20평)', value: 17 },
  { id: 'large', label: '대형 (25평 이상)', value: 30 },
];

// 업종별 체크리스트 데이터 - 공통 + 업종별 특화 (중장년층 친화적 설명)
const CHECKLIST_COMMON: Omit<ChecklistItem, 'status'>[] = [
  // 행정
  { id: 'business_reg', category: '행정/서류', title: '사업자등록', description: '세무서에서 발급', icon: FileText, estimatedCost: { min: 0, max: 0, unit: '무료' }, isRequired: true },
  { id: 'contract', category: '행정/서류', title: '임대차 계약', description: '보증금·월세 협상', icon: FileText, estimatedCost: { min: 500, max: 5000, unit: '만원' }, isRequired: true },
  // 공사
  { id: 'interior', category: '인테리어/공사', title: '인테리어 공사', description: '철거·설비·마감 포함', icon: PaintBucket, estimatedCost: { min: 150, max: 400, unit: '평당 만원' }, isRequired: true },
  { id: 'signage', category: '인테리어/공사', title: '간판 설치', description: '외부 간판 제작', icon: SignpostBig, estimatedCost: { min: 200, max: 800, unit: '만원' }, isRequired: true },
  // 세팅
  { id: 'pos_system', category: '장비/세팅', title: 'POS·키오스크', description: '결제 시스템 설치', icon: Monitor, estimatedCost: { min: 50, max: 150, unit: '만원' }, isRequired: true },
  { id: 'cctv', category: '장비/세팅', title: 'CCTV·인터넷', description: '보안 및 통신 설치', icon: Eye, estimatedCost: { min: 50, max: 150, unit: '만원' }, isRequired: true },
  // PM 지원
  { id: 'pm_admin', category: '매니저 지원', title: '인허가·서류 대행', description: '담당 매니저가 행정 절차를 도와드려요', icon: FileText, estimatedCost: { min: 0, max: 0, unit: '매니저 지원' }, isRequired: false },
  { id: 'pm_marketing', category: '매니저 지원', title: '마케팅 세팅', description: '네이버지도·배달앱 등록 대행', icon: Target, estimatedCost: { min: 0, max: 0, unit: '매니저 지원' }, isRequired: false },
];

const CHECKLIST_BY_CATEGORY: Record<string, Omit<ChecklistItem, 'status'>[]> = {
  // 음식점
  restaurant: [
    { id: 'health_cert', category: '행정/서류', title: '보건증·위생교육', description: '보건소 발급 + 위생교육 수료', icon: Shield, estimatedCost: { min: 2, max: 7, unit: '만원' }, isRequired: true },
    { id: 'food_license', category: '행정/서류', title: '영업신고증', description: '구청 위생과에서 발급', icon: BookOpen, estimatedCost: { min: 0, max: 5, unit: '만원' }, isRequired: true },
    { id: 'kitchen_equip', category: '장비/세팅', title: '주방 장비', description: '가스레인지·싱크대·냉장고', icon: ChefHat, estimatedCost: { min: 500, max: 1500, unit: '만원' }, isRequired: true },
    { id: 'furniture', category: '장비/세팅', title: '테이블·의자', description: '홀 가구 구매', icon: Armchair, estimatedCost: { min: 200, max: 600, unit: '만원' }, isRequired: true },
  ],

  // 치킨/분식
  chicken: [
    { id: 'health_cert', category: '행정/서류', title: '보건증·위생교육', description: '보건소 발급 + 위생교육 수료', icon: Shield, estimatedCost: { min: 2, max: 7, unit: '만원' }, isRequired: true },
    { id: 'food_license', category: '행정/서류', title: '영업신고증', description: '구청 위생과에서 발급', icon: BookOpen, estimatedCost: { min: 0, max: 5, unit: '만원' }, isRequired: true },
    { id: 'fryer', category: '장비/세팅', title: '튀김기·냉동고', description: '업소용 튀김기 + 대형 냉동고', icon: ChefHat, estimatedCost: { min: 300, max: 900, unit: '만원' }, isRequired: true },
    { id: 'delivery_app', category: '장비/세팅', title: '배달앱 등록', description: '배민·쿠팡이츠·요기요', icon: Bike, estimatedCost: { min: 0, max: 50, unit: '만원' }, isRequired: true },
  ],

  // 카페
  cafe: [
    { id: 'health_cert', category: '행정/서류', title: '보건증·위생교육', description: '보건소 발급 + 위생교육 수료', icon: Shield, estimatedCost: { min: 2, max: 7, unit: '만원' }, isRequired: true },
    { id: 'food_license', category: '행정/서류', title: '휴게음식점 신고', description: '구청 위생과에서 발급', icon: BookOpen, estimatedCost: { min: 0, max: 5, unit: '만원' }, isRequired: true },
    { id: 'espresso_machine', category: '장비/세팅', title: '커피머신·분쇄기', description: '에스프레소 머신 + 그라인더', icon: Coffee, estimatedCost: { min: 600, max: 3500, unit: '만원' }, isRequired: true },
    { id: 'furniture', category: '장비/세팅', title: '테이블·의자', description: '카페 분위기 가구', icon: Armchair, estimatedCost: { min: 200, max: 800, unit: '만원' }, isRequired: true },
  ],

  // 주점/바
  pub: [
    { id: 'health_cert', category: '행정/서류', title: '보건증·위생교육', description: '보건소 발급 + 위생교육 수료', icon: Shield, estimatedCost: { min: 2, max: 7, unit: '만원' }, isRequired: true },
    { id: 'food_license', category: '행정/서류', title: '일반음식점 신고', description: '술 판매 시 필수', icon: BookOpen, estimatedCost: { min: 0, max: 5, unit: '만원' }, isRequired: true },
    { id: 'refrigerator', category: '장비/세팅', title: '냉장고·제빙기', description: '음료 보관 + 얼음 제조', icon: Refrigerator, estimatedCost: { min: 200, max: 500, unit: '만원' }, isRequired: true },
    { id: 'furniture', category: '장비/세팅', title: '테이블·바 가구', description: '홀 + 바 테이블', icon: Armchair, estimatedCost: { min: 300, max: 1000, unit: '만원' }, isRequired: true },
  ],

  // 소매/편의점
  retail: [
    { id: 'retail_license', category: '행정/서류', title: '소매업 신고', description: '구청에 신고 필요', icon: BookOpen, estimatedCost: { min: 0, max: 10, unit: '만원' }, isRequired: true },
    { id: 'display_shelf', category: '장비/세팅', title: '진열대·냉장고', description: '선반 + 냉장 진열장', icon: Box, estimatedCost: { min: 500, max: 1800, unit: '만원' }, isRequired: true },
    { id: 'counter', category: '장비/세팅', title: '계산대·POS', description: '결제 시스템 설치', icon: Store, estimatedCost: { min: 100, max: 300, unit: '만원' }, isRequired: true },
  ],

  // 미용/뷰티
  beauty: [
    { id: 'beauty_license', category: '행정/서류', title: '미용사 자격증·신고', description: '자격증 + 구청 미용업 신고', icon: BookOpen, estimatedCost: { min: 0, max: 5, unit: '만원' }, isRequired: true },
    { id: 'plumbing', category: '인테리어/공사', title: '샴푸대 배관 공사', description: '수도·배수 시설 설치', icon: Store, estimatedCost: { min: 100, max: 300, unit: '만원' }, isRequired: true },
    { id: 'beauty_chair', category: '장비/세팅', title: '미용 의자·거울·샴푸대', description: '의자 + 거울 + 샴푸대 세트', icon: Armchair, estimatedCost: { min: 500, max: 1400, unit: '만원' }, isRequired: true },
    { id: 'beauty_tools', category: '장비/세팅', title: '미용 도구·재료', description: '드라이기·고데기·염색 도구', icon: Scissors, estimatedCost: { min: 100, max: 400, unit: '만원' }, isRequired: true },
  ],

  // 헬스/운동
  fitness: [
    { id: 'sports_permit', category: '행정/서류', title: '체육시설업 신고', description: '구청 체육과 신고', icon: BookOpen, estimatedCost: { min: 0, max: 10, unit: '만원' }, isRequired: true },
    { id: 'gym_equip', category: '장비/세팅', title: '운동 기구', description: '러닝머신·자전거·역기 등', icon: Dumbbell, estimatedCost: { min: 1000, max: 5000, unit: '만원' }, isRequired: true },
    { id: 'shower_room', category: '인테리어/공사', title: '샤워실·탈의실', description: '샤워부스 + 락커', icon: Store, estimatedCost: { min: 300, max: 800, unit: '만원' }, isRequired: true },
  ],

  // 교육/학원
  education: [
    { id: 'academy_reg', category: '행정/서류', title: '학원 등록', description: '교육청 등록 필수', icon: BookOpen, estimatedCost: { min: 0, max: 20, unit: '만원' }, isRequired: true },
    { id: 'desk_chair', category: '장비/세팅', title: '책상·의자·칠판', description: '학생용 가구 일체', icon: Armchair, estimatedCost: { min: 200, max: 600, unit: '만원' }, isRequired: true },
    { id: 'teacher_hire', category: '장비/세팅', title: '강사 채용', description: '과목별 강사 필요', icon: Users, estimatedCost: { min: 0, max: 0, unit: '인건비' }, isRequired: true },
  ],

  // 사무실
  office: [
    { id: 'office_furniture', category: '장비/세팅', title: '사무용 가구', description: '책상·의자·서류함', icon: Armchair, estimatedCost: { min: 200, max: 800, unit: '만원' }, isRequired: true },
  ],

  // PC방
  pcroom: [
    { id: 'game_biz_reg', category: '행정/서류', title: '게임제공업 등록', description: '구청 등록 + 청소년보호 교육', icon: BookOpen, estimatedCost: { min: 0, max: 15, unit: '만원' }, isRequired: true },
    { id: 'pc_setup', category: '장비/세팅', title: '컴퓨터·모니터', description: '고성능 PC + 주변기기', icon: Monitor, estimatedCost: { min: 5000, max: 10000, unit: '만원' }, isRequired: true },
    { id: 'gaming_chair', category: '장비/세팅', title: '의자·책상', description: '게이밍 의자 + PC방 책상', icon: Armchair, estimatedCost: { min: 500, max: 1500, unit: '만원' }, isRequired: true },
  ],

  // 호텔/숙박
  hotel: [
    { id: 'hotel_biz_reg', category: '행정/서류', title: '숙박업 등록', description: '구청 등록 + 소방검사', icon: BookOpen, estimatedCost: { min: 10, max: 50, unit: '만원' }, isRequired: true },
    { id: 'room_furniture', category: '장비/세팅', title: '객실 가구·침구', description: '침대·이불·TV 등', icon: Armchair, estimatedCost: { min: 100, max: 300, unit: '객실당 만원' }, isRequired: true },
    { id: 'front_system', category: '장비/세팅', title: '예약 관리', description: '예약 시스템 + 도어락', icon: Monitor, estimatedCost: { min: 100, max: 500, unit: '만원' }, isRequired: true },
  ],

  // 기타
  etc: [
    { id: 'license', category: '행정/서류', title: '인허가 확인', description: '필요한 허가 확인', icon: BookOpen, estimatedCost: { min: 0, max: 20, unit: '만원' }, isRequired: true },
    { id: 'equipment', category: '장비/세팅', title: '필요 장비', description: '업종별 필수 장비', icon: Box, estimatedCost: { min: 500, max: 2000, unit: '만원' }, isRequired: true },
  ],
};

// 업종 ID -> 체크리스트 매핑 (공통 + 업종별)
const getChecklistForCategory = (categoryId: string): Omit<ChecklistItem, 'status'>[] => {
  const specificItems = CHECKLIST_BY_CATEGORY[categoryId] || CHECKLIST_BY_CATEGORY.etc;
  // 공통 항목 + 업종별 특화 항목 합치기
  return [...CHECKLIST_COMMON, ...specificItems];
};

// 동별 상권 정보
const DONG_INFO: Record<string, { competitors: number; footTraffic: string; avgRent: number; description: string }> = {
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
};

// 단계 정의
const JOURNEY_STEPS = [
  { step: 1, title: '업종 선택', description: '어떤 창업을 준비하시나요?' },
  { step: 2, title: '위치 선택', description: '창업 예정 지역을 선택하세요' },
  { step: 3, title: '상권 분석', description: '선택한 지역의 상권을 분석합니다' },
  { step: 4, title: '매장 규모', description: '예상 평수를 입력하세요' },
  { step: 5, title: '준비 체크리스트', description: '현재 상황을 체크해주세요' },
  { step: 6, title: '예상 비용', description: '창업 비용을 확인하세요' },
  { step: 7, title: '매니저 배정', description: '전담 매니저가 배정됩니다' },
];

// 동별 카카오맵 좌표
const DONG_COORDINATES: Record<string, { lat: number; lng: number }> = {
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
};

// 단계별 색상 테마
const STEP_COLORS: Record<number, { bg: string; text: string; accent: string }> = {
  7: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600', accent: 'bg-blue-100' },
  8: { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600', accent: 'bg-purple-100' },
  9: { bg: 'from-orange-500 to-orange-600', text: 'text-orange-600', accent: 'bg-orange-100' },
  10: { bg: 'from-yellow-500 to-yellow-600', text: 'text-yellow-600', accent: 'bg-yellow-100' },
  11: { bg: 'from-green-500 to-green-600', text: 'text-green-600', accent: 'bg-green-100' },
  12: { bg: 'from-slate-500 to-slate-600', text: 'text-slate-600', accent: 'bg-slate-100' },
};

const PM_STEP_LABELS: Record<number, string> = {
  7: '상담 시작',
  8: '비용 견적',
  9: '계약/시작',
  10: '진행중',
  11: '오픈 완료',
  12: '사후관리'
};

export const ServiceJourneyView: React.FC<ServiceJourneyViewProps> = ({ onBack, isGuestMode = false, onProjectCreated, onLoginRequired }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(!isGuestMode); // 게스트 모드는 로딩 없음
  const [project, setProject] = useState<Project | null>(null);

  // 단계 변경 알림
  const [showStepToast, setShowStepToast] = useState(false);
  const [lastSeenStep, setLastSeenStep] = useState<number | null>(null);

  // 폼 데이터
  const [businessCategory, setBusinessCategory] = useState('');
  const [hasRealEstateContract, setHasRealEstateContract] = useState<boolean | null>(null);
  const [dong, setDong] = useState('');
  const [storeSize, setStoreSize] = useState(15);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [pmMessage, setPmMessage] = useState('');

  // 업종 선택 시 체크리스트 초기화
  useEffect(() => {
    if (businessCategory) {
      const items = getChecklistForCategory(businessCategory);
      setChecklist(items.map(item => ({ ...item, status: 'unchecked' as const })));
    }
  }, [businessCategory]);

  // 결과 데이터
  const [estimatedCosts, setEstimatedCosts] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [assignedPM, setAssignedPM] = useState<ProjectManager | null>(null);

  // 견적 결과 보기 (PDF)
  const [estimateResult, setEstimateResult] = useState<EstimatePDFProps | null>(null);


  // 채팅
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const touchStartRef = useRef<number>(0);
  const msgChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const projChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastSeenStepRef = useRef<number | null>(null);

  // UI 상태
  const [showOnboarding, setShowOnboarding] = useState(() => !sessionStorage.getItem('onboarding_seen'));
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);

  // Keep lastSeenStepRef in sync to avoid stale closures in realtime callback
  useEffect(() => {
    lastSeenStepRef.current = lastSeenStep;
  }, [lastSeenStep]);

  // 기존 프로젝트 로드 (게스트 모드가 아닐 때만)
  useEffect(() => {
    if (!isGuestMode) {
      loadExistingProject();
    }

    // Cleanup realtime subscriptions on unmount
    return () => {
      if (msgChannelRef.current) {
        supabase.removeChannel(msgChannelRef.current);
        msgChannelRef.current = null;
      }
      if (projChannelRef.current) {
        supabase.removeChannel(projChannelRef.current);
        projChannelRef.current = null;
      }
    };
  }, [isGuestMode]);

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 비용 계산
  useEffect(() => {
    calculateCosts();
  }, [checklist, storeSize]);

  const loadExistingProject = async () => {
    setLoading(true);

    // 현재 유저의 프로젝트만 조회
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { setLoading(false); return; }
    const { data: projects } = await supabase
      .from('startup_projects')
      .select(`
        *,
        pm:project_managers(*)
      `)
      .eq('user_id', authUser.id)
      .in('status', ['DRAFT', 'PENDING_PM', 'PM_ASSIGNED', 'IN_PROGRESS', 'PAYMENT_PENDING', 'ACTIVE', 'POST_SERVICE'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (projects && projects.length > 0) {
      const proj = projects[0];
      setProject(proj);
      setCurrentStep(proj.current_step || 6);
      setBusinessCategory(proj.business_category);
      setDong(proj.location_dong);
      setStoreSize(proj.store_size);
      setEstimatedCosts({ min: (proj.estimated_total / 10000) * 0.8, max: (proj.estimated_total / 10000) * 1.2 });

      // 단계 변경 감지 및 토스트 표시
      const savedStep = localStorage.getItem(`project_${proj.id}_step`);
      if (savedStep && parseInt(savedStep) !== proj.current_step && proj.current_step >= 7) {
        setShowStepToast(true);
        setTimeout(() => setShowStepToast(false), 4000);
      }
      localStorage.setItem(`project_${proj.id}_step`, String(proj.current_step));
      setLastSeenStep(proj.current_step);

      if (proj.pm) {
        setAssignedPM(proj.pm);
      }

      loadMessages(proj.id);
      subscribeToMessages(proj.id);
      subscribeToProjectUpdates(proj.id);
    }

    setLoading(false);
  };

  // 프로젝트 변경사항 실시간 구독
  const subscribeToProjectUpdates = (projectId: string) => {
    if (projChannelRef.current) {
      supabase.removeChannel(projChannelRef.current);
    }
    const channel = supabase
      .channel(`project-updates-${projectId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'startup_projects',
        filter: `id=eq.${projectId}`
      }, (payload: any) => {
        const newStep = payload.new.current_step;
        const prevStep = lastSeenStepRef.current;

        if (newStep !== prevStep && newStep >= 7) {
          setCurrentStep(newStep);
          setLastSeenStep(newStep);
          setShowStepToast(true);
          localStorage.setItem(`project_${projectId}_step`, String(newStep));
          setTimeout(() => setShowStepToast(false), 4000);
        }
      })
      .subscribe();
    projChannelRef.current = channel;
  };

  const loadMessages = async (projectId: string) => {
    const { data } = await supabase
      .from('project_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');

    if (data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = (projectId: string) => {
    if (msgChannelRef.current) {
      supabase.removeChannel(msgChannelRef.current);
    }
    const channel = supabase
      .channel(`project-${projectId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'project_messages',
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();
    msgChannelRef.current = channel;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;

    const messageText = newMessage.trim();
    setSending(true);

    // 게스트 모드: 로컬 상태로만 처리
    if (isGuestMode) {
      const guestMessage: Message = {
        id: `guest-msg-${Date.now()}`,
        sender_type: 'USER',
        message: messageText || '📷 이미지',
        attachments: imagePreview ? [{ url: imagePreview, type: 'image', name: 'preview' }] : undefined,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, guestMessage]);

      // 게스트 모드에서 PM 자동 응답 시뮬레이션
      setTimeout(() => {
        const pmResponse: Message = {
          id: `guest-pm-${Date.now()}`,
          sender_type: 'PM',
          message: '안녕하세요. 게스트 모드에서는 메시지 기능을 체험해보실 수 있습니다. 실제 PM과 상담을 원하시면 회원가입 후 이용해주세요.',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, pmResponse]);
      }, 1000);

      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      setSending(false);
      return;
    }

    // 실제 사용자: DB에 저장
    if (!project?.id) {
      setSending(false);
      return;
    }

    try {
      let attachments: { url: string; type: string; name: string }[] | undefined;

      // 이미지 업로드 처리
      if (selectedImage) {
        setUploadingImage(true);
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${project.id}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, selectedImage);

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('chat-images')
            .getPublicUrl(fileName);

          attachments = [{
            url: urlData.publicUrl,
            type: selectedImage.type,
            name: selectedImage.name
          }];
        }
        setUploadingImage(false);
      }

      const { data, error } = await supabase.from('project_messages').insert({
        project_id: project.id,
        sender_type: 'USER',
        message: messageText || '📷 이미지',
        attachments: attachments || null
      }).select().single();

      if (error) {
        console.error('메시지 전송 오류:', error);
        // 에러가 있어도 UI에 메시지를 즉시 표시 (낙관적 업데이트)
        const tempMessage: Message = {
          id: `temp-${Date.now()}`,
          sender_type: 'USER',
          message: messageText || '📷 이미지',
          attachments: attachments,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMessage]);
      } else if (data) {
        // Realtime이 작동하지 않을 경우를 대비해 직접 추가
        setMessages(prev => {
          const exists = prev.some(m => m.id === data.id);
          if (exists) return prev;
          return [...prev, data];
        });
      }
    } catch (err) {
      console.error('메시지 전송 실패:', err);
    }

    setNewMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    setSending(false);
  };

  // 이미지 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지는 5MB 이하만 업로드 가능합니다.');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const cancelImageUpload = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 프로젝트 취소
  const cancelProject = async () => {
    // 게스트 모드: 로컬 상태만 초기화
    if (isGuestMode) {
      setProject(null);
      setAssignedPM(null);
      setCurrentStep(1);
      setBusinessCategory('');
      setDong('');
      setStoreSize(15);
      setChecklist([]);
      setMessages([]);
      setShowCancelDialog(false);
      if (onBack) onBack();
      return;
    }

    // 실제 사용자: DB 업데이트
    if (!project?.id) return;

    try {
      await Promise.all([
        supabase
          .from('startup_projects')
          .update({ status: 'CANCELLED' })
          .eq('id', project.id),
        supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('project_id', project.id),
      ]);

      await supabase.from('project_messages').insert({
        project_id: project.id,
        sender_type: 'SYSTEM',
        message: '프로젝트가 취소되었습니다.'
      });

      setProject(null);
      setAssignedPM(null);
      setCurrentStep(1);
      setBusinessCategory('');
      setDong('');
      setStoreSize(15);
      setChecklist([]);
      setMessages([]);
      setShowCancelDialog(false);
    } catch (err) {
      console.error('프로젝트 취소 실패:', err);
    }
  };

  // 온보딩 애니메이션 시작
  const startOnboarding = () => {
    setShowOnboarding(true);
    setOnboardingStep(0);
  };

  // 온보딩 완료 후 실제 시작
  const completeOnboarding = () => {
    sessionStorage.setItem('onboarding_seen', '1');
    setShowOnboarding(false);
    setCurrentStep(1);
  };


  const calculateCosts = () => {
    let minTotal = 0;
    let maxTotal = 0;

    checklist.forEach(item => {
      if (item.status !== 'done') {
        const isPerPyung = item.estimatedCost.unit.includes('평당');
        const multiplier = isPerPyung ? storeSize : 1;
        minTotal += item.estimatedCost.min * multiplier;
        maxTotal += item.estimatedCost.max * multiplier;
      }
    });

    // 기본 비용 추가 (보증금, 권리금 예상)
    const depositMin = storeSize * 300; // 평당 300만원
    const depositMax = storeSize * 800; // 평당 800만원
    minTotal += depositMin;
    maxTotal += depositMax;

    setEstimatedCosts({ min: minTotal, max: maxTotal });
  };

  const toggleChecklistItem = (itemId: string, newStatus: 'done' | 'worry' | 'unchecked') => {
    setChecklist(prev => prev.map(item =>
      item.id === itemId ? { ...item, status: newStatus } : item
    ));
  };

  // PM 배정
  const assignPM = async () => {
    const { data: pms } = await supabase
      .from('project_managers')
      .select('*')
      .eq('is_available', true);

    if (pms && pms.length > 0) {
      const randomPM = pms[Math.floor(Math.random() * pms.length)];
      setAssignedPM(randomPM);
      return randomPM;
    }
    return null;
  };

  // 프로젝트 생성 (PENDING_PM 상태로 저장)
  const createProject = async () => {
    // 이미 프로젝트가 존재하면 중복 생성 방지
    if (project?.id) {
      console.log('[ServiceJourney] 이미 프로젝트 존재:', project.id);
      if (onProjectCreated) onProjectCreated();
      return;
    }

    setLoading(true);

    const worryItems = checklist.filter(i => i.status === 'worry').map(i => i.title);
    const doneItems = checklist.filter(i => i.status === 'done').map(i => i.title);
    const category = BUSINESS_CATEGORIES.find(c => c.id === businessCategory);

    // 시스템 메시지 준비
    let systemMsg = `📋 프로젝트 요약\n\n`;
    systemMsg += `• 업종: ${category?.label}\n`;
    systemMsg += `• 위치: 강남구 ${dong}\n`;
    systemMsg += `• 규모: ${storeSize}평\n`;
    systemMsg += `• 예상 비용: ${formatPriceMan(estimatedCosts.min)} ~ ${formatPriceMan(estimatedCosts.max)}원\n\n`;
    if (doneItems.length > 0) systemMsg += `✅ 이미 준비됨: ${doneItems.join(', ')}\n`;
    if (worryItems.length > 0) systemMsg += `⚠️ 도움 필요: ${worryItems.join(', ')}\n`;

    const checklistData = checklist.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      status: item.status
    }));

    // 게스트 모드: 로그인 필요 → localStorage에 데이터 저장 후 로그인 페이지로
    // localStorage는 탭을 닫거나 새 탭에서도 유지됨 (sessionStorage는 탭 종속)
    if (isGuestMode) {
      const pendingData = {
        businessCategory,
        dong,
        storeSize,
        estimatedTotal: ((estimatedCosts.min + estimatedCosts.max) / 2) * 10000,
        checklistData,
        systemMessage: systemMsg,
        pmMessage: pmMessage.trim() || null
      };
      localStorage.setItem('pending_project_data', JSON.stringify(pendingData));
      setLoading(false);
      if (onLoginRequired) onLoginRequired();
      return;
    }

    // 인증된 사용자: PENDING_PM 상태로 프로젝트 생성 (PM 미배정)
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      alert('로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.');
      setLoading(false);
      if (onLoginRequired) onLoginRequired();
      return;
    }

    const { data: newProject, error: insertError } = await supabase
      .from('startup_projects')
      .insert([{
        user_id: authUser.id,
        business_category: businessCategory,
        location_city: '서울시',
        location_district: '강남구',
        location_dong: dong,
        store_size: storeSize,
        estimated_total: ((estimatedCosts.min + estimatedCosts.max) / 2) * 10000,
        current_step: 6,
        status: 'PENDING_PM',
        checklist_data: checklistData
      }])
      .select()
      .single();

    if (insertError || !newProject) {
      console.error('Project creation failed:', insertError);
      alert('프로젝트 생성에 실패했습니다. 다시 시도해주세요.');
      setLoading(false);
      return;
    }

    await supabase.from('project_messages').insert({
      project_id: newProject.id,
      sender_type: 'SYSTEM',
      message: systemMsg
    });

    if (pmMessage.trim()) {
      await supabase.from('project_messages').insert({
        project_id: newProject.id,
        sender_type: 'USER',
        message: pmMessage.trim()
      });
    }

    setProject(newProject);
    if (onProjectCreated) onProjectCreated();
    setLoading(false);
  };

  const goToNextStep = () => {
    if (currentStep === 6) {
      // 마지막 단계에서 결과 보기 (게스트 모드일 경우 PDF 생성)
      if (isGuestMode) {
        setEstimateResult({
          customerName: "예비 창업자",
          totalCostRange: estimatedCosts,
          locationData: {
            region: `서울시 강남구 ${dong}`,
            analysis: [
              { label: "주요 타겟", value: "20-30대 직장인/주거" }, // Mock data
              { label: "유동 인구", value: DONG_INFO[dong]?.footTraffic || "정보 없음" },
              { label: "경쟁 점포", value: `${DONG_INFO[dong]?.competitors || 0}개 (반경 500m)` },
            ]
          },
          costBreakdown: [
            { label: "보증금 및 권리금", min: storeSize * 300 * 10000, max: storeSize * 800 * 10000 },
            ...checklist.filter(i => i.estimatedCost.max > 0).map(item => {
              const isPerPyung = item.estimatedCost.unit.includes('평당');
              const multiplier = isPerPyung ? storeSize : 1;
              return {
                label: item.title,
                min: item.estimatedCost.min * multiplier * 10000,
                max: item.estimatedCost.max * multiplier * 10000
              };
            })
          ],
          checklist: {
            readyCount: checklist.filter(i => i.status === 'done').length,
            worryCount: checklist.filter(i => i.status === 'worry').length,
            worryItems: checklist.filter(i => i.status === 'worry').map(i => i.title),
            readyItems: checklist.filter(i => i.status === 'done').map(i => i.title)
          },
          projectName: `${dong} ${BUSINESS_CATEGORIES.find(c => c.id === businessCategory)?.label || '매장'} 창업`
        });
      } else {
        createProject();
      }
    } else if (currentStep === 1 && hasRealEstateContract === true) {
      // 부동산 계약 완료 → 위치 선택은 하되, 상권 분석은 건너뛰고 매장 규모로
      setCurrentStep(3); // Step 2 (위치) -> Step 3 (상권) X -> Step 2 -> Step 4? 
      // Original logic was: Step 1 -> Step 2. Then in Step 2 -> Step 4 if contract exists.
      // Wait, let's keep original flow: Step 1 -> Step 2 always. 
      // The skipping happens AT Step 2 next click.
      setCurrentStep(2);
    } else if (currentStep === 2 && hasRealEstateContract === true) {
      // 부동산 계약 완료 → 상권 분석(Step 3) 건너뛰고 매장 규모(Step 4)로
      setCurrentStep(4);
    } else {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const goToPrevStep = () => {
    if (currentStep === 4 && hasRealEstateContract === true) {
      // 매장 규모에서 뒤로 가면 위치 선택으로
      setCurrentStep(2);
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return businessCategory !== '' && hasRealEstateContract !== null;
      case 2: return dong !== '';
      case 3: return true;
      case 4: return storeSize > 0;
      case 5: return true;
      case 6: return true;
      default: return true;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-brand-600 mx-auto mb-4" size={40} />
          <p className="text-gray-500">프로젝트 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 온보딩 슬라이드 데이터
  const ONBOARDING_SLIDES = [
    { image: '/onboarding-1.png', title: '업종을 선택하세요', desc: '치킨, 카페, 주점 등\n원하는 업종을 간편하게 선택' },
    { image: '/onboarding-2.png', title: '무료 입지 분석', desc: '원하는 지역의 상권, 유동인구\n경쟁점포를 무료로 분석해드려요' },
    { image: '/onboarding-3.png', title: '예상 비용을 확인하세요', desc: '체크리스트로 필요한 항목을 파악하고\n항목별 예상 비용을 미리 확인하세요' },
    { image: '/onboarding-4.png', title: '전담 매니저 + 상세 보고서', desc: '전담 매니저가 배정되고\n비용 분석 보고서를 받아보세요' },
  ];

  // 서비스 안내 페이지 (슬라이드형)
  if (showOnboarding) {
    const slide = ONBOARDING_SLIDES[onboardingStep];
    const isLast = onboardingStep === ONBOARDING_SLIDES.length - 1;

    return (
      <div
        className="fixed inset-0 z-[60] bg-white flex flex-col overflow-hidden"
        onTouchStart={(e) => { touchStartRef.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const delta = e.changedTouches[0].clientX - touchStartRef.current;
          if (delta < -50 && onboardingStep < ONBOARDING_SLIDES.length - 1) {
            setOnboardingStep(prev => prev + 1);
          }
          if (delta > 50 && onboardingStep > 0) {
            setOnboardingStep(prev => prev - 1);
          }
        }}
      >
        <style>{`
          @keyframes slide-fade-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>

        {/* 상단바 */}
        <div className="pt-[max(env(safe-area-inset-top),12px)] px-5 flex justify-end items-center shrink-0">
          <button
            onClick={completeOnboarding}
            className="text-sm text-slate-400 font-medium py-3 px-1 active:text-slate-600"
          >
            건너뛰기
          </button>
        </div>

        {/* 일러스트 영역 (상단 절반) */}
        <div className="flex-1 flex items-end justify-center pb-6">
          <div
            key={`img-${onboardingStep}`}
            style={{ animation: 'slide-fade-in 0.35s ease-out' }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="max-w-[280px] max-h-[280px] w-auto h-auto mx-auto"
            />
          </div>
        </div>

        {/* 텍스트 영역 (하단 절반) */}
        <div className="flex-1 flex flex-col px-8">
          <div
            key={`txt-${onboardingStep}`}
            className="pt-4"
            style={{ animation: 'slide-fade-in 0.35s ease-out 0.05s both' }}
          >
            <h2 className="text-[22px] font-black text-slate-900 text-center leading-tight mb-3">
              {slide.title}
            </h2>
            <p className="text-[15px] text-slate-400 text-center leading-relaxed whitespace-pre-line">
              {slide.desc}
            </p>
          </div>
        </div>

        {/* 하단: 인디케이터 + 버튼 */}
        <div className="px-6 shrink-0" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
          <div className="flex justify-center gap-2 mb-5">
            {ONBOARDING_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setOnboardingStep(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === onboardingStep ? 'w-6 bg-brand-500' : 'w-1.5 bg-slate-200'
                  }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (isLast) {
                completeOnboarding();
              } else {
                setOnboardingStep(prev => prev + 1);
              }
            }}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-2xl active:scale-[0.97] transition-all text-base"
          >
            {isLast ? '시작하기' : '다음'}
          </button>

          {onboardingStep === 0 && (
            <button
              onClick={() => { if (onBack) onBack(); }}
              className="w-full mt-2 text-slate-400 text-sm font-medium py-2 active:text-slate-600"
            >
              다음에 할게요
            </button>
          )}
        </div>
      </div>
    );
  }

  // 취소 확인 다이얼로그
  const CancelDialog = () => {
    const hasExistingProject = !!project?.id;

    const handleCancel = () => {
      if (hasExistingProject) {
        cancelProject();
      } else {
        // 프로젝트가 없으면 그냥 초기화하고 뒤로가기
        setShowCancelDialog(false);
        setCurrentStep(1);
        setBusinessCategory('');
        setDong('');
        setStoreSize(15);
        setChecklist([]);
        if (onBack) onBack();
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-sm p-6 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-center mb-2">
            {hasExistingProject ? '프로젝트를 취소할까요?' : '창업 상담을 종료할까요?'}
          </h3>
          <p className="text-gray-500 text-center text-sm mb-6">
            {hasExistingProject
              ? '취소하면 현재까지의 진행 상황이 모두 삭제됩니다. 이 작업은 되돌릴 수 없습니다.'
              : '현재까지 입력한 내용이 사라집니다.'}
          </p>
          <div className="space-y-2">
            <button
              onClick={handleCancel}
              className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
            >
              {hasExistingProject ? '프로젝트 취소' : '종료하기'}
            </button>
            <button
              onClick={() => setShowCancelDialog(false)}
              className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              계속 진행하기
            </button>
          </div>
        </div>
      </div>
    );
  };

  // PM 배정 후 화면 (Step 7+)
  const stepColor = STEP_COLORS[currentStep] || STEP_COLORS[7];
  const pmStepNumber = currentStep >= 7 ? currentStep - 6 : 1;

  if (currentStep >= 7 && assignedPM) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {showCancelDialog && <CancelDialog />}

        {/* 단계 변경 토스트 알림 */}
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${showStepToast
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
        >
          <div className={`bg-gradient-to-r ${stepColor.bg} text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3`}>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black text-lg">
              {pmStepNumber}
            </div>
            <div>
              <p className="text-white/80 text-xs font-bold">단계가 변경되었습니다</p>
              <p className="font-bold text-lg">{PM_STEP_LABELS[currentStep]}</p>
            </div>
          </div>
        </div>

        {/* 깔끔한 헤더 + 단계별 색상 */}
        <div className={`bg-gradient-to-r ${stepColor.bg} text-white px-4 py-3`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCancelDialog(true)}
              className="p-2 -ml-2 hover:bg-white/10 rounded-full"
            >
              <X size={20} className="text-white/80" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg truncate">내 창업 프로젝트</h1>
              <p className="text-xs text-white/70">
                강남구 {dong} · {BUSINESS_CATEGORIES.find(c => c.id === businessCategory)?.label} · {storeSize}평
              </p>
            </div>
            <img src="/favicon-new.png" alt="오프닝" className="w-10 h-10 rounded-xl bg-white/20 p-1" />
          </div>

          {/* PM 진행 단계 표시 (6단계) */}
          <div className="mt-4 pt-3 border-t border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">{PM_STEP_LABELS[currentStep]}</span>
              <span className="text-xs text-white/70">{pmStepNumber}/6 단계</span>
            </div>
            <div className="flex gap-1.5">
              {[7, 8, 9, 10, 11, 12].map(step => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-all ${step <= currentStep ? 'bg-white' : 'bg-white/30'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* PM 카드 */}
        <div className="p-4">
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <div className="flex items-center gap-4">
              <img
                src={assignedPM.profile_image || '/favicon-new.png'}
                alt={assignedPM.name}
                className="w-16 h-16 rounded-full border-2 border-brand-100 object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg">{assignedPM.name}</span>
                  <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-bold">담당 매니저</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  ⭐ {assignedPM.rating} · 프로젝트 {assignedPM.completed_projects}건 완료
                </p>
                <div className="flex flex-wrap gap-1">
                  {assignedPM.specialties?.slice(0, 3).map((s, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <a
                href={`tel:${assignedPM.phone}`}
                className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg"
              >
                <Phone size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* 예상 비용 요약 (드롭다운) */}
        <div className="px-4 mb-2">
          <div className="bg-white rounded-xl border overflow-hidden">
            {/* 헤더 - 클릭하면 펼쳐짐 */}
            <button
              onClick={() => setShowCostBreakdown(!showCostBreakdown)}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-700 p-4 text-white text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-brand-100 mb-1">예상 창업 비용</p>
                  <p className="text-2xl font-bold">
                    {formatPriceMan(estimatedCosts.min)} ~ {formatPriceMan(estimatedCosts.max)}원
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-brand-200">상세보기</span>
                  {showCostBreakdown ? (
                    <ChevronUp size={20} className="text-white/70" />
                  ) : (
                    <ChevronDown size={20} className="text-white/70" />
                  )}
                </div>
              </div>
            </button>

            {/* 상세 비용 내역 */}
            {showCostBreakdown && (
              <div className="p-4 bg-gray-50 border-t animate-fade-in">
                <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <Calculator size={16} className="text-brand-600" />
                  비용 상세 내역 (강남구 {dong} 기준)
                </h4>

                <div className="space-y-2 text-sm">
                  {/* 보증금/권리금 */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">보증금 + 권리금 (예상)</span>
                    <span className="font-bold">{formatPriceMan(storeSize * 300)} ~ {formatPriceMan(storeSize * 800)}원</span>
                  </div>

                  {/* 체크리스트 항목별 비용 */}
                  {checklist.filter(i => i.status !== 'done' && i.estimatedCost.max > 0).map(item => {
                    const isPerPyung = item.estimatedCost.unit.includes('평당');
                    const min = item.estimatedCost.min * (isPerPyung ? storeSize : 1);
                    const max = item.estimatedCost.max * (isPerPyung ? storeSize : 1);
                    return (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">{item.title}</span>
                          {item.status === 'worry' && (
                            <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">도움필요</span>
                          )}
                        </div>
                        <span className="font-medium text-gray-800">
                          {min > 0 ? `${formatPriceMan(min)} ~ ${formatPriceMan(max)}원` : '무료'}
                        </span>
                      </div>
                    );
                  })}

                  {/* 이미 준비된 항목 */}
                  {checklist.filter(i => i.status === 'done').length > 0 && (
                    <div className="pt-2 mt-2">
                      <p className="text-xs text-green-600 font-bold mb-1">✓ 이미 준비됨 (비용 제외)</p>
                      <p className="text-xs text-gray-500">
                        {checklist.filter(i => i.status === 'done').map(i => i.title).join(', ')}
                      </p>
                    </div>
                  )}

                  {/* 도움 필요 항목 요약 */}
                  {checklist.filter(i => i.status === 'worry').length > 0 && (
                    <div className="pt-2 mt-2 bg-orange-50 -mx-4 px-4 py-3 border-t border-orange-100">
                      <p className="text-xs text-orange-700 font-bold mb-1">⚠️ PM이 중점 지원할 항목</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {checklist.filter(i => i.status === 'worry').map(item => (
                          <span key={item.id} className="text-xs bg-white text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                            {item.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <MessageCircle size={40} className="mx-auto mb-2 opacity-50" />
              <p>PM에게 메시지를 보내보세요</p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.sender_type === 'USER'
                    ? 'bg-brand-600 text-white rounded-br-md'
                    : msg.sender_type === 'PM'
                      ? 'bg-white border shadow-sm rounded-bl-md'
                      : 'bg-gray-100 text-gray-600 text-sm'
                    }`}
                >
                  {msg.sender_type === 'PM' && (
                    <p className="text-xs text-brand-600 font-bold mb-1">{assignedPM?.name} 매니저</p>
                  )}
                  {msg.sender_type === 'SYSTEM' && (
                    <p className="text-xs text-gray-400 font-bold mb-1">시스템</p>
                  )}
                  {/* 이미지 첨부파일 표시 */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-2">
                      {msg.attachments.map((att, idx) => (
                        <img
                          key={idx}
                          src={att.url}
                          alt={att.name}
                          className="max-w-full rounded-lg cursor-pointer hover:opacity-90"
                          onClick={() => window.open(att.url, '_blank')}
                        />
                      ))}
                    </div>
                  )}
                  {msg.message !== '📷 이미지' && (
                    <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                  )}
                  <div className={`flex items-center gap-2 mt-1 ${msg.sender_type === 'USER' ? 'text-white/70' : 'text-gray-400'
                    }`}>
                    <span className="text-xs">
                      {new Date(msg.created_at).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {/* 내가 보낸 메시지에 읽음 표시 */}
                    {msg.sender_type === 'USER' && msg.is_read && (
                      <span className="text-xs">✓ 읽음</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 메시지 입력 */}
        <div className="p-4 bg-white border-t">
          {/* 이미지 미리보기 */}
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img src={imagePreview} alt="미리보기" className="max-h-32 rounded-lg border" />
              <button
                onClick={cancelImageUpload}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex gap-2">
            {/* 이미지 첨부 버튼 */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center hover:bg-gray-200"
              title="사진 첨부"
            >
              <ImagePlus size={20} />
            </button>
            <input
              type="text"
              placeholder="메시지를 입력하세요"
              className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={sending || uploadingImage || (!newMessage.trim() && !selectedImage)}
              className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50"
            >
              {sending || uploadingImage ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 온보딩 단계 (1-6)
  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
      {showCancelDialog && <CancelDialog />}

      {/* 프로그레스 헤더 */}
      <div className="sticky top-0 bg-white border-b z-40">
        <div className="flex items-center justify-between px-4 h-14">
          {currentStep > 1 ? (
            <button onClick={goToPrevStep} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft size={24} />
            </button>
          ) : (
            <button onClick={() => setShowCancelDialog(true)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          )}
          <div className="flex-1 mx-4">
            <div className="flex gap-1">
              {JOURNEY_STEPS.filter(s => {
                // 부동산 계약 시 Step 3(상권 분석) 숨김
                if (hasRealEstateContract && s.step === 3) return false;
                return true;
              }).map(s => (
                <div
                  key={s.step}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${s.step <= currentStep ? 'bg-brand-600' : 'bg-gray-200'
                    }`}
                />
              ))}
            </div>
          </div>
          <div className="text-sm font-bold text-gray-400">{currentStep}/{JOURNEY_STEPS.length}</div>
        </div>
        <div className="px-4 pb-3">
          <h2 className="text-lg font-bold text-slate-900">{JOURNEY_STEPS[currentStep - 1]?.title}</h2>
          <p className="text-sm text-gray-500">{JOURNEY_STEPS[currentStep - 1]?.description}</p>
        </div>
      </div>

      {/* 컨텐츠 - 하단 버튼 영역 확보 */}
      <div className="flex-1 p-4 pb-32 overflow-y-auto">
        {/* Step 1: 부동산 계약 여부 + 업종 선택 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* 부동산 계약 여부 질문 (컴팩트) */}
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
              <p className="font-bold text-sm text-slate-900 mb-2">매장 계약은 하셨나요?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setHasRealEstateContract(true)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${hasRealEstateContract === true
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                >
                  네, 했어요
                </button>
                <button
                  onClick={() => setHasRealEstateContract(false)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${hasRealEstateContract === false
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                >
                  아직이요
                </button>
              </div>
            </div>

            {/* 업종 선택 */}
            <div className="grid grid-cols-2 gap-3">
              {BUSINESS_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isSelected = businessCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setBusinessCategory(cat.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${isSelected
                      ? 'border-brand-600 bg-brand-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mx-auto mb-3`}>
                      <Icon size={24} />
                    </div>
                    <p className={`font-bold text-sm ${isSelected ? 'text-brand-700' : 'text-gray-700'}`}>
                      {cat.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: 위치 선택 */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
              <div className="flex items-center gap-2 text-brand-700 mb-1">
                <MapPin size={18} />
                <span className="font-bold">서울시 강남구</span>
              </div>
              <p className="text-sm text-brand-600">현재 강남구에서만 서비스 이용 가능</p>
            </div>

            <div className="space-y-2">
              {GANGNAM_DONGS.map(d => (
                <button
                  key={d.name}
                  onClick={() => setDong(d.name)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${dong === d.name
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-bold ${dong === d.name ? 'text-brand-700' : 'text-gray-900'}`}>
                        {d.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{d.landmark}</p>
                    </div>
                    {dong === d.name && <CheckCircle size={20} className="text-brand-600" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: 상권 분석 */}
        {currentStep === 3 && dong && (
          <div className="space-y-4">
            {/* 지도 */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                <iframe
                  src={`https://map.kakao.com/link/map/${dong},${DONG_COORDINATES[dong]?.lat || 37.5},${DONG_COORDINATES[dong]?.lng || 127.0}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0"
                />
                <div className="absolute top-3 left-3 bg-white px-3 py-1.5 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2">
                    <MapPinned size={16} className="text-brand-600" />
                    <span className="font-bold text-sm">강남구 {dong}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 상권 분석 요약 */}
            {DONG_INFO[dong] && (
              <>
                <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
                  <p className="text-sm text-brand-800">{DONG_INFO[dong].description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* 유동인구 */}
                  <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-2 mb-2 text-gray-500">
                      <Users size={18} />
                      <span className="text-xs font-bold">유동인구</span>
                    </div>
                    <p className="text-lg font-black text-slate-900">{DONG_INFO[dong].footTraffic}</p>
                  </div>

                  {/* 경쟁업체 */}
                  <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-2 mb-2 text-gray-500">
                      <Store size={18} />
                      <span className="text-xs font-bold">
                        주변 {BUSINESS_CATEGORIES.find(c => c.id === businessCategory)?.label || '음식점'}
                      </span>
                    </div>
                    <p className="text-lg font-black text-slate-900">{DONG_INFO[dong].competitors}개</p>
                    <p className="text-xs text-gray-500 mt-1">반경 500m 내</p>
                  </div>

                  {/* 평균 임대료 */}
                  <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-2 mb-2 text-gray-500">
                      <CircleDollarSign size={18} />
                      <span className="text-xs font-bold">평균 임대료</span>
                    </div>
                    <p className="text-lg font-black text-slate-900">{DONG_INFO[dong].avgRent}만원</p>
                    <p className="text-xs text-gray-500 mt-1">평당/월</p>
                  </div>

                  {/* 상권 등급 */}
                  <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-2 mb-2 text-gray-500">
                      <TrendingUp size={18} />
                      <span className="text-xs font-bold">상권 등급</span>
                    </div>
                    <p className="text-lg font-black text-green-600">
                      {DONG_INFO[dong].avgRent >= 350 ? 'A급' : DONG_INFO[dong].avgRent >= 250 ? 'B급' : 'C급'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {DONG_INFO[dong].avgRent >= 350 ? '프리미엄' : DONG_INFO[dong].avgRent >= 250 ? '우량' : '보통'}
                    </p>
                  </div>
                </div>

                {/* 경쟁 분석 */}
                <div className="bg-white rounded-xl border p-4">
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <Eye size={16} className="text-brand-600" />
                    {BUSINESS_CATEGORIES.find(c => c.id === businessCategory)?.label} 경쟁 분석
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">경쟁 강도</span>
                      <span className={`font-bold ${DONG_INFO[dong].competitors > 30 ? 'text-red-600' : DONG_INFO[dong].competitors > 20 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {DONG_INFO[dong].competitors > 30 ? '높음 (과밀)' : DONG_INFO[dong].competitors > 20 ? '보통' : '낮음 (기회)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">배달 수요</span>
                      <span className="font-bold text-brand-600">
                        {DONG_INFO[dong].avgRent < 250 ? '높음' : '보통'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">추천도</span>
                      <span className={`font-bold ${DONG_INFO[dong].competitors < 25 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {DONG_INFO[dong].competitors < 25 ? '추천' : '검토 필요'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 주의사항 */}
                {DONG_INFO[dong].competitors > 30 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-yellow-800">경쟁 과밀 지역</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          해당 지역은 동종 업종이 많습니다. 차별화 전략이 필요하며, PM과 상세 상담을 권장합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 4: 규모 선택 */}
        {currentStep === 4 && (
          <div className="space-y-4">
            {STORE_SIZES.map(size => (
              <button
                key={size.id}
                onClick={() => setStoreSize(size.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${storeSize === size.value
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{size.label}</span>
                  {storeSize === size.value && <CheckCircle size={20} className="text-brand-600" />}
                </div>
              </button>
            ))}

            <div className="pt-4">
              <label className="text-sm font-bold text-gray-500 mb-2 block">직접 입력 (평)</label>
              <input
                type="number"
                placeholder="예: 15"
                min={1}
                max={500}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg font-bold focus:border-brand-500 focus:ring-0"
                value={storeSize}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setStoreSize(v > 0 && v <= 500 ? v : 15);
                }}
              />
            </div>
          </div>
        )}

        {/* Step 5: 체크리스트 */}
        {currentStep === 5 && (
          <div className="space-y-5">
            {/* 안내 + 스킵 */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">탭: 미확인 → 도움필요 → 준비됨</p>
              <button onClick={goToNextStep} className="text-xs text-brand-500 font-bold px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors">
                건너뛰기 →
              </button>
            </div>

            {/* 범례 */}
            <div className="flex gap-4 justify-center">
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> 미확인</span>
              <span className="flex items-center gap-1.5 text-xs text-green-600"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> 준비됨</span>
              <span className="flex items-center gap-1.5 text-xs text-orange-500"><span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> 도움필요</span>
            </div>

            {['행정/서류', '인테리어/공사', '장비/세팅', '매니저 지원'].map(category => {
              const categoryItems = checklist.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category}>
                  <p className="text-xs font-bold text-slate-400 mb-2 px-1">{category === '매니저 지원' ? '매니저 지원 항목' : category}</p>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                    {categoryItems.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          const next = item.status === 'unchecked' ? 'worry' : item.status === 'worry' ? 'done' : 'unchecked';
                          toggleChecklistItem(item.id, next);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all active:bg-slate-50 ${idx > 0 ? 'border-t border-slate-50' : ''
                          }`}
                      >
                        {/* 상태 인디케이터 */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${item.status === 'done' ? 'bg-green-500 text-white' :
                          item.status === 'worry' ? 'bg-orange-400 text-white' :
                            'bg-slate-100 text-slate-300'
                          }`}>
                          {item.status === 'done' ? <Check size={16} /> :
                            item.status === 'worry' ? <AlertTriangle size={14} /> :
                              <span className="w-2 h-2 rounded-full bg-slate-300" />}
                        </div>

                        {/* 텍스트 */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] font-bold leading-tight ${item.status === 'done' ? 'text-green-700' :
                            item.status === 'worry' ? 'text-orange-600' :
                              'text-slate-800'
                            }`}>{item.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                        </div>

                        {/* 상태 라벨 */}
                        {item.status !== 'unchecked' && (
                          <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${item.status === 'done' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'
                            }`}>
                            {item.status === 'done' ? '준비됨' : '도움필요'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 6: 비용 산출 & PM 메시지 */}
        {currentStep === 6 && (
          <div className="space-y-4">
            {/* 비용 요약 */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Calculator size={20} />
                <span className="font-bold">예상 총 창업 비용</span>
              </div>
              <div className="text-3xl font-black mb-2">
                {formatPriceMan(estimatedCosts.min)} ~ {formatPriceMan(estimatedCosts.max)}원
              </div>
              <p className="text-sm text-brand-100">보증금, 권리금, 시설비 포함</p>
            </div>

            {/* 비용 상세 */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h3 className="font-bold text-sm text-gray-700">비용 상세 (강남구 {dong} 기준)</h3>
              </div>
              <div className="divide-y">
                <div className="p-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">보증금 + 권리금 (예상)</span>
                  <span className="font-bold text-sm">{formatPriceMan(storeSize * 300)} ~ {formatPriceMan(storeSize * 800)}원</span>
                </div>
                {checklist.filter(i => i.status !== 'done' && i.estimatedCost.max > 0).map(item => {
                  const isPerPyung = item.estimatedCost.unit.includes('평당');
                  const min = item.estimatedCost.min * (isPerPyung ? storeSize : 1);
                  const max = item.estimatedCost.max * (isPerPyung ? storeSize : 1);
                  return (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{item.title}</span>
                        {isPerPyung && (
                          <span className="text-[10px] text-gray-400">({item.estimatedCost.min}~{item.estimatedCost.max}{item.estimatedCost.unit} × {storeSize}평)</span>
                        )}
                        {item.status === 'worry' && (
                          <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">걱정</span>
                        )}
                      </div>
                      <span className="font-bold text-sm">
                        {min > 0 ? `${formatPriceMan(min)} ~ ${formatPriceMan(max)}원` : '무료'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 체크리스트 요약 표 */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-bold text-sm text-gray-700">📋 준비 현황 요약</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-bold text-gray-600">항목</th>
                      <th className="px-3 py-2 text-center font-bold text-gray-600 w-20">상태</th>
                      <th className="px-4 py-2 text-left font-bold text-gray-600">메모</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {checklist.filter(i => i.status !== 'unchecked' || i.comment).map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900">{item.title}</td>
                        <td className="px-3 py-2 text-center">
                          {item.status === 'done' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">✓ 준비됨</span>
                          ) : item.status === 'worry' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">⚠️ 도움필요</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-gray-600 text-xs">{item.comment || '-'}</td>
                      </tr>
                    ))}
                    {checklist.filter(i => i.status !== 'unchecked' || i.comment).length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                          체크하거나 메모를 남긴 항목이 없습니다
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
                총 {checklist.filter(i => i.status === 'done').length}개 준비 완료 / {checklist.filter(i => i.status === 'worry').length}개 도움 필요 / {checklist.filter(i => i.status === 'unchecked').length}개 미체크
              </div>
            </div>

            {/* PM에게 전할 메시지 */}
            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-bold text-sm text-gray-700 mb-2">💬 PM에게 전할 말이 있나요?</h3>
              <textarea
                placeholder="궁금한 점이나 요청사항을 적어주세요..."
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm resize-none h-24"
                value={pmMessage}
                onChange={(e) => setPmMessage(e.target.value)}
              />
            </div>

            {/* 걱정 항목 요약 */}
            {checklist.filter(i => i.status === 'worry').length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <h3 className="font-bold text-sm text-orange-800 mb-2">⚠️ PM이 중점 지원할 항목</h3>
                <div className="flex flex-wrap gap-2">
                  {checklist.filter(i => i.status === 'worry').map(item => (
                    <span key={item.id} className="px-3 py-1 bg-white text-orange-700 rounded-full text-sm font-medium border border-orange-200">
                      {item.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 하단 버튼 - BottomNav 위에 위치 */}
      <div
        className="fixed bottom-[72px] left-0 right-0 bg-white border-t z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]"
      >
        <div className="px-4 py-3">
          <Button
            fullWidth
            size="lg"
            disabled={!canProceed() || loading}
            onClick={goToNextStep}
            className="h-14 text-base font-bold"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : currentStep === 6 ? (
              <>
                <Rocket size={20} className="mr-2" />
                {isGuestMode ? '무료 상세 견적서 받기' : project?.id ? '프로젝트 현황 보기' : '매니저 배정 신청하기'}
              </>
            ) : (
              <>
                다음 단계로
                <ChevronRight size={20} className="ml-1" />
              </>
            )}
          </Button>
          {currentStep === 6 && isGuestMode && (
            <p className="text-center text-xs text-slate-400 mt-2">
              지금까지 입력한 정보는 로그인 후에도 유지됩니다
            </p>
          )}
        </div>
      </div>
      {/* PDF 결과 보기 모달 */}
      {estimateResult && (
        <EstimateResultView
          data={estimateResult}
          onClose={() => {
            setEstimateResult(null);
            // PDF 확인 후 로그인 유도
            if (isGuestMode && onLoginRequired) {
              const confirmLogin = window.confirm("상세 견적 리포트를 저장하시겠습니까?\n로그인하여 매니저와 상담을 이어가세요.");
              if (confirmLogin) onLoginRequired();
            }
          }}
        />
      )}
    </div>
  );
};

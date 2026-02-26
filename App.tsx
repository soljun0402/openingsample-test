import React, { useState, useEffect } from 'react';
import { MainTab, User } from './types';
import { supabase } from './utils/supabaseClient';
import { BottomNav } from './components/BottomNav';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { ServiceJourneyView } from './components/ServiceJourneyView';
import { MyConsultationsView } from './components/MyConsultationsView';
import { MoreView } from './components/MoreView';
import { MyPageView } from './components/MyPageView';
import { AdminView } from './components/AdminView';
import { PMPortalView } from './components/PMPortalView';
import { LoginView } from './components/LoginView';
import { DoorOpen, Loader2 } from 'lucide-react';
import { EstimateResultView } from './components/EstimateResultView';

function App() {
  // --- 강제 우회 코드: 로그인/결제 없이 PDF 결과 바로 확인 ---
  const MOCK_BYPASS = false;
  if (MOCK_BYPASS) {
    const mockEstimateData = {
      customerName: '예비 창업자',
      totalCostRange: { min: 54000, max: 166000 },
      locationData: {
        region: '서울시 강남구 역삼동',
        analysis: [
          { label: '주요 타겟', value: '20-30대 직장인/주거' },
          { label: '유동 인구', value: '일 평균 85,000명' },
          { label: '경쟁 점포', value: '45개 (반경 500m)' }
        ]
      },
      costBreakdown: [
        { label: '보증금 및 권리금', min: 30000, max: 80000 },
        { label: '임대차 계약', min: 5000, max: 50000 },
        { label: '인테리어 공사', min: 15000, max: 40000 },
        { label: '간판 설치', min: 2000, max: 8000 },
        { label: 'POS·키오스크', min: 500, max: 1500 },
        { label: 'CCTV·인터넷', min: 500, max: 1500 },
        { label: '보건증·위생교육', min: 20, max: 70 },
        { label: '휴게음식점 신고', min: 0, max: 50 },
        { label: '커피머신·분쇄기', min: 6000, max: 35000 },
        { label: '테이블·의자', min: 2000, max: 8000 },
      ],
      checklist: {
        readyCount: 5,
        worryCount: 7,
        readyItems: ['사업자등록', '임대차 계약', '간판 설치', '보건증·위생교육', '휴게음식점 신고'],
        worryItems: ['인테리어 공사', 'POS·키오스크', 'CCTV·인터넷', '인허가·서류 대행', '마케팅 세팅', '커피머신·분쇄기', '테이블·의자']
      },
      businessType: '카페/디저트',
      marketGrade: 'A' as const,
      simpleScore: 85,
      simpleComment: '우수한 상권입니다. 성공적인 창업이 기대됩니다.',
    };

    return <EstimateResultView data={mockEstimateData} onBack={() => { }} />;
  }
  // --- 강제 우회 코드 끝 ---

  // 화면 상태
  const [showLanding, setShowLanding] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  // Auth 상태
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPM, setIsPM] = useState(false);
  const [pmId, setPmId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // 탭 상태
  const [currentTab, setCurrentTab] = useState<MainTab>('HOME');

  // 프로젝트 상태
  const [hasActiveProject, setHasActiveProject] = useState(false);
  const [consultingBookings, setConsultingBookings] = useState<any[]>([]);

  // 로그인 후 데이터 로딩 중 여부 (이 동안 로딩 화면 표시)
  const [isDataLoading, setIsDataLoading] = useState(false);

  // 프로젝트 생성 실패 시 에러 상태
  const [projectError, setProjectError] = useState<string | null>(null);

  // Auth 체크 — onAuthStateChange 콜백은 Supabase 내부 lock 안에서 실행되므로,
  // setTimeout(0)으로 lock 해제 후 실제 작업 수행 (deadlock 방지)
  useEffect(() => {
    let handled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] event:', event, session?.user ? 'user=' + session.user.id.slice(0, 8) : 'no user');

      // setTimeout(0)으로 Supabase 내부 lock 해제 후 실행
      setTimeout(async () => {
        if (session?.user && !handled) {
          handled = true;
          console.log('[Auth] handleSession start');
          await handleSession(session);
          setShowLanding(false);
          console.log('[Auth] handleSession done');
        }
        setIsAuthChecking(false);
      }, 0);
    });

    // 안전장치: 5초 안에 아무 이벤트도 안 오면 로딩 해제
    const timeout = setTimeout(() => {
      console.log('[Auth] safety timeout — no event received');
      setIsAuthChecking(false);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSession = async (session: any) => {
    if (session?.user) {
      const email = session.user.email || '';
      if (email === 'admin@opening.run') {
        setIsAdmin(true);
      }
      setUser({
        id: session.user.id,
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '사장님',
        phone: session.user.email || '',
        type: 'KAKAO',
        joinedDate: new Date(session.user.created_at).toLocaleDateString()
      });
      setIsAuthenticated(true);
      setIsDataLoading(true);
      try {
        await loadUserData(session.user.id);
      } finally {
        setIsDataLoading(false);
      }
    }
  };

  // localStorage에 저장된 대기 프로젝트 생성 (재시도 포함)
  // 결제 게이트: PAYMENT_PENDING 상태로 생성 → DashboardView에서 결제 후 PENDING_PM 전환
  const createProjectFromPending = async (userId: string, retryCount = 0): Promise<boolean> => {
    const pendingStr = localStorage.getItem('pending_project_data');
    if (!pendingStr) return false;

    try {
      const data = JSON.parse(pendingStr);
      const { data: newProject, error: insertError } = await supabase
        .from('startup_projects')
        .insert([{
          user_id: userId,
          business_category: data.businessCategory,
          location_city: '서울시',
          location_district: '강남구',
          location_dong: data.dong,
          store_size: data.storeSize,
          estimated_total: data.estimatedTotal,
          current_step: 6,
          status: 'PAYMENT_PENDING',
          checklist_data: data.checklistData
        }])
        .select()
        .single();

      if (insertError || !newProject) {
        console.error('Pending project creation failed:', insertError);

        // 최대 2회 재시도 (1초 간격)
        if (retryCount < 2) {
          await new Promise(r => setTimeout(r, 1000));
          return createProjectFromPending(userId, retryCount + 1);
        }

        // 재시도 실패 — localStorage 유지해서 수동 재시도 가능
        const errMsg = insertError?.message || '알 수 없는 오류';
        setProjectError(`프로젝트 생성에 실패했습니다 (${errMsg}). 아래 버튼을 눌러 다시 시도해주세요.`);
        return false;
      }

      if (data.systemMessage) {
        await supabase.from('project_messages').insert({
          project_id: newProject.id,
          sender_type: 'SYSTEM',
          message: data.systemMessage
        });
      }
      if (data.pmMessage) {
        await supabase.from('project_messages').insert({
          project_id: newProject.id,
          sender_type: 'USER',
          message: data.pmMessage
        });
      }
      localStorage.removeItem('pending_project_data');
      setProjectError(null);
      return true;
    } catch (err) {
      console.error('Failed to create pending project:', err);

      if (retryCount < 2) {
        await new Promise(r => setTimeout(r, 1000));
        return createProjectFromPending(userId, retryCount + 1);
      }

      setProjectError('프로젝트 생성 중 오류가 발생했습니다. 아래 버튼을 눌러 다시 시도해주세요.');
      return false;
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      // startup_projects에서 진행중인 프로젝트 수 조회
      const { data: allProjects } = await supabase
        .from('startup_projects')
        .select('id, status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (allProjects) {
        setConsultingBookings(allProjects.map((p: any) => ({ ...p })));
      }

      const { data: projects } = await supabase
        .from('startup_projects')
        .select('id, status')
        .eq('user_id', userId)
        .in('status', ['DRAFT', 'PENDING_PM', 'PM_ASSIGNED', 'IN_PROGRESS', 'PAYMENT_PENDING', 'ACTIVE', 'POST_SERVICE'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (projects && projects.length > 0) {
        setHasActiveProject(true);
      } else {
        // 기존 프로젝트 없으면 → localStorage에서 대기 프로젝트 생성
        const created = await createProjectFromPending(userId);
        if (created) {
          setHasActiveProject(true);
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('pending_project_data');
    localStorage.removeItem('push_banner_dismissed');
    sessionStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsPM(false);
    setPmId(null);
    setHasActiveProject(false);
    setConsultingBookings([]);
    setCurrentTab('HOME');
    setShowLanding(true);
  };

  // 프로젝트 생성 수동 재시도
  const handleRetryProjectCreation = async () => {
    if (!user?.id) return;
    setProjectError(null);
    setIsDataLoading(true);
    try {
      const created = await createProjectFromPending(user.id);
      if (created) {
        setHasActiveProject(true);
      }
    } finally {
      setIsDataLoading(false);
    }
  };

  // 랜딩에서 "창업비용 확인하기" 클릭 → 게스트로 바로 진입
  const handleStartFromLanding = () => {
    setUser({ id: `guest-${Date.now()}`, name: '사장님', phone: '', type: 'PHONE', joinedDate: new Date().toLocaleDateString() });
    setShowLanding(false);
  };

  // PM 배정받기 클릭 (게스트) → 로그인 페이지로 이동
  const handleLoginRequired = () => {
    setShowLogin(true);
  };

  // Admin/PM 로그인 (숨김 기능)
  const handleAdminLogin = async (email: string, password: string): Promise<boolean> => {
    await supabase.auth.signOut();

    const ADMIN_PW = (import.meta as any).env?.VITE_ADMIN_PW || '';
    const PM_PW = (import.meta as any).env?.VITE_PM_PW || '';

    // Admin 로그인 — Supabase Auth로 실제 인증 (DB 쓰기 권한 필요)
    if (email === 'admin' && password === ADMIN_PW) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@opening.run',
        password: ADMIN_PW,
      });
      if (signInError) {
        console.error('Admin sign-in error:', signInError);
      }
      setIsAdmin(true);
      setIsAuthenticated(true);
      setUser({ id: 'admin', name: '관리자', phone: '', type: 'KAKAO', joinedDate: new Date().toLocaleDateString() });
      setShowLanding(false);
      setShowLogin(false);
      return true;
    }

    // PM 로그인
    if (password === PM_PW) {
      const { data: pmData } = await supabase
        .from('project_managers')
        .select('id, name, phone')
        .eq('email', email)
        .single();

      if (pmData) {
        setIsPM(true);
        setPmId(pmData.id);
        setIsAuthenticated(true);
        setUser({ id: pmData.id, name: pmData.name + ' PM', phone: pmData.phone || '', type: 'KAKAO', joinedDate: new Date().toLocaleDateString() });
        setShowLanding(false);
        setShowLogin(false);
        return true;
      }
    }

    return false;
  };

  // === 렌더링 ===

  // 1. 로딩 (인증 체크 또는 로그인 후 데이터 로딩)
  if (isAuthChecking || isDataLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center text-brand-600">
        <div className="flex flex-col items-center gap-4 animate-scale-in">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center shadow-lg mb-2">
            <DoorOpen size={36} strokeWidth={2.5} />
          </div>
          <Loader2 className="animate-spin text-brand-400" size={28} />
          <p className="text-sm text-slate-400 mt-2">{isDataLoading ? '프로젝트 준비중...' : '인증 확인중...'}</p>
        </div>
      </div>
    );
  }

  // 2. 프로젝트 생성 실패 에러 화면
  if (projectError && isAuthenticated && !hasActiveProject) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed">{projectError}</p>
          <button
            onClick={handleRetryProjectCreation}
            className="mt-4 px-6 py-3 bg-brand-500 text-white rounded-xl font-medium text-sm hover:bg-brand-600 active:scale-95 transition-all"
          >
            다시 시도하기
          </button>
          <button
            onClick={() => { setProjectError(null); setShowLanding(true); }}
            className="px-4 py-2 text-slate-400 text-xs"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 3. 로그인 화면 (내 프로젝트 보기 → 로그인)
  if (showLogin) {
    return (
      <LoginView
        onLoginSuccess={async () => {
          setShowLogin(false);
          setShowLanding(false);
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await handleSession(session);
          }
        }}
        onGuestBrowse={() => {
          // 게스트 둘러보기 → ServiceJourney 위자드로 진입 (대시보드 아님)
          setUser({ id: `guest-${Date.now()}`, name: '사장님', phone: '', type: 'PHONE', joinedDate: new Date().toLocaleDateString() });
          setShowLogin(false);
          setShowLanding(false);
        }}
        onAdminLogin={handleAdminLogin}
        onBack={() => {
          setShowLogin(false);
          setShowLanding(true);
        }}
      />
    );
  }

  // 3. 랜딩 페이지 (첫 화면 - 로그인 페이지 아님!)
  if (showLanding) {
    return (
      <LandingView
        onStart={handleStartFromLanding}
        onGoToLogin={() => { setShowLogin(true); setShowLanding(false); }}
        onAdminLogin={handleAdminLogin}
      />
    );
  }

  // 3. Admin
  if (isAdmin) {
    return <AdminView onLogout={handleLogout} />;
  }

  // 4. PM
  if (isPM && pmId) {
    return <PMPortalView pmId={pmId} onLogout={handleLogout} />;
  }

  // 5. 일반 사용자: 프로젝트 없으면 ServiceJourney, 있으면 Dashboard
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col max-w-lg mx-auto relative">
      <main className="flex-1 w-full overflow-y-auto no-scrollbar scroll-smooth" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
        {currentTab === 'HOME' && (
          hasActiveProject ? (
            <DashboardView
              onNavigateToProject={() => setCurrentTab('PROJECT')}
              isGuestMode={!isAuthenticated}
              onLoginRequired={handleLoginRequired}
              userId={user?.id}
              userName={user?.name}
            />
          ) : (
            <ServiceJourneyView
              onBack={() => setShowLanding(true)}
              isGuestMode={!isAuthenticated}
              onProjectCreated={() => setHasActiveProject(true)}
              onLoginRequired={handleLoginRequired}
            />
          )
        )}

        {currentTab === 'PROJECT' && (
          <ServiceJourneyView
            onBack={() => setCurrentTab('HOME')}
            isGuestMode={!isAuthenticated}
            onProjectCreated={() => setHasActiveProject(true)}
            onLoginRequired={handleLoginRequired}
            viewMode="view"
          />
        )}

        {currentTab === 'CONSULTING' && (
          <MyConsultationsView
            isGuestMode={!isAuthenticated}
            onLoginRequired={handleLoginRequired}
          />
        )}

        {currentTab === 'MORE' && (
          <MoreView
            onNavigate={setCurrentTab as any}
            hasActiveProject={hasActiveProject}
            onStartNewProject={() => setCurrentTab('PROJECT')}
          />
        )}

        {currentTab === 'MYPAGE' && (
          <MyPageView
            user={user}
            onLogout={handleLogout}
            onProfileUpdate={(name, phone) => setUser(prev => prev ? { ...prev, name, phone } : prev)}
            consultingCount={consultingBookings.filter((b: any) => ['PENDING_PM', 'PM_ASSIGNED', 'IN_PROGRESS', 'PAYMENT_PENDING', 'ACTIVE'].includes(b.status)).length}
            quoteCount={0}
          />
        )}
      </main>

      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
}

export default App;

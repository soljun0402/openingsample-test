import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { DoorOpen, ArrowRight, ArrowLeft, Lock, Mail, Loader2, Sparkles, Phone, User, ChevronDown, CheckCircle, RefreshCw } from 'lucide-react';

const SIGNUP_SOURCES = [
  { value: '', label: '가입 경로 선택' },
  { value: 'search', label: '검색 (네이버/구글)' },
  { value: 'instagram', label: '인스타그램' },
  { value: 'youtube', label: '유튜브' },
  { value: 'blog', label: '블로그' },
  { value: 'friend', label: '지인 추천' },
  { value: 'ad', label: '광고' },
  { value: 'other', label: '기타' },
];

interface LoginViewProps {
  onLoginSuccess: () => void;
  onGuestBrowse?: () => void;
  onAdminLogin?: (email: string, password: string) => boolean | Promise<boolean>;
  onBack?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onGuestBrowse, onAdminLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [signupSource, setSignupSource] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current); };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 관리자/PM 로그인 체크
      if (!isRegister && onAdminLogin) {
        const result = await onAdminLogin(email, password);
        if (result) {
          return; // 관리자/PM 로그인 성공
        }
      }

      if (isRegister) {
        if (!name.trim()) {
          throw new Error('이름을 입력해주세요.');
        }
        if (!phone.trim()) {
          throw new Error('전화번호를 입력해주세요.');
        }
        if (!signupSource) {
          throw new Error('가입 경로를 선택해주세요.');
        }
        if (password.length < 8) {
          throw new Error('비밀번호는 8자 이상이어야 합니다.');
        }
        if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
          throw new Error('비밀번호는 영문과 숫자를 모두 포함해야 합니다.');
        }
        // 이메일 인증 리다이렉트 URL - 프로덕션 도메인 사용
        const redirectUrl = window.location.hostname === 'localhost'
          ? 'https://opening.run'
          : window.location.origin;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone: phone,
              signup_source: signupSource
            },
            emailRedirectTo: redirectUrl
          }
        });
        if (error) throw error;

        // 이메일 인증이 필요한 경우 → 인증 안내 화면 표시
        if (data.user && !data.session) {
          setShowVerification(true);
          startResendCooldown();
          return;
        }

        // 이메일 인증이 비활성화된 경우 바로 로그인
        if (data.session) {
          onLoginSuccess();
          return;
        }

        setShowVerification(true);
        startResendCooldown();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLoginSuccess();
      }
    } catch (err: any) {
      const message = err.message || "인증 중 오류가 발생했습니다.";
      // 에러 메시지 한글화
      if (message.includes('Invalid login credentials')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (message.includes('Email not confirmed')) {
        setError('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
      } else if (message.includes('User already registered')) {
        setError('이미 가입된 이메일입니다.');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownTimerRef.current!); cooldownTimerRef.current = null; return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setError(null);

    try {
      const redirectUrl = window.location.hostname === 'localhost'
        ? 'https://opening.run'
        : window.location.origin;

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) throw error;
      setSuccessMessage('인증 메일이 재발송되었습니다.');
      startResendCooldown();
    } catch (err: any) {
      setError(err.message || '재발송에 실패했습니다.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowVerification(false);
    setIsRegister(false);
    setPassword('');
    setError(null);
    setSuccessMessage(null);
  };

  const handleGuestLogin = () => {
    if (onGuestBrowse) {
      onGuestBrowse();
    } else {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-200/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* 뒤로가기 */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-slate-500 font-medium mb-6 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={16} />
            돌아가기
          </button>
        )}
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20 overflow-hidden">
            <img src="/favicon-new.png" alt="오프닝" className="w-full h-full" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">오프닝</h1>
          <p className="text-slate-500 font-medium">성공적인 창업의 시작과 끝</p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel rounded-3xl p-8 backdrop-blur-xl">
          {showVerification ? (
            /* 이메일 인증 안내 화면 */
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto">
                <Mail size={28} className="text-brand-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-2">이메일 인증이 필요합니다</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  <span className="font-bold text-brand-600">{email}</span>으로<br />
                  인증 메일을 보내드렸습니다.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2">
                <p className="text-sm font-bold text-slate-700">인증 방법</p>
                <ol className="text-sm text-slate-600 space-y-1.5 list-decimal list-inside">
                  <li>이메일 받은편지함을 확인해주세요</li>
                  <li><span className="font-medium">"Confirm your signup"</span> 메일을 열어주세요</li>
                  <li>메일 내 인증 링크를 클릭하면 완료!</li>
                </ol>
                <p className="text-xs text-slate-400 mt-2">스팸/정크 폴더도 확인해주세요</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-green-50 text-green-600 text-sm font-medium rounded-lg flex items-center gap-2">
                  <CheckCircle size={16} /> {successMessage}
                </div>
              )}

              <button
                onClick={handleResendVerification}
                disabled={resendCooldown > 0 || resendLoading}
                className="w-full py-3 px-4 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <RefreshCw size={18} />
                )}
                {resendCooldown > 0 ? `재발송 (${resendCooldown}초)` : '인증 메일 재발송'}
              </button>

              <button
                onClick={handleBackToLogin}
                className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                인증 완료 후 로그인하기
              </button>
            </div>
          ) : (
          /* 기존 로그인/회원가입 폼 */
          <>
          <div className="flex gap-4 mb-8 p-1 bg-slate-100/50 rounded-xl">
            <button 
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              로그인
            </button>
            <button 
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegister && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">이름</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400"
                      placeholder="홍길동"
                      required={isRegister}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">전화번호</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                        const formatted = raw.length <= 3 ? raw : raw.length <= 7 ? `${raw.slice(0,3)}-${raw.slice(3)}` : `${raw.slice(0,3)}-${raw.slice(3,7)}-${raw.slice(7)}`;
                        setPhone(formatted);
                      }}
                      className="w-full bg-slate-50 border-none rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400"
                      placeholder="010-1234-5678"
                      required={isRegister}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">가입 경로</label>
                  <div className="relative group">
                    <select
                      value={signupSource}
                      onChange={(e) => setSignupSource(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-slate-900 font-medium focus:ring-2 focus:ring-brand-500 transition-all appearance-none cursor-pointer"
                      required={isRegister}
                    >
                      {SIGNUP_SOURCES.map(source => (
                        <option key={source.value} value={source.value}>{source.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={20} />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">이메일</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400"
                  placeholder="이메일 주소"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">비밀번호</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                />
              </div>
              {isRegister && (
                <p className="text-xs text-slate-400 ml-1">영문 + 숫자 포함 8자 이상</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg flex items-center gap-2 animate-fade-in">
                <span>⚠️</span> {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-green-50 text-green-600 text-sm font-medium rounded-lg flex items-center gap-2 animate-fade-in">
                <span>✓</span> {successMessage}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : (isRegister ? '회원가입' : '로그인')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
             {!isRegister && (
               <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
               >
                  <Sparkles size={18} className="text-yellow-300" />
                  간편 회원가입
               </button>
             )}
             <button
                type="button"
                onClick={handleGuestLogin}
                className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-2"
             >
                <Sparkles size={18} className="text-yellow-500" />
                게스트로 둘러보기
             </button>
          </div>
          </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          © 2026 Opening Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};

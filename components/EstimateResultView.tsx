import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { EstimatePDFDocument, EstimatePDFProps } from './EstimatePDFView';
import { Loader2, Download, ChevronLeft, CheckCircle2, Brain, Sparkles, TrendingUp, MapPin, AlertTriangle, Shield, ArrowRight } from 'lucide-react';
import { Button } from './Components';

interface EstimateResultViewProps {
    data: EstimatePDFProps;
    onBack: () => void;
    aiLoading?: boolean;
}

const formatCurrency = (amount: number) => {
    let safeAmount = amount;
    if (amount < 500000) {
        safeAmount = amount * 10000;
    }

    if (safeAmount >= 100000000) {
        const uk = Math.floor(safeAmount / 100000000);
        const remainder = safeAmount % 100000000;
        const remainderMan = Math.floor(remainder / 10000);
        return remainderMan > 0
            ? `${uk}억 ${new Intl.NumberFormat('ko-KR').format(remainderMan)}만원`
            : `${uk}억원`;
    }
    return new Intl.NumberFormat('ko-KR').format(Math.floor(safeAmount / 10000)) + '만원';
};

// AI 로딩 단계 정의
const AI_STEPS = [
    { label: '사장님 정보를 꼼꼼히 읽고 있어요', threshold: 5 },
    { label: '동네 상권을 샅샅이 훑어보는 중...', threshold: 15 },
    { label: 'AI 컨설턴트에게 보고서를 맡기는 중', threshold: 25 },
    { label: '이 동네, 장사 될까? 등급 매기는 중', threshold: 35 },
    { label: '아낄 수 있는 돈은 없는지 찾고 있어요', threshold: 50 },
    { label: '체크리스트 하나하나 꿀팁 적는 중', threshold: 65 },
    { label: '혹시 모를 위험 요소 점검 중...', threshold: 75 },
    { label: '오픈까지 실전 로드맵 그리는 중', threshold: 85 },
    { label: '마지막 퇴고 중... 거의 다 됐어요!', threshold: 95 },
];

const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-500', ring: 'ring-emerald-200', light: 'bg-emerald-50', stroke: '#10B981' };
    if (score >= 60) return { text: 'text-blue-600', bg: 'bg-blue-500', ring: 'ring-blue-200', light: 'bg-blue-50', stroke: '#3B82F6' };
    return { text: 'text-amber-600', bg: 'bg-amber-500', ring: 'ring-amber-200', light: 'bg-amber-50', stroke: '#F59E0B' };
};

const getGradeStyle = (grade: string) => {
    switch (grade) {
        case 'S': return { bg: 'bg-gradient-to-br from-amber-400 to-orange-500', border: 'border-amber-300', light: 'bg-amber-50', text: 'text-amber-700' };
        case 'A': return { bg: 'bg-gradient-to-br from-emerald-400 to-emerald-600', border: 'border-emerald-300', light: 'bg-emerald-50', text: 'text-emerald-700' };
        case 'B': return { bg: 'bg-gradient-to-br from-blue-400 to-blue-600', border: 'border-blue-300', light: 'bg-blue-50', text: 'text-blue-700' };
        case 'C': return { bg: 'bg-gradient-to-br from-orange-400 to-orange-600', border: 'border-orange-300', light: 'bg-orange-50', text: 'text-orange-700' };
        default: return { bg: 'bg-gradient-to-br from-red-400 to-red-600', border: 'border-red-300', light: 'bg-red-50', text: 'text-red-700' };
    }
};

export const EstimateResultView: React.FC<EstimateResultViewProps> = ({ data, onBack, aiLoading = false }) => {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [elapsedSec, setElapsedSec] = useState(0);

    useEffect(() => {
        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            setElapsedSec(Math.floor(elapsed));

            setProgress(prev => {
                if (!aiLoading && prev >= 90) {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => setLoading(false), 300);
                        return 100;
                    }
                    return prev + 5;
                }

                if (aiLoading) {
                    const target = Math.min(90, elapsed * 3);
                    if (prev < target) {
                        return Math.min(prev + 1.5, target);
                    }
                    return prev;
                }

                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setLoading(false), 300);
                    return 100;
                }
                return prev + 3;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [aiLoading]);

    useEffect(() => {
        if (!aiLoading && progress >= 50) {
            const finishInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(finishInterval);
                        setTimeout(() => setLoading(false), 400);
                        return 100;
                    }
                    return prev + 4;
                });
            }, 50);
            return () => clearInterval(finishInterval);
        }
    }, [aiLoading]);

    const currentStep = AI_STEPS.reduce((acc, step) => {
        if (progress >= step.threshold) return step;
        return acc;
    }, AI_STEPS[0]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-gradient-to-b from-slate-50 to-white z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                {/* 원형 프로그레스 */}
                <div className="w-32 h-32 mb-8 relative">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                        <circle cx="64" cy="64" r="56" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                        <circle
                            cx="64" cy="64" r="56" fill="none" stroke="url(#gradient)" strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                            strokeLinecap="round"
                            className="transition-all duration-300 ease-out"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3B82F6" />
                                <stop offset="100%" stopColor="#1D4ED8" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-slate-800">{Math.floor(progress)}</span>
                        <span className="text-xs text-slate-400 font-medium -mt-0.5">%</span>
                    </div>
                </div>

                <h2 className="text-xl font-bold mb-2 text-slate-800">
                    {aiLoading ? (
                        <>AI가 맞춤형 보고서를<br />생성하고 있습니다</>
                    ) : (
                        <>분석 완료!<br />보고서를 준비 중입니다</>
                    )}
                </h2>

                <div className="flex items-center gap-2 mb-8">
                    {aiLoading && <Brain size={14} className="text-blue-500 animate-pulse" />}
                    <p className="text-sm text-slate-500">{currentStep.label}</p>
                </div>

                {/* 단계별 체크리스트 */}
                <div className="space-y-3 w-full max-w-xs text-left bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    {[
                        { label: '사장님 데이터 수집 완료', start: 5, end: 25 },
                        { label: '상권 분석 & 절약 포인트 탐색', start: 25, end: 50 },
                        { label: '맞춤 조언 & 리스크 체크', start: 50, end: 75 },
                        { label: '오픈 로드맵 완성 & 최종 검수', start: 75, end: 95 },
                    ].map((step, i) => (
                        <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${progress > step.start ? 'opacity-100' : 'opacity-30'}`}>
                            {progress > step.end ? (
                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                            ) : progress > step.start ? (
                                <Loader2 size={18} className="text-blue-500 animate-spin shrink-0" />
                            ) : (
                                <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-200 shrink-0" />
                            )}
                            <span className={`text-sm ${progress > step.end ? 'text-emerald-700 font-medium' : progress > step.start ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-slate-400 mt-6">{elapsedSec}초 경과</p>
            </div>
        );
    }

    const hasAI = !!data.aiReport;
    const score = hasAI ? data.aiReport!.summary.overallScore : 0;
    const scoreStyle = getScoreColor(score);
    const gradeStyle = hasAI ? getGradeStyle(data.aiReport!.locationAnalysis.grade) : null;

    return (
        <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto animate-in fade-in duration-500">
            <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl flex flex-col">

                {/* Hero Header */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                        backgroundSize: '60px 60px'
                    }} />

                    <div className="relative px-6 pt-14 pb-24 text-center">
                        <button
                            onClick={onBack}
                            className="absolute top-4 left-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <ChevronLeft size={24} className="text-white" />
                        </button>

                        <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full mb-5">
                            {hasAI ? <Sparkles size={13} className="text-amber-300" /> : <CheckCircle2 size={13} className="text-emerald-300" />}
                            <span className="text-xs font-semibold text-white/90">{hasAI ? 'AI 분석 완료' : '분석 완료'}</span>
                        </div>

                        <h1 className="text-[22px] font-extrabold text-white mb-2 leading-tight">
                            {data.locationData.region} {data.businessType}<br />창업 분석 리포트
                        </h1>
                        <p className="text-blue-200 text-sm">
                            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Floating Score + Grade Cards */}
                <div className="px-5 -mt-14 relative z-10">
                    {hasAI ? (
                        <div className="bg-white rounded-2xl shadow-lg border p-5 mb-4 ring-1 ring-slate-100">
                            <div className="flex items-center gap-5">
                                {/* 원형 점수 */}
                                <div className="relative w-20 h-20 shrink-0">
                                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                        <circle cx="40" cy="40" r="34" fill="none" stroke="#F1F5F9" strokeWidth="6" />
                                        <circle
                                            cx="40" cy="40" r="34" fill="none" stroke={scoreStyle.stroke} strokeWidth="6"
                                            strokeDasharray={`${2 * Math.PI * 34}`}
                                            strokeDashoffset={`${2 * Math.PI * 34 * (1 - score / 100)}`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-2xl font-black ${scoreStyle.text}`}>{score}</span>
                                        <span className="text-[9px] text-slate-400 -mt-0.5">/ 100</span>
                                    </div>
                                </div>

                                {/* 상권등급 + 라벨 */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <div className={`w-10 h-10 rounded-xl ${gradeStyle!.bg} flex items-center justify-center shadow-sm`}>
                                            <span className="text-lg font-black text-white">{data.aiReport!.locationAnalysis.grade}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">
                                                {data.aiReport!.locationAnalysis.grade === 'S' ? '최고 입지' :
                                                 data.aiReport!.locationAnalysis.grade === 'A' ? '우수 입지' :
                                                 data.aiReport!.locationAnalysis.grade === 'B' ? '양호 입지' :
                                                 data.aiReport!.locationAnalysis.grade === 'C' ? '보통 입지' : '주의 필요'}
                                            </p>
                                            <p className={`text-xs font-bold ${scoreStyle.text}`}>{data.aiReport!.summary.scoreLabel}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 세부 점수 바 */}
                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
                                {[
                                    { label: '상권 입지', ratio: Math.min(score + 5, 100), color: 'bg-blue-500' },
                                    { label: '경쟁 환경', ratio: Math.min(Math.max(score - 8, 30), 100), color: 'bg-violet-500' },
                                    { label: '비용 적정성', ratio: Math.min(Math.max(score + 2, 35), 100), color: 'bg-emerald-500' },
                                    { label: '준비 상태', ratio: Math.min(Math.max(score - 5, 25), 100), color: 'bg-amber-500' },
                                    { label: '성장 가능성', ratio: Math.min(Math.max(score + 8, 40), 100), color: 'bg-rose-500' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="text-[11px] text-slate-500 w-16 shrink-0">{item.label}</span>
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${item.color} transition-all duration-700`} style={{ width: `${item.ratio}%` }} />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-600 w-6 text-right">{item.ratio}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border p-5 mb-4 text-center ring-1 ring-slate-100">
                            <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                            <p className="font-bold text-slate-800">견적 분석 완료</p>
                        </div>
                    )}

                    {/* AI One-liner */}
                    {hasAI && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100">
                            <div className="flex gap-2.5">
                                <Brain size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                    {data.aiReport!.summary.oneLiner}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 상권 분석 상세 */}
                    {hasAI && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4">
                            {/* 헤더: 등급 배지 + 근거 */}
                            <div className={`px-4 py-3.5 flex items-center gap-3 ${gradeStyle!.light} border-b ${gradeStyle!.border}`}>
                                <div className={`w-11 h-11 rounded-xl ${gradeStyle!.bg} flex items-center justify-center shadow-sm shrink-0`}>
                                    <span className="text-lg font-black text-white">{data.aiReport!.locationAnalysis.grade}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold ${gradeStyle!.text}`}>
                                        {data.aiReport!.locationAnalysis.grade === 'S' ? '최고 입지' :
                                         data.aiReport!.locationAnalysis.grade === 'A' ? '우수 입지' :
                                         data.aiReport!.locationAnalysis.grade === 'B' ? '양호 입지' :
                                         data.aiReport!.locationAnalysis.grade === 'C' ? '보통 입지' : '주의 필요'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{data.aiReport!.locationAnalysis.gradeReason}</p>
                                </div>
                            </div>

                            {/* 타겟 고객 + 피크 시간대 */}
                            <div className="grid grid-cols-2 divide-x divide-slate-100">
                                <div className="p-3.5 flex items-start gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-violet-500">
                                            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 mb-0.5">타겟 고객</p>
                                        <p className="text-xs text-slate-700 font-medium leading-snug">{data.aiReport!.locationAnalysis.targetCustomer}</p>
                                    </div>
                                </div>
                                <div className="p-3.5 flex items-start gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-500">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 mb-0.5">피크 시간</p>
                                        <p className="text-xs text-slate-700 font-medium leading-snug">{data.aiReport!.locationAnalysis.peakHours}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 강점 / 약점 태그 */}
                            <div className="px-4 pb-4 pt-1">
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {data.aiReport!.locationAnalysis.strengths.map((s, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                                            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-emerald-500"><path d="M8 1a.75.75 0 01.75.75v5.5h5.5a.75.75 0 010 1.5h-5.5v5.5a.75.75 0 01-1.5 0v-5.5h-5.5a.75.75 0 010-1.5h5.5v-5.5A.75.75 0 018 1z" /></svg>
                                            {s}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {data.aiReport!.locationAnalysis.weaknesses.map((w, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 text-xs font-medium bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg border border-red-100">
                                            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-red-400"><path d="M3.75 7.25a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5z" /></svg>
                                            {w}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* 주변 상권 팁 */}
                            {data.aiReport!.locationAnalysis.nearbyTip && (
                                <div className="mx-4 mb-4 bg-blue-50 rounded-lg p-3 border border-blue-100">
                                    <div className="flex items-start gap-2">
                                        <Sparkles size={13} className="text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-700 leading-relaxed">{data.aiReport!.locationAnalysis.nearbyTip}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Key Metrics */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4">
                        {/* Cost */}
                        <div className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <TrendingUp size={18} className="text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-400 font-medium">예상 창업 비용</p>
                                <p className="text-[15px] font-bold text-slate-800 whitespace-nowrap">
                                    {formatCurrency(data.totalCostRange.min)} ~ {formatCurrency(data.totalCostRange.max)}
                                </p>
                            </div>
                        </div>
                        <div className="border-t border-slate-50" />

                        {/* Worry Items */}
                        <div className="p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                data.checklist.worryCount > 0 ? 'bg-amber-50' : 'bg-emerald-50'
                            }`}>
                                {data.checklist.worryCount > 0
                                    ? <AlertTriangle size={18} className="text-amber-500" />
                                    : <Shield size={18} className="text-emerald-500" />
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-400 font-medium">도움 필요 항목</p>
                                <p className={`text-[15px] font-bold ${data.checklist.worryCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {data.checklist.worryCount > 0 ? `${data.checklist.worryCount}개 항목` : '모두 준비 완료'}
                                </p>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="border-t border-slate-50" />
                        <div className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                                <MapPin size={18} className="text-violet-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-400 font-medium">분석 지역</p>
                                <p className="text-[15px] font-bold text-slate-800">{data.locationData.region}</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Highlights */}
                    {hasAI && data.aiReport!.summary.keyHighlights.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">핵심 포인트</p>
                            <div className="space-y-2">
                                {data.aiReport!.summary.keyHighlights.map((h, i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <ArrowRight size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-slate-700">{h}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Non-AI fallback message */}
                    {!hasAI && (
                        <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {data.checklist.worryCount > 0
                                    ? `현재 ${data.checklist.worryCount}개의 항목에서 도움이 필요하시군요. 오프닝 매니저가 ${data.locationData.region} 지역의 특성과 예산을 고려한 구체적인 해결책을 레포트에 담았습니다.`
                                    : "준비 상태가 매우 훌륭합니다! 놓친 부분이 없는지, 더 절감할 수 있는 포인트는 없는지 레포트에서 확인해보세요."
                                }
                            </p>
                        </div>
                    )}

                    {/* Download Button */}
                    <div className="pb-8 pt-2">
                        <PDFDownloadLink
                            document={<EstimatePDFDocument {...data} />}
                            fileName={`opening_estimate_${new Date().toISOString().slice(0, 10)}.pdf`}
                            className="w-full block"
                        >
                            <button className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]">
                                <Download size={20} />
                                {hasAI ? 'AI 분석 리포트 다운로드' : '상세 견적 리포트 다운로드'}
                            </button>
                        </PDFDownloadLink>
                        <p className="text-center text-xs text-slate-400 mt-3">
                            {hasAI ? 'AI 분석 포함 7페이지 PDF' : 'PDF 파일로 저장되어 언제든 다시 볼 수 있습니다'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

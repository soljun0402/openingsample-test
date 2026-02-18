import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { EstimatePDFDocument, EstimatePDFProps } from './EstimatePDFView';
import { Loader2, Download, ChevronLeft, CheckCircle2, Brain, Sparkles } from 'lucide-react';
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
                    // AI 완료됨 → 빠르게 100%로
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => setLoading(false), 300);
                        return 100;
                    }
                    return prev + 5;
                }

                if (aiLoading) {
                    // AI 로딩 중 → 90%까지 천천히 (실제 시간 비례)
                    // 30초 타임아웃 기준, 초당 ~3%
                    const target = Math.min(90, elapsed * 3);
                    if (prev < target) {
                        return Math.min(prev + 1.5, target);
                    }
                    return prev;
                }

                // AI 이미 완료된 상태에서 진입 (폴백)
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

    // AI 완료 시 progress를 100으로 밀기
    useEffect(() => {
        if (!aiLoading && progress >= 50) {
            // AI 끝남 → 빠르게 완료
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

    // 현재 AI 단계
    const currentStep = AI_STEPS.reduce((acc, step) => {
        if (progress >= step.threshold) return step;
        return acc;
    }, AI_STEPS[0]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                {/* 원형 프로그레스 */}
                <div className="w-28 h-28 mb-6 relative">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                        <circle cx="56" cy="56" r="50" fill="none" stroke="#E5EDFF" strokeWidth="6" />
                        <circle
                            cx="56" cy="56" r="50" fill="none" stroke="#1E6FFF" strokeWidth="6"
                            strokeDasharray={`${2 * Math.PI * 50}`}
                            strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                            strokeLinecap="round"
                            className="transition-all duration-300 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-brand-600">{Math.floor(progress)}%</span>
                    </div>
                </div>

                <h2 className="text-xl font-bold mb-2 text-slate-800">
                    {aiLoading ? (
                        <>AI가 맞춤형 보고서를<br />생성하고 있습니다</>
                    ) : (
                        <>분석 완료!<br />보고서를 준비 중입니다</>
                    )}
                </h2>

                {/* 현재 단계 표시 */}
                <div className="flex items-center gap-2 mb-6">
                    {aiLoading && <Brain size={14} className="text-brand-500 animate-pulse" />}
                    <p className="text-sm text-slate-500">
                        {currentStep.label}
                    </p>
                </div>

                {/* 경과 시간 */}
                <p className="text-xs text-slate-400 mb-6">{elapsedSec}초 경과</p>

                {/* 단계별 체크리스트 */}
                <div className="space-y-2.5 w-full max-w-xs text-left">
                    <div className={`flex items-center gap-3 transition-all duration-500 ${progress > 5 ? 'opacity-100' : 'opacity-20'}`}>
                        {progress > 25 ? <CheckCircle2 size={16} className="text-green-500 shrink-0" /> : <Loader2 size={16} className="text-brand-400 animate-spin shrink-0" />}
                        <span className="text-sm">사장님 데이터 수집 완료</span>
                    </div>
                    <div className={`flex items-center gap-3 transition-all duration-500 ${progress > 25 ? 'opacity-100' : 'opacity-20'}`}>
                        {progress > 50 ? <CheckCircle2 size={16} className="text-green-500 shrink-0" /> : progress > 25 ? <Loader2 size={16} className="text-brand-400 animate-spin shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />}
                        <span className="text-sm">상권 분석 & 절약 포인트 탐색</span>
                    </div>
                    <div className={`flex items-center gap-3 transition-all duration-500 ${progress > 50 ? 'opacity-100' : 'opacity-20'}`}>
                        {progress > 75 ? <CheckCircle2 size={16} className="text-green-500 shrink-0" /> : progress > 50 ? <Loader2 size={16} className="text-brand-400 animate-spin shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />}
                        <span className="text-sm">맞춤 조언 & 리스크 체크</span>
                    </div>
                    <div className={`flex items-center gap-3 transition-all duration-500 ${progress > 75 ? 'opacity-100' : 'opacity-20'}`}>
                        {progress >= 95 ? <CheckCircle2 size={16} className="text-green-500 shrink-0" /> : progress > 75 ? <Loader2 size={16} className="text-brand-400 animate-spin shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />}
                        <span className="text-sm">오픈 로드맵 완성 & 최종 검수</span>
                    </div>
                </div>

                {/* 하단 프로그레스 바 */}
                <div className="w-full max-w-xs mt-8">
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    const hasAI = !!data.aiReport;

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto animate-in slide-in-from-bottom-10 duration-500">
            <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl flex flex-col">
                {/* Header with back button */}
                <div className="relative px-6 py-8 bg-brand-600 text-white text-center pb-20">
                    <button
                        onClick={onBack}
                        className="absolute top-4 left-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <ChevronLeft size={24} className="text-white" />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <CheckCircle2 size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">분석이 완료되었습니다</h1>
                    <p className="text-brand-100 text-sm">
                        고객님만을 위한 맞춤형 창업 리포트가<br />생성되었습니다.
                    </p>
                    {hasAI && (
                        <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                            <Sparkles size={12} />
                            <span className="text-xs font-medium">AI 분석 포함</span>
                        </div>
                    )}
                </div>

                {/* Content Card */}
                <div className="px-6 -mt-10 mb-8 flex-1">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b">
                            <div>
                                <p className="text-xs text-gray-500 font-bold mb-1">PROJECT</p>
                                <p className="font-bold text-gray-800 text-lg">OPENING ESTIMATE</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-bold mb-1">DATE</p>
                                <p className="font-bold text-gray-800">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 shrink-0">예상 창업 비용</span>
                                <span className="text-brand-600 font-bold text-lg text-right whitespace-nowrap">
                                    {formatCurrency(data.totalCostRange.min)} ~ {formatCurrency(data.totalCostRange.max)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">도움 필요 항목</span>
                                <span className={`font-bold ${data.checklist.worryCount > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                                    {data.checklist.worryCount}개
                                </span>
                            </div>
                            {hasAI && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">AI 종합 점수</span>
                                    <span className={`font-bold ${
                                        data.aiReport!.summary.overallScore >= 80 ? 'text-green-600' :
                                        data.aiReport!.summary.overallScore >= 60 ? 'text-blue-600' :
                                        'text-orange-500'
                                    }`}>{data.aiReport!.summary.overallScore}점</span>
                                </div>
                            )}
                        </div>

                        {/* 상권 등급 블럭 */}
                        {hasAI && (
                            <div className={`rounded-xl p-4 mb-4 border ${
                                ['S', 'A'].includes(data.aiReport!.locationAnalysis.grade)
                                    ? 'bg-green-50 border-green-200'
                                    : data.aiReport!.locationAnalysis.grade === 'B'
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-orange-50 border-orange-200'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-black text-xl text-white ${
                                        data.aiReport!.locationAnalysis.grade === 'S' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                                        data.aiReport!.locationAnalysis.grade === 'A' ? 'bg-green-500' :
                                        data.aiReport!.locationAnalysis.grade === 'B' ? 'bg-blue-500' :
                                        data.aiReport!.locationAnalysis.grade === 'C' ? 'bg-orange-500' :
                                        'bg-red-500'
                                    }`}>
                                        {data.aiReport!.locationAnalysis.grade}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-800">상권 등급</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{data.aiReport!.locationAnalysis.gradeReason}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-600 leading-relaxed border border-gray-100">
                            {hasAI
                                ? data.aiReport!.summary.oneLiner
                                : data.checklist.worryCount > 0
                                    ? `현재 ${data.checklist.worryCount}개의 항목에서 도움이 필요하시군요. 오프닝 매니저가 ${data.locationData.region} 지역의 특성과 예산을 고려한 구체적인 해결책을 레포트에 담았습니다.`
                                    : "준비 상태가 매우 훌륭합니다! 놓친 부분이 없는지, 더 절감할 수 있는 포인트는 없는지 레포트에서 확인해보세요."
                            }
                        </div>

                        {/* PDF Download Button */}
                        <PDFDownloadLink
                            document={<EstimatePDFDocument {...data} />}
                            fileName={`opening_estimate_${new Date().toISOString().slice(0, 10)}.pdf`}
                            className="w-full"
                        >
                            <Button fullWidth size="lg" className="h-14 text-lg font-bold shadow-brand-lg">
                                <Download className="mr-2" size={20} />
                                {hasAI ? 'AI 분석 리포트 다운로드' : '상세 견적 리포트 다운로드'}
                            </Button>
                        </PDFDownloadLink>

                        <p className="text-center text-xs text-gray-400 mt-3">
                            {hasAI ? '* AI 분석 포함 7페이지 PDF' : '* PDF 파일로 저장되어 언제든 다시 볼 수 있습니다.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

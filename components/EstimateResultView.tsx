import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { EstimatePDFDocument, EstimatePDFProps } from './EstimatePDFView';
import { Loader2, Download, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from './Components';

interface EstimateResultViewProps {
    data: EstimatePDFProps;
    onClose?: () => void;
}

export const EstimateResultView: React.FC<EstimateResultViewProps> = ({ data, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate analysis process
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setLoading(false);
                    return 100;
                }
                return prev + 2; // 50 ticks * 60ms ~= 3s
            });
        }, 60);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                <div className="w-24 h-24 mb-8 relative">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div
                        className="absolute inset-0 border-4 border-brand-600 rounded-full border-t-transparent animate-spin"
                        style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent' }}
                    ></div>
                    <Loader2 className="absolute inset-0 m-auto text-brand-600 animate-pulse" size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-slate-800">
                    AI가 상권과 견적을<br />정밀 분석하고 있습니다
                </h2>
                <p className="text-slate-500 mb-8">
                    고객님의 응답을 바탕으로<br />
                    최적의 솔루션을 도출 중입니다... {progress}%
                </p>

                {/* Progress steps simulation */}
                <div className="space-y-3 w-full max-w-xs text-left">
                    <div className={`flex items-center gap-3 transition-opacity duration-500 ${progress > 20 ? 'opacity-100' : 'opacity-30'}`}>
                        <CheckCircle2 size={16} className="text-brand-500" />
                        <span className="text-sm font-medium">상권 데이터 매칭 완료</span>
                    </div>
                    <div className={`flex items-center gap-3 transition-opacity duration-500 delay-100 ${progress > 50 ? 'opacity-100' : 'opacity-30'}`}>
                        <CheckCircle2 size={16} className="text-brand-500" />
                        <span className="text-sm font-medium">예상 비용 산출 완료</span>
                    </div>
                    <div className={`flex items-center gap-3 transition-opacity duration-500 delay-200 ${progress > 80 ? 'opacity-100' : 'opacity-30'}`}>
                        <CheckCircle2 size={16} className="text-brand-500" />
                        <span className="text-sm font-medium">맞춤형 레포트 생성 중...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto animate-in slide-in-from-bottom-10 duration-500">
            <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl flex flex-col">
                {/* Header */}
                <div className="px-6 py-8 bg-brand-600 text-white text-center pb-20">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <CheckCircle2 size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">분석이 완료되었습니다</h1>
                    <p className="text-brand-100 text-sm">
                        고객님만을 위한 맞춤형 창업 리포트가<br />생성되었습니다.
                    </p>
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
                                <span className="text-gray-600">예상 창업 비용</span>
                                <span className="text-brand-600 font-bold text-xl">
                                    {data.totalCostRange.min / 10000}~{data.totalCostRange.max / 10000}만원
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">도움 필요 항목</span>
                                <span className={`font-bold ${data.checklist.worryCount > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                                    {data.checklist.worryCount}개
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-600 leading-relaxed border border-gray-100">
                            {data.checklist.worryCount > 0
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
                                상세 견적 리포트 다운로드
                            </Button>
                        </PDFDownloadLink>

                        <p className="text-center text-xs text-gray-400 mt-3">
                            * PDF 파일로 저장되어 언제든 다시 볼 수 있습니다.
                        </p>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={onClose}
                            className="text-gray-400 text-sm hover:text-gray-600 underline decoration-1 underline-offset-4"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

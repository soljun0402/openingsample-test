import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { AIReportOutput } from '../utils/aiReportApi';

// Register Korean Font
Font.register({
    family: 'NotoKR',
    fonts: [
        { src: '/fonts/NotoSansKR-Light.ttf', fontWeight: 'light' },
        { src: '/fonts/NotoSansKR-Regular.ttf', fontWeight: 'normal' },
        { src: '/fonts/NotoSansKR-Medium.ttf', fontWeight: 'medium' },
        { src: '/fonts/NotoSansKR-Bold.ttf', fontWeight: 'bold' },
    ],
});

// ─── Constants ───
const BRAND = '#1E6FFF';
const TEXT_MAIN = '#000000';
const TEXT_SUB = '#666666';
const TEXT_MUTED = '#999999';
const LINE_COLOR = '#000000';
const LINE_MUTED = '#E5E5E5';
const GREEN = '#34C759';
const ORANGE = '#FF9500';
const BG_GRAY = '#F8F9FA';
const F = 'NotoKR';

// ─── Styles ───
const s = StyleSheet.create({
    page: {
        paddingTop: 45,
        paddingBottom: 60,
        paddingHorizontal: 45,
        backgroundColor: '#FFF',
        fontFamily: F
    },
    logo: {
        width: 100,
        marginBottom: 30,
    },
    // Page 1 Header
    h1: { fontSize: 36, fontWeight: 'bold', color: TEXT_MAIN, marginBottom: 8, letterSpacing: -0.5 },
    preparedText: { fontSize: 10, color: TEXT_SUB, marginBottom: 16 }, // 여백 축소

    // Page 1 Hero
    heroTitle: { fontSize: 16, color: '#333', lineHeight: 1.5, marginBottom: 40, letterSpacing: -0.5 },
    costRange: { fontSize: 28, fontWeight: 'bold', color: BRAND, marginBottom: 60 },
    costLabel: { fontSize: 16, color: TEXT_MAIN, fontWeight: 'bold', letterSpacing: -0.5, marginBottom: 8 },

    // Sections
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: TEXT_MAIN,
        letterSpacing: -0.5,
        paddingBottom: 8,
        borderBottomWidth: 1.5,
        borderBottomColor: LINE_COLOR,
        marginBottom: 12
    },

    // Grid (Location Analysis)
    gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    gridCol: { flex: 1, paddingRight: 10 },
    gridLabel: { fontSize: 7, color: TEXT_MUTED, marginBottom: 4 },
    gridValue: { fontSize: 10, color: TEXT_MAIN },

    // Details Page Header
    h2: { fontSize: 32, fontWeight: 'bold', color: TEXT_MAIN, marginBottom: 30 },

    // Cost Breakdown Table
    tRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: LINE_MUTED
    },
    tLabel: { fontSize: 12, color: TEXT_MAIN },
    tValue: { fontSize: 12, fontWeight: 'bold', color: TEXT_MAIN, textAlign: 'right' },

    // Total Row
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 16,
    },
    totalLabel: { fontSize: 12, fontWeight: 'bold', color: TEXT_MAIN },
    totalValueBox: { alignItems: 'flex-end' },
    totalValuePrimary: { fontSize: 13, fontWeight: 'bold', color: BRAND, marginBottom: 2 },
    totalValueSecondary: { fontSize: 13, fontWeight: 'bold', color: BRAND },

    // Checklist Page
    scoreBoxRow: { flexDirection: 'row', gap: 10, marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: LINE_MUTED },
    scoreBox: { flex: 1, padding: 16, backgroundColor: BG_GRAY, borderRadius: 8, alignItems: 'center' },
    scoreLabel: { fontSize: 9, color: TEXT_SUB, marginBottom: 4 },
    scoreValue: { fontSize: 24, fontWeight: 'bold', color: BRAND },

    checklistContainer: { flexDirection: 'row', gap: 20 },
    checklistCol: { flex: 1 },
    checkColumnHeaderReady: { fontSize: 11, fontWeight: 'bold', color: GREEN, marginBottom: 12 },
    checkColumnHeaderWorry: { fontSize: 11, fontWeight: 'bold', color: ORANGE, marginBottom: 12 },
    checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    checkDotReady: { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN, marginRight: 8 },
    checkDotWorry: { width: 8, height: 8, borderRadius: 4, backgroundColor: ORANGE, marginRight: 8 },
    checkText: { fontSize: 9.5, color: '#444' },

    // Banner
    ctaPanel: {
        backgroundColor: BG_GRAY,
        padding: 20,
        borderRadius: 4,
        marginTop: 40
    },
    ctaTitle: { fontSize: 11, fontWeight: 'bold', color: BRAND, marginBottom: 8 },
    ctaDesc: { fontSize: 9, color: '#444', lineHeight: 1.6 },

    // Footer
    footerView: {
        position: 'absolute',
        bottom: 30,
        left: 45,
        right: 45,
        borderTopWidth: 1,
        borderTopColor: LINE_MUTED,
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    footerText: { fontSize: 8, color: TEXT_MUTED },
});

// ─── Types ───
interface CostBreakdownItem { label: string; min: number; max: number; }
interface ChecklistData { readyCount: number; worryCount: number; worryItems: string[]; readyItems: string[]; }

export interface EstimatePDFProps {
    customerName: string;
    totalCostRange: { min: number; max: number };
    locationData: { region: string; analysis: { label: string; value: string }[] };
    costBreakdown: CostBreakdownItem[];
    checklist: ChecklistData;
    projectName?: string;
    aiReport?: AIReportOutput;
    businessType?: string;
    marketGrade?: 'S' | 'A' | 'B' | 'C' | 'D';
    simpleScore?: number;
    simpleComment?: string;
    checklistTitles?: Record<string, string>;
}

// ─── Helpers ───
const fmtRange = (min: number, max: number) => {
    const f = (val: number) => {
        let v = val < 500000 ? val * 10000 : val;
        if (v >= 100000000) {
            const uk = Math.floor(v / 100000000);
            const r = Math.floor((v % 100000000) / 10000);
            return r > 0 ? `${uk}억 ${new Intl.NumberFormat('ko-KR').format(r)}만원` : `${uk}억원`;
        }
        return new Intl.NumberFormat('ko-KR').format(Math.floor(v / 10000)) + '만원';
    };
    return `${f(min)} ~ ${f(max)}`;
};

const fmtPrice = (val: number) => {
    let v = val < 500000 ? val * 10000 : val;
    if (v >= 100000000) {
        const uk = Math.floor(v / 100000000);
        const r = Math.floor((v % 100000000) / 10000);
        return r > 0 ? `${uk}억 ${new Intl.NumberFormat('ko-KR').format(r)}만원` : `${uk}억원`;
    }
    return new Intl.NumberFormat('ko-KR').format(Math.floor(v / 10000)) + '만원';
};

// ─── Component ───
export const EstimatePDFDocument: React.FC<EstimatePDFProps> = ({
    customerName, totalCostRange, locationData, costBreakdown, checklist, aiReport, simpleScore, marketGrade
}) => {

    // 안전장치: 분석 데이터가 부족할 경우를 대비해 3개만 잘라서 배치
    const analysisItems = locationData.analysis.slice(0, 3);

    // 점수 및 등급 렌더링 값 연산
    const renderingScore = aiReport?.summary?.overallScore || simpleScore || 0;
    const renderingGrade = aiReport?.locationAnalysis?.grade || marketGrade || '-';

    return (
        <Document>
            {/* =========================================================
            PAGE 1: Estimate & Location
        ========================================================= */}
            <Page size="A4" style={s.page}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
                    <Image src="/logo.png" style={{ width: 24, height: 24, marginRight: 6 }} />
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: BRAND, letterSpacing: -0.5 }}>Opening</Text>
                </View>

                <Text style={s.h1}>견적 보고서</Text>
                <Text style={s.preparedText}>예비 창업자: {customerName} | {new Date().toLocaleDateString('ko-KR')}</Text>

                <Text style={s.heroTitle}>창업이라는 긴 여정, 오프닝이 가장 든든한{'\n'}페이스메이커가 되어 드릴게요.</Text>

                <Text style={s.costLabel}>예상 총 창업 비용</Text>
                <Text style={s.costRange}>{fmtRange(totalCostRange.min, totalCostRange.max)}</Text>

                <Text style={s.sectionHeader}>입지 분석 데이터</Text>

                <View style={s.gridRow}>
                    <View style={s.gridCol}>
                        <Text style={s.gridLabel}>지역</Text>
                        <Text style={s.gridValue}>{locationData.region}</Text>
                    </View>
                    {analysisItems[0] && (
                        <View style={s.gridCol}>
                            <Text style={s.gridLabel}>{analysisItems[0].label}</Text>
                            <Text style={s.gridValue}>{analysisItems[0].value}</Text>
                        </View>
                    )}
                    {analysisItems[1] && (
                        <View style={s.gridCol}>
                            <Text style={s.gridLabel}>{analysisItems[1].label}</Text>
                            <Text style={s.gridValue}>{analysisItems[1].value}</Text>
                        </View>
                    )}
                </View>

                {(analysisItems.length > 2) && (
                    <View style={s.gridRow}>
                        <View style={s.gridCol}>
                            <Text style={s.gridLabel}>{analysisItems[2].label}</Text>
                            <Text style={s.gridValue}>{analysisItems[2].value}</Text>
                        </View>
                        <View style={s.gridCol} />
                        <View style={s.gridCol} />
                    </View>
                )}

                <View style={s.footerView}>
                    <Text style={s.footerText}>OPENING STARTUP SOLUTION</Text>
                    <Text style={s.footerText}>Page 1 / 3</Text>
                </View>
            </Page>

            {/* =========================================================
            PAGE 2: Details (Cost Breakdown)
        ========================================================= */}
            <Page size="A4" style={s.page}>
                <View style={{ height: 40 }} />
                <Text style={s.h2}>상세 내역</Text>

                <Text style={s.sectionHeader}>항목별 비용 상세</Text>

                {costBreakdown.map((item, i) => (
                    <View key={i} style={s.tRow}>
                        <Text style={s.tLabel}>{item.label}</Text>
                        <Text style={s.tValue}>{fmtRange(item.min, item.max)}</Text>
                    </View>
                ))}

                <View style={s.totalRow}>
                    <Text style={s.totalLabel}>합계</Text>
                    <View style={s.totalValueBox}>
                        <Text style={s.totalValuePrimary}>{fmtPrice(totalCostRange.min)} ~ {fmtPrice(totalCostRange.max).split(' ')[0]}</Text>
                        <Text style={s.totalValueSecondary}>{fmtPrice(totalCostRange.max).split(' ').slice(1).join(' ')}</Text>
                    </View>
                </View>

                <View style={s.footerView}>
                    <Text style={s.footerText}>OPENING STARTUP SOLUTION</Text>
                    <Text style={s.footerText}>Page 2 / 3</Text>
                </View>
            </Page>

            {/* =========================================================
            PAGE 3: Checklist
        ========================================================= */}
            <Page size="A4" style={s.page}>
                <View style={{ height: 40 }} />
                <Text style={s.h2}>준비 항목 검토</Text>

                {/* Score / Grade Section */}
                <View style={s.scoreBoxRow}>
                    <View style={s.scoreBox}>
                        <Text style={s.scoreLabel}>준비 점수 (AI 종합 분석)</Text>
                        <Text style={s.scoreValue}>{renderingScore}점</Text>
                    </View>
                    <View style={s.scoreBox}>
                        <Text style={s.scoreLabel}>상권 등급</Text>
                        <Text style={s.scoreValue}>{renderingGrade}등급</Text>
                    </View>
                </View>

                <Text style={s.sectionHeader}>준비 현황</Text>

                <View style={s.checklistContainer}>
                    {/* 왼쪽: Required Attention (도움 필요) */}
                    <View style={s.checklistCol}>
                        <Text style={s.checkColumnHeaderWorry}>도움 필요 ({checklist.worryCount})</Text>
                        {checklist.worryItems.map((item, i) => (
                            <View key={i} style={s.checkItem}>
                                <View style={s.checkDotWorry} />
                                <Text style={s.checkText}>{item}</Text>
                            </View>
                        ))}
                        {checklist.worryCount === 0 && (
                            <Text style={[s.checkText, { color: TEXT_MUTED }]}>없음</Text>
                        )}
                    </View>

                    {/* 오른쪽: Ready (준비 완료) */}
                    <View style={s.checklistCol}>
                        <Text style={s.checkColumnHeaderReady}>준비 완료 ({checklist.readyCount})</Text>
                        {checklist.readyItems.map((item, i) => (
                            <View key={i} style={s.checkItem}>
                                <View style={s.checkDotReady} />
                                <Text style={s.checkText}>{item}</Text>
                            </View>
                        ))}
                        {checklist.readyCount === 0 && (
                            <Text style={[s.checkText, { color: TEXT_MUTED }]}>없음</Text>
                        )}
                    </View>
                </View>

                {/* CTA Panel */}
                <View style={s.ctaPanel}>
                    <Text style={s.ctaTitle}>맞춤형 솔루션 제안 (Cost Saving Plan)</Text>
                    <Text style={s.ctaDesc}>
                        {checklist.worryCount > 0
                            ? `${checklist.worryCount}개의 '도움 필요' 항목에 대해 오프닝 전담 매니저가 구체적인 해결책과 비용 절감 방안을 준비했습니다.\n내일 오전 중으로 연락드리겠습니다.`
                            : `대부분의 준비가 완료되셨군요! 성공적인 오픈을 위해 전담 매니저가 마지막 점검을 도와드리겠습니다.\n내일 오전 중으로 연락드리겠습니다.`}
                    </Text>
                </View>

                <View style={s.footerView}>
                    <Text style={s.footerText}>OPENING STARTUP SOLUTION</Text>
                    <Text style={s.footerText}>Page 3 / 3</Text>
                </View>
            </Page>
        </Document>
    );
};


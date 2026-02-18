import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import type { AIReportOutput } from '../utils/aiReportApi';

// Register Korean Font (Noto Sans KR)
Font.register({
    family: 'Noto Sans KR',
    fonts: [
        {
            src: '/fonts/NotoSansKR-Light.ttf',
            fontWeight: 'light',
        },
        {
            src: '/fonts/NotoSansKR-Regular.ttf',
            fontWeight: 'normal',
        },
        {
            src: '/fonts/NotoSansKR-Medium.ttf',
            fontWeight: 'medium',
        },
        {
            src: '/fonts/NotoSansKR-Bold.ttf',
            fontWeight: 'bold',
        },
    ],
});

// ─── Colors ───
const BRAND = '#1E6FFF';
const BRAND_LIGHT = '#F0F6FF';
const BRAND_BORDER = '#E5EDFF';
const GREEN = '#34C759';
const ORANGE = '#FF9500';
const RED = '#FF3B30';
const PURPLE = '#6C3CE9';

// ─── Styles ───
const s = StyleSheet.create({
    page: { padding: 40, paddingBottom: 60, backgroundColor: '#FFFFFF', fontFamily: 'Noto Sans KR' },
    // Typography
    mainTitle: { fontSize: 36, fontWeight: 'bold', color: '#000', marginBottom: 4 },
    pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#000', marginBottom: 4 },
    subtitle: { fontSize: 10, color: '#888', marginBottom: 16 },
    sectionHeader: { fontSize: 12, fontWeight: 'bold', color: BRAND, marginBottom: 6, marginTop: 14, paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: BRAND_BORDER },
    sectionHeaderDark: { fontSize: 12, fontWeight: 'bold', color: '#000', marginBottom: 6, marginTop: 14, paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
    body: { fontSize: 9.5, color: '#333', lineHeight: 1.6 },
    small: { fontSize: 8.5, color: '#666', lineHeight: 1.5 },
    bold: { fontSize: 9.5, fontWeight: 'bold', color: '#000' },
    label: { fontSize: 8, color: '#888', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.8 },
    // Layout
    row: { flexDirection: 'row' },
    col: { flex: 1 },
    card: { padding: 10, backgroundColor: '#F9FAFB', borderRadius: 4, marginBottom: 8 },
    cardBlue: { padding: 10, backgroundColor: BRAND_LIGHT, borderRadius: 4, marginBottom: 8 },
    divider: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0', marginVertical: 6 },
    // Table
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 6, alignItems: 'center' },
    tableLabel: { flex: 2, fontSize: 10 },
    tableValue: { flex: 1, fontSize: 10, textAlign: 'right', fontWeight: 'bold' },
    // Bullets
    bulletRow: { flexDirection: 'row', marginBottom: 3, paddingLeft: 2 },
    bulletDot: { fontSize: 9.5, color: BRAND, marginRight: 5, width: 8 },
    // Checklist
    checkDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    // Risk
    riskCard: { padding: 8, marginBottom: 6, borderRadius: 4, borderLeftWidth: 3 },
    // Phase
    phaseRow: { flexDirection: 'row', marginBottom: 8, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    phaseBadge: { width: 56, marginRight: 8 },
    // Footer
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
    footerText: { fontSize: 8, color: '#AAA' },
    // CTA
    ctaBox: { backgroundColor: '#F5F5F7', padding: 14, borderRadius: 4, marginTop: 12 },
    ctaTitle: { fontSize: 11, fontWeight: 'bold', color: BRAND, marginBottom: 4 },
    ctaText: { fontSize: 9.5, color: '#333', lineHeight: 1.5 },
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
const fmtCost = (amount: number) => {
    let v = amount;
    if (amount < 500000) v = amount * 10000;
    if (v >= 100000000) {
        const uk = Math.floor(v / 100000000);
        const rest = Math.floor((v % 100000000) / 10000);
        return rest > 0 ? `${uk}억 ${new Intl.NumberFormat('ko-KR').format(rest)}만원` : `${uk}억원`;
    }
    return new Intl.NumberFormat('ko-KR').format(Math.floor(v / 10000)) + '만원';
};

const gradeColor = (g: string) => {
    const map: Record<string, string> = { S: PURPLE, A: BRAND, B: GREEN, C: ORANGE, D: RED };
    return map[g] || '#888';
};
const riskColor = (level: string) => {
    const map: Record<string, { border: string; bg: string }> = {
        high: { border: RED, bg: '#FFF5F5' }, medium: { border: ORANGE, bg: '#FFFBF0' }, low: { border: GREEN, bg: '#F0FFF4' },
    };
    return map[level] || { border: '#888', bg: '#F5F5F5' };
};
const riskLabel = (level: string) => ({ high: '높음', medium: '보통', low: '낮음' }[level] || level);

// ─── Component ───
export const EstimatePDFDocument: React.FC<EstimatePDFProps> = ({
    customerName, totalCostRange, locationData, costBreakdown, checklist, projectName, aiReport, checklistTitles,
}) => {
    const hasAI = !!aiReport;
    const totalPages = hasAI ? 5 : 3;

    return (
    <Document>
        {/* ═══════════════════════════════════════════════════════════
            PAGE 1: Cover & Executive Summary
           ═══════════════════════════════════════════════════════════ */}
        <Page size="A4" style={s.page}>
            <Text style={s.mainTitle}>OPENING</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 6 }}>Estimate.</Text>
            <Text style={{ fontSize: 10, color: '#888', marginBottom: 30 }}>
                Prepared for {customerName} | {new Date().toLocaleDateString('ko-KR')}
            </Text>

            {/* Hero: One-liner + Cost */}
            <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, color: '#333', lineHeight: 1.5, marginBottom: 16 }}>
                    {hasAI ? aiReport.summary.oneLiner : '창업이라는 긴 여정, 오프닝이 가장 든든한 페이스메이커가 되어 드릴게요.'}
                </Text>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: BRAND, marginBottom: 3 }}>
                    {fmtCost(totalCostRange.min)} ~ {fmtCost(totalCostRange.max)}
                </Text>
                <Text style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Estimated Total Cost Range</Text>
            </View>

            {/* AI: Score + Grade side by side */}
            {hasAI && (
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                    <View style={{ flex: 1, padding: 12, backgroundColor: BRAND_LIGHT, borderRadius: 6 }}>
                        <Text style={{ fontSize: 8, color: '#888', marginBottom: 4 }}>창업 잠재력 점수</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                            <Text style={{ fontSize: 32, fontWeight: 'bold', color: BRAND, marginRight: 6 }}>{aiReport.summary.overallScore}</Text>
                            <Text style={{ fontSize: 10, color: '#666' }}>/ 100 ({aiReport.summary.scoreLabel})</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1, padding: 12, backgroundColor: BRAND_LIGHT, borderRadius: 6 }}>
                        <Text style={{ fontSize: 8, color: '#888', marginBottom: 4 }}>상권 등급</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: gradeColor(aiReport.locationAnalysis.grade), justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF' }}>{aiReport.locationAnalysis.grade}</Text>
                            </View>
                            <Text style={{ fontSize: 9, color: '#666', flex: 1 }}>{aiReport.locationAnalysis.gradeReason.slice(0, 50)}</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* AI: Key Highlights */}
            {hasAI && (
                <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#666', marginBottom: 6 }}>KEY HIGHLIGHTS</Text>
                    {aiReport.summary.keyHighlights.map((h, i) => (
                        <View key={i} style={s.bulletRow}>
                            <Text style={s.bulletDot}>-</Text>
                            <Text style={s.body}>{h}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Location Data Grid */}
            <Text style={s.sectionHeaderDark}>Location Data</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 4 }}>
                <View style={{ width: '30%' }}>
                    <Text style={s.label}>Region</Text>
                    <Text style={s.bold}>{locationData.region}</Text>
                </View>
                {locationData.analysis.map((item, i) => (
                    <View key={i} style={{ width: '30%' }}>
                        <Text style={s.label}>{item.label}</Text>
                        <Text style={s.bold}>{item.value}</Text>
                    </View>
                ))}
                {projectName && (
                    <View style={{ width: '30%' }}>
                        <Text style={s.label}>Project</Text>
                        <Text style={s.bold}>{projectName}</Text>
                    </View>
                )}
            </View>

            <View style={s.footer}>
                <Text style={s.footerText}>OPENING STARTUP SOLUTION</Text>
                <Text style={s.footerText}>Page 1 / {totalPages}</Text>
            </View>
        </Page>

        {/* ═══════════════════════════════════════════════════════════
            PAGE 2: Cost Details + AI Cost Analysis
           ═══════════════════════════════════════════════════════════ */}
        <Page size="A4" style={s.page}>
            <Text style={s.pageTitle}>Cost Details.</Text>
            <Text style={s.subtitle}>항목별 예상 비용 및 분석</Text>

            {/* Cost Breakdown Table */}
            <Text style={s.sectionHeaderDark}>Cost Breakdown</Text>
            {costBreakdown.map((item, i) => (
                <View key={i} style={s.tableRow}>
                    <Text style={s.tableLabel}>{item.label}</Text>
                    <Text style={s.tableValue}>{fmtCost(item.min)} ~ {fmtCost(item.max)}</Text>
                </View>
            ))}
            <View style={[s.tableRow, { borderBottomWidth: 2, borderBottomColor: '#000', marginTop: 4 }]}>
                <Text style={[s.tableLabel, { fontWeight: 'bold', fontSize: 11 }]}>Total</Text>
                <Text style={[s.tableValue, { color: BRAND, fontSize: 12 }]}>
                    {fmtCost(totalCostRange.min)} ~ {fmtCost(totalCostRange.max)}
                </Text>
            </View>

            {/* AI Cost Analysis */}
            {hasAI && (
                <View style={{ marginTop: 14 }}>
                    <Text style={s.sectionHeader}>AI 비용 분석</Text>
                    <Text style={[s.body, { marginBottom: 10 }]}>{aiReport.costAnalysis.totalComment}</Text>

                    {/* Saving Tips */}
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: GREEN, marginBottom: 6 }}>비용 절감 포인트</Text>
                    {aiReport.costAnalysis.savingTips.map((tip, i) => (
                        <View key={i} style={{ flexDirection: 'row', marginBottom: 6, padding: 8, backgroundColor: '#F9FAFB', borderRadius: 4, borderLeftWidth: 2, borderLeftColor: GREEN }}>
                            <View style={{ width: 60, marginRight: 8 }}>
                                <Text style={s.bold}>{tip.area}</Text>
                                <Text style={{ fontSize: 8, color: BRAND, fontWeight: 'bold' }}>{tip.savedAmount}</Text>
                            </View>
                            <Text style={[s.small, { flex: 1 }]}>{tip.tip}</Text>
                        </View>
                    ))}

                    {/* Budget Priority */}
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: RED, marginTop: 8, marginBottom: 4 }}>절대 아끼면 안 되는 항목</Text>
                    {aiReport.costAnalysis.budgetPriority.map((item, i) => (
                        <View key={i} style={s.bulletRow}>
                            <Text style={{ fontSize: 9, color: RED, marginRight: 5, width: 8, fontWeight: 'bold' }}>!</Text>
                            <Text style={s.body}>{item}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Non-AI: Checklist summary in cost page */}
            {!hasAI && (
                <View style={{ marginTop: 20 }}>
                    <Text style={s.sectionHeaderDark}>Preparation Status</Text>
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                        <View style={[s.card, { flex: 1, borderLeftWidth: 3, borderLeftColor: GREEN }]}>
                            <Text style={{ fontSize: 8, color: '#888', marginBottom: 2 }}>준비 완료</Text>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: GREEN }}>{checklist.readyCount}개</Text>
                        </View>
                        <View style={[s.card, { flex: 1, borderLeftWidth: 3, borderLeftColor: ORANGE }]}>
                            <Text style={{ fontSize: 8, color: '#888', marginBottom: 2 }}>도움 필요</Text>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: ORANGE }}>{checklist.worryCount}개</Text>
                        </View>
                    </View>
                </View>
            )}

            <View style={s.footer}>
                <Text style={s.footerText}>OPENING STARTUP SOLUTION</Text>
                <Text style={s.footerText}>Page 2 / {totalPages}</Text>
            </View>
        </Page>

        {/* ═══════════════════════════════════════════════════════════
            PAGE 3: Location Analysis + Checklist Status
           ═══════════════════════════════════════════════════════════ */}
        <Page size="A4" style={s.page}>
            {hasAI ? (
                <>
                    <Text style={s.pageTitle}>Location Analysis.</Text>
                    <Text style={s.subtitle}>상권 입지 분석 및 체크리스트 현황</Text>

                    {/* Grade + Reason */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View style={{ width: 40, height: 40, borderRadius: 6, backgroundColor: gradeColor(aiReport.locationAnalysis.grade), justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFF' }}>{aiReport.locationAnalysis.grade}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.bold}>상권 등급: {aiReport.locationAnalysis.grade}등급</Text>
                            <Text style={s.small}>{aiReport.locationAnalysis.gradeReason}</Text>
                        </View>
                    </View>

                    {/* Target + Peak side by side */}
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                        <View style={[s.card, { flex: 1 }]}>
                            <Text style={s.label}>주요 타겟 고객</Text>
                            <Text style={s.body}>{aiReport.locationAnalysis.targetCustomer}</Text>
                        </View>
                        <View style={[s.card, { flex: 1 }]}>
                            <Text style={s.label}>피크 시간대</Text>
                            <Text style={s.body}>{aiReport.locationAnalysis.peakHours}</Text>
                        </View>
                    </View>

                    {/* Strengths + Weaknesses side by side */}
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: GREEN, marginBottom: 4 }}>강점</Text>
                            {aiReport.locationAnalysis.strengths.map((item, i) => (
                                <View key={i} style={s.bulletRow}>
                                    <Text style={{ fontSize: 9, color: GREEN, marginRight: 5, width: 8 }}>+</Text>
                                    <Text style={s.body}>{item}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: ORANGE, marginBottom: 4 }}>약점</Text>
                            {aiReport.locationAnalysis.weaknesses.map((item, i) => (
                                <View key={i} style={s.bulletRow}>
                                    <Text style={{ fontSize: 9, color: ORANGE, marginRight: 5, width: 8 }}>-</Text>
                                    <Text style={s.body}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Nearby Tip */}
                    <View style={s.cardBlue}>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: BRAND, marginBottom: 3 }}>주변 상권 활용 팁</Text>
                        <Text style={s.body}>{aiReport.locationAnalysis.nearbyTip}</Text>
                    </View>

                    {/* Compact Checklist Status */}
                    <Text style={[s.sectionHeaderDark, { marginTop: 10 }]}>Checklist Status</Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                        {/* Ready Column */}
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: GREEN, marginBottom: 4 }}>준비 완료 ({checklist.readyCount})</Text>
                            {checklist.readyItems.map((item, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                    <View style={[s.checkDot, { backgroundColor: GREEN }]} />
                                    <Text style={s.small}>{item}</Text>
                                </View>
                            ))}
                            {checklist.readyCount === 0 && <Text style={s.small}>- 없음 -</Text>}
                        </View>
                        {/* Worry Column */}
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: ORANGE, marginBottom: 4 }}>도움 필요 ({checklist.worryCount})</Text>
                            {checklist.worryItems.map((item, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                    <View style={[s.checkDot, { backgroundColor: ORANGE }]} />
                                    <Text style={s.small}>{item}</Text>
                                </View>
                            ))}
                            {checklist.worryCount === 0 && <Text style={s.small}>- 없음 -</Text>}
                        </View>
                    </View>
                </>
            ) : (
                <>
                    <Text style={s.pageTitle}>Checklist.</Text>
                    <Text style={s.subtitle}>창업 준비 현황</Text>

                    <Text style={s.sectionHeaderDark}>Preparation Status</Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                        {/* Worry Column */}
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: ORANGE, marginBottom: 8 }}>도움 필요 ({checklist.worryCount})</Text>
                            {checklist.worryItems.map((item, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                    <View style={[s.checkDot, { backgroundColor: ORANGE }]} />
                                    <Text style={{ fontSize: 10, color: '#444' }}>{item}</Text>
                                </View>
                            ))}
                            {checklist.worryCount === 0 && <Text style={{ fontSize: 10, color: '#999' }}>- 없음 -</Text>}
                        </View>
                        {/* Ready Column */}
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: GREEN, marginBottom: 8 }}>준비 완료 ({checklist.readyCount})</Text>
                            {checklist.readyItems.map((item, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                    <View style={[s.checkDot, { backgroundColor: GREEN }]} />
                                    <Text style={{ fontSize: 10, color: '#444' }}>{item}</Text>
                                </View>
                            ))}
                            {checklist.readyCount === 0 && <Text style={{ fontSize: 10, color: '#999' }}>- 없음 -</Text>}
                        </View>
                    </View>

                    {/* CTA */}
                    <View style={[s.ctaBox, { marginTop: 30 }]}>
                        <Text style={s.ctaTitle}>
                            {checklist.worryCount > 0 ? "맞춤형 솔루션 제안 (Cost Saving Plan)" : "성공적인 오픈을 위한 최종 점검"}
                        </Text>
                        <Text style={s.ctaText}>
                            {checklist.worryCount > 0
                                ? `${checklist.worryCount}개의 '도움 필요' 항목에 대해 오프닝 전담 매니저가 구체적인 해결책과 비용 절감 방안을 준비했습니다. 내일 오전 중으로 연락드리겠습니다.`
                                : "대부분의 준비가 완료되셨군요! 놓친 부분이 없는지 전담 매니저가 더블 체크를 도와드리겠습니다."}
                        </Text>
                    </View>
                </>
            )}

            <View style={s.footer}>
                <Text style={s.footerText}>{hasAI ? 'OPENING AI ANALYSIS' : 'OPENING STARTUP SOLUTION'}</Text>
                <Text style={s.footerText}>Page 3 / {totalPages}</Text>
            </View>
        </Page>

        {/* ═══════════════════════════════════════════════════════════
            PAGE 4 (AI only): Checklist Advice + Risk Factors
           ═══════════════════════════════════════════════════════════ */}
        {hasAI && (
            <Page size="A4" style={s.page}>
                <Text style={s.pageTitle}>Expert Advice.</Text>
                <Text style={s.subtitle}>AI 맞춤 컨설팅 및 리스크 분석</Text>

                {/* Checklist AI Advice */}
                <Text style={s.sectionHeader}>항목별 AI 조언</Text>
                {aiReport.checklistAdvice.map((item, i) => {
                    const isReady = item.status === 'done';
                    const statusColor = isReady ? GREEN : ORANGE;
                    const statusText = isReady ? '완료' : '도움 필요';
                    const title = checklistTitles?.[item.itemId] || item.itemId;

                    return (
                        <View key={i} style={{ marginBottom: 8, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                <View style={[s.checkDot, { backgroundColor: statusColor }]} />
                                <Text style={s.bold}>{title}</Text>
                                <Text style={{ fontSize: 7.5, color: statusColor, marginLeft: 4 }}>({statusText})</Text>
                            </View>
                            <Text style={[s.small, { marginLeft: 14, marginBottom: 2 }]}>{item.advice}</Text>

                            {/* Action Steps */}
                            {item.actionSteps && item.actionSteps.length > 0 && (
                                <View style={{ marginLeft: 14, marginTop: 2 }}>
                                    {item.actionSteps.map((step, j) => (
                                        <View key={j} style={{ flexDirection: 'row', marginBottom: 1 }}>
                                            <Text style={{ fontSize: 8, color: BRAND, marginRight: 3, width: 10 }}>{j + 1}.</Text>
                                            <Text style={s.small}>{step}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                            {/* Cost + Timeline */}
                            {(item.costTip || item.timeline) && (
                                <View style={{ flexDirection: 'row', marginLeft: 14, marginTop: 2, gap: 10 }}>
                                    {item.costTip && <Text style={{ fontSize: 7.5, color: BRAND }}>비용: {item.costTip}</Text>}
                                    {item.timeline && <Text style={{ fontSize: 7.5, color: '#888' }}>기간: {item.timeline}</Text>}
                                </View>
                            )}
                        </View>
                    );
                })}

                {/* Risk Factors */}
                <Text style={[s.sectionHeader, { marginTop: 10 }]}>리스크 요인</Text>
                {aiReport.riskFactors.map((risk, i) => {
                    const c = riskColor(risk.level);
                    return (
                        <View key={i} style={[s.riskCard, { borderLeftColor: c.border, backgroundColor: c.bg }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                <Text style={{ fontSize: 7.5, color: c.border, fontWeight: 'bold', marginRight: 4 }}>[{riskLabel(risk.level)}]</Text>
                                <Text style={s.bold}>{risk.title}</Text>
                            </View>
                            <Text style={[s.small, { marginBottom: 3 }]}>{risk.description}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontSize: 8, color: BRAND, fontWeight: 'bold', marginRight: 3 }}>대응:</Text>
                                <Text style={[s.small, { flex: 1 }]}>{risk.mitigation}</Text>
                            </View>
                        </View>
                    );
                })}

                <View style={s.footer}>
                    <Text style={s.footerText}>OPENING AI ANALYSIS</Text>
                    <Text style={s.footerText}>Page 4 / {totalPages}</Text>
                </View>
            </Page>
        )}

        {/* ═══════════════════════════════════════════════════════════
            PAGE 5 (AI only): Action Plan + Opening Tip + CTA
           ═══════════════════════════════════════════════════════════ */}
        {hasAI && (
            <Page size="A4" style={s.page}>
                <Text style={s.pageTitle}>Action Plan.</Text>
                <Text style={s.subtitle}>실행 로드맵 및 최종 정리</Text>

                {/* Roadmap */}
                <Text style={s.sectionHeader}>실행 로드맵</Text>
                <Text style={{ fontSize: 9, color: BRAND, fontWeight: 'bold', marginBottom: 8 }}>
                    총 예상 기간: {aiReport.actionPlan.totalDuration}
                </Text>

                {aiReport.actionPlan.phases.map((phase, i) => (
                    <View key={i} style={s.phaseRow}>
                        <View style={s.phaseBadge}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: BRAND }}>{phase.phase.split(':')[0] || phase.phase}</Text>
                            <Text style={{ fontSize: 8, color: '#888' }}>{phase.duration}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            {phase.phase.includes(':') && (
                                <Text style={[s.bold, { marginBottom: 2 }]}>
                                    {phase.phase.split(':').slice(1).join(':').trim()}
                                </Text>
                            )}
                            {phase.tasks.map((task, j) => (
                                <View key={j} style={s.bulletRow}>
                                    <Text style={s.bulletDot}>-</Text>
                                    <Text style={s.small}>{task}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Opening Tip */}
                <Text style={[s.sectionHeader, { marginTop: 8 }]}>Opening Tip</Text>
                <View style={[s.cardBlue, { padding: 14 }]}>
                    <Text style={{ fontSize: 10.5, color: '#333', lineHeight: 1.7 }}>
                        "{aiReport.openingTip}"
                    </Text>
                </View>

                {/* Final Summary Card */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    <View style={[s.card, { flex: 1, alignItems: 'center', paddingVertical: 12 }]}>
                        <Text style={{ fontSize: 7.5, color: '#888', marginBottom: 2 }}>잠재력 점수</Text>
                        <Text style={{ fontSize: 22, fontWeight: 'bold', color: BRAND }}>{aiReport.summary.overallScore}</Text>
                        <Text style={{ fontSize: 8, color: '#888' }}>{aiReport.summary.scoreLabel}</Text>
                    </View>
                    <View style={[s.card, { flex: 1, alignItems: 'center', paddingVertical: 12 }]}>
                        <Text style={{ fontSize: 7.5, color: '#888', marginBottom: 2 }}>상권 등급</Text>
                        <Text style={{ fontSize: 22, fontWeight: 'bold', color: gradeColor(aiReport.locationAnalysis.grade) }}>{aiReport.locationAnalysis.grade}</Text>
                        <Text style={{ fontSize: 8, color: '#888' }}>{aiReport.locationAnalysis.grade}등급</Text>
                    </View>
                    <View style={[s.card, { flex: 1, alignItems: 'center', paddingVertical: 12 }]}>
                        <Text style={{ fontSize: 7.5, color: '#888', marginBottom: 2 }}>예상 준비 기간</Text>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 4 }}>{aiReport.actionPlan.totalDuration}</Text>
                    </View>
                </View>

                {/* CTA */}
                <View style={[s.ctaBox, { marginTop: 10 }]}>
                    <Text style={s.ctaTitle}>오프닝과 함께 시작하세요</Text>
                    <Text style={s.ctaText}>
                        이 보고서는 Opening AI가 생성한 참고 자료입니다. 전담 매니저와 상담하시면 더욱 정밀한 맞춤 솔루션을 받으실 수 있습니다.
                        {checklist.worryCount > 0 && ` ${checklist.worryCount}개의 '도움 필요' 항목에 대한 구체적인 해결 방안을 준비해 드리겠습니다.`}
                    </Text>
                </View>

                <View style={s.footer}>
                    <Text style={s.footerText}>OPENING AI ANALYSIS</Text>
                    <Text style={s.footerText}>Page 5 / {totalPages}</Text>
                </View>
            </Page>
        )}
    </Document>
    );
};

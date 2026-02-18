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

// Define styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Noto Sans KR',
    },
    pageDetails: {
        padding: 40,
        paddingBottom: 60,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Noto Sans KR',
    },
    pageChecklist: {
        padding: 40,
        paddingBottom: 150, // More space for CTA overlap
        backgroundColor: '#FFFFFF',
        fontFamily: 'Noto Sans KR',
    },
    // Typography
    serifTitle: {
        fontFamily: 'Noto Sans KR',
        fontSize: 42,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000000',
    },
    sectionTitle: {
        fontFamily: 'Noto Sans KR',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        paddingBottom: 5,
    },
    brandText: {
        color: '#1E6FFF',
    },
    // Hero Section
    heroSection: {
        marginTop: 40,
        marginBottom: 60,
    },
    heroQuote: {
        fontFamily: 'Noto Sans KR',
        fontSize: 24,
        fontStyle: 'normal',
        marginBottom: 20,
        lineHeight: 1.4,
        color: '#333333',
    },
    costRange: {
        fontFamily: 'Noto Sans KR',
        fontWeight: 'bold',
        fontSize: 32,
        color: '#1E6FFF',
        marginBottom: 5,
    },
    costLabel: {
        fontSize: 12,
        color: '#666666',
        textTransform: 'uppercase',
    },
    // Grid Layout
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
    },
    gridItem: {
        width: '30%',
        marginBottom: 20,
    },
    gridLabel: {
        fontSize: 10,
        color: '#888888',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    gridValue: {
        fontSize: 14,
        fontFamily: 'Noto Sans KR',
        color: '#000000',
    },
    // Table
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        paddingVertical: 8,
        alignItems: 'center',
    },
    tableLabel: {
        flex: 2,
        fontSize: 12,
        fontFamily: 'Noto Sans KR',
    },
    tableValue: {
        flex: 1,
        fontSize: 12,
        textAlign: 'right',
        fontFamily: 'Noto Sans KR',
        fontWeight: 'bold',
    },
    // Checklist
    checklistContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    checklistCol: {
        width: '48%',
        marginRight: '2%',
    },
    checkItem: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'center',
    },
    checkIcon: {
        width: 12,
        height: 12,
        marginRight: 8,
        borderRadius: 6,
    },
    checkText: {
        fontSize: 11,
        color: '#444444',
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        paddingTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerText: {
        fontSize: 10,
        color: '#999999',
    },
    ctaBox: {
        backgroundColor: '#F5F5F7',
        padding: 20,
        borderRadius: 4,
        marginTop: 40,
    },
    ctaTitle: {
        fontSize: 14,
        fontFamily: 'Noto Sans KR',
        fontWeight: 'bold',
        color: '#1E6FFF',
        marginBottom: 8,
    },
    ctaText: {
        fontSize: 11,
        color: '#333333',
        lineHeight: 1.4,
    },
    // ─── AI Report Styles ───
    aiPageTitle: {
        fontFamily: 'Noto Sans KR',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 6,
    },
    aiSubtitle: {
        fontSize: 11,
        color: '#888888',
        marginBottom: 24,
    },
    aiSectionHeader: {
        fontFamily: 'Noto Sans KR',
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1E6FFF',
        marginBottom: 8,
        marginTop: 16,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#E5EDFF',
    },
    aiBodyText: {
        fontSize: 10,
        color: '#333333',
        lineHeight: 1.6,
        fontFamily: 'Noto Sans KR',
    },
    aiSmallText: {
        fontSize: 9,
        color: '#666666',
        lineHeight: 1.5,
        fontFamily: 'Noto Sans KR',
    },
    aiBoldText: {
        fontSize: 10,
        color: '#000000',
        fontFamily: 'Noto Sans KR',
        fontWeight: 'bold',
    },
    // Score badge
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#F0F6FF',
        borderRadius: 6,
    },
    scoreNumber: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#1E6FFF',
        fontFamily: 'Noto Sans KR',
        marginRight: 12,
    },
    scoreLabel: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Noto Sans KR',
    },
    // Grade badge
    gradeBadge: {
        width: 32,
        height: 32,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    gradeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'Noto Sans KR',
    },
    // Bullet item
    bulletRow: {
        flexDirection: 'row',
        marginBottom: 4,
        paddingLeft: 4,
    },
    bulletDot: {
        fontSize: 10,
        color: '#1E6FFF',
        marginRight: 6,
        width: 10,
    },
    // Risk card
    riskCard: {
        padding: 10,
        marginBottom: 8,
        borderRadius: 4,
        borderLeftWidth: 3,
    },
    // Phase row
    phaseRow: {
        flexDirection: 'row',
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    phaseBadge: {
        width: 60,
        marginRight: 10,
    },
    phaseName: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1E6FFF',
        fontFamily: 'Noto Sans KR',
    },
    phaseDuration: {
        fontSize: 9,
        color: '#888888',
        fontFamily: 'Noto Sans KR',
    },
    // Saving tip row
    savingTipRow: {
        flexDirection: 'row',
        marginBottom: 8,
        padding: 8,
        backgroundColor: '#F9FAFB',
        borderRadius: 4,
    },
});

// Interfaces
interface CostBreakdownItem {
    label: string;
    min: number;
    max: number;
}

interface ChecklistData {
    readyCount: number;
    worryCount: number;
    worryItems: string[];
    readyItems: string[];
}

export interface EstimatePDFProps {
    customerName: string;
    totalCostRange: { min: number; max: number };
    locationData: {
        region: string;
        analysis: { label: string; value: string }[];
    };
    costBreakdown: CostBreakdownItem[];
    checklist: ChecklistData;
    projectName?: string;
    aiReport?: AIReportOutput;
}

// Helper
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

const getGradeColor = (grade: string) => {
    switch (grade) {
        case 'S': return '#6C3CE9';
        case 'A': return '#1E6FFF';
        case 'B': return '#34C759';
        case 'C': return '#FF9500';
        case 'D': return '#FF3B30';
        default: return '#888888';
    }
};

const getRiskColor = (level: string) => {
    switch (level) {
        case 'high': return { border: '#FF3B30', bg: '#FFF5F5' };
        case 'medium': return { border: '#FF9500', bg: '#FFFBF0' };
        case 'low': return { border: '#34C759', bg: '#F0FFF4' };
        default: return { border: '#888888', bg: '#F5F5F5' };
    }
};

const getRiskLabel = (level: string) => {
    switch (level) {
        case 'high': return '높음';
        case 'medium': return '보통';
        case 'low': return '낮음';
        default: return level;
    }
};

// Component
export const EstimatePDFDocument: React.FC<EstimatePDFProps> = ({
    customerName,
    totalCostRange,
    locationData,
    costBreakdown,
    checklist,
    projectName,
    aiReport
}) => {
    const hasAI = !!aiReport;
    const totalPages = hasAI ? 7 : 3;

    return (
    <Document>
        {/* PAGE 1: Concept & Summary */}
        <Page size="A4" style={styles.page}>
            <Text style={styles.serifTitle}>Estimate.</Text>
            <Text style={{ fontSize: 12, color: '#666666', marginBottom: 40 }}>
                Prepared for {customerName} | {new Date().toLocaleDateString()}
            </Text>

            {/* Hero Section */}
            <View style={styles.heroSection}>
                <Text style={styles.heroQuote}>
                    {hasAI ? aiReport.summary.oneLiner : '창업이라는 긴 여정, 오프닝이 가장 든든한 페이스메이커가 되어 드릴게요.'}
                </Text>
                <Text style={styles.costRange}>
                    {formatCurrency(totalCostRange.min)} ~ {formatCurrency(totalCostRange.max)}
                </Text>
                <Text style={styles.costLabel}>ESTIMATED TOTAL COST RANGE</Text>
            </View>

            {/* AI Summary Score */}
            {hasAI && (
                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreNumber}>{aiReport.summary.overallScore}</Text>
                    <View>
                        <Text style={styles.aiBoldText}>창업 준비도 점수</Text>
                        <Text style={styles.scoreLabel}>{aiReport.summary.scoreLabel}</Text>
                    </View>
                </View>
            )}

            {hasAI && (
                <View style={{ marginBottom: 20 }}>
                    {aiReport.summary.keyHighlights.map((h, i) => (
                        <View key={i} style={styles.bulletRow}>
                            <Text style={styles.bulletDot}>-</Text>
                            <Text style={styles.aiBodyText}>{h}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Technical Data (Market Analysis) */}
            <Text style={styles.sectionTitle}>Technical Data: Location Analysis</Text>
            <View style={styles.gridContainer}>
                <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Region</Text>
                    <Text style={styles.gridValue}>{locationData.region}</Text>
                </View>
                {locationData.analysis.map((item, idx) => (
                    <View key={idx} style={styles.gridItem}>
                        <Text style={styles.gridLabel}>{item.label}</Text>
                        <Text style={styles.gridValue}>{item.value}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>OPENING STARTUP SOLUTION (Rev. Final)</Text>
                <Text style={styles.footerText}>Page 1 / {totalPages}</Text>
            </View>
        </Page>

        {/* PAGE 2: Cost Breakdown */}
        <Page size="A4" style={styles.pageDetails}>
            <Text style={styles.serifTitle}>Details.</Text>

            {/* Cost Breakdown */}
            <View style={{ marginBottom: 40, flex: 1 }}>
                <Text style={styles.sectionTitle}>Cost Breakdown</Text>
                {costBreakdown.map((item, idx) => (
                    <View key={idx} style={styles.tableRow}>
                        <Text style={styles.tableLabel}>{item.label}</Text>
                        <Text style={styles.tableValue}>
                            {formatCurrency(item.min)} ~ {formatCurrency(item.max)}
                        </Text>
                    </View>
                ))}
                <View style={[styles.tableRow, { borderBottomWidth: 0, marginTop: 10 }]}>
                    <Text style={[styles.tableLabel, { fontFamily: 'Noto Sans KR', fontWeight: 'bold' }]}>Total</Text>
                    <Text style={[styles.tableValue, { color: '#1E6FFF', fontSize: 14 }]}>
                        {formatCurrency(totalCostRange.min)} ~ {formatCurrency(totalCostRange.max)}
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>OPENING STARTUP SOLUTION (Rev. Final)</Text>
                <Text style={styles.footerText}>Page 2 / {totalPages}</Text>
            </View>
        </Page>

        {/* PAGE 3: Checklist & Action Plan */}
        <Page size="A4" style={styles.pageChecklist}>
            <Text style={styles.serifTitle}>Checklist.</Text>

            {/* Checklist Status */}
            <View style={{ marginBottom: 40, flex: 1 }}>
                <Text style={styles.sectionTitle}>Preparation Status</Text>
                <View style={styles.checklistContainer}>
                    {/* Help Needed Column */}
                    <View style={styles.checklistCol}>
                        <Text style={{ fontSize: 12, fontFamily: 'Noto Sans KR', fontWeight: 'bold', marginBottom: 10, color: '#FF9500' }}>
                            Required Attention ({checklist.worryCount})
                        </Text>
                        {checklist.worryItems.map((item, idx) => (
                            <View key={idx} style={styles.checkItem}>
                                <View style={[styles.checkIcon, { backgroundColor: '#FF9500' }]} />
                                <Text style={styles.checkText}>{item}</Text>
                            </View>
                        ))}
                        {checklist.worryCount === 0 && (
                            <Text style={{ fontSize: 11, color: '#999' }}>- None -</Text>
                        )}
                    </View>

                    {/* Ready Column */}
                    <View style={styles.checklistCol}>
                        <Text style={{ fontSize: 12, fontFamily: 'Noto Sans KR', fontWeight: 'bold', marginBottom: 10, color: '#34C759' }}>
                            Ready ({checklist.readyCount})
                        </Text>
                        {checklist.readyItems.map((item, idx) => (
                            <View key={idx} style={styles.checkItem}>
                                <View style={[styles.checkIcon, { backgroundColor: '#34C759' }]} />
                                <Text style={styles.checkText}>{item}</Text>
                            </View>
                        ))}
                        {checklist.readyCount === 0 && (
                            <Text style={{ fontSize: 11, color: '#999' }}>- None -</Text>
                        )}
                    </View>
                </View>
            </View>

            {/* PM Action Plan (CTA) */}
            <View style={styles.ctaBox}>
                <Text style={styles.ctaTitle}>
                    {checklist.worryCount > 0
                        ? "맞춤형 솔루션 제안 (Cost Saving Plan)"
                        : "성공적인 오픈을 위한 최종 점검"}
                </Text>
                <Text style={styles.ctaText}>
                    {checklist.worryCount > 0
                        ? `${checklist.worryCount}개의 '도움 필요' 항목에 대해 오프닝 전담 매니저가 구체적인 해결책과 비용 절감 방안을 준비했습니다. 내일 오전 중으로 연락드리겠습니다.`
                        : "대부분의 준비가 완료되셨군요! 놓친 부분이 없는지 전담 매니저가 더블 체크를 도와드리겠습니다."}
                </Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>OPENING STARTUP SOLUTION (Rev. Final)</Text>
                <Text style={styles.footerText}>Page 3 / {totalPages}</Text>
            </View>
        </Page>

        {/* ═══════════════════════════════════════════════════════════
            AI REPORT PAGES (4~7) — aiReport가 있을 때만 렌더링
           ═══════════════════════════════════════════════════════════ */}

        {hasAI && (
            /* PAGE 4: AI 상권 분석 */
            <Page size="A4" style={styles.page}>
                <Text style={styles.aiPageTitle}>AI 상권 분석</Text>
                <Text style={styles.aiSubtitle}>Opening AI가 분석한 입지 리포트</Text>

                {/* 상권 등급 */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(aiReport.locationAnalysis.grade) }]}>
                        <Text style={styles.gradeText}>{aiReport.locationAnalysis.grade}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.aiBoldText}>상권 등급: {aiReport.locationAnalysis.grade}등급</Text>
                        <Text style={styles.aiSmallText}>{aiReport.locationAnalysis.gradeReason}</Text>
                    </View>
                </View>

                {/* 타겟 고객 & 피크 시간 */}
                <View style={{ flexDirection: 'row', marginBottom: 16, gap: 12 }}>
                    <View style={{ flex: 1, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 4 }}>
                        <Text style={{ fontSize: 9, color: '#888', marginBottom: 4, fontFamily: 'Noto Sans KR' }}>주요 타겟 고객</Text>
                        <Text style={styles.aiBodyText}>{aiReport.locationAnalysis.targetCustomer}</Text>
                    </View>
                    <View style={{ flex: 1, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 4 }}>
                        <Text style={{ fontSize: 9, color: '#888', marginBottom: 4, fontFamily: 'Noto Sans KR' }}>피크 시간대</Text>
                        <Text style={styles.aiBodyText}>{aiReport.locationAnalysis.peakHours}</Text>
                    </View>
                </View>

                {/* 강점 */}
                <Text style={styles.aiSectionHeader}>강점</Text>
                {aiReport.locationAnalysis.strengths.map((s, i) => (
                    <View key={i} style={styles.bulletRow}>
                        <Text style={[styles.bulletDot, { color: '#34C759' }]}>+</Text>
                        <Text style={styles.aiBodyText}>{s}</Text>
                    </View>
                ))}

                {/* 약점 */}
                <Text style={styles.aiSectionHeader}>약점</Text>
                {aiReport.locationAnalysis.weaknesses.map((w, i) => (
                    <View key={i} style={styles.bulletRow}>
                        <Text style={[styles.bulletDot, { color: '#FF9500' }]}>-</Text>
                        <Text style={styles.aiBodyText}>{w}</Text>
                    </View>
                ))}

                {/* 주변 상권 활용 팁 */}
                <View style={[styles.ctaBox, { marginTop: 16 }]}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1E6FFF', marginBottom: 4, fontFamily: 'Noto Sans KR' }}>주변 상권 활용 팁</Text>
                    <Text style={styles.aiBodyText}>{aiReport.locationAnalysis.nearbyTip}</Text>
                </View>

                {/* 비용 분석 미리보기 */}
                <Text style={[styles.aiSectionHeader, { marginTop: 20 }]}>비용 분석</Text>
                <Text style={styles.aiBodyText}>{aiReport.costAnalysis.totalComment}</Text>

                {/* 절감 팁 */}
                {aiReport.costAnalysis.savingTips.map((tip, i) => (
                    <View key={i} style={styles.savingTipRow}>
                        <View style={{ width: 60, marginRight: 8 }}>
                            <Text style={styles.aiBoldText}>{tip.area}</Text>
                            <Text style={{ fontSize: 9, color: '#1E6FFF', fontFamily: 'Noto Sans KR' }}>{tip.savedAmount}</Text>
                        </View>
                        <Text style={[styles.aiSmallText, { flex: 1 }]}>{tip.tip}</Text>
                    </View>
                ))}

                {/* 돈 아끼면 안 되는 항목 */}
                <View style={{ marginTop: 10 }}>
                    <Text style={{ fontSize: 9, color: '#FF3B30', fontWeight: 'bold', marginBottom: 4, fontFamily: 'Noto Sans KR' }}>돈 아끼면 안 되는 항목</Text>
                    {aiReport.costAnalysis.budgetPriority.map((item, i) => (
                        <View key={i} style={styles.bulletRow}>
                            <Text style={[styles.bulletDot, { color: '#FF3B30' }]}>!</Text>
                            <Text style={styles.aiSmallText}>{item}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>OPENING AI ANALYSIS</Text>
                    <Text style={styles.footerText}>Page 4 / {totalPages}</Text>
                </View>
            </Page>
        )}

        {hasAI && (
            /* PAGE 5: 체크리스트별 AI 조언 */
            <Page size="A4" style={styles.page}>
                <Text style={styles.aiPageTitle}>AI 체크리스트 조언</Text>
                <Text style={styles.aiSubtitle}>항목별 맞춤 컨설팅</Text>

                {aiReport.checklistAdvice.map((item, i) => {
                    const statusColor = item.status === 'done' ? '#34C759' : item.status === 'worry' ? '#FF9500' : '#CCCCCC';
                    const statusLabel = item.status === 'done' ? '완료' : item.status === 'worry' ? '도움 필요' : '미체크';

                    return (
                        <View key={i} style={{ marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor, marginRight: 6 }} />
                                <Text style={styles.aiBoldText}>{item.itemId}</Text>
                                <Text style={{ fontSize: 8, color: statusColor, marginLeft: 6, fontFamily: 'Noto Sans KR' }}>({statusLabel})</Text>
                            </View>
                            <Text style={[styles.aiSmallText, { marginLeft: 14 }]}>{item.advice}</Text>

                            {/* worry 항목: 실행 단계 */}
                            {item.actionSteps && item.actionSteps.length > 0 && (
                                <View style={{ marginLeft: 14, marginTop: 3 }}>
                                    {item.actionSteps.map((step, j) => (
                                        <View key={j} style={styles.bulletRow}>
                                            <Text style={{ fontSize: 9, color: '#1E6FFF', marginRight: 4, fontFamily: 'Noto Sans KR' }}>{j + 1}.</Text>
                                            <Text style={styles.aiSmallText}>{step}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                            {/* 비용 팁 & 소요 기간 */}
                            {(item.costTip || item.timeline) && (
                                <View style={{ flexDirection: 'row', marginLeft: 14, marginTop: 2, gap: 12 }}>
                                    {item.costTip && <Text style={{ fontSize: 8, color: '#1E6FFF', fontFamily: 'Noto Sans KR' }}>비용: {item.costTip}</Text>}
                                    {item.timeline && <Text style={{ fontSize: 8, color: '#888', fontFamily: 'Noto Sans KR' }}>기간: {item.timeline}</Text>}
                                </View>
                            )}
                        </View>
                    );
                })}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>OPENING AI ANALYSIS</Text>
                    <Text style={styles.footerText}>Page 5 / {totalPages}</Text>
                </View>
            </Page>
        )}

        {hasAI && (
            /* PAGE 6: 리스크 분석 */
            <Page size="A4" style={styles.page}>
                <Text style={styles.aiPageTitle}>리스크 분석</Text>
                <Text style={styles.aiSubtitle}>주의해야 할 요인과 대응 방안</Text>

                {aiReport.riskFactors.map((risk, i) => {
                    const color = getRiskColor(risk.level);
                    return (
                        <View key={i} style={[styles.riskCard, { borderLeftColor: color.border, backgroundColor: color.bg }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <Text style={{ fontSize: 8, color: color.border, fontWeight: 'bold', marginRight: 6, fontFamily: 'Noto Sans KR' }}>
                                    [{getRiskLabel(risk.level)}]
                                </Text>
                                <Text style={styles.aiBoldText}>{risk.title}</Text>
                            </View>
                            <Text style={[styles.aiSmallText, { marginBottom: 4 }]}>{risk.description}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontSize: 9, color: '#1E6FFF', fontWeight: 'bold', marginRight: 4, fontFamily: 'Noto Sans KR' }}>대응:</Text>
                                <Text style={[styles.aiSmallText, { flex: 1 }]}>{risk.mitigation}</Text>
                            </View>
                        </View>
                    );
                })}

                {/* 실행 로드맵 */}
                <Text style={[styles.aiSectionHeader, { marginTop: 24 }]}>실행 로드맵</Text>
                <Text style={{ fontSize: 10, color: '#1E6FFF', fontWeight: 'bold', marginBottom: 12, fontFamily: 'Noto Sans KR' }}>
                    총 예상 기간: {aiReport.actionPlan.totalDuration}
                </Text>

                {aiReport.actionPlan.phases.map((phase, i) => (
                    <View key={i} style={styles.phaseRow}>
                        <View style={styles.phaseBadge}>
                            <Text style={styles.phaseName}>{phase.phase.split(':')[0] || phase.phase}</Text>
                            <Text style={styles.phaseDuration}>{phase.duration}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            {phase.phase.includes(':') && (
                                <Text style={[styles.aiBoldText, { marginBottom: 2 }]}>
                                    {phase.phase.split(':').slice(1).join(':').trim()}
                                </Text>
                            )}
                            {phase.tasks.map((task, j) => (
                                <View key={j} style={styles.bulletRow}>
                                    <Text style={styles.bulletDot}>-</Text>
                                    <Text style={styles.aiSmallText}>{task}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>OPENING AI ANALYSIS</Text>
                    <Text style={styles.footerText}>Page 6 / {totalPages}</Text>
                </View>
            </Page>
        )}

        {hasAI && (
            /* PAGE 7: 오프닝 한마디 + CTA */
            <Page size="A4" style={styles.page}>
                <Text style={styles.aiPageTitle}>Opening Tip.</Text>
                <Text style={styles.aiSubtitle}>Opening AI의 창업 꿀팁</Text>

                <View style={{ padding: 20, backgroundColor: '#F0F6FF', borderRadius: 6, marginBottom: 30 }}>
                    <Text style={{ fontSize: 14, color: '#333333', lineHeight: 1.8, fontFamily: 'Noto Sans KR' }}>
                        "{aiReport.openingTip}"
                    </Text>
                </View>

                {/* 최종 요약 카드 */}
                <View style={{ padding: 20, backgroundColor: '#FAFAFA', borderRadius: 6, marginBottom: 20 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#000', marginBottom: 8, fontFamily: 'Noto Sans KR' }}>
                        {aiReport.summary.title}
                    </Text>
                    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 9, color: '#888', fontFamily: 'Noto Sans KR' }}>준비도 점수</Text>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1E6FFF', fontFamily: 'Noto Sans KR' }}>{aiReport.summary.overallScore}점</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 9, color: '#888', fontFamily: 'Noto Sans KR' }}>상권 등급</Text>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: getGradeColor(aiReport.locationAnalysis.grade), fontFamily: 'Noto Sans KR' }}>{aiReport.locationAnalysis.grade}등급</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 9, color: '#888', fontFamily: 'Noto Sans KR' }}>예상 기간</Text>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', fontFamily: 'Noto Sans KR' }}>{aiReport.actionPlan.totalDuration}</Text>
                        </View>
                    </View>
                </View>

                {/* CTA */}
                <View style={[styles.ctaBox, { marginTop: 20 }]}>
                    <Text style={styles.ctaTitle}>오프닝과 함께 시작하세요</Text>
                    <Text style={styles.ctaText}>
                        이 보고서는 AI가 생성한 참고 자료입니다. 전담 매니저와 상담하시면 더욱 정밀한 맞춤 솔루션을 받으실 수 있습니다.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>OPENING AI ANALYSIS</Text>
                    <Text style={styles.footerText}>Page 7 / {totalPages}</Text>
                </View>
            </Page>
        )}
    </Document>
    );
};

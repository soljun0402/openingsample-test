import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
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
const BG = '#F0F6FF';
const GREEN = '#34C759';
const ORANGE = '#FF9500';
const RED = '#FF3B30';
const PURPLE = '#6C3CE9';
const F = 'NotoKR'; // font shorthand

// ─── Text truncation (prevents page overflow) ───
const cut = (text: string | undefined, max: number) => {
    if (!text) return '';
    return text.length > max ? text.slice(0, max - 1) + '…' : text;
};

// ─── Compact styles ───
const s = StyleSheet.create({
    page: { padding: 32, paddingBottom: 50, backgroundColor: '#FFF', fontFamily: F },
    // Type
    h1: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 2 },
    h2: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 2 },
    h3: { fontSize: 10, fontWeight: 'bold', color: BRAND, marginBottom: 4, marginTop: 8, paddingBottom: 2, borderBottomWidth: 0.5, borderBottomColor: '#E5EDFF' },
    h3d: { fontSize: 10, fontWeight: 'bold', color: '#000', marginBottom: 4, marginTop: 8, paddingBottom: 2, borderBottomWidth: 0.5, borderBottomColor: '#DDD' },
    sub: { fontSize: 8, color: '#999', marginBottom: 10 },
    b9: { fontSize: 8.5, color: '#333', lineHeight: 1.5, fontFamily: F },
    s8: { fontSize: 7.5, color: '#666', lineHeight: 1.4, fontFamily: F },
    bold: { fontSize: 8.5, fontWeight: 'bold', color: '#000', fontFamily: F },
    lbl: { fontSize: 7, color: '#999', marginBottom: 1, textTransform: 'uppercase', letterSpacing: 0.5 },
    // Layout
    row: { flexDirection: 'row' },
    card: { padding: 6, backgroundColor: '#F9FAFB', borderRadius: 3, marginBottom: 4 },
    cardB: { padding: 6, backgroundColor: BG, borderRadius: 3, marginBottom: 4 },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4, marginTop: 2 },
    // Table
    tRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#EEE', paddingVertical: 4, alignItems: 'center' },
    tL: { flex: 2, fontSize: 8.5, fontFamily: F },
    tV: { flex: 1, fontSize: 8.5, textAlign: 'right', fontWeight: 'bold', fontFamily: F },
    // Bullet
    bRow: { flexDirection: 'row', marginBottom: 2, paddingLeft: 2 },
    bDot: { fontSize: 8, color: BRAND, marginRight: 4, width: 6 },
    // Footer
    ft: { position: 'absolute', bottom: 24, left: 32, right: 32, borderTopWidth: 0.5, borderTopColor: '#EEE', paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between' },
    ftT: { fontSize: 7, color: '#BBB' },
    // CTA
    cta: { backgroundColor: '#F5F5F7', padding: 10, borderRadius: 3, marginTop: 8 },
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
const fmt = (amount: number) => {
    let v = amount < 500000 ? amount * 10000 : amount;
    if (v >= 100000000) {
        const uk = Math.floor(v / 100000000);
        const r = Math.floor((v % 100000000) / 10000);
        return r > 0 ? `${uk}억 ${new Intl.NumberFormat('ko-KR').format(r)}만원` : `${uk}억원`;
    }
    return new Intl.NumberFormat('ko-KR').format(Math.floor(v / 10000)) + '만원';
};

const gc = (g: string) => ({ S: PURPLE, A: BRAND, B: GREEN, C: ORANGE, D: RED }[g] || '#888');
const rc = (l: string) => ({ high: { b: RED, bg: '#FFF5F5' }, medium: { b: ORANGE, bg: '#FFFBF0' }, low: { b: GREEN, bg: '#F0FFF4' } }[l] || { b: '#888', bg: '#F5F5F5' });
const rl = (l: string) => ({ high: '높음', medium: '보통', low: '낮음' }[l] || l);

// ─── Component ───
export const EstimatePDFDocument: React.FC<EstimatePDFProps> = ({
    customerName, totalCostRange, locationData, costBreakdown, checklist, projectName, aiReport, checklistTitles,
}) => {
    const ai = aiReport;
    const hasAI = !!ai;
    const tp = hasAI ? 5 : 3;

    return (
    <Document>
        {/* ══════════ PAGE 1: Cover ══════════ */}
        <Page size="A4" style={s.page}>
            <Text style={s.h1}>OPENING</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000', marginBottom: 4, fontFamily: F }}>Estimate.</Text>
            <Text style={{ fontSize: 8, color: '#999', marginBottom: 2, fontFamily: F }}>
                Prepared for {customerName} | {new Date().toLocaleDateString('ko-KR')}
            </Text>
            {hasAI && <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#333', marginBottom: 16, fontFamily: F }}>{ai.summary.title}</Text>}
            {!hasAI && <View style={{ marginBottom: 16 }} />}

            {/* One-liner + Cost */}
            <Text style={{ fontSize: 12, color: '#333', lineHeight: 1.4, marginBottom: 10, fontFamily: F }}>
                {hasAI ? cut(ai.summary.oneLiner, 80) : '창업이라는 긴 여정, 오프닝이 가장 든든한 페이스메이커가 되어 드릴게요.'}
            </Text>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: BRAND, marginBottom: 2, fontFamily: F }}>
                {fmt(totalCostRange.min)} ~ {fmt(totalCostRange.max)}
            </Text>
            <Text style={{ fontSize: 7, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14, fontFamily: F }}>Estimated Total Cost Range</Text>

            {/* Score + Grade */}
            {hasAI && (
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                    <View style={{ flex: 1, padding: 8, backgroundColor: BG, borderRadius: 4 }}>
                        <Text style={{ fontSize: 7, color: '#888', marginBottom: 2, fontFamily: F }}>창업 잠재력 점수</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                            <Text style={{ fontSize: 26, fontWeight: 'bold', color: BRAND, marginRight: 4, fontFamily: F }}>{ai.summary.overallScore}</Text>
                            <Text style={{ fontSize: 8, color: '#666', fontFamily: F }}>/ 100 ({ai.summary.scoreLabel})</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1, padding: 8, backgroundColor: BG, borderRadius: 4 }}>
                        <Text style={{ fontSize: 7, color: '#888', marginBottom: 2, fontFamily: F }}>상권 등급</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 28, height: 28, borderRadius: 4, backgroundColor: gc(ai.locationAnalysis.grade), justifyContent: 'center', alignItems: 'center', marginRight: 6 }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFF', fontFamily: F }}>{ai.locationAnalysis.grade}</Text>
                            </View>
                            <Text style={{ fontSize: 7.5, color: '#666', flex: 1, fontFamily: F }}>{cut(ai.locationAnalysis.gradeReason, 45)}</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Key Highlights */}
            {hasAI && (
                <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: '#888', marginBottom: 4, fontFamily: F }}>KEY HIGHLIGHTS</Text>
                    {ai.summary.keyHighlights.slice(0, 4).map((h, i) => (
                        <View key={i} style={s.bRow}>
                            <Text style={s.bDot}>-</Text>
                            <Text style={s.b9}>{cut(h, 50)}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Location Grid */}
            <Text style={s.h3d}>Location Data</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 2 }}>
                <View style={{ width: '30%' }}><Text style={s.lbl}>Region</Text><Text style={s.bold}>{locationData.region}</Text></View>
                {locationData.analysis.map((a, i) => (
                    <View key={i} style={{ width: '30%' }}><Text style={s.lbl}>{a.label}</Text><Text style={s.bold}>{a.value}</Text></View>
                ))}
            </View>

            <View style={s.ft}><Text style={s.ftT}>OPENING STARTUP SOLUTION</Text><Text style={s.ftT}>Page 1 / {tp}</Text></View>
        </Page>

        {/* ══════════ PAGE 2: Cost + AI Cost Analysis ══════════ */}
        <Page size="A4" style={s.page}>
            <Text style={s.h2}>Cost Details.</Text>
            <Text style={s.sub}>항목별 예상 비용 및 분석</Text>

            <Text style={s.h3d}>Cost Breakdown</Text>
            {costBreakdown.slice(0, 10).map((item, i) => (
                <View key={i} style={s.tRow}>
                    <Text style={s.tL}>{item.label}</Text>
                    <Text style={s.tV}>{fmt(item.min)} ~ {fmt(item.max)}</Text>
                </View>
            ))}
            <View style={[s.tRow, { borderBottomWidth: 1.5, borderBottomColor: '#000', marginTop: 2 }]}>
                <Text style={[s.tL, { fontWeight: 'bold' }]}>Total</Text>
                <Text style={[s.tV, { color: BRAND, fontSize: 10 }]}>{fmt(totalCostRange.min)} ~ {fmt(totalCostRange.max)}</Text>
            </View>

            {hasAI && (
                <View style={{ marginTop: 8 }}>
                    <Text style={s.h3}>AI 비용 분석</Text>
                    <Text style={[s.b9, { marginBottom: 6 }]}>{cut(ai.costAnalysis.totalComment, 120)}</Text>

                    <Text style={{ fontSize: 8, fontWeight: 'bold', color: GREEN, marginBottom: 3, fontFamily: F }}>비용 절감 포인트</Text>
                    {ai.costAnalysis.savingTips.slice(0, 3).map((tip, i) => (
                        <View key={i} style={{ flexDirection: 'row', marginBottom: 4, padding: 5, backgroundColor: '#F9FAFB', borderRadius: 3, borderLeftWidth: 2, borderLeftColor: GREEN }}>
                            <View style={{ width: 50, marginRight: 6 }}>
                                <Text style={s.bold}>{tip.area}</Text>
                                <Text style={{ fontSize: 7, color: BRAND, fontWeight: 'bold', fontFamily: F }}>{tip.savedAmount}</Text>
                            </View>
                            <Text style={[s.s8, { flex: 1 }]}>{cut(tip.tip, 80)}</Text>
                        </View>
                    ))}

                    <Text style={{ fontSize: 8, fontWeight: 'bold', color: RED, marginTop: 4, marginBottom: 2, fontFamily: F }}>절대 아끼면 안 되는 항목</Text>
                    {ai.costAnalysis.budgetPriority.slice(0, 3).map((p, i) => (
                        <View key={i} style={s.bRow}>
                            <Text style={{ fontSize: 8, color: RED, marginRight: 3, width: 6, fontWeight: 'bold', fontFamily: F }}>!</Text>
                            <Text style={s.b9}>{cut(p, 55)}</Text>
                        </View>
                    ))}
                </View>
            )}

            {!hasAI && (
                <View style={{ marginTop: 14 }}>
                    <Text style={s.h3d}>Preparation Status</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                        <View style={[s.card, { flex: 1, borderLeftWidth: 2, borderLeftColor: GREEN }]}>
                            <Text style={{ fontSize: 7, color: '#888', fontFamily: F }}>준비 완료</Text>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: GREEN, fontFamily: F }}>{checklist.readyCount}개</Text>
                        </View>
                        <View style={[s.card, { flex: 1, borderLeftWidth: 2, borderLeftColor: ORANGE }]}>
                            <Text style={{ fontSize: 7, color: '#888', fontFamily: F }}>도움 필요</Text>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: ORANGE, fontFamily: F }}>{checklist.worryCount}개</Text>
                        </View>
                    </View>
                </View>
            )}

            <View style={s.ft}><Text style={s.ftT}>OPENING STARTUP SOLUTION</Text><Text style={s.ftT}>Page 2 / {tp}</Text></View>
        </Page>

        {/* ══════════ PAGE 3: Location Analysis + Checklist ══════════ */}
        <Page size="A4" style={s.page}>
            {hasAI ? (
                <>
                    <Text style={s.h2}>Location Analysis.</Text>
                    <Text style={s.sub}>상권 입지 분석 및 체크리스트 현황</Text>

                    {/* Grade */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <View style={{ width: 30, height: 30, borderRadius: 4, backgroundColor: gc(ai.locationAnalysis.grade), justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFF', fontFamily: F }}>{ai.locationAnalysis.grade}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.bold}>상권 등급: {ai.locationAnalysis.grade}등급</Text>
                            <Text style={s.s8}>{cut(ai.locationAnalysis.gradeReason, 100)}</Text>
                        </View>
                    </View>

                    {/* Target + Peak */}
                    <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
                        <View style={[s.card, { flex: 1 }]}>
                            <Text style={s.lbl}>주요 타겟 고객</Text>
                            <Text style={s.b9}>{cut(ai.locationAnalysis.targetCustomer, 60)}</Text>
                        </View>
                        <View style={[s.card, { flex: 1 }]}>
                            <Text style={s.lbl}>피크 시간대</Text>
                            <Text style={s.b9}>{cut(ai.locationAnalysis.peakHours, 60)}</Text>
                        </View>
                    </View>

                    {/* Strengths + Weaknesses */}
                    <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold', color: GREEN, marginBottom: 2, fontFamily: F }}>강점</Text>
                            {ai.locationAnalysis.strengths.slice(0, 3).map((x, i) => (
                                <View key={i} style={s.bRow}>
                                    <Text style={{ fontSize: 7.5, color: GREEN, marginRight: 3, width: 6, fontFamily: F }}>+</Text>
                                    <Text style={s.s8}>{cut(x, 55)}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold', color: ORANGE, marginBottom: 2, fontFamily: F }}>약점</Text>
                            {ai.locationAnalysis.weaknesses.slice(0, 2).map((x, i) => (
                                <View key={i} style={s.bRow}>
                                    <Text style={{ fontSize: 7.5, color: ORANGE, marginRight: 3, width: 6, fontFamily: F }}>-</Text>
                                    <Text style={s.s8}>{cut(x, 55)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Nearby Tip */}
                    <View style={s.cardB}>
                        <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: BRAND, marginBottom: 2, fontFamily: F }}>주변 상권 활용 팁</Text>
                        <Text style={s.b9}>{cut(ai.locationAnalysis.nearbyTip, 100)}</Text>
                    </View>

                    {/* Checklist (compact) */}
                    <Text style={[s.h3d, { marginTop: 6 }]}>Checklist Status</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: GREEN, marginBottom: 2, fontFamily: F }}>준비 완료 ({checklist.readyCount})</Text>
                            {checklist.readyItems.slice(0, 8).map((x, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                    <View style={[s.dot, { backgroundColor: GREEN }]} />
                                    <Text style={s.s8}>{x}</Text>
                                </View>
                            ))}
                            {checklist.readyCount === 0 && <Text style={s.s8}>- 없음 -</Text>}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: ORANGE, marginBottom: 2, fontFamily: F }}>도움 필요 ({checklist.worryCount})</Text>
                            {checklist.worryItems.slice(0, 8).map((x, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                    <View style={[s.dot, { backgroundColor: ORANGE }]} />
                                    <Text style={s.s8}>{x}</Text>
                                </View>
                            ))}
                            {checklist.worryCount === 0 && <Text style={s.s8}>- 없음 -</Text>}
                        </View>
                    </View>
                </>
            ) : (
                <>
                    <Text style={s.h2}>Checklist.</Text>
                    <Text style={s.sub}>창업 준비 현황</Text>
                    <Text style={s.h3d}>Preparation Status</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: ORANGE, marginBottom: 4, fontFamily: F }}>도움 필요 ({checklist.worryCount})</Text>
                            {checklist.worryItems.map((x, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    <View style={[s.dot, { backgroundColor: ORANGE }]} /><Text style={{ fontSize: 9, color: '#444', fontFamily: F }}>{x}</Text>
                                </View>
                            ))}
                            {checklist.worryCount === 0 && <Text style={{ fontSize: 9, color: '#999', fontFamily: F }}>- 없음 -</Text>}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: GREEN, marginBottom: 4, fontFamily: F }}>준비 완료 ({checklist.readyCount})</Text>
                            {checklist.readyItems.map((x, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    <View style={[s.dot, { backgroundColor: GREEN }]} /><Text style={{ fontSize: 9, color: '#444', fontFamily: F }}>{x}</Text>
                                </View>
                            ))}
                            {checklist.readyCount === 0 && <Text style={{ fontSize: 9, color: '#999', fontFamily: F }}>- 없음 -</Text>}
                        </View>
                    </View>
                    <View style={[s.cta, { marginTop: 20 }]}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: BRAND, marginBottom: 3, fontFamily: F }}>
                            {checklist.worryCount > 0 ? "맞춤형 솔루션 제안" : "성공적인 오픈을 위한 최종 점검"}
                        </Text>
                        <Text style={{ fontSize: 8.5, color: '#333', lineHeight: 1.4, fontFamily: F }}>
                            {checklist.worryCount > 0
                                ? `${checklist.worryCount}개의 '도움 필요' 항목에 대해 오프닝 전담 매니저가 해결책과 비용 절감 방안을 준비했습니다.`
                                : "대부분의 준비가 완료되셨군요! 전담 매니저가 더블 체크를 도와드리겠습니다."}
                        </Text>
                    </View>
                </>
            )}
            <View style={s.ft}><Text style={s.ftT}>{hasAI ? 'OPENING AI ANALYSIS' : 'OPENING STARTUP SOLUTION'}</Text><Text style={s.ftT}>Page 3 / {tp}</Text></View>
        </Page>

        {/* ══════════ PAGE 4 (AI): Advice + Risk ══════════ */}
        {hasAI && (
            <Page size="A4" style={s.page}>
                <Text style={s.h2}>Expert Advice.</Text>
                <Text style={s.sub}>AI 맞춤 컨설팅 및 리스크 분석</Text>

                <Text style={s.h3}>항목별 AI 조언</Text>
                {ai.checklistAdvice.slice(0, 10).map((item, i) => {
                    const done = item.status === 'done';
                    const color = done ? GREEN : ORANGE;
                    const title = checklistTitles?.[item.itemId] || item.itemId;

                    return (
                        <View key={i} style={{ marginBottom: 4, paddingBottom: 3, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 1 }}>
                                <View style={[s.dot, { backgroundColor: color }]} />
                                <Text style={s.bold}>{title}</Text>
                                <Text style={{ fontSize: 6.5, color, marginLeft: 3, fontFamily: F }}>({done ? '완료' : '도움필요'})</Text>
                            </View>
                            <Text style={[s.s8, { marginLeft: 10 }]}>{cut(item.advice, 70)}</Text>

                            {/* Worry: action steps (max 2) */}
                            {!done && item.actionSteps && item.actionSteps.length > 0 && (
                                <View style={{ marginLeft: 10, marginTop: 1 }}>
                                    {item.actionSteps.slice(0, 2).map((step, j) => (
                                        <View key={j} style={{ flexDirection: 'row', marginBottom: 1 }}>
                                            <Text style={{ fontSize: 7, color: BRAND, marginRight: 2, width: 8, fontFamily: F }}>{j + 1}.</Text>
                                            <Text style={s.s8}>{cut(step, 55)}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                            {/* Cost + Timeline (worry only) */}
                            {!done && (item.costTip || item.timeline) && (
                                <View style={{ flexDirection: 'row', marginLeft: 10, marginTop: 1, gap: 8 }}>
                                    {item.costTip && <Text style={{ fontSize: 7, color: BRAND, fontFamily: F }}>비용: {cut(item.costTip, 35)}</Text>}
                                    {item.timeline && <Text style={{ fontSize: 7, color: '#888', fontFamily: F }}>기간: {item.timeline}</Text>}
                                </View>
                            )}
                        </View>
                    );
                })}

                {/* Risk */}
                <Text style={[s.h3, { marginTop: 6 }]}>리스크 요인</Text>
                {ai.riskFactors.slice(0, 3).map((risk, i) => {
                    const c = rc(risk.level);
                    return (
                        <View key={i} style={{ padding: 6, marginBottom: 4, borderRadius: 3, borderLeftWidth: 2, borderLeftColor: c.b, backgroundColor: c.bg }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                <Text style={{ fontSize: 7, color: c.b, fontWeight: 'bold', marginRight: 3, fontFamily: F }}>[{rl(risk.level)}]</Text>
                                <Text style={s.bold}>{risk.title}</Text>
                            </View>
                            <Text style={[s.s8, { marginBottom: 2 }]}>{cut(risk.description, 80)}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontSize: 7.5, color: BRAND, fontWeight: 'bold', marginRight: 2, fontFamily: F }}>대응:</Text>
                                <Text style={[s.s8, { flex: 1 }]}>{cut(risk.mitigation, 80)}</Text>
                            </View>
                        </View>
                    );
                })}

                <View style={s.ft}><Text style={s.ftT}>OPENING AI ANALYSIS</Text><Text style={s.ftT}>Page 4 / {tp}</Text></View>
            </Page>
        )}

        {/* ══════════ PAGE 5 (AI): Action Plan + Tip + CTA ══════════ */}
        {hasAI && (
            <Page size="A4" style={s.page}>
                <Text style={s.h2}>Action Plan.</Text>
                <Text style={s.sub}>실행 로드맵 및 최종 정리</Text>

                <Text style={s.h3}>실행 로드맵</Text>
                <Text style={{ fontSize: 8, color: BRAND, fontWeight: 'bold', marginBottom: 6, fontFamily: F }}>
                    총 예상 기간: {ai.actionPlan.totalDuration}
                </Text>

                {ai.actionPlan.phases.slice(0, 4).map((phase, i) => (
                    <View key={i} style={{ flexDirection: 'row', marginBottom: 6, paddingBottom: 4, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0' }}>
                        <View style={{ width: 48, marginRight: 6 }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold', color: BRAND, fontFamily: F }}>{phase.phase.split(':')[0] || phase.phase}</Text>
                            <Text style={{ fontSize: 7, color: '#888', fontFamily: F }}>{phase.duration}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            {phase.phase.includes(':') && (
                                <Text style={[s.bold, { marginBottom: 1 }]}>{phase.phase.split(':').slice(1).join(':').trim()}</Text>
                            )}
                            {phase.tasks.slice(0, 4).map((task, j) => (
                                <View key={j} style={s.bRow}>
                                    <Text style={s.bDot}>-</Text>
                                    <Text style={s.s8}>{cut(task, 40)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Opening Tip */}
                <Text style={[s.h3, { marginTop: 4 }]}>Opening Tip</Text>
                <View style={[s.cardB, { padding: 10 }]}>
                    <Text style={{ fontSize: 9, color: '#333', lineHeight: 1.6, fontFamily: F }}>
                        "{cut(ai.openingTip, 180)}"
                    </Text>
                </View>

                {/* Summary Cards */}
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                    <View style={[s.card, { flex: 1, alignItems: 'center', paddingVertical: 8 }]}>
                        <Text style={{ fontSize: 6.5, color: '#888', marginBottom: 1, fontFamily: F }}>잠재력 점수</Text>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: BRAND, fontFamily: F }}>{ai.summary.overallScore}</Text>
                        <Text style={{ fontSize: 7, color: '#888', fontFamily: F }}>{ai.summary.scoreLabel}</Text>
                    </View>
                    <View style={[s.card, { flex: 1, alignItems: 'center', paddingVertical: 8 }]}>
                        <Text style={{ fontSize: 6.5, color: '#888', marginBottom: 1, fontFamily: F }}>상권 등급</Text>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: gc(ai.locationAnalysis.grade), fontFamily: F }}>{ai.locationAnalysis.grade}</Text>
                        <Text style={{ fontSize: 7, color: '#888', fontFamily: F }}>{ai.locationAnalysis.grade}등급</Text>
                    </View>
                    <View style={[s.card, { flex: 1, alignItems: 'center', paddingVertical: 8 }]}>
                        <Text style={{ fontSize: 6.5, color: '#888', marginBottom: 1, fontFamily: F }}>예상 기간</Text>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#333', marginTop: 3, fontFamily: F }}>{ai.actionPlan.totalDuration}</Text>
                    </View>
                </View>

                {/* CTA */}
                <View style={[s.cta, { marginTop: 6 }]}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: BRAND, marginBottom: 2, fontFamily: F }}>오프닝과 함께 시작하세요</Text>
                    <Text style={{ fontSize: 8, color: '#333', lineHeight: 1.4, fontFamily: F }}>
                        이 보고서는 Opening AI가 생성한 참고 자료입니다. 전담 매니저와 상담하시면 더욱 정밀한 맞춤 솔루션을 받으실 수 있습니다.
                        {checklist.worryCount > 0 && ` ${checklist.worryCount}개의 '도움 필요' 항목에 대한 해결 방안을 준비해 드리겠습니다.`}
                    </Text>
                </View>

                <View style={s.ft}><Text style={s.ftT}>OPENING AI ANALYSIS</Text><Text style={s.ftT}>Page 5 / {tp}</Text></View>
            </Page>
        )}
    </Document>
    );
};

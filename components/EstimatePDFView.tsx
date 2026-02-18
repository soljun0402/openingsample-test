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
const F = 'NotoKR';

// Text truncation
const cut = (text: string | undefined, max: number) => {
    if (!text) return '';
    return text.length > max ? text.slice(0, max - 1) + '…' : text;
};

// ─── Styles ───
const s = StyleSheet.create({
    page: { padding: 32, paddingBottom: 50, backgroundColor: '#FFF', fontFamily: F },
    h1: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 2 },
    h2: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 2 },
    h3: { fontSize: 10, fontWeight: 'bold', color: BRAND, marginBottom: 4, marginTop: 8, paddingBottom: 2, borderBottomWidth: 0.5, borderBottomColor: '#E5EDFF' },
    h3d: { fontSize: 10, fontWeight: 'bold', color: '#000', marginBottom: 4, marginTop: 8, paddingBottom: 2, borderBottomWidth: 0.5, borderBottomColor: '#DDD' },
    sub: { fontSize: 8, color: '#999', marginBottom: 10 },
    b9: { fontSize: 8.5, color: '#333', lineHeight: 1.5, fontFamily: F },
    s8: { fontSize: 7.5, color: '#666', lineHeight: 1.4, fontFamily: F },
    bold: { fontSize: 8.5, fontWeight: 'bold', color: '#000', fontFamily: F },
    lbl: { fontSize: 7, color: '#999', marginBottom: 1 },
    card: { padding: 6, backgroundColor: '#F9FAFB', borderRadius: 3, marginBottom: 4 },
    cardB: { padding: 6, backgroundColor: BG, borderRadius: 3, marginBottom: 4 },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4, marginTop: 2 },
    tRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#EEE', paddingVertical: 4, alignItems: 'center' },
    tL: { flex: 2, fontSize: 8.5, fontFamily: F },
    tV: { flex: 1, fontSize: 8.5, textAlign: 'right', fontWeight: 'bold', fontFamily: F },
    bRow: { flexDirection: 'row', marginBottom: 2, paddingLeft: 2 },
    bDot: { fontSize: 8, color: BRAND, marginRight: 4, width: 6 },
    ft: { position: 'absolute', bottom: 24, left: 32, right: 32, borderTopWidth: 0.5, borderTopColor: '#EEE', paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between' },
    ftT: { fontSize: 7, color: '#BBB' },
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

    // AI가 있으면 주요 타겟을 AI 분석 데이터로 교체
    const locationAnalysis = locationData.analysis.map(item => {
        if (item.label === '주요 타겟' && hasAI) {
            return { ...item, value: cut(ai.locationAnalysis.targetCustomer, 40) };
        }
        return item;
    });

    return (
    <Document>
        {/* ══════════════════════════════════════════════════════
            PAGE 1: 개요 — 견적 요약 + 비용 상세
           ══════════════════════════════════════════════════════ */}
        <Page size="A4" style={s.page}>
            <Text style={s.h1}>OPENING</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000', marginBottom: 3, fontFamily: F }}>견적 보고서</Text>
            <Text style={{ fontSize: 8, color: '#999', marginBottom: 2, fontFamily: F }}>
                {customerName} | {new Date().toLocaleDateString('ko-KR')}
            </Text>
            {hasAI && <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#333', marginBottom: 12, fontFamily: F }}>{ai.summary.title}</Text>}
            {!hasAI && <View style={{ marginBottom: 12 }} />}

            {/* 한 줄 요약 + 비용 */}
            <Text style={{ fontSize: 11, color: '#333', lineHeight: 1.4, marginBottom: 8, fontFamily: F }}>
                {hasAI ? cut(ai.summary.oneLiner, 80) : '창업이라는 긴 여정, 오프닝이 가장 든든한 페이스메이커가 되어 드릴게요.'}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: BRAND, marginBottom: 2, fontFamily: F }}>
                {fmt(totalCostRange.min)} ~ {fmt(totalCostRange.max)}
            </Text>
            <Text style={{ fontSize: 7, color: '#999', marginBottom: 10, fontFamily: F }}>예상 총 창업 비용</Text>

            {/* 점수 + 등급 */}
            {hasAI && (
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <View style={{ flex: 1, padding: 7, backgroundColor: BG, borderRadius: 4 }}>
                        <Text style={{ fontSize: 6.5, color: '#888', marginBottom: 1, fontFamily: F }}>창업 잠재력 점수</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                            <Text style={{ fontSize: 22, fontWeight: 'bold', color: BRAND, marginRight: 3, fontFamily: F }}>{ai.summary.overallScore}</Text>
                            <Text style={{ fontSize: 8, color: '#666', fontFamily: F }}>/ 100 ({ai.summary.scoreLabel})</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1, padding: 7, backgroundColor: BG, borderRadius: 4 }}>
                        <Text style={{ fontSize: 6.5, color: '#888', marginBottom: 1, fontFamily: F }}>상권 등급</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: gc(ai.locationAnalysis.grade), justifyContent: 'center', alignItems: 'center', marginRight: 6 }}>
                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#FFF', fontFamily: F }}>{ai.locationAnalysis.grade}</Text>
                            </View>
                            <Text style={{ fontSize: 7, color: '#666', flex: 1, fontFamily: F }}>{cut(ai.locationAnalysis.gradeReason, 40)}</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* 핵심 포인트 */}
            {hasAI && (
                <View style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: '#888', marginBottom: 3, fontFamily: F }}>핵심 포인트</Text>
                    {ai.summary.keyHighlights.slice(0, 4).map((h, i) => (
                        <View key={i} style={s.bRow}><Text style={s.bDot}>-</Text><Text style={s.b9}>{cut(h, 50)}</Text></View>
                    ))}
                </View>
            )}

            {/* 입지 정보 */}
            <Text style={s.h3d}>입지 정보</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 2 }}>
                <View style={{ width: '30%' }}><Text style={s.lbl}>지역</Text><Text style={s.bold}>{locationData.region}</Text></View>
                {locationAnalysis.map((a, i) => (
                    <View key={i} style={{ width: '30%' }}><Text style={s.lbl}>{a.label}</Text><Text style={s.bold}>{a.value}</Text></View>
                ))}
            </View>

            {/* 비용 상세 테이블 */}
            <Text style={[s.h3d, { marginTop: 8 }]}>항목별 비용</Text>
            {costBreakdown.slice(0, 8).map((item, i) => (
                <View key={i} style={s.tRow}>
                    <Text style={s.tL}>{item.label}</Text>
                    <Text style={s.tV}>{fmt(item.min)} ~ {fmt(item.max)}</Text>
                </View>
            ))}
            {costBreakdown.length > 8 && (
                <Text style={{ fontSize: 7, color: '#999', marginTop: 2, fontFamily: F }}>외 {costBreakdown.length - 8}개 항목</Text>
            )}
            <View style={[s.tRow, { borderBottomWidth: 1.5, borderBottomColor: '#000', marginTop: 2 }]}>
                <Text style={[s.tL, { fontWeight: 'bold' }]}>합계</Text>
                <Text style={[s.tV, { color: BRAND, fontSize: 10 }]}>{fmt(totalCostRange.min)} ~ {fmt(totalCostRange.max)}</Text>
            </View>

            <View style={s.ft}><Text style={s.ftT}>OPENING</Text><Text style={s.ftT}>1 / {tp}</Text></View>
        </Page>

        {/* ══════════════════════════════════════════════════════
            PAGE 2: 상권 분석
           ══════════════════════════════════════════════════════ */}
        {hasAI ? (
            <Page size="A4" style={s.page}>
                <Text style={s.h2}>상권 분석</Text>
                <Text style={s.sub}>AI가 분석한 입지 리포트</Text>

                {/* 등급 + 판단 근거 */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: gc(ai.locationAnalysis.grade), justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF', fontFamily: F }}>{ai.locationAnalysis.grade}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={s.bold}>상권 등급: {ai.locationAnalysis.grade}등급</Text>
                        <Text style={s.s8}>{cut(ai.locationAnalysis.gradeReason, 120)}</Text>
                    </View>
                </View>

                {/* 타겟 + 피크 */}
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
                    <View style={[s.card, { flex: 1 }]}>
                        <Text style={s.lbl}>주요 타겟 고객</Text>
                        <Text style={s.b9}>{cut(ai.locationAnalysis.targetCustomer, 70)}</Text>
                    </View>
                    <View style={[s.card, { flex: 1 }]}>
                        <Text style={s.lbl}>피크 시간대</Text>
                        <Text style={s.b9}>{cut(ai.locationAnalysis.peakHours, 60)}</Text>
                    </View>
                </View>

                {/* 강점 + 약점 */}
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 8, fontWeight: 'bold', color: GREEN, marginBottom: 3, fontFamily: F }}>강점</Text>
                        {ai.locationAnalysis.strengths.slice(0, 3).map((x, i) => (
                            <View key={i} style={s.bRow}>
                                <Text style={{ fontSize: 7.5, color: GREEN, marginRight: 3, width: 6, fontFamily: F }}>+</Text>
                                <Text style={s.b9}>{cut(x, 55)}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 8, fontWeight: 'bold', color: ORANGE, marginBottom: 3, fontFamily: F }}>약점</Text>
                        {ai.locationAnalysis.weaknesses.slice(0, 2).map((x, i) => (
                            <View key={i} style={s.bRow}>
                                <Text style={{ fontSize: 7.5, color: ORANGE, marginRight: 3, width: 6, fontFamily: F }}>-</Text>
                                <Text style={s.b9}>{cut(x, 55)}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 주변 상권 팁 */}
                <View style={s.cardB}>
                    <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: BRAND, marginBottom: 2, fontFamily: F }}>주변 상권 활용 팁</Text>
                    <Text style={s.b9}>{cut(ai.locationAnalysis.nearbyTip, 110)}</Text>
                </View>

                {/* AI 비용 분석 */}
                <Text style={[s.h3, { marginTop: 6 }]}>비용 분석</Text>
                <Text style={[s.b9, { marginBottom: 6 }]}>{cut(ai.costAnalysis.totalComment, 120)}</Text>

                <Text style={{ fontSize: 8, fontWeight: 'bold', color: GREEN, marginBottom: 3, fontFamily: F }}>비용 절감 포인트</Text>
                {ai.costAnalysis.savingTips.slice(0, 3).map((tip, i) => (
                    <View key={i} style={{ flexDirection: 'row', marginBottom: 4, padding: 5, backgroundColor: '#F9FAFB', borderRadius: 3, borderLeftWidth: 2, borderLeftColor: GREEN }}>
                        <View style={{ width: 48, marginRight: 6 }}>
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

                <View style={s.ft}><Text style={s.ftT}>OPENING AI ANALYSIS</Text><Text style={s.ftT}>2 / {tp}</Text></View>
            </Page>
        ) : (
            /* Non-AI Page 2: 비용 상세 + 체크리스트 */
            <Page size="A4" style={s.page}>
                <Text style={s.h2}>비용 상세</Text>
                <Text style={s.sub}>항목별 예상 비용</Text>
                <Text style={s.h3d}>준비 현황</Text>
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
                <View style={s.ft}><Text style={s.ftT}>OPENING</Text><Text style={s.ftT}>2 / {tp}</Text></View>
            </Page>
        )}

        {/* ══════════════════════════════════════════════════════
            PAGE 3: 리스크 분석 + 실행 로드맵
           ══════════════════════════════════════════════════════ */}
        {hasAI ? (
            <Page size="A4" style={s.page}>
                <Text style={s.h2}>리스크 분석</Text>
                <Text style={s.sub}>주의 요인 및 실행 로드맵</Text>

                {/* 리스크 카드 */}
                <Text style={s.h3}>주요 리스크 요인</Text>
                {ai.riskFactors.slice(0, 3).map((risk, i) => {
                    const c = rc(risk.level);
                    return (
                        <View key={i} style={{ padding: 7, marginBottom: 5, borderRadius: 3, borderLeftWidth: 2, borderLeftColor: c.b, backgroundColor: c.bg }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                <Text style={{ fontSize: 7, color: c.b, fontWeight: 'bold', marginRight: 3, fontFamily: F }}>[{rl(risk.level)}]</Text>
                                <Text style={s.bold}>{risk.title}</Text>
                            </View>
                            <Text style={[s.s8, { marginBottom: 2 }]}>{cut(risk.description, 100)}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontSize: 7.5, color: BRAND, fontWeight: 'bold', marginRight: 2, fontFamily: F }}>대응:</Text>
                                <Text style={[s.s8, { flex: 1 }]}>{cut(risk.mitigation, 100)}</Text>
                            </View>
                        </View>
                    );
                })}

                {/* 실행 로드맵 */}
                <Text style={[s.h3, { marginTop: 8 }]}>실행 로드맵</Text>
                <Text style={{ fontSize: 8, color: BRAND, fontWeight: 'bold', marginBottom: 6, fontFamily: F }}>
                    총 예상 기간: {ai.actionPlan.totalDuration}
                </Text>

                {ai.actionPlan.phases.slice(0, 4).map((phase, i) => (
                    <View key={i} style={{ flexDirection: 'row', marginBottom: 5, paddingBottom: 4, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0' }}>
                        <View style={{ width: 48, marginRight: 6 }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold', color: BRAND, fontFamily: F }}>{phase.phase.split(':')[0] || phase.phase}</Text>
                            <Text style={{ fontSize: 7, color: '#888', fontFamily: F }}>{phase.duration}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            {phase.phase.includes(':') && (
                                <Text style={[s.bold, { marginBottom: 1 }]}>{phase.phase.split(':').slice(1).join(':').trim()}</Text>
                            )}
                            {phase.tasks.slice(0, 4).map((task, j) => (
                                <View key={j} style={s.bRow}><Text style={s.bDot}>-</Text><Text style={s.s8}>{cut(task, 40)}</Text></View>
                            ))}
                        </View>
                    </View>
                ))}

                <View style={s.ft}><Text style={s.ftT}>OPENING AI ANALYSIS</Text><Text style={s.ftT}>3 / {tp}</Text></View>
            </Page>
        ) : (
            /* Non-AI Page 3: 체크리스트 + CTA */
            <Page size="A4" style={s.page}>
                <Text style={s.h2}>체크리스트</Text>
                <Text style={s.sub}>창업 준비 현황</Text>
                <Text style={s.h3d}>준비 현황</Text>
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
                        {checklist.worryCount > 0 ? '맞춤형 솔루션 제안' : '성공적인 오픈을 위한 최종 점검'}
                    </Text>
                    <Text style={{ fontSize: 8.5, color: '#333', lineHeight: 1.4, fontFamily: F }}>
                        {checklist.worryCount > 0
                            ? `${checklist.worryCount}개의 '도움 필요' 항목에 대해 오프닝 전담 매니저가 해결책과 비용 절감 방안을 준비했습니다.`
                            : '대부분의 준비가 완료되셨군요! 전담 매니저가 더블 체크를 도와드리겠습니다.'}
                    </Text>
                </View>
                <View style={s.ft}><Text style={s.ftT}>OPENING</Text><Text style={s.ftT}>3 / {tp}</Text></View>
            </Page>
        )}

        {/* ══════════════════════════════════════════════════════
            PAGE 4 (AI): 체크리스트 검토
           ══════════════════════════════════════════════════════ */}
        {hasAI && (
            <Page size="A4" style={s.page}>
                <Text style={s.h2}>체크리스트 검토</Text>
                <Text style={s.sub}>항목별 AI 맞춤 컨설팅</Text>

                {/* 준비 현황 요약 */}
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
                    <View style={[s.card, { flex: 1, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 2, borderLeftColor: GREEN }]}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: GREEN, marginRight: 4, fontFamily: F }}>{checklist.readyCount}</Text>
                        <Text style={{ fontSize: 8, color: '#666', fontFamily: F }}>준비 완료</Text>
                    </View>
                    <View style={[s.card, { flex: 1, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 2, borderLeftColor: ORANGE }]}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: ORANGE, marginRight: 4, fontFamily: F }}>{checklist.worryCount}</Text>
                        <Text style={{ fontSize: 8, color: '#666', fontFamily: F }}>도움 필요</Text>
                    </View>
                </View>

                {/* AI 조언 목록 */}
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
                            {!done && (item.costTip || item.timeline) && (
                                <View style={{ flexDirection: 'row', marginLeft: 10, marginTop: 1, gap: 8 }}>
                                    {item.costTip && <Text style={{ fontSize: 7, color: BRAND, fontFamily: F }}>비용: {cut(item.costTip, 35)}</Text>}
                                    {item.timeline && <Text style={{ fontSize: 7, color: '#888', fontFamily: F }}>기간: {item.timeline}</Text>}
                                </View>
                            )}
                        </View>
                    );
                })}

                <View style={s.ft}><Text style={s.ftT}>OPENING AI ANALYSIS</Text><Text style={s.ftT}>4 / {tp}</Text></View>
            </Page>
        )}

        {/* ══════════════════════════════════════════════════════
            PAGE 5 (AI): 오프닝 Tip
           ══════════════════════════════════════════════════════ */}
        {hasAI && (
            <Page size="A4" style={s.page}>
                <Text style={s.h2}>오프닝 Tip</Text>
                <Text style={s.sub}>AI가 전하는 창업 성공 꿀팁</Text>

                {/* Opening Tip */}
                <View style={[s.cardB, { padding: 14, marginBottom: 12 }]}>
                    <Text style={{ fontSize: 10, color: '#333', lineHeight: 1.7, fontFamily: F }}>
                        "{cut(ai.openingTip, 200)}"
                    </Text>
                </View>

                {/* 최종 요약 */}
                <Text style={s.h3}>분석 요약</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
                    <View style={[s.card, { flex: 1, alignItems: 'center', paddingVertical: 10 }]}>
                        <Text style={{ fontSize: 6.5, color: '#888', marginBottom: 1, fontFamily: F }}>잠재력 점수</Text>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: BRAND, fontFamily: F }}>{ai.summary.overallScore}</Text>
                        <Text style={{ fontSize: 7, color: '#888', fontFamily: F }}>{ai.summary.scoreLabel}</Text>
                    </View>
                    <View style={[s.card, { flex: 1, alignItems: 'center', paddingVertical: 10 }]}>
                        <Text style={{ fontSize: 6.5, color: '#888', marginBottom: 1, fontFamily: F }}>상권 등급</Text>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: gc(ai.locationAnalysis.grade), fontFamily: F }}>{ai.locationAnalysis.grade}</Text>
                        <Text style={{ fontSize: 7, color: '#888', fontFamily: F }}>{ai.locationAnalysis.grade}등급</Text>
                    </View>
                    <View style={[s.card, { flex: 1, alignItems: 'center', paddingVertical: 10 }]}>
                        <Text style={{ fontSize: 6.5, color: '#888', marginBottom: 1, fontFamily: F }}>예상 기간</Text>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 3, fontFamily: F }}>{ai.actionPlan.totalDuration}</Text>
                    </View>
                </View>

                {/* 핵심 포인트 다시 */}
                <Text style={s.h3}>핵심 포인트</Text>
                {ai.summary.keyHighlights.slice(0, 4).map((h, i) => (
                    <View key={i} style={s.bRow}><Text style={s.bDot}>-</Text><Text style={s.b9}>{cut(h, 50)}</Text></View>
                ))}

                {/* CTA */}
                <View style={[s.cta, { marginTop: 10 }]}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: BRAND, marginBottom: 2, fontFamily: F }}>오프닝과 함께 시작하세요</Text>
                    <Text style={{ fontSize: 8, color: '#333', lineHeight: 1.4, fontFamily: F }}>
                        이 보고서는 Opening AI가 생성한 참고 자료입니다. 전담 매니저와 상담하시면 더욱 정밀한 맞춤 솔루션을 받으실 수 있습니다.
                        {checklist.worryCount > 0 && ` ${checklist.worryCount}개의 '도움 필요' 항목에 대한 해결 방안을 준비해 드리겠습니다.`}
                    </Text>
                </View>

                <View style={s.ft}><Text style={s.ftT}>OPENING AI ANALYSIS</Text><Text style={s.ftT}>5 / {tp}</Text></View>
            </Page>
        )}
    </Document>
    );
};

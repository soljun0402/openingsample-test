import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

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
    // Typography
    serifTitle: {
        fontFamily: 'Noto Sans KR', // Using generic for now as we only registered one
        fontSize: 42,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000000',
    },
    sectionTitle: {
        fontFamily: 'Noto Sans KR',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        paddingBottom: 5,
    },
    brandText: {
        color: '#1E6FFF', // Brand Blue
    },
    // Hero Section
    heroSection: {
        marginTop: 40,
        marginBottom: 60,
    },
    heroQuote: {
        fontFamily: 'Noto Sans KR',
        fontSize: 24,
        fontStyle: 'normal', // Italic often not supported in CJK fonts directly without specific file
        marginBottom: 20,
        lineHeight: 1.4,
        color: '#333333',
    },
    costRange: {
        fontFamily: 'Noto Sans KR',
        fontWeight: 'bold',
        fontSize: 48,
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
        paddingVertical: 12,
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
    }
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
    worryItems: string[]; // List of items user marked as "Help Needed"
    readyItems: string[];
}

export interface EstimatePDFProps {
    customerName: string;
    totalCostRange: { min: number; max: number };
    locationData: {
        region: string;
        analysis: { label: string; value: string }[]; // e.g., 'Target', 'Traffic'
    };
    costBreakdown: CostBreakdownItem[];
    checklist: ChecklistData;
    projectName?: string;
}

// Helper
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount / 10000) + '만';
};

// Component
export const EstimatePDFDocument: React.FC<EstimatePDFProps> = ({
    customerName,
    totalCostRange,
    locationData,
    costBreakdown,
    checklist,
    projectName
}) => (
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
                    "막막한 준비 과정,"\n"저희가 가장 든든한 답이 되어드리겠습니다."
                </Text>
                <Text style={styles.costRange}>
                    {formatCurrency(totalCostRange.min)} ~ {formatCurrency(totalCostRange.max)}원
                </Text>
                <Text style={styles.costLabel}>ESTIMATED TOTAL COST RANGE</Text>
            </View>

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
                <Text style={styles.footerText}>OPENING STARTUP SOLUTION</Text>
                <Text style={styles.footerText}>Page 1 / 2</Text>
            </View>
        </Page>

        {/* PAGE 2: Details & Checklist */}
        <Page size="A4" style={styles.page}>
            <Text style={styles.serifTitle}>Details.</Text>

            {/* Cost Breakdown */}
            <View style={{ marginBottom: 40 }}>
                <Text style={styles.sectionTitle}>Cost Breakdown</Text>
                {costBreakdown.map((item, idx) => (
                    <View key={idx} style={styles.tableRow}>
                        <Text style={styles.tableLabel}>{item.label}</Text>
                        <Text style={styles.tableValue}>
                            {formatCurrency(item.min)} ~ {formatCurrency(item.max)}원
                        </Text>
                    </View>
                ))}
                <View style={[styles.tableRow, { borderBottomWidth: 0, marginTop: 10 }]}>
                    <Text style={[styles.tableLabel, { fontFamily: 'Noto Sans KR', fontWeight: 'bold' }]}>Total</Text>
                    <Text style={[styles.tableValue, { color: '#1E6FFF', fontSize: 14 }]}>
                        {formatCurrency(totalCostRange.min)} ~ {formatCurrency(totalCostRange.max)}원
                    </Text>
                </View>
            </View>

            {/* Checklist Status */}
            <View style={{ marginBottom: 40 }}>
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
                        {checklist.readyItems.slice(0, 10).map((item, idx) => ( // Show only top 10 to fit page
                            <View key={idx} style={styles.checkItem}>
                                <View style={[styles.checkIcon, { backgroundColor: '#34C759' }]} />
                                <Text style={styles.checkText}>{item}</Text>
                            </View>
                        ))}
                        {checklist.readyCount > 10 && (
                            <Text style={{ fontSize: 11, color: '#999', marginLeft: 20 }}>
                                + {checklist.readyCount - 10} more items...
                            </Text>
                        )}
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
                        ? `${checklist.worryCount}개의 '도움 필요' 항목에 대해 오프닝 전담 매니저가 구체적인 해결책과 비용 절감 방안을 준비했습니다.내일 오전 중으로 연락드리겠습니다.`
                        : "대부분의 준비가 완료되셨군요! 놓친 부분이 없는지 전담 매니저가 더블 체크를 도와드리겠습니다."}
                </Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>OPENING STARTUP SOLUTION</Text>
                <Text style={styles.footerText}>Page 2 / 2</Text>
            </View>
        </Page>
    </Document>
);

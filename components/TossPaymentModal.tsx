import React, { useEffect, useRef, useState } from 'react';
import { X, CreditCard, Loader2 } from 'lucide-react';

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || '';

interface TossPaymentModalProps {
  amount: number;
  orderId: string;
  orderName: string;
  successUrl: string;
  failUrl: string;
  onClose: () => void;
  onError?: (error: any) => void;
}

export const TossPaymentModal: React.FC<TossPaymentModalProps> = ({
  amount,
  orderId,
  orderName,
  successUrl,
  failUrl,
  onClose,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetsRef = useRef<any>(null);

  useEffect(() => {
    const initWidget = async () => {
      try {
        const TossPayments = (window as any).TossPayments;
        if (!TossPayments) {
          setError('결제 모듈을 불러올 수 없습니다.\n페이지를 새로고침한 후 다시 시도해주세요.');
          return;
        }
        if (!TOSS_CLIENT_KEY) {
          setError('결제 설정이 완료되지 않았습니다.\n관리자에게 문의해주세요.');
          return;
        }

        const tossPayments = TossPayments(TOSS_CLIENT_KEY);
        const widgets = tossPayments.widgets({ customerKey: TossPayments.ANONYMOUS });
        widgetsRef.current = widgets;

        await widgets.setAmount({ currency: 'KRW', value: amount });
        await widgets.renderPaymentMethods({ selector: '#toss-payment-method' });
        await widgets.renderAgreement({ selector: '#toss-agreement' });
        setLoading(false);
      } catch (err: any) {
        console.error('Widget init error:', err);
        setError(err?.message || '결제 위젯 초기화에 실패했습니다.');
      }
    };

    initWidget();
  }, []);

  const handlePayment = async () => {
    if (!widgetsRef.current) return;
    setPaying(true);
    try {
      await widgetsRef.current.requestPayment({
        orderId,
        orderName,
        successUrl,
        failUrl,
      });
    } catch (err: any) {
      if (err?.code === 'USER_CANCEL') {
        onClose();
      } else {
        console.error('Payment error:', err);
        onError?.(err);
      }
    }
    setPaying(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CreditCard size={20} className="text-brand-600" />
            결제하기
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-sm text-blue-600 font-medium">결제 금액</p>
            <p className="text-2xl font-bold text-blue-800">{amount.toLocaleString()}원</p>
            <p className="text-xs text-blue-500 mt-1">{orderName}</p>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
            </div>
          ) : (
            <>
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-brand-600" size={32} />
                  <span className="ml-2 text-gray-500">결제 수단을 불러오는 중...</span>
                </div>
              )}

              <div id="toss-payment-method" />
              <div id="toss-agreement" />

              {!loading && (
                <button
                  onClick={handlePayment}
                  disabled={paying}
                  className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                >
                  {paying ? (
                    <><Loader2 className="animate-spin" size={20} /> 결제 처리중...</>
                  ) : (
                    <><CreditCard size={20} /> {amount.toLocaleString()}원 결제하기</>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

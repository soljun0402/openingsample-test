# GARA_PAYMENT.md — PM 배정 전 Toss 결제 게이트 변경 보고서

## 변경 개요

PM 배정 신청(Step 6) 시 **고정 금액 50,000원 Toss 테스트 결제**를 게이트로 추가하여, 결제 완료 후에만 PM 배정(`PENDING_PM`)이 진행되도록 변경.

## 변경 전 롤백 지점

```
커밋: e190e69c8ea1cb4caf53d2cc788aee946ddff4b8
메시지: fix: PDF 견적서 금액 10배 과다 표시 버그 수정
```

## 커밋 이력

| 커밋 | 설명 |
|------|------|
| `d43bf74` | feat: PM 배정 전 Toss 결제 게이트 추가 |
| `f1e6c77` | fix: 기존 PAYMENT_PENDING 프로젝트가 있을 때 결제 오버레이가 안 뜨는 버그 수정 |
| `0b6cfca` | fix: 게스트 로그인 후 프로젝트를 PAYMENT_PENDING 상태로 생성 |
| `dea755b` | fix: PENDING_PM 상태에서도 미결제 시 결제 대기 화면 표시 |

## 변경된 흐름

### 인증 사용자 (로그인 상태)
```
Step 6 → "매니저 배정 신청하기" 클릭
  → 결제 확인 오버레이 표시 (금액, 포함 서비스 안내)
  → "토스페이로 결제하기" 클릭
  → createProject('PAYMENT_PENDING') + localStorage 저장
  → Toss 결제 리다이렉트
  → 결제 완료 후 앱 복귀
  → DashboardView에서 toss_success + paymentType=service 감지
  → completeServicePayment(): PENDING_PM 전환 + service_paid 플래그 저장
  → PM 배정 대기 화면
```

### 게스트 사용자 (비로그인)
```
Step 6 → "로그인하고 매니저 배정받기" 클릭
  → 프로젝트 데이터 localStorage 저장 (pending_project_data)
  → 로그인/회원가입 화면
  → 로그인 완료
  → App.tsx createProjectFromPending(): PAYMENT_PENDING 상태로 프로젝트 생성
  → DashboardView에서 결제 대기 화면 표시
  → "토스페이로 결제하기" 클릭
  → Toss 결제 → 결제 완료 → PENDING_PM 전환
  → PM 배정 대기 화면
```

### 결제 실패/취소 시
```
Toss에서 취소 → 앱 복귀 → DashboardView
  → 결제 대기 화면 표시 (PAYMENT_PENDING 또는 미결제 PENDING_PM)
  → "토스페이로 결제하기" 재시도 버튼
```

### 기존 프로젝트 (결제 게이트 도입 전 생성) 호환
```
기존 PENDING_PM 프로젝트
  → DashboardView에서 localStorage 'service_paid_{projectId}' 확인
  → 플래그 없음 → 결제 대기 화면 표시
  → 결제 완료 → 플래그 저장 → PM 배정 대기 화면
```

## 수정 파일 목록

### 1. `components/ServiceJourneyView.tsx`

**변경 사항:**

1. **상수 추가**:
   ```typescript
   const SERVICE_FEE = 50000;
   const SERVICE_FEE_LABEL = '오프닝 매니저 배정 서비스 이용료';
   const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || '';
   ```

2. **상태 추가**:
   ```typescript
   const [showPaymentGate, setShowPaymentGate] = useState(false);
   const [paymentProcessing, setPaymentProcessing] = useState(false);
   ```

3. **`createProject()` 시그니처 변경**:
   - `createProject()` → `createProject(initialStatus: string = 'PENDING_PM')`
   - 반환값: `void` → `Project | null`
   - status 필드: 하드코딩 `'PENDING_PM'` → 파라미터 `initialStatus` 사용

4. **`handleServicePayment()` 함수 추가**:
   - 기존 `PAYMENT_PENDING` 프로젝트가 있으면 재사용, 없으면 `createProject('PAYMENT_PENDING')` 호출
   - localStorage에 `pending_payment_project_id` 저장
   - Toss SDK `requestPayment()` 호출 (successUrl에 `paymentType=service&projectId=...` 포함)

5. **`goToNextStep()` 변경**:
   - 기존: `currentStep === 6` → `createProject()` 직접 호출
   - 변경:
     - 게스트 모드 → 기존 `createProject()` (로그인 유도, localStorage 저장)
     - `PAYMENT_PENDING` 상태 기존 프로젝트 → `setShowPaymentGate(true)` (결제 오버레이)
     - 기존 프로젝트(결제 완료) → `onProjectCreated()` (대시보드 이동)
     - 새 프로젝트 → `setShowPaymentGate(true)` (결제 오버레이)

6. **결제 확인 오버레이 UI 추가** (컴포넌트 하단):
   - 풀스크린 z-50 오버레이
   - 금액 카드 (50,000원, VAT 포함)
   - 서비스 포함 내용 목록 (전담 매니저, 인허가 대행, 상권 분석, 실시간 상담)
   - 안전 결제 안내 배너
   - "토스페이로 결제하기" 버튼

### 2. `components/DashboardView.tsx`

**변경 사항:**

1. **`tossRedirectParams` 타입 확장**:
   - `paymentType?: string`, `projectId?: string` 필드 추가

2. **Toss 리다이렉트 파라미터 캡처 확장**:
   - `paymentType`, `projectId` 파라미터 추가 캡처

3. **결제 완료 분기 추가** (useEffect):
   - `paymentType === 'service'` → `completeServicePayment()` 호출
   - 기존 결제 → `completeTossPayment()` 호출 (기존 동작 유지)

4. **`completeServicePayment()` 함수 추가**:
   - Supabase에서 직접 `status: 'PENDING_PM'` 업데이트
   - localStorage에 `service_paid_{projectId}` 플래그 저장
   - `pending_payment_project_id` 정리
   - 알림 생성 + 토스트 표시
   - `loadProject()` 호출

5. **`retryServicePayment()` 함수 추가**:
   - PAYMENT_PENDING 또는 미결제 PENDING_PM 상태에서 결제 재시도
   - 기존 Toss 결제 패턴 재활용

6. **결제 필요 여부 판단 로직 추가**:
   ```typescript
   const isPaymentPending = project.status === 'PAYMENT_PENDING';
   const servicePaid = localStorage.getItem(`service_paid_${project.id}`) === 'true';
   const needsServicePayment = isPaymentPending || (isPending && !servicePaid);
   ```
   - `PAYMENT_PENDING` 상태 → 결제 필요
   - `PENDING_PM` 상태 + `service_paid` 플래그 없음 → 결제 필요 (기존 프로젝트 호환)
   - `PENDING_PM` 상태 + `service_paid` 플래그 있음 → PM 배정 대기 (정상)

7. **결제 대기 전용 화면 추가** (`needsServicePayment === true` 일 때):
   - 오렌지 그라데이션 프로젝트 카드
   - "서비스 이용료 결제가 필요합니다" + 금액 50,000원
   - "토스페이로 결제하기" 버튼
   - 서비스 포함 내용 안내 (전담 매니저, 인허가 대행, 상권 분석, 실시간 상담)

### 3. `App.tsx`

**변경 사항:**

1. **`createProjectFromPending()` status 변경**:
   - 기존: `status: 'PENDING_PM'` (결제 없이 바로 PM 배정 대기)
   - 변경: `status: 'PAYMENT_PENDING'` (DashboardView에서 결제 후 PENDING_PM 전환)
   - 게스트 → 로그인 → 프로젝트 자동 생성 시 결제 게이트를 우회하지 않도록 수정

### 4. `GARA_PAYMENT.md` (본 파일)
- 변경사항 보고서, 롤백 가이드, 테스트 방법

## localStorage 키 목록

| 키 | 용도 | 설정 시점 | 정리 시점 |
|----|------|-----------|-----------|
| `pending_project_data` | 게스트 프로젝트 데이터 (로그인 후 복원) | ServiceJourneyView 게스트 모드 | App.tsx createProjectFromPending 성공 후 |
| `pending_payment_project_id` | 결제 진행중인 프로젝트 ID | handleServicePayment() | completeServicePayment() |
| `service_paid_{projectId}` | 서비스 결제 완료 플래그 | completeServicePayment() | 삭제하지 않음 (영구 보존) |

## 롤백 방법

### Git 롤백 (권장)

결제 게이트 관련 커밋 4개를 한번에 되돌리기:

```bash
git checkout e190e69 -- components/ServiceJourneyView.tsx components/DashboardView.tsx App.tsx
git rm GARA_PAYMENT.md
git commit -m "revert: 결제 게이트 롤백"
```

### 수동 롤백

**ServiceJourneyView.tsx:**
1. `SERVICE_FEE`, `SERVICE_FEE_LABEL`, `TOSS_CLIENT_KEY` 상수 삭제
2. `showPaymentGate`, `paymentProcessing` 상태 삭제
3. `handleServicePayment()` 함수 전체 삭제
4. `createProject` 시그니처를 `async () =>` 로 복원, status를 `'PENDING_PM'` 하드코딩, 반환값 제거
5. `goToNextStep`의 step 6 분기를 `createProject()` 직접 호출로 복원
6. 결제 확인 오버레이 JSX 블록 전체 삭제

**DashboardView.tsx:**
1. `tossRedirectParams` 타입에서 `paymentType`, `projectId` 제거
2. 리다이렉트 캡처에서 `paymentType`, `projectId` 제거
3. useEffect의 service payment 분기 제거
4. `completeServicePayment()`, `retryServicePayment()` 함수 삭제
5. `isPaymentPending`, `servicePaid`, `needsServicePayment` 변수 삭제, `currentTheme` 조건 복원
6. 결제 대기 화면 JSX 블록 전체 삭제

**App.tsx:**
1. `createProjectFromPending()`의 `status: 'PAYMENT_PENDING'`을 `'PENDING_PM'`으로 복원

## 테스트 방법

### 사전 준비
```bash
npm run build   # 빌드 성공 확인
npm run dev     # 개발 서버 시작
```

### 시나리오 1: 인증 사용자 신규 프로젝트
1. 로그인 상태로 Step 1~5 진행
2. Step 6에서 "매니저 배정 신청하기" 클릭
3. 결제 확인 오버레이 표시 확인 (금액 50,000원)
4. "토스페이로 결제하기" → Toss 테스트 결제 페이지 이동
5. 테스트 카드(`4330-0000-0000-0000`, 유효기간/CVC 아무거나)로 결제
6. 앱 복귀 → "결제가 완료되었습니다!" 토스트 확인
7. PM 배정 대기 화면 표시 확인

### 시나리오 2: 게스트 → 로그인 → 결제
1. 비로그인 상태로 Step 1~6 진행
2. "로그인하고 매니저 배정받기" 클릭 → 로그인/회원가입
3. 로그인 완료 → DashboardView 결제 대기 화면 확인
4. "토스페이로 결제하기" → 결제 완료
5. PM 배정 대기 화면 전환 확인

### 시나리오 3: 결제 취소/실패
1. 결제 오버레이에서 "토스페이로 결제하기" 클릭
2. Toss 결제 페이지에서 취소
3. 앱 복귀 → DashboardView 결제 대기 화면 + "토스페이로 결제하기" 재시도 버튼 확인

### 시나리오 4: 기존 프로젝트 (결제 게이트 도입 전 생성)
1. 기존 `PENDING_PM` 상태 프로젝트가 있는 계정으로 로그인
2. DashboardView에서 결제 대기 화면 표시 확인 (기존 대기 화면 대신)
3. 결제 완료 후 PM 배정 대기 화면 전환 확인

### 시나리오 5: 게스트 모드 체험
1. 게스트 모드에서 Step 6까지 진행
2. 기존 로그인 유도 동작 유지 확인 (결제 오버레이 미표시)

## 환경 변수

`.env`에 아래 키가 필요합니다:

```
VITE_TOSS_CLIENT_KEY=test_ck_...    # 토스페이먼츠 클라이언트 키
```

Toss SDK는 `index.html`에서 전역으로 로드됨:
```html
<script src="https://js.tosspayments.com/v2/standard"></script>
```

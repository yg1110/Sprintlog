# Sprintlog

OKR 관리와 일일 업무기록을 한 곳에서 관리하는 서비스

## 주요 기능

### 대시보드

- 총 업무기록 수, 완료된 KR, OKR 평균 진행률 통계 카드
- 오늘/내일 할 일 목록 (오전 → 오후 순 정렬)
- 기간별(스프린트·월간·분기·연간) OKR 통계 — 도넛 차트 + KR 진행 바
- 오늘 업무기록 빠른 작성 버튼

### OKR 관리

- OKR 생성/수정/삭제, 기간 유형(스프린트·월간·분기·연간) 설정
- OKR당 핵심 결과(KR) 다수 등록 (목표값·현재값·단위)
- KR 클릭 시 연결된 업무일지 목록 확장 표시
- KR `current_value`는 연결된 업무일지 수로 자동 동기화

### 업무기록

- 월간 캘린더 뷰 — 기록된 날짜는 검정, 오늘은 링 표시
- 날짜 클릭으로 기록 작성/수정 모달 오픈
- OKR 페이지에서 업무일지 클릭 시 해당 날짜 모달 자동 오픈

### 업무일지 모달

- **투두 리스트**: 오전/오후 구분, 완료 체크, 순서 관리
- **상세 기록**: 한 일·이슈·막힌 것·설계·배운점·내일 할일·수치 변화·피드백·개선 포인트 (9개 필드)
- **OKR 연결**: 업무일지와 KR 다대다 연결
- 기록 삭제 기능 (헤더 휴지통 버튼 → 인라인 확인)

## 화면 미리보기

### 대시보드

![대시보드](img/대시보드.png)

### OKR 관리

![OKR 관리](img/OKR.png)

### OKR 모달

![OKR 모달](img/OKR_모달.png)

### 업무기록 캘린더

![업무기록 캘린더](img/업무일지.png)

### 업무일지 모달

![업무일지 모달](img/업무일지_모달.png)

---

## 기술 스택

| 분류        | 라이브러리                            |
| ----------- | ------------------------------------- |
| UI          | React 19, TypeScript, Tailwind CSS v4 |
| 라우팅      | React Router v7                       |
| 백엔드/인증 | Supabase (RLS, Auth)                  |
| 아이콘      | Lucide React                          |
| 날짜        | date-fns                              |
| 빌드        | Vite 7                                |
| 배포        | Vercel                                |

## 프로젝트 구조

```
src/
  components/
    Layout.tsx          # 사이드바, 모바일 헤더/하단 내비게이션
  features/
    auth/
      AuthPage.tsx      # 로그인 / 회원가입
    dashboard/
      DashboardPage.tsx # 대시보드 (통계, 투두, OKR 차트)
    logs/
      LogsPage.tsx      # 월간 캘린더 뷰
      WorkLogModal.tsx  # 업무일지 작성/수정 모달
    okrs/
      OKRsPage.tsx      # OKR 목록 + KR 확장 패널
      OKRModal.tsx      # OKR 생성/수정 모달
  lib/
    api.ts              # Supabase API 함수
    supabase.ts         # Supabase 클라이언트
    cn.ts               # className 유틸
  types.ts              # 공유 타입 (WorkLog, OKR, KeyResult 등)
  App.tsx               # 라우팅 + 전역 상태
```

## DB 스키마

```
profiles        — 사용자 프로필
okrs            — OKR (key_results: JSONB 배열로 KR 포함)
work_logs       — 날짜별 업무기록 (user_id + log_date unique)
todo_items      — 업무기록에 속한 투두 항목
work_log_krs    — 업무기록 ↔ KR 다대다 연결
```

모든 테이블에 Row Level Security(RLS) 적용 — 본인 데이터만 접근 가능.

## 시작하기

```bash
# 패키지 설치
pnpm install

# 환경 변수 설정
touch .env
VITE_SUPABASE_URL="URL"
VITE_SUPABASE_ANON_KEY="YOUR KEY"

# Supabase 스키마 적용
supabase-schema.sql 을 Supabase SQL Editor에서 실행

# 개발 서버 실행
pnpm dev
```

## 스크립트

```bash
pnpm dev          # 개발 서버 (HMR)
pnpm build        # 타입 체크 + 프로덕션 빌드
pnpm lint         # ESLint 검사
pnpm lint:fix     # ESLint 자동 수정
pnpm format       # Prettier 포맷
```

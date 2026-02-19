# AI Leader Web

React + Vite + TanStack Query 기반 프론트엔드.

## 실행 방법

```bash
# 환경변수 설정
copy .env.example .env   # Windows
cp .env.example .env     # Mac/Linux

# 개발 서버
npm run dev
```

프론트엔드: http://localhost:5173

## 주요 URL

| URL | 설명 |
|-----|------|
| `/` | 홈 (최근 판단 이력 + CTA) |
| `/my/cars` | 차량 관리 |
| `/judge/new` | 견적 입력 방식 선택 |
| `/judge/manual` | 직접 입력 |
| `/judge/photo` | 사진 업로드 (v1: UI만) |
| `/judge/review/:estimateId` | 요약 검수 |
| `/judge/result/:judgementId` | 판단 결과 |
| `/my/judgements` | 내 판단 이력 |
| `/dev/ui` | UI 컴포넌트 미리보기 |

## Mock 상태

```
?mock=loading  → Skeleton 로딩 상태 표시
?mock=fail     → ErrorState 에러 상태 표시
```

## 환경변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_API_URL` | API 서버 URL | 비어있으면 Vite proxy 사용 |
| `VITE_USER_ID` | 임시 사용자 ID | `user_1` |

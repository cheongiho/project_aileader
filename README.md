# AI Leader - 차량 정비 견적 적정 범위 판단 서비스

차량 수리/정비 견적서의 항목별 가격이 적정한지 판단해주는 서비스 (v1).

## 구조

```
.
├── apps/
│   ├── api/        # Fastify + TypeScript + Prisma (포트 3001)
│   └── web/        # React + Vite + TanStack Query (포트 5173)
└── packages/
    └── shared/     # 공유 zod 스키마 + TypeScript 타입 + 상수
```

## 빠른 시작

### 1. 사전 요구사항

- Node.js 18+
- npm 9+
- PostgreSQL 14+ (Docker 또는 로컬 설치)

### 2. 의존성 설치

```bash
npm install
```

### 3. Shared 패키지 빌드

```bash
npm run build -w packages/shared
```

### 4. PostgreSQL 실행

#### 방법 A: Docker Compose (권장)

Docker Desktop이 없다면 [여기서 설치](https://www.docker.com/products/docker-desktop/)

```bash
cd apps/api
docker compose up -d
cd ../..
```

#### 방법 B: 로컬 PostgreSQL

[PostgreSQL 설치](https://www.postgresql.org/download/windows/) 후:

```bash
# Windows (psql이 PATH에 있어야 함)
psql -U postgres -c "CREATE DATABASE aileader_dev;"

# 또는 pgAdmin에서 "aileader_dev" DB 생성
```

### 5. 환경변수 설정

```bash
# Windows
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env

# Mac/Linux
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

`apps/api/.env`의 `DATABASE_URL`을 실제 DB 연결 정보로 수정하세요.

### 6. DB 마이그레이션 + 시드

```bash
# 마이그레이션 실행
npm run db:migrate -w apps/api

# 시드 데이터 삽입 (Estimate 2개, Judgement 3개 포함)
npm run db:seed -w apps/api
```

### 7. 개발 서버 실행

```bash
npm run dev
```

- 프론트엔드: http://localhost:5173
- API: http://localhost:3001
- OpenAPI 문서: http://localhost:3001/docs
- Prisma Studio: `npm run db:studio -w apps/api` → http://localhost:5555

## 주요 URL

| URL | 설명 |
|-----|------|
| http://localhost:5173 | 홈 (최근 판단 이력) |
| http://localhost:5173/my/cars | 차량 관리 |
| http://localhost:5173/judge/manual | 견적 직접 입력 |
| http://localhost:5173/my/judgements | 내 판단 이력 |
| http://localhost:5173/dev/ui | UI 컴포넌트 미리보기 |
| http://localhost:3001/health | API 헬스체크 |
| http://localhost:3001/docs | OpenAPI (Swagger UI) |

## Mock 상태 테스트

결과 페이지에서 쿼리스트링으로 UX 상태 시뮬레이션:

```
?mock=loading  → Skeleton 로딩 상태
?mock=fail     → ErrorState 에러 상태
```

예시: http://localhost:5173/judge/result/any-id?mock=loading

## 테스트

```bash
npm test -w apps/api
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | API + Web 동시 실행 |
| `npm run build` | 전체 빌드 |
| `npm run lint` | ESLint 검사 |
| `npm run format` | Prettier 포맷 |
| `npm test` | API 단위 테스트 |
| `npm run db:migrate -w apps/api` | Prisma 마이그레이션 |
| `npm run db:seed -w apps/api` | 시드 데이터 삽입 |
| `npm run db:studio -w apps/api` | Prisma Studio 실행 |
| `npm run db:reset -w apps/api` | DB 초기화 + 재마이그레이션 |

# AI Leader API

Fastify + TypeScript + Prisma + PostgreSQL 기반 REST API.

## 실행 방법

### 1. 환경변수 설정

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

### 2. PostgreSQL 실행

#### Docker (권장)

```bash
docker compose up -d
```

#### 로컬 설치

```bash
# DB 생성 후
psql -U postgres -c "CREATE DATABASE aileader_dev;"
```

### 3. 마이그레이션 + 시드

```bash
npm run db:migrate   # 마이그레이션 실행
npm run db:seed      # 시드 데이터 삽입
```

### 4. 개발 서버 실행

```bash
npm run dev
```

서버: http://localhost:3001
OpenAPI 문서: http://localhost:3001/docs

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 헬스체크 |
| GET | `/api/cars` | 내 차량 목록 |
| POST | `/api/cars` | 차량 등록 |
| POST | `/api/estimates` | 견적 생성 |
| GET | `/api/estimates/:id` | 견적 상세 |
| POST | `/api/estimates/:id/items` | 견적 항목 추가 |
| POST | `/api/judgements` | 판단 요청 |
| GET | `/api/judgements/:id` | 판단 결과 조회 |
| GET | `/api/me/judgements` | 내 판단 이력 |
| POST | `/api/judgements/:id/feedback` | 피드백 제출 |

## 인증

모든 `/api/*` 요청에 `x-user-id` 헤더 필요 (개발용 간단 인증):

```bash
curl http://localhost:3001/api/cars -H "x-user-id: user_1"
```

## curl 예시

```bash
# 헬스체크
curl http://localhost:3001/health

# 차량 등록
curl -X POST http://localhost:3001/api/cars \
  -H "Content-Type: application/json" \
  -H "x-user-id: user_1" \
  -d '{"make":"현대","model":"아반떼","year":2020}'

# 견적 생성
curl -X POST http://localhost:3001/api/estimates \
  -H "Content-Type: application/json" \
  -H "x-user-id: user_1" \
  -d '{"source":"manual","shopName":"강남정비소"}'

# 견적 항목 추가
curl -X POST http://localhost:3001/api/estimates/{ESTIMATE_ID}/items \
  -H "Content-Type: application/json" \
  -H "x-user-id: user_1" \
  -d '{"name":"브레이크 패드","category":"BRAKE","laborCost":50000,"partsCost":170000,"totalCost":220000}'

# 판단 요청
curl -X POST http://localhost:3001/api/judgements \
  -H "Content-Type: application/json" \
  -H "x-user-id: user_1" \
  -d '{"estimateId":"{ESTIMATE_ID}"}'

# 판단 결과 조회
curl http://localhost:3001/api/judgements/{JUDGEMENT_ID} \
  -H "x-user-id: user_1"

# 내 판단 이력
curl http://localhost:3001/api/me/judgements \
  -H "x-user-id: user_1"
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 (hot reload) |
| `npm run build` | TypeScript 빌드 |
| `npm run db:migrate` | Prisma 마이그레이션 |
| `npm run db:seed` | 시드 데이터 삽입 |
| `npm run db:studio` | Prisma Studio (http://localhost:5555) |
| `npm run db:reset` | DB 초기화 + 재마이그레이션 |
| `npm test` | 단위 테스트 |

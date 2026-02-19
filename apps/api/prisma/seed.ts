import 'dotenv/config';
import { PrismaClient, EstimateSource, EstimateStatus, JudgementStatus, ResultLabel } from '@prisma/client';
import { computeJudgement } from '../src/services/judgement.service';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 삽입 시작...');

  // 기존 데이터 정리 (개발 환경용)
  await prisma.feedback.deleteMany();
  await prisma.judgementItem.deleteMany();
  await prisma.judgement.deleteMany();
  await prisma.estimateItem.deleteMany();
  await prisma.estimate.deleteMany();
  await prisma.carProfile.deleteMany();
  await prisma.user.deleteMany();

  // ─── User ───────────────────────────────
  const user = await prisma.user.create({
    data: {
      id: 'user_1',
      email: 'test@aileader.dev',
      name: '테스트 사용자',
    },
  });
  console.log('✅ User 생성:', user.id);

  // ─── CarProfile ──────────────────────────
  const car = await prisma.carProfile.create({
    data: {
      userId: user.id,
      make: '현대',
      model: '아반떼',
      year: 2020,
      plateNo: '서울 12가 3456',
    },
  });
  console.log('✅ CarProfile 생성:', car.id);

  // ─── Estimate A: 적정 수준 ────────────────
  const estimateA = await prisma.estimate.create({
    data: {
      userId: user.id,
      carId: car.id,
      source: EstimateSource.manual,
      status: EstimateStatus.submitted,
      shopName: '강남 정비센터',
      totalAmount: 0, // 항목 추가 후 업데이트
    },
  });

  const itemsA = await Promise.all([
    prisma.estimateItem.create({
      data: {
        estimateId: estimateA.id,
        name: '브레이크 패드',
        category: 'BRAKE',
        laborCost: 40_000,
        partsCost: 80_000,
        totalCost: 120_000,
      },
    }),
    prisma.estimateItem.create({
      data: {
        estimateId: estimateA.id,
        name: '엔진오일 교환',
        category: 'ENGINE_OIL',
        laborCost: 10_000,
        partsCost: 35_000,
        totalCost: 45_000,
      },
    }),
  ]);

  const totalA = itemsA.reduce((s: number, i: any) => s + i.totalCost, 0);
  await prisma.estimate.update({
    where: { id: estimateA.id },
    data: { totalAmount: totalA },
  });

  console.log('✅ Estimate A 생성 (적정):', estimateA.id);

  // ─── Judgement A-v1: FAIR ─────────────────
  const resultAv1 = computeJudgement(itemsA);
  const judgementAv1 = await prisma.judgement.create({
    data: {
      estimateId: estimateA.id,
      version: 1,
      status: JudgementStatus.done,
      resultLabel: resultAv1.resultLabel,
      confidence: resultAv1.confidence,
      overallScore: resultAv1.overallScore,
      summary: resultAv1.summary,
      items: {
        create: resultAv1.items.map((item) => ({
          estimateItemId: item.estimateItemId,
          fairMin: item.fairMin,
          fairMax: item.fairMax,
          myPrice: item.myPrice,
          positionPct: item.positionPct,
          resultLabel: item.resultLabel as ResultLabel,
          reasonTags: item.reasonTags,
          notes: item.notes,
        })),
      },
    },
  });
  console.log('✅ Judgement A-v1 생성 (FAIR):', judgementAv1.id, '점수:', resultAv1.overallScore);

  // ─── Judgement A-v2: CAUTION (재판단 - 항목 가격 변동 가정) ─────
  // 동일 estimate에 재판단, 브레이크 패드 가격이 올라간 시나리오를 시뮬레이션
  const itemsAv2Sim = [
    {
      ...itemsA[0],
      laborCost: 50_000,
      partsCost: 110_000,
      totalCost: 160_000, // CAUTION 구간 (max 200k 이하지만 avg 130k 초과)
    },
    itemsA[1],
  ];

  const resultAv2 = computeJudgement(itemsAv2Sim);
  const judgementAv2 = await prisma.judgement.create({
    data: {
      estimateId: estimateA.id,
      version: 2,
      status: JudgementStatus.done,
      resultLabel: resultAv2.resultLabel,
      confidence: resultAv2.confidence,
      overallScore: resultAv2.overallScore,
      summary: resultAv2.summary,
      items: {
        create: resultAv2.items.map((item) => ({
          estimateItemId: item.estimateItemId,
          fairMin: item.fairMin,
          fairMax: item.fairMax,
          myPrice: item.myPrice,
          positionPct: item.positionPct,
          resultLabel: item.resultLabel as ResultLabel,
          reasonTags: item.reasonTags,
          notes: item.notes,
        })),
      },
    },
  });
  console.log('✅ Judgement A-v2 생성 (재판단):', judgementAv2.id, '점수:', resultAv2.overallScore);

  // ─── Estimate B: 과다 수준 ────────────────
  const estimateB = await prisma.estimate.create({
    data: {
      userId: user.id,
      carId: car.id,
      source: EstimateSource.manual,
      status: EstimateStatus.submitted,
      shopName: '서초 수입차 정비소',
      totalAmount: 0,
    },
  });

  const itemsB = await Promise.all([
    prisma.estimateItem.create({
      data: {
        estimateId: estimateB.id,
        name: '브레이크 패드',
        category: 'BRAKE',
        laborCost: 80_000,
        partsCost: 200_000,
        totalCost: 280_000, // EXCESSIVE (max 200k * 1.2 = 240k 초과)
      },
    }),
    prisma.estimateItem.create({
      data: {
        estimateId: estimateB.id,
        name: '배터리 교체',
        category: 'BATTERY',
        laborCost: 30_000,
        partsCost: 200_000,
        totalCost: 230_000, // EXCESSIVE (max 180k * 1.2 = 216k 초과)
      },
    }),
  ]);

  const totalB = itemsB.reduce((s: number, i: any) => s + i.totalCost, 0);
  await prisma.estimate.update({
    where: { id: estimateB.id },
    data: { totalAmount: totalB },
  });

  console.log('✅ Estimate B 생성 (과다):', estimateB.id);

  // ─── Judgement B-v1: EXCESSIVE ────────────
  const resultBv1 = computeJudgement(itemsB);
  const judgementBv1 = await prisma.judgement.create({
    data: {
      estimateId: estimateB.id,
      version: 1,
      status: JudgementStatus.done,
      resultLabel: resultBv1.resultLabel,
      confidence: resultBv1.confidence,
      overallScore: resultBv1.overallScore,
      summary: resultBv1.summary,
      items: {
        create: resultBv1.items.map((item) => ({
          estimateItemId: item.estimateItemId,
          fairMin: item.fairMin,
          fairMax: item.fairMax,
          myPrice: item.myPrice,
          positionPct: item.positionPct,
          resultLabel: item.resultLabel as ResultLabel,
          reasonTags: item.reasonTags,
          notes: item.notes,
        })),
      },
    },
  });
  console.log('✅ Judgement B-v1 생성 (EXCESSIVE):', judgementBv1.id, '점수:', resultBv1.overallScore);

  // ─── Feedback (Judgement A-v1에 좋은 평가) ─
  const feedback = await prisma.feedback.create({
    data: {
      judgementId: judgementAv1.id,
      rating: 5,
      comment: '정확하고 유용한 판단이었습니다. 덕분에 정비소에 확인을 잘 했어요!',
    },
  });
  console.log('✅ Feedback 생성:', feedback.id);

  console.log(`
  ====================================
  시드 완료!
  ====================================
  - User: 1명 (user_1)
  - CarProfile: 1개 (현대 아반떼 2020)
  - Estimate: 2개 (A: 적정, B: 과다)
  - Judgement: 3개 (A-v1: ${resultAv1.resultLabel}, A-v2: ${resultAv2.resultLabel}, B-v1: ${resultBv1.resultLabel})
  - Feedback: 1개
  ====================================
  `);
}

main()
  .catch((err) => {
    console.error('시드 실패:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

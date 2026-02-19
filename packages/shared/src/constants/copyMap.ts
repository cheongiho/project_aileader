import type { ReasonTag } from './reasonTags';

export interface ReasonTagCopy {
  label: string;
  description: string;
  questions: string[];
}

export const REASON_TAG_COPY: Record<ReasonTag, ReasonTagCopy> = {
  HIGH_PART_PRICE: {
    label: '부품비 높음',
    description: '이 항목의 부품비가 시장 평균보다 높게 책정되어 있습니다.',
    questions: [
      '사용하시는 부품이 OEM인지, 순정인지 확인해보세요.',
      '같은 부품으로 다른 정비소에서도 견적을 받아보시는 것도 좋습니다.',
    ],
  },
  HIGH_LABOR: {
    label: '공임 높음',
    description: '이 작업의 공임이 일반적인 범위보다 높을 수 있습니다.',
    questions: [
      '작업 시간이 얼마나 걸리는지 물어보세요.',
      '공임에 포함된 작업 범위가 무엇인지 확인해보세요.',
    ],
  },
  DUP_LABOR: {
    label: '공임 중복 의심',
    description: '다른 항목과 작업이 겹쳐 공임이 중복 청구될 수 있습니다.',
    questions: [
      '이 작업들을 함께 할 때 공임을 묶어서 할인해 드릴 수 있는지 여쭤보세요.',
      '어떤 부분의 분해·조립이 포함되어 있는지 설명해달라고 하세요.',
    ],
  },
  UNNEEDED_REPLACEMENT: {
    label: '교체 필요성 불확실',
    description: '지금 당장 교체가 꼭 필요한지 확인이 필요합니다.',
    questions: [
      '해당 부품의 현재 상태(마모도, 사진 등)를 보여달라고 하세요.',
      '교체하지 않을 경우 주행에 어떤 영향이 있는지 물어보세요.',
    ],
  },
  UNCLEAR_ITEM: {
    label: '항목 내용 불분명',
    description: '이 항목이 구체적으로 어떤 작업인지 확인이 필요합니다.',
    questions: [
      '이 항목에 포함된 작업 내용을 구체적으로 설명해달라고 하세요.',
      '영수증이나 작업 명세서를 요청해보세요.',
    ],
  },
  MARKET_VARIANCE: {
    label: '가격 편차 있음',
    description: '이 항목은 지역이나 차종에 따라 가격 차이가 클 수 있습니다.',
    questions: [
      '차량 연식과 모델에 따라 달라지는 이유가 있는지 물어보세요.',
      '인근 다른 정비소와 비교해보는 것도 방법입니다.',
    ],
  },
};

export function getReasonTagCopy(tag: string): ReasonTagCopy | null {
  return (REASON_TAG_COPY as Record<string, ReasonTagCopy>)[tag] ?? null;
}

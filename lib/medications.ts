import { Medication } from "@/components/types";

export const medications: Medication[] = [
  {
    id: "acetaminophen-500",
    slug: "tylenol-500",
    name: "타이레놀 500mg",
    category: "해열진통제",
    dosage: "500mg",
    ingredient: "아세트아미노펜",
    summary: "두통, 발열, 가벼운 통증 완화에 사용되는 대표적인 해열진통제입니다.",
    efficacy:
      "감기, 두통, 치통, 생리통과 같은 가벼운 통증과 발열을 완화하는 데 사용됩니다.",
    usage: [
      "공복 복용보다 식후 또는 간단한 음식과 함께 복용하는 편이 부담이 적습니다.",
      "권장 용법을 초과하지 말고, 다른 아세트아미노펜 성분 약과 중복 복용을 피해야 합니다.",
      "지속적인 통증이나 고열이 이어지면 의료진 상담이 필요합니다.",
    ],
    cautions: [
      "음주 전후 복용은 간 부담을 높일 수 있습니다.",
      "간 질환이 있거나 다른 감기약을 함께 먹는 경우 성분 중복을 확인해야 합니다.",
      "장기간 연속 복용은 피하는 것이 좋습니다.",
    ],
    sideEffects: ["메스꺼움", "발진", "간 수치 상승 가능성"],
    storage: "직사광선을 피하고 실온에서 보관하세요.",
  },
  {
    id: "pancol-cold",
    slug: "pancol-cold",
    name: "판콜 콜드",
    category: "종합감기약",
    dosage: "1회 1포",
    ingredient: "아세트아미노펜, 클로르페니라민, 카페인",
    summary: "감기 증상 완화를 위한 복합 성분 감기약입니다.",
    efficacy:
      "코막힘, 콧물, 기침, 두통 등 감기 증상을 완화하는 데 도움을 줍니다.",
    usage: [
      "졸릴 수 있으므로 복용 후 운전이나 기계 조작은 피하는 편이 안전합니다.",
      "정해진 횟수 이상 복용하지 말고 수분 섭취를 유지하세요.",
      "다른 감기약과 중복 복용하지 않도록 성분을 확인하세요.",
    ],
    cautions: [
      "졸음 유발 가능성이 있습니다.",
      "혈압약 복용 중이거나 기저질환이 있으면 의약사 상담이 필요합니다.",
      "카페인 음료와 함께 복용 시 두근거림이 심해질 수 있습니다.",
    ],
    sideEffects: ["졸림", "입마름", "어지러움"],
    storage: "습기가 적고 서늘한 곳에 보관하세요.",
  },
  {
    id: "geborin-tablet",
    slug: "geborin-tablet",
    name: "게보린 정",
    category: "진통제",
    dosage: "정제",
    ingredient: "아세트아미노펜, 카페인, 이소프로필안티피린",
    summary: "두통과 치통 등 일상 통증 완화에 자주 사용되는 복합 진통제입니다.",
    efficacy: "두통, 치통, 생리통, 근육통 등 다양한 통증 완화에 사용됩니다.",
    usage: [
      "권장 용량을 지키고, 위장 자극이 있다면 식후 복용을 고려하세요.",
      "짧은 간격으로 반복 복용하지 않는 것이 좋습니다.",
      "카페인 민감성이 있다면 복용 후 컨디션을 관찰하세요.",
    ],
    cautions: [
      "과다복용 시 위장장애 위험이 높아질 수 있습니다.",
      "다른 진통제와 함께 복용할 때는 성분 중복을 확인해야 합니다.",
      "속쓰림이 잦다면 복용 전 전문가 상담이 필요합니다.",
    ],
    sideEffects: ["속쓰림", "메스꺼움", "두근거림"],
    storage: "고온다습한 장소를 피해 보관하세요.",
  },
  {
    id: "zyrtec-10",
    slug: "zyrtec-10",
    name: "지르텍 10mg",
    category: "항히스타민제",
    dosage: "10mg",
    ingredient: "세티리진염산염",
    summary: "알레르기성 비염과 두드러기 증상 완화에 사용하는 항히스타민제입니다.",
    efficacy: "재채기, 콧물, 가려움, 두드러기 등 알레르기 증상 완화에 도움을 줍니다.",
    usage: [
      "하루 한 번 같은 시간대에 복용하는 것이 일반적입니다.",
      "복용 초기에는 졸음 여부를 확인하는 것이 좋습니다.",
      "신장 기능 저하가 있으면 복용 전 전문가 상담이 필요합니다.",
    ],
    cautions: [
      "운전 전 복용 시 졸음 여부를 먼저 확인하세요.",
      "술과 함께 복용하면 진정 효과가 더 강해질 수 있습니다.",
      "임신 또는 수유 중이라면 전문가 상담 후 복용해야 합니다.",
    ],
    sideEffects: ["졸림", "입마름", "피로감"],
    storage: "어린이 손이 닿지 않는 곳에 실온 보관하세요.",
  },
];

export function findMedicationBySlug(slug: string) {
  return medications.find((item) => item.slug === slug);
}

export function searchMedications(keyword: string) {
  const normalized = keyword.trim().toLowerCase();

  if (!normalized) {
    return medications;
  }

  return medications.filter((item) => {
    const haystack = [item.name, item.category, item.summary].join(" ").toLowerCase();
    return haystack.includes(normalized);
  });
}

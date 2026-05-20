import { Medication } from "@/components/types";
import { HealthProfile, getAgeGroupFromAge } from "@/lib/health-profile";
import { splitMedicationName } from "@/lib/medication-name";

export type MedicationGuidance = {
  key: string;
  title: string;
  message: string;
  medicationNames: string[];
  priority: number;
  profileMatches: string[];
};

const GUIDANCE_RULES = [
  {
    key: "meal-before",
    title: "식전 복용 권장",
    priority: 40,
    message:
      "공복 또는 식전 복용이 권장되는 약이 있습니다. 식사 직전보다는 안내된 시간 간격을 두고 복용하는 편이 좋습니다.",
    pattern: /(식전|공복(?:에|으로)?\s*(복용|투여|사용))/u,
  },
  {
    key: "meal-after",
    title: "식후 복용 권장",
    priority: 35,
    message:
      "식후 복용이 권장되는 약이 있습니다. 위장 자극을 줄이기 위해 식사 후에 맞춰 복용하는 편이 안전합니다.",
    pattern: /(식후|식사 후)/u,
  },
  {
    key: "avoid-driving",
    title: "운전·기계 조작 주의",
    priority: 90,
    message:
      "졸림이나 어지러움을 유발할 수 있는 약이 있습니다. 운전 전후나 기계 조작 전에는 복용을 피하거나, 복용 후 충분히 상태를 확인하세요.",
    pattern: /(운전|기계 조작|졸림|어지러움|집중력저하|진정)/u,
  },
  {
    key: "avoid-alcohol",
    title: "음주 병행 주의",
    priority: 80,
    message:
      "음주와 함께 복용 시 부작용이나 간 부담이 커질 수 있는 약이 있습니다. 복용 전후에는 술을 피하는 편이 좋습니다.",
    pattern: /(음주|술|알코올)/u,
  },
  {
    key: "interaction",
    title: "병용 약 확인 필요",
    priority: 85,
    message:
      "다른 약과 함께 복용할 때 주의가 필요한 약이 있습니다. 복용 중인 약이 여러 개라면 상호작용 여부를 먼저 확인하세요.",
    pattern: /(함께 복용|병용|상호작용|다른 .*약물|다른 .*약과)/u,
  },
  {
    key: "pregnancy",
    title: "임신·수유 중 전문가 상담",
    priority: 95,
    message:
      "임신 중이거나 수유 중에는 복용 전 전문가 확인이 필요한 약이 있습니다. 임신 가능성이 있더라도 먼저 상담 후 복용하세요.",
    pattern: /(임부|임신|수유부|수유 중)/u,
  },
  {
    key: "liver-care",
    title: "간 기능 부담 주의",
    priority: 78,
    message:
      "간 질환이 있거나 간 기능이 저하된 경우 더 주의해서 확인해야 하는 약이 있습니다. 기존 간 질환이 있다면 복용 전 전문가와 먼저 상의하세요.",
    pattern: /(간기능|간 기능|간장애|간 장애|간질환|간 질환|간부전|간 손상|간독성)/u,
  },
  {
    key: "kidney-care",
    title: "신장 기능 부담 주의",
    priority: 78,
    message:
      "신장으로 배출되거나 신장 기능 상태에 따라 주의가 필요한 약이 있습니다. 신장 질환이 있다면 복용 전 용법과 용량을 먼저 확인하세요.",
    pattern: /(신기능|신 기능|신장애|신 장애|신질환|신 질환|신부전|콩팥)/u,
  },
  {
    key: "blood-pressure",
    title: "혈압 상태 확인 필요",
    priority: 70,
    message:
      "혈압에 영향을 줄 수 있거나 고혈압 환자에서 주의가 필요한 약이 있습니다. 혈압약을 복용 중이라면 함께 확인하는 편이 좋습니다.",
    pattern: /(고혈압|혈압\s*(상승|저하|변화)?)/u,
  },
  {
    key: "asthma",
    title: "천식·호흡기 증상 주의",
    priority: 70,
    message:
      "천식이나 호흡기 과민 상태에서 더 주의해야 하는 약이 있습니다. 기존 천식 증상이 있다면 복용 후 호흡기 변화도 함께 살펴보세요.",
    pattern: /(천식|기관지(?:수축|경련)?|호흡곤란)/u,
  },
  {
    key: "stomach",
    title: "위장 자극 주의",
    priority: 68,
    message:
      "속쓰림이나 위장 장애를 악화시킬 수 있어 확인이 필요한 약이 있습니다. 위장 질환이 있다면 식후 복용 여부와 자극 증상을 먼저 살펴보세요.",
    pattern: /(위장장애|위장 장애|위궤양|위염|위출혈|속쓰림|소화성궤양|위장관)/u,
  },
  {
    key: "allergy-care",
    title: "알레르기 반응 이력 확인",
    priority: 74,
    message:
      "과민반응이나 알레르기 이력이 있다면 성분과 반응 경험을 먼저 대조해야 하는 약이 있습니다. 발진, 두드러기, 호흡기 증상이 있었던 경우 특히 주의하세요.",
    pattern: /(과민반응|알레르기|발진|두드러기|아나필락시스)/u,
  },
  {
    key: "meal-consistency",
    title: "복용 시간 일정하게 유지",
    priority: 30,
    message:
      "같은 시간대에 꾸준히 복용하는 편이 좋은 약이 있습니다. 하루 복용 횟수와 간격을 가능한 일정하게 유지하세요.",
    pattern: /(1일\s*\d+회|하루\s*\d+회|복용간격|같은 시간대|매일 같은 시간)/u,
  },
] as const;

export function extractMedicationGuidance(
  medications: Medication[],
  healthProfile?: HealthProfile,
): MedicationGuidance[] {
  const grouped = new Map<string, MedicationGuidance>();

  for (const medication of medications) {
    const medicationName = splitMedicationName(medication.name).primaryName;
    const sourceText = [
      medication.summary,
      medication.efficacy,
      ...medication.usage,
      ...medication.cautions,
      ...medication.sideEffects,
    ].join(" ");

    for (const rule of GUIDANCE_RULES) {
      if (!rule.pattern.test(sourceText)) {
        continue;
      }

      const existing = grouped.get(rule.key);

      if (existing) {
        if (!existing.medicationNames.includes(medicationName)) {
          existing.medicationNames.push(medicationName);
        }
        continue;
      }

      grouped.set(rule.key, {
        key: rule.key,
        title: rule.title,
        message: rule.message,
        medicationNames: [medicationName],
        priority: rule.priority,
        profileMatches: [],
      });
    }
  }

  const personalized = [...grouped.values()].map((guide) => {
    const adjustment = getGuidancePriorityAdjustment(guide.key, healthProfile);

    return {
      ...guide,
      priority: guide.priority + adjustment.bonus,
      profileMatches: adjustment.profileMatches,
    };
  });

  return personalized.sort((left, right) => {
    if (right.priority !== left.priority) {
      return right.priority - left.priority;
    }

    if (right.medicationNames.length !== left.medicationNames.length) {
      return right.medicationNames.length - left.medicationNames.length;
    }

    return left.title.localeCompare(right.title, "ko");
  });
}

function getGuidancePriorityAdjustment(
  guideKey: string,
  healthProfile?: HealthProfile,
) {
  if (!healthProfile) {
    return {
      bonus: 0,
      profileMatches: [] as string[],
    };
  }

  let bonus = 0;
  const profileMatches: string[] = [];
  const ageGroup = getAgeGroupFromAge(healthProfile.age);

  if (healthProfile.pregnant === "yes" && guideKey === "pregnancy") {
    bonus += 70;
    profileMatches.push("임신 여부");
  }

  if (healthProfile.breastfeeding === "yes" && guideKey === "pregnancy") {
    bonus += 60;
    profileMatches.push("수유 여부");
  }

  if (healthProfile.driving === "yes" && guideKey === "avoid-driving") {
    bonus += 50;
    profileMatches.push("운전 여부");
  }

  if (guideKey === "avoid-alcohol") {
    const drinkingBonus = getDrinkingPriorityBonus(healthProfile.drinkingFrequency);

    if (drinkingBonus > 0) {
      bonus += drinkingBonus;
      profileMatches.push("음주 빈도");
    }

    if (healthProfile.liverDisease === "yes") {
      bonus += 20;
      profileMatches.push("간 질환 여부");
    }
  }

  if (healthProfile.liverDisease === "yes" && guideKey === "liver-care") {
    bonus += 60;
    profileMatches.push("간 질환 여부");
  }

  if (healthProfile.kidneyDisease === "yes" && guideKey === "kidney-care") {
    bonus += 60;
    profileMatches.push("신장 질환 여부");
  }

  if (
    healthProfile.highBloodPressure === "yes" &&
    guideKey === "blood-pressure"
  ) {
    bonus += 55;
    profileMatches.push("고혈압 여부");
  }

  if (healthProfile.asthma === "yes" && guideKey === "asthma") {
    bonus += 55;
    profileMatches.push("천식 여부");
  }

  if (healthProfile.stomachDisease === "yes" && guideKey === "stomach") {
    bonus += 55;
    profileMatches.push("위장 질환 여부");
  }

  if (healthProfile.allergies && guideKey === "allergy-care") {
    bonus += 55;
    profileMatches.push("알레르기");
  }

  if (healthProfile.currentMedications && guideKey === "interaction") {
    bonus += 40;
    profileMatches.push("현재 복용 중인 약");
  }

  if (ageGroup === "child" || ageGroup === "teen") {
    if (guideKey === "interaction") {
      bonus += 10;
      profileMatches.push("나이");
    }
  }

  if (ageGroup === "senior") {
    if (guideKey === "avoid-driving") {
      bonus += 20;
      profileMatches.push("나이");
    }

    if (guideKey === "interaction") {
      bonus += 15;
      profileMatches.push("나이");
    }
  }

  return {
    bonus,
    profileMatches: [...new Set(profileMatches)],
  };
}

function getDrinkingPriorityBonus(frequency: HealthProfile["drinkingFrequency"]) {
  switch (frequency) {
    case "rare":
      return 10;
    case "monthly":
      return 20;
    case "weekly":
      return 35;
    case "frequent":
      return 50;
    default:
      return 0;
  }
}

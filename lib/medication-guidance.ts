import { Medication } from "@/components/types";
import { splitMedicationName } from "@/lib/medication-name";

export type MedicationGuidance = {
  key: string;
  title: string;
  message: string;
  medicationNames: string[];
  priority: number;
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
      });
    }
  }

  return [...grouped.values()].sort((left, right) => {
    if (right.priority !== left.priority) {
      return right.priority - left.priority;
    }

    if (right.medicationNames.length !== left.medicationNames.length) {
      return right.medicationNames.length - left.medicationNames.length;
    }

    return left.title.localeCompare(right.title, "ko");
  });
}

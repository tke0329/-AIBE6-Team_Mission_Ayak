const GENERIC_SIDE_EFFECT_NOTICE =
  "부작용이 발생할 경우 사용을 즉각 중단하고 의사 또는 약사와 상의하십시오.";

const ADVISORY_PATTERNS = [
  /나타나는 경우.*$/u,
  /지속되거나 악화될 경우.*$/u,
  /복용을 즉각 중지.*$/u,
  /복용을 즉각 중단.*$/u,
  /사용을 즉각 중지.*$/u,
  /사용을 즉각 중단.*$/u,
  /의사 또는 약사와 상의하십시오.*$/u,
];

const SIDE_EFFECT_GUIDANCE_RULES = [
  {
    pattern: /(졸림|어지러움|피로감|집중력저하)/u,
    message: "운전 전후나 기계 조작 전에는 복용에 주의하세요.",
  },
  {
    pattern: /(구역|구토|속쓰림|복통|설사|변비|식욕부진|입마름)/u,
    message: "위장 불편이 이어지면 식후 복용 여부와 수분 섭취를 확인하고 상담하세요.",
  },
  {
    pattern: /(발진|가려움|두드러기|부종|붓기|알레르기|호흡곤란|쇽|쇼크)/u,
    message: "과민반응 가능성이 있어 즉시 사용을 중단하고 진료를 받아야 합니다.",
  },
  {
    pattern: /(두근거림|청색증|저혈압)/u,
    message: "심혈관계 이상 신호일 수 있어 즉시 휴식하고 의료진과 상의하세요.",
  },
  {
    pattern: /(간 수치 상승|AST 상승|ALT 상승)/u,
    message: "간 관련 이상 가능성이 있어 음주를 피하고 빠르게 상담하는 편이 안전합니다.",
  },
];

export function getGenericSideEffectNotice() {
  return GENERIC_SIDE_EFFECT_NOTICE;
}

export function extractSideEffectKeywords(sideEffects: string[]) {
  const keywords = new Set<string>();

  for (const item of sideEffects) {
    const normalized = normalizeSideEffectSentence(item);

    for (const part of normalized.split(/[,/]| 및 /u)) {
      const cleaned = cleanSideEffectKeyword(part);

      if (!cleaned) {
        continue;
      }

      keywords.add(cleaned);
    }
  }

  return [...keywords].slice(0, 12);
}

export function getSideEffectGuidance(keyword: string) {
  const matchedRule = SIDE_EFFECT_GUIDANCE_RULES.find((rule) =>
    rule.pattern.test(keyword),
  );

  return matchedRule?.message ?? "증상이 반복되거나 심해지면 복용을 중단하고 전문가와 상의하세요.";
}

function normalizeSideEffectSentence(value: string) {
  let normalized = value.replace(/\r/g, "").replace(/\n+/g, ", ");

  for (const pattern of ADVISORY_PATTERNS) {
    normalized = normalized.replace(pattern, "");
  }

  return normalized;
}

function cleanSideEffectKeyword(value: string) {
  const cleaned = value
    .replace(/\([^)]*\)/g, "")
    .replace(/[()]/g, "")
    .replace(/등[이가은는을를과와]?/gu, "")
    .replace(/(증상|이상반응|가능성)$/gu, "")
    .replace(/^(새로운|심한|중대한)\s+/gu, "")
    .replace(/\s+/g, " ")
    .replace(/[.:;]+$/g, "")
    .replace(/[,\-/]+$/g, "")
    .trim();

  const normalized = cleaned
    .replace(/\s+(이|가|은|는|을|를|와|과)$/u, "")
    .replace(/(이|가|은|는|을|를|와|과)$/u, (match, particle, offset, source) =>
      source.length <= 2 ? match : "",
    )
    .trim();

  if (!normalized) {
    return null;
  }

  if (
    normalized.includes("의사") ||
    normalized.includes("약사") ||
    normalized.includes("복용") ||
    normalized.includes("사용") ||
    normalized.includes("경우")
  ) {
    return null;
  }

  return normalized;
}

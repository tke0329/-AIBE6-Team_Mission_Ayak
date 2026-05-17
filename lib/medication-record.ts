import { Medication } from "@/components/types";

export type MedicationRow = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  dosage: string | null;
  ingredient: string | null;
  summary: string;
  efficacy: string;
  usage: string[] | null;
  cautions: string[] | null;
  side_effects: string[] | null;
  storage: string;
};

export function normalizeMedication(row: MedicationRow): Medication {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category ?? "분류 미지정",
    dosage: row.dosage ?? "용량 미지정",
    ingredient: resolveIngredient(row.name, row.ingredient),
    summary: row.summary,
    efficacy: row.efficacy,
    usage: row.usage ?? [],
    cautions: row.cautions ?? [],
    sideEffects: row.side_effects ?? [],
    storage: row.storage,
  };
}

function resolveIngredient(name: string, ingredient: string | null) {
  const ingredientFromName = extractKoreanIngredientFromName(name);

  if (ingredientFromName) {
    return sanitizeIngredientText(ingredientFromName);
  }

  return sanitizeIngredientText(ingredient ?? "주성분 정보 없음");
}

function extractKoreanIngredientFromName(name: string) {
  const parentheticalValues = [...name.matchAll(/\(([^)]+)\)/g)]
    .map((match) => match[1]?.trim())
    .filter(Boolean);

  const matched = parentheticalValues.find(
    (value) => /[가-힣]/u.test(value) && !value.includes("수출명"),
  );

  return matched ?? null;
}

function sanitizeIngredientText(value: string) {
  const normalizedWhitespace = value.replace(/\s+/g, " ").trim();
  const withoutEmptyParentheses = normalizedWhitespace.replace(/\(\s*\)/g, "");
  const withoutDanglingPunctuation = withoutEmptyParentheses
    .replace(/^[,;:/)\]}]+/g, "")
    .replace(/[(\[{,;:/]+$/g, "")
    .trim();

  const balanced = stripUnmatchedParentheses(withoutDanglingPunctuation)
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ", ")
    .trim();

  return balanced || "주성분 정보 없음";
}

function stripUnmatchedParentheses(value: string) {
  const openingStack: number[] = [];
  const keep = Array.from(value, () => true);

  for (const [index, char] of Array.from(value).entries()) {
    if (char === "(") {
      openingStack.push(index);
      continue;
    }

    if (char === ")") {
      const matchedOpening = openingStack.pop();

      if (matchedOpening === undefined) {
        keep[index] = false;
      }
    }
  }

  for (const index of openingStack) {
    keep[index] = false;
  }

  return Array.from(value)
    .filter((_, index) => keep[index])
    .join("");
}

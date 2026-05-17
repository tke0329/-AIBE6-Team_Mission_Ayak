export function splitMedicationName(name: string) {
  const trimmedName = name.trim();
  const firstParenthesisIndex = trimmedName.indexOf("(");
  const sanitizePrimaryName = (value: string) =>
    value
      .replace(/^\d+\.\s*/u, "")
      .replace(/^[\-\u2022]+\s*/u, "")
      .trim();

  if (firstParenthesisIndex === -1) {
    return {
      primaryName: sanitizePrimaryName(trimmedName),
      secondaryName: null,
    };
  }

  const primaryName =
    sanitizePrimaryName(trimmedName.slice(0, firstParenthesisIndex)) ||
    sanitizePrimaryName(trimmedName);
  const secondaryParts = [...trimmedName.matchAll(/\(([^)]+)\)/g)]
    .map((match) => match[1]?.trim())
    .filter(Boolean);

  return {
    primaryName,
    secondaryName: secondaryParts.length > 0 ? secondaryParts.join(" · ") : null,
  };
}

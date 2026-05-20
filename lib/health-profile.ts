"use client";

export type AgeGroup = "" | "child" | "teen" | "adult" | "senior";
export type BooleanChoice = "" | "yes" | "no";
export type DrinkingFrequency =
  | ""
  | "rare"
  | "monthly"
  | "weekly"
  | "frequent";

export type HealthProfile = {
  age: string;
  pregnant: BooleanChoice;
  breastfeeding: BooleanChoice;
  drinkingFrequency: DrinkingFrequency;
  driving: BooleanChoice;
  liverDisease: BooleanChoice;
  kidneyDisease: BooleanChoice;
  highBloodPressure: BooleanChoice;
  asthma: BooleanChoice;
  stomachDisease: BooleanChoice;
  allergies: string;
  currentMedications: string;
  updatedAt: string;
};

export const emptyHealthProfile: HealthProfile = {
  age: "",
  pregnant: "",
  breastfeeding: "",
  drinkingFrequency: "",
  driving: "",
  liverDisease: "",
  kidneyDisease: "",
  highBloodPressure: "",
  asthma: "",
  stomachDisease: "",
  allergies: "",
  currentMedications: "",
  updatedAt: "",
};

export function createEmptyHealthProfile() {
  return { ...emptyHealthProfile };
}

export function sanitizeHealthProfile(
  profile: Partial<HealthProfile>,
): HealthProfile {
  return {
    age: sanitizeAge(profile.age),
    pregnant:
      profile.pregnant === "yes" || profile.pregnant === "no"
        ? profile.pregnant
        : "",
    breastfeeding:
      profile.breastfeeding === "yes" || profile.breastfeeding === "no"
        ? profile.breastfeeding
        : "",
    drinkingFrequency: sanitizeDrinkingFrequency(profile.drinkingFrequency),
    driving:
      profile.driving === "yes" || profile.driving === "no"
        ? profile.driving
        : "",
    liverDisease:
      profile.liverDisease === "yes" || profile.liverDisease === "no"
        ? profile.liverDisease
        : "",
    kidneyDisease:
      profile.kidneyDisease === "yes" || profile.kidneyDisease === "no"
        ? profile.kidneyDisease
        : "",
    highBloodPressure:
      profile.highBloodPressure === "yes" || profile.highBloodPressure === "no"
        ? profile.highBloodPressure
        : "",
    asthma:
      profile.asthma === "yes" || profile.asthma === "no" ? profile.asthma : "",
    stomachDisease:
      profile.stomachDisease === "yes" || profile.stomachDisease === "no"
        ? profile.stomachDisease
        : "",
    allergies:
      typeof profile.allergies === "string" ? profile.allergies.trim() : "",
    currentMedications:
      typeof profile.currentMedications === "string"
        ? profile.currentMedications.trim()
        : "",
    updatedAt: typeof profile.updatedAt === "string" ? profile.updatedAt : "",
  };
}

export function hasHealthProfile(profile: HealthProfile) {
  return (
    Boolean(profile.age) ||
    Boolean(profile.pregnant) ||
    Boolean(profile.breastfeeding) ||
    Boolean(profile.drinkingFrequency) ||
    Boolean(profile.driving) ||
    Boolean(profile.liverDisease) ||
    Boolean(profile.kidneyDisease) ||
    Boolean(profile.highBloodPressure) ||
    Boolean(profile.asthma) ||
    Boolean(profile.stomachDisease) ||
    Boolean(profile.allergies) ||
    Boolean(profile.currentMedications)
  );
}

export function getAgeGroupFromAge(age: string): AgeGroup {
  const numericAge = Number.parseInt(age, 10);

  if (!Number.isFinite(numericAge) || numericAge < 0) {
    return "";
  }

  if (numericAge <= 12) {
    return "child";
  }

  if (numericAge <= 18) {
    return "teen";
  }

  if (numericAge <= 58) {
    return "adult";
  }

  return "senior";
}

export function formatAgeGroup(ageGroup: AgeGroup) {
  switch (ageGroup) {
    case "child":
      return "어린이";
    case "teen":
      return "청소년";
    case "adult":
      return "성인";
    case "senior":
      return "고령자";
    default:
      return "미입력";
  }
}

export function formatAgeSummary(age: string) {
  const ageGroup = getAgeGroupFromAge(age);

  if (!ageGroup) {
    return "미입력";
  }

  return `${age}세 (${formatAgeGroup(ageGroup)})`;
}

export function formatBooleanChoice(choice: BooleanChoice) {
  switch (choice) {
    case "yes":
      return "예";
    case "no":
      return "아니오";
    default:
      return "미입력";
  }
}

export function formatDrinkingFrequency(frequency: DrinkingFrequency) {
  switch (frequency) {
    case "rare":
      return "거의 안 마심";
    case "monthly":
      return "월 1~3회";
    case "weekly":
      return "주 1~2회";
    case "frequent":
      return "주 3회 이상";
    default:
      return "미입력";
  }
}

function sanitizeAge(age: unknown) {
  if (typeof age !== "string") {
    return "";
  }

  const digitsOnly = age.replace(/[^\d]/g, "");

  if (!digitsOnly) {
    return "";
  }

  const normalizedAge = Number.parseInt(digitsOnly, 10);

  if (!Number.isFinite(normalizedAge) || normalizedAge < 0) {
    return "";
  }

  return String(normalizedAge);
}

function sanitizeDrinkingFrequency(
  frequency: unknown,
): DrinkingFrequency {
  if (
    frequency === "rare" ||
    frequency === "monthly" ||
    frequency === "weekly" ||
    frequency === "frequent"
  ) {
    return frequency;
  }

  return "";
}

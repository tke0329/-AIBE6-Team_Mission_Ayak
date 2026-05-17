import { Medication } from "@/components/types";
import { MedicationRow, normalizeMedication } from "@/lib/medication-record";
import {
  createServerSupabaseAdminClient,
  createServerSupabaseClient,
} from "@/lib/supabase/server";

type SearchMedicationsOptions = {
  query?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
};

export type SearchMedicationsResult = {
  medications: Medication[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
};

async function createMedicationReadClient() {
  const adminClient = createServerSupabaseAdminClient();

  if (adminClient) {
    return adminClient;
  }

  return createServerSupabaseClient();
}

function getMedicationReadErrorMessage(message: string) {
  if (
    message.includes("permission denied") ||
    message.includes("row-level security") ||
    message.includes("violates row-level security policy")
  ) {
    return "medications 조회 권한이 없습니다. `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY`를 추가하거나 Supabase에서 SELECT 정책을 설정해야 합니다.";
  }

  return message;
}

export async function getAllMedications() {
  const supabase = await createMedicationReadClient();
  const { data, error } = await supabase
    .from("medications")
    .select(
      "id, slug, name, category, dosage, ingredient, summary, efficacy, usage, cautions, side_effects, storage",
    )
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error(getMedicationReadErrorMessage(error.message));
  }

  return ((data ?? []) as MedicationRow[]).map(normalizeMedication);
}

export async function searchMedications({
  query = "",
  tag = "전체",
  page = 1,
  pageSize = 20,
}: SearchMedicationsOptions = {}): Promise<SearchMedicationsResult> {
  const supabase = await createMedicationReadClient();
  const normalizedQuery = query.trim();
  const normalizedTag = tag.trim() || "전체";
  const currentPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 20;
  const from = (currentPage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  let request = supabase
    .from("medications")
    .select(
      "id, slug, name, category, dosage, ingredient, summary, efficacy, usage, cautions, side_effects, storage",
      { count: "exact" },
    )
    .eq("is_active", true)
    .order("name")
    .range(from, to);

  if (normalizedQuery) {
    request = request.ilike("search_text", `%${escapeLikeValue(normalizedQuery)}%`);
  }

  if (normalizedTag !== "전체") {
    request = request.ilike("search_text", `%${escapeLikeValue(normalizedTag)}%`);
  }

  const { data, error, count } = await request;

  if (error) {
    throw new Error(getMedicationReadErrorMessage(error.message));
  }

  return {
    medications: ((data ?? []) as MedicationRow[]).map(normalizeMedication),
    totalCount: count ?? 0,
    currentPage,
    pageSize: safePageSize,
  };
}

export async function getMedicationBySlugOrId(identifier: string) {
  const supabase = await createMedicationReadClient();
  const { data, error } = await supabase
    .from("medications")
    .select(
      "id, slug, name, category, dosage, ingredient, summary, efficacy, usage, cautions, side_effects, storage",
    )
    .or(`slug.eq.${identifier},id.eq.${identifier}`)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(getMedicationReadErrorMessage(error.message));
  }

  if (!data) {
    return null;
  }

  return normalizeMedication(data as MedicationRow);
}

function escapeLikeValue(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

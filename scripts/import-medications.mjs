import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

loadEnvFile(path.join(projectRoot, ".env.local"));
loadEnvFile(path.join(projectRoot, ".env"));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PUBLIC_DATA_API_SERVICE_KEY = process.env.PUBLIC_DATA_API_SERVICE_KEY;
const PUBLIC_DATA_INGREDIENT_API_SERVICE_KEY =
  process.env.PUBLIC_DATA_INGREDIENT_API_SERVICE_KEY;
const PUBLIC_DATA_INGREDIENT_API_URL = process.env.PUBLIC_DATA_INGREDIENT_API_URL;
const PAGE_SIZE = parsePositiveInt(process.env.PUBLIC_DATA_API_PAGE_SIZE, 100);
const MAX_PAGES = parsePositiveInt(process.env.PUBLIC_DATA_API_MAX_PAGES, 0);

if (!SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL 환경변수가 필요합니다.");
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.");
}

if (!PUBLIC_DATA_API_SERVICE_KEY) {
  throw new Error("PUBLIC_DATA_API_SERVICE_KEY 환경변수가 필요합니다.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const API_ENDPOINT =
  "https://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList";
const INGREDIENT_API_PATH = "/getDrugPrdtPrmsnInq07";

async function main() {
  let pageNo = 1;
  let processedCount = 0;
  let totalCount = Number.POSITIVE_INFINITY;

  while (processedCount < totalCount) {
    if (MAX_PAGES > 0 && pageNo > MAX_PAGES) {
      break;
    }

    const payload = await fetchPage(pageNo, PAGE_SIZE);
    const body = payload?.body;
    const items = Array.isArray(body?.items) ? body.items : [];

    if (pageNo === 1) {
      totalCount = Number(body?.totalCount ?? 0);
      console.log(`총 ${totalCount}건 적재 대상 확인`);
    }

    if (items.length === 0) {
      console.log(`page=${pageNo}: 수집 결과가 없어 종료합니다.`);
      break;
    }

    const rows = dedupeRowsById(items.map(mapMedicationRow));
    const { error } = await supabase
      .from("medications")
      .upsert(rows, { onConflict: "id" });

    if (error) {
      throw error;
    }

    processedCount += rows.length;
    console.log(`page=${pageNo}: ${rows.length}건 upsert 완료 (누적 ${processedCount}건)`);
    pageNo += 1;
  }

  const ingredientUpdatedCount = await enrichIngredients();
  console.log(`주성분 보강 완료: 총 ${ingredientUpdatedCount}건 업데이트`);
  console.log(`의약품 적재 완료: 총 ${processedCount}건 처리`);
}

async function fetchPage(pageNo, numOfRows) {
  const url = new URL(API_ENDPOINT);
  url.searchParams.set("serviceKey", PUBLIC_DATA_API_SERVICE_KEY);
  url.searchParams.set("pageNo", String(pageNo));
  url.searchParams.set("numOfRows", String(numOfRows));
  url.searchParams.set("type", "json");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`공공 API 호출 실패: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const resultCode = payload?.header?.resultCode;

  if (resultCode && resultCode !== "00") {
    throw new Error(
      `공공 API 오류: ${resultCode} ${payload?.header?.resultMsg ?? "알 수 없는 오류"}`,
    );
  }

  return payload;
}

function mapMedicationRow(item) {
  const name = normalizeText(item.itemName) ?? "이름 미상 의약품";
  const efficacy = normalizeText(item.efcyQesitm) ?? "효과 정보가 제공되지 않았습니다.";
  const cautions = splitParagraphs(
    [item.atpnWarnQesitm, item.atpnQesitm, item.intrcQesitm]
      .map(normalizeText)
      .filter(Boolean)
      .join("\n\n"),
  );
  const usage = splitParagraphs(item.useMethodQesitm);
  const sideEffects = splitParagraphs(item.seQesitm);
  const companyName = normalizeText(item.entpName);
  const category = inferCategory(efficacy);
  const dosage = inferDosage(name);
  const slug = makeSlug(name, item.itemSeq);
  const summary = buildSummary(efficacy);

  return {
    id: String(item.itemSeq),
    slug,
    name,
    category,
    dosage,
    ingredient: null,
    summary,
    efficacy,
    usage,
    cautions,
    side_effects: sideEffects,
    storage: normalizeText(item.depositMethodQesitm) ?? "보관 정보가 제공되지 않았습니다.",
    company_name: companyName,
    image_url: normalizeText(item.itemImage),
    source_provider: "data_go_kr",
    source_dataset: "DrbEasyDrugInfoService",
    source_item_id: String(item.itemSeq),
    open_de: normalizeText(item.openDe),
    source_updated_at: normalizeText(item.updateDe),
    is_active: true,
    search_text: buildSearchText({
      name,
      category,
      dosage,
      summary,
      efficacy,
      companyName,
      usage,
      cautions,
      sideEffects,
    }),
  };
}

async function enrichIngredients() {
  if (!PUBLIC_DATA_INGREDIENT_API_SERVICE_KEY || !PUBLIC_DATA_INGREDIENT_API_URL) {
    console.log("주성분 API 환경변수가 없어 주성분 보강 단계를 건너뜁니다.");
    return 0;
  }

  let pageNo = 1;
  let updatedCount = 0;
  let totalCount = Number.POSITIVE_INFINITY;

  while (updatedCount < totalCount) {
    if (MAX_PAGES > 0 && pageNo > MAX_PAGES) {
      break;
    }

    const payload = await fetchIngredientPage(pageNo, PAGE_SIZE);
    const body = payload?.body;
    const items = Array.isArray(body?.items) ? body.items : [];

    if (pageNo === 1) {
      totalCount = Number(body?.totalCount ?? 0);
      console.log(`주성분 API 총 ${totalCount}건 확인`);
    }

    if (items.length === 0) {
      break;
    }

    const rows = items
      .map(mapIngredientRow)
      .filter((item) => item && item.id && item.ingredient);

    if (rows.length === 0) {
      pageNo += 1;
      continue;
    }

    for (const row of rows) {
      const { error } = await supabase
        .from("medications")
        .update({ ingredient: row.ingredient })
        .eq("id", row.id);

      if (error) {
        throw error;
      }
    }

    updatedCount += rows.length;
    console.log(
      `ingredient page=${pageNo}: ${rows.length}건 upsert 완료 (누적 ${updatedCount}건)`,
    );
    pageNo += 1;
  }

  return updatedCount;
}

async function fetchIngredientPage(pageNo, numOfRows) {
  const url = new URL(`${PUBLIC_DATA_INGREDIENT_API_URL}${INGREDIENT_API_PATH}`);
  url.searchParams.set("serviceKey", PUBLIC_DATA_INGREDIENT_API_SERVICE_KEY);
  url.searchParams.set("pageNo", String(pageNo));
  url.searchParams.set("numOfRows", String(numOfRows));
  url.searchParams.set("type", "json");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`주성분 API 호출 실패: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const resultCode = payload?.header?.resultCode;

  if (resultCode && resultCode !== "00") {
    throw new Error(
      `주성분 API 오류: ${resultCode} ${payload?.header?.resultMsg ?? "알 수 없는 오류"}`,
    );
  }

  return payload;
}

function mapIngredientRow(item) {
  const id = normalizeText(item.ITEM_SEQ);
  const ingredientName = normalizeText(item.ITEM_INGR_NAME);
  const ingredientCount = normalizeText(item.ITEM_INGR_CNT);

  if (!id || !ingredientName) {
    return null;
  }

  return {
    id,
    ingredient:
      ingredientCount && ingredientCount !== "1"
        ? `${ingredientName} 외 ${ingredientCount}성분`
        : ingredientName,
  };
}

function dedupeRowsById(rows) {
  const deduped = new Map();

  for (const row of rows) {
    deduped.set(row.id, row);
  }

  return [...deduped.values()];
}

function buildSummary(efficacy) {
  const sentence = efficacy.split(/(?<=[.!?다])\s+/u)[0]?.trim();

  if (!sentence) {
    return "효과 요약 정보가 제공되지 않았습니다.";
  }

  return sentence;
}

function buildSearchText({
  name,
  category,
  dosage,
  summary,
  efficacy,
  companyName,
  usage,
  cautions,
  sideEffects,
}) {
  return [
    name,
    category,
    dosage,
    summary,
    efficacy,
    companyName,
    ...usage,
    ...cautions,
    ...sideEffects,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function splitParagraphs(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\n{2,}|\.\s+/u)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeText(value) {
  if (typeof value !== "string") {
    return null;
  }

  const text = value
    .replace(/<[^>]+>/g, " ")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n /g, "\n")
    .trim();

  return text.length > 0 ? text : null;
}

function inferCategory(efficacy) {
  const rules = [
    { keyword: /(비염|두드러기|재채기|가려움)/u, value: "항히스타민제" },
    { keyword: /(발열|두통|치통|생리통|근육통|통증)/u, value: "해열진통제" },
    { keyword: /(기침|콧물|코막힘|감기)/u, value: "종합감기약" },
    { keyword: /(소화불량|체함|속쓰림|구토|구역|위산과다)/u, value: "소화제" },
    { keyword: /(티눈|굳은살|사마귀)/u, value: "외용제" },
  ];

  const matched = rules.find((rule) => rule.keyword.test(efficacy));
  return matched?.value ?? null;
}

function inferDosage(name) {
  const matched = name.match(/(\d+(?:\.\d+)?\s?(?:mg|mL|g|정|포|캡슐))/iu);
  return matched?.[1] ?? null;
}

function makeSlug(name, itemSeq) {
  const base = name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return `${base || "medication"}-${itemSeq}`;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

main().catch((error) => {
  console.error("의약품 적재 스크립트 실패", error);
  process.exitCode = 1;
});

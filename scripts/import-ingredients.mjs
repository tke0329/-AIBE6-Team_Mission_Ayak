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
const PUBLIC_DATA_INGREDIENT_API_SERVICE_KEY =
  process.env.PUBLIC_DATA_INGREDIENT_API_SERVICE_KEY;
const PUBLIC_DATA_INGREDIENT_API_URL = process.env.PUBLIC_DATA_INGREDIENT_API_URL;
const PAGE_SIZE = parsePositiveInt(process.env.PUBLIC_DATA_API_PAGE_SIZE, 100);
const MAX_PAGES = parsePositiveInt(process.env.PUBLIC_DATA_API_MAX_PAGES, 0);
const INGREDIENT_API_PATH = "/getDrugPrdtPrmsnInq07";

if (!SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL 환경변수가 필요합니다.");
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.");
}

if (!PUBLIC_DATA_INGREDIENT_API_SERVICE_KEY) {
  throw new Error("PUBLIC_DATA_INGREDIENT_API_SERVICE_KEY 환경변수가 필요합니다.");
}

if (!PUBLIC_DATA_INGREDIENT_API_URL) {
  throw new Error("PUBLIC_DATA_INGREDIENT_API_URL 환경변수가 필요합니다.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
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
      console.log(`ingredient page=${pageNo}: 수집 결과가 없어 종료합니다.`);
      break;
    }

    const rows = items
      .map(mapIngredientRow)
      .filter((item) => item && item.id && item.ingredient);

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
      `ingredient page=${pageNo}: ${rows.length}건 update 완료 (누적 ${updatedCount}건)`,
    );
    pageNo += 1;
  }

  console.log(`주성분 전용 보강 완료: 총 ${updatedCount}건 업데이트`);
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

function normalizeText(value) {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.replace(/\r/g, "").replace(/\s+/g, " ").trim();
  return text.length > 0 ? text : null;
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
  console.error("주성분 전용 보강 스크립트 실패", error);
  process.exitCode = 1;
});

import { SearchPage } from "@/components/search-page";
import { searchMedications } from "@/lib/medications-db";

type SearchParams = Promise<{ q?: string; tag?: string; page?: string }>;

export default async function Page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const query = searchParams.q ?? "";
  const tag = searchParams.tag ?? "전체";
  const page = Number.parseInt(searchParams.page ?? "1", 10);
  const result = await searchMedications({
    query,
    tag,
    page: Number.isFinite(page) ? page : 1,
    pageSize: 20,
  });

  return (
    <SearchPage
      key={`${query}:${tag}:${result.currentPage}`}
      initialQuery={query}
      currentTag={tag}
      currentPage={result.currentPage}
      pageSize={result.pageSize}
      totalCount={result.totalCount}
      medications={result.medications}
    />
  );
}

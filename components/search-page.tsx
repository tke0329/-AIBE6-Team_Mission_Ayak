"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, MouseEvent, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import {
  FilterIcon,
  PageButtonActionButton,
} from "@/components/page-action-button";
import { Medication } from "@/components/types";
import { useAuthUser } from "@/lib/auth";
import { splitMedicationName } from "@/lib/medication-name";
import { useUserMedications } from "@/lib/user-medications";

type SearchPageProps = {
  initialQuery: string;
  currentTag: string;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  medications: Medication[];
};

const filterTags = ["전체", "두통", "감기", "발열", "알레르기", "기침", "콧물"];

export function SearchPage({
  initialQuery,
  currentTag,
  currentPage,
  pageSize,
  totalCount,
  medications,
}: SearchPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthUser();
  const [query, setQuery] = useState(initialQuery);
  const [selectedTag, setSelectedTag] = useState(currentTag);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pendingMedicationId, setPendingMedicationId] = useState<string | null>(
    null,
  );
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const visiblePageNumbers = useMemo(() => {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    return Array.from(
      { length: end - adjustedStart + 1 },
      (_, index) => adjustedStart + index,
    );
  }, [currentPage, totalPages]);
  const { medicationIds, addMedication, removeMedication, loading, error } =
    useUserMedications(user?.id);
  const authPending = user === undefined;
  async function handleMedicationToggle(
    event: MouseEvent<HTMLButtonElement>,
    medicationId: string,
  ) {
    event.preventDefault();
    event.stopPropagation();

    setPendingMedicationId(medicationId);
    if (medicationIds.includes(medicationId)) {
      await removeMedication(medicationId);
    } else {
      await addMedication(medicationId);
    }
    setPendingMedicationId(null);
  }

  function buildSearchUrl(next: {
    query?: string;
    tag?: string;
    page?: number;
  }) {
    const params = new URLSearchParams();
    const nextQuery = next.query ?? query;
    const nextTag = next.tag ?? selectedTag;
    const nextPage = next.page ?? currentPage;

    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    }

    if (nextTag && nextTag !== "전체") {
      params.set("tag", nextTag);
    }

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextUrl = buildSearchUrl({ query, tag: "전체", page: 1 });
    setSelectedTag("전체");
    router.push(nextUrl);
  }

  function handleTagChange(tag: string) {
    setSelectedTag(tag);
    router.push(buildSearchUrl({ tag, page: 1 }));
  }

  function handlePageChange(page: number) {
    router.push(buildSearchUrl({ page }));
  }

  return (
    <AppShell>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="rounded-[28px] border border-white/60 bg-white/88 p-8 shadow-[0_20px_60px_rgba(0,80,203,0.12)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <h1 className="font-display text-3xl font-bold text-[var(--color-on-surface)] md:text-4xl">
              의약품 검색
            </h1>
            <PageButtonActionButton
              onClick={() => setFiltersOpen((current) => !current)}
              icon={<FilterIcon />}
              label="필터"
            />
          </div>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--color-on-surface-variant)]">
            약 이름을 입력하거나 태그 필터를 눌러 원하는 효과 중심으로 의약품을
            빠르게 좁혀볼 수 있습니다.
          </p>
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 flex flex-col gap-3 md:flex-row"
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="예: 타이레놀, 판콜, 지르텍"
              className="h-14 flex-1 rounded-2xl border border-[var(--color-outline-variant)]/60 bg-[var(--color-surface)] px-5 text-base outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/15"
            />
            <button
              type="submit"
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-6 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,80,203,0.24)] transition hover:bg-[var(--color-primary-container)]"
            >
              검색
            </button>
          </form>
          <div className="mt-4">
            {filtersOpen ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {filterTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagChange(tag)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selectedTag === tag
                        ? "bg-[var(--color-primary)] text-white shadow-[0_10px_25px_rgba(0,80,203,0.18)]"
                        : "bg-[var(--color-surface-container)] text-[var(--color-on-surface)] hover:bg-[var(--color-primary-fixed)]"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            ) : null}
            {query.trim() ? (
              <p className="mt-3 text-xs leading-5 text-[var(--color-on-surface-variant)]">
                검색어로 조회하면 태그 필터는 자동으로{" "}
                <span className="font-semibold text-[var(--color-primary)]">
                  #전체
                </span>
                로 초기화됩니다.
              </p>
            ) : null}
          </div>
        </div>

        {medications.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[var(--color-outline)] bg-white/75 p-12 text-center text-[var(--color-on-surface-variant)]">
            검색 결과가 없습니다. 다른 약 이름으로 다시 검색해 주세요.
          </div>
        ) : (
          <>
            {error ? (
              <div className="rounded-[28px] bg-[var(--color-error-container)] px-5 py-4 text-sm text-[var(--color-on-error-container)]">
                {error}
              </div>
            ) : null}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {medications.map((item) => {
                const displayName = splitMedicationName(item.name);

                return (
                  <article
                    key={item.id}
                    className="flex h-full flex-col rounded-[28px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(0,80,203,0.1)]"
                  >
                    <div className="flex min-h-[7.25rem] items-start justify-between gap-4 border-b border-[var(--color-outline-variant)]/40 pb-4">
                      <div className="min-w-0 flex-1">
                        <h2 className="font-display text-2xl font-bold leading-tight text-[var(--color-on-surface)] break-words [overflow-wrap:anywhere]">
                          {displayName.primaryName}
                        </h2>
                        {displayName.secondaryName ? (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-on-surface-variant)]">
                            {displayName.secondaryName}
                          </p>
                        ) : null}
                        <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                          {item.category} · {item.dosage}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-1 flex-col gap-3">
                      <section className="rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-4">
                        <div className="text-xs font-semibold text-[var(--color-primary)]">
                          효과 요약
                        </div>
                        <p className="mt-2 overflow-hidden text-sm leading-6 text-[var(--color-on-surface-variant)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                          {item.summary}
                        </p>
                      </section>
                      <section className="rounded-2xl border border-[var(--color-outline-variant)]/35 bg-white px-4 py-4">
                        <div className="text-xs font-semibold text-[var(--color-primary)]">
                          성분
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)] break-words [overflow-wrap:anywhere]">
                          {item.ingredient}
                        </p>
                      </section>
                    </div>
                    <div className="mt-6 flex flex-col gap-3">
                      {authPending ? (
                        <div className="inline-flex w-full items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-on-surface-variant)]">
                          로그인 상태 확인 중...
                        </div>
                      ) : Boolean(user) ? (
                        <button
                          type="button"
                          onClick={(event) =>
                            void handleMedicationToggle(event, item.id)
                          }
                          disabled={loading || pendingMedicationId === item.id}
                          className={`relative z-10 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                            medicationIds.includes(item.id)
                              ? "border border-[var(--color-outline-variant)] bg-white text-[var(--color-primary)]"
                              : "bg-[var(--color-primary)] text-white shadow-[0_12px_30px_rgba(0,80,203,0.24)] hover:bg-[var(--color-primary-container)]"
                          }`}
                        >
                          {loading
                            ? "내 복용약 불러오는 중..."
                            : pendingMedicationId === item.id
                              ? "처리 중..."
                              : medicationIds.includes(item.id)
                                ? "내 복용약에서 제거"
                                : "내 복용약에 등록"}
                        </button>
                      ) : (
                        <Link
                          href="/member/login"
                          className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,80,203,0.24)] transition hover:bg-[var(--color-primary-container)]"
                        >
                          로그인 후 등록
                        </Link>
                      )}
                      <Link
                        href={`/medicines/${item.id}`}
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,80,203,0.24)] transition hover:bg-[var(--color-primary-container)]"
                      >
                        상세 정보 보기
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-on-surface)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                이전
              </button>
              {visiblePageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    pageNumber === currentPage
                      ? "bg-[var(--color-primary)] text-white shadow-[0_10px_25px_rgba(0,80,203,0.18)]"
                      : "border border-[var(--color-outline-variant)] bg-white text-[var(--color-on-surface)]"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-on-surface)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                다음
              </button>
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
}

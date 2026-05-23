"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { useAuthUser } from "@/lib/auth";
import { hasHealthProfile } from "@/lib/health-profile";
import { extractMedicationGuidance } from "@/lib/medication-guidance";
import { splitMedicationName } from "@/lib/medication-name";
import {
  extractSideEffectKeywords,
  getGenericSideEffectNotice,
  getSideEffectGuidance,
} from "@/lib/side-effects";
import { useHealthProfile } from "@/lib/use-health-profile";
import { useUserMedications } from "@/lib/user-medications";
import { useSavedMedications } from "@/lib/use-saved-medications";

const INITIAL_VISIBLE_COUNT = 4;

export function MyMedicationsPage() {
  const router = useRouter();
  const user = useAuthUser();
  const [showAllGuidance, setShowAllGuidance] = useState(false);
  const [showAllSideEffects, setShowAllSideEffects] = useState(false);
  const { medicationIds, removeMedication, clearMedications, loading, error } =
    useUserMedications(user?.id);
  const { profile } = useHealthProfile(user?.id);
  const {
    medications: items,
    loading: medicationsLoading,
    error: medicationsError,
  } = useSavedMedications(medicationIds);

  useEffect(() => {
    if (user === null) {
      router.replace("/member/login");
    }
  }, [router, user]);

  async function handleClearMedications() {
    const confirmed = window.confirm("전체 복용약을 삭제하시겠습니까?");

    if (!confirmed) {
      return;
    }

    await clearMedications();
  }

  const sideEffectGroups = useMemo(() => {
    const grouped = new Map<
      string,
      { keyword: string; medicationNames: string[]; guidance: string }
    >();

    for (const item of items) {
      const medicationName = splitMedicationName(item.name).primaryName;
      const sideEffects = extractSideEffectKeywords(item.sideEffects);

      for (const sideEffect of sideEffects) {
        const existing = grouped.get(sideEffect);

        if (existing) {
          if (!existing.medicationNames.includes(medicationName)) {
            existing.medicationNames.push(medicationName);
          }
          continue;
        }

        grouped.set(sideEffect, {
          keyword: sideEffect,
          medicationNames: [medicationName],
          guidance: getSideEffectGuidance(sideEffect),
        });
      }
    }

    return [...grouped.values()].sort((a, b) => {
      if (b.medicationNames.length !== a.medicationNames.length) {
        return b.medicationNames.length - a.medicationNames.length;
      }

      return a.keyword.localeCompare(b.keyword, "ko");
    });
  }, [items]);
  const hasProfile = hasHealthProfile(profile);
  const integratedGuidance = useMemo(
    () => extractMedicationGuidance(items, profile),
    [items, profile],
  );
  const visibleGuidance = showAllGuidance
    ? integratedGuidance
    : integratedGuidance.slice(0, INITIAL_VISIBLE_COUNT);
  const visibleSideEffectGroups = showAllSideEffects
    ? sideEffectGroups
    : sideEffectGroups.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMoreGuidance = integratedGuidance.length > INITIAL_VISIBLE_COUNT;
  const hasMoreSideEffects = sideEffectGroups.length > INITIAL_VISIBLE_COUNT;

  if (user === undefined) {
    return (
      <AppShell>
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <div className="rounded-[28px] border border-white/60 bg-white/92 p-12 text-center text-[var(--color-on-surface-variant)] shadow-[0_20px_60px_rgba(0,80,203,0.1)]">
            로그인 상태를 확인하고 있습니다.
          </div>
        </section>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <div className="rounded-[28px] border border-white/60 bg-white/92 p-12 text-center text-[var(--color-on-surface-variant)] shadow-[0_20px_60px_rgba(0,80,203,0.1)]">
            로그인 페이지로 이동하고 있습니다.
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-[28px] border border-white/60 bg-white/92 p-8 shadow-[0_20px_60px_rgba(0,80,203,0.12)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-[var(--color-on-surface)] md:text-4xl">
                내 복용약
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--color-on-surface-variant)]">
                등록한 약품의 효과 요약과 주성분을 먼저 확인하고, 부작용은
                아래에서 한 번에 모아볼 수 있습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleClearMedications()}
              disabled={loading || medicationsLoading || items.length === 0}
              className="inline-flex items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-error)] transition hover:bg-[var(--color-error-container)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              전체 삭제
            </button>
          </div>
        </div>

        {error || medicationsError ? (
          <div className="rounded-[28px] bg-[var(--color-error-container)] px-5 py-4 text-sm text-[var(--color-on-error-container)]">
            {error || medicationsError}
          </div>
        ) : null}

        {loading || medicationsLoading ? (
          <div className="rounded-[28px] border border-white/60 bg-white/92 p-12 text-center text-[var(--color-on-surface-variant)]">
            복용약 목록을 불러오는 중입니다.
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[var(--color-outline)] bg-white/78 p-12 text-center">
            <p className="text-base text-[var(--color-on-surface-variant)]">
              아직 등록된 복용약이 없습니다.
            </p>
            <Link
              href="/search"
              className="mt-5 inline-flex rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,80,203,0.24)]"
            >
              의약품 검색하러 가기
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-[28px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(0,80,203,0.1)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-[var(--color-on-surface)]">
                    통합 복용 주의
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">
                    등록한 약 전체를 기준으로 식전·식후 복용, 운전 주의, 병용
                    주의 같은 생활형 안내를 한 번에 모아봅니다.
                  </p>
                  {hasProfile ? (
                    <p className="mt-2 text-xs leading-5 text-[var(--color-primary)]">
                      입력한 건강정보와 맞닿은 주의 항목은 먼저 확인할 수 있도록
                      상단으로 올려 보여줍니다.
                    </p>
                  ) : null}
                </div>
                <div className="rounded-full bg-[var(--color-primary-fixed)] px-4 py-2 text-xs font-semibold text-[var(--color-primary)]">
                  총 {integratedGuidance.length}개 안내
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {visibleGuidance.map((guide) => (
                  <article
                    key={guide.key}
                    className="rounded-[24px] border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-low)] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <div className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-[var(--color-primary)]">
                          {guide.title}
                        </div>
                        {guide.profileMatches.length > 0 ? (
                          <div className="rounded-full bg-[var(--color-primary-fixed)] px-3 py-2 text-xs font-semibold text-[var(--color-primary)]">
                            건강정보 우선
                          </div>
                        ) : null}
                      </div>
                      <div className="text-xs font-semibold text-[var(--color-on-surface-variant)]">
                        관련 약 {guide.medicationNames.length}개
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[var(--color-on-surface)]">
                      {guide.message}
                    </p>
                    {guide.profileMatches.length > 0 ? (
                      <p className="mt-3 text-xs leading-5 text-[var(--color-on-surface-variant)]">
                        우선 반영된 건강정보: {guide.profileMatches.join(", ")}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {guide.medicationNames.map((name) => (
                        <span
                          key={`${guide.key}-${name}`}
                          className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[var(--color-on-surface-variant)]"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
                {integratedGuidance.length === 0 ? (
                  <div className="rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3 text-sm text-[var(--color-on-surface-variant)]">
                    현재 등록한 복용약에서는 별도로 묶어 보여줄 통합 복용 주의가
                    없습니다.
                  </div>
                ) : null}
              </div>
              {hasMoreGuidance ? (
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAllGuidance((current) => !current)}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--color-outline-variant)] bg-white px-12 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-surface-container-low)]"
                  >
                    {showAllGuidance
                      ? "통합 복용 주의 접기"
                      : `${integratedGuidance.length - INITIAL_VISIBLE_COUNT}개 더보기`}
                  </button>
                </div>
              ) : null}
            </section>

            <div className="grid gap-5">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[28px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(0,80,203,0.1)]"
                >
                  {(() => {
                    const displayName = splitMedicationName(item.name);

                    return (
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="xl:w-[16rem] xl:shrink-0">
                          <h2 className="font-display text-2xl font-bold leading-tight text-[var(--color-on-surface)] break-words [overflow-wrap:anywhere]">
                            {displayName.primaryName}
                          </h2>
                          {displayName.secondaryName ? (
                            <p className="mt-1 text-xs leading-5 text-[var(--color-on-surface-variant)]">
                              {displayName.secondaryName}
                            </p>
                          ) : null}
                          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                            {item.category} · {item.dosage}
                          </p>
                        </div>

                        <div className="grid flex-1 gap-4 md:grid-cols-2">
                          <section className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                            <div className="text-xs font-semibold text-[var(--color-primary)]">
                              효과 요약
                            </div>
                            <p className="mt-2 overflow-hidden text-sm leading-6 text-[var(--color-on-surface-variant)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                              {item.summary}
                            </p>
                          </section>

                          <section className="rounded-2xl border border-[var(--color-outline-variant)]/40 bg-white p-4">
                            <div className="text-xs font-semibold text-[var(--color-primary)]">
                              주성분
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)] break-words [overflow-wrap:anywhere]">
                              {item.ingredient}
                            </p>
                          </section>
                        </div>

                        <div className="flex flex-row gap-3 xl:w-[10rem] xl:flex-col xl:items-stretch">
                          <button
                            type="button"
                            onClick={() => void removeMedication(item.id)}
                            className="rounded-full border border-[var(--color-outline-variant)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)] xl:rounded-2xl"
                          >
                            삭제
                          </button>
                          <Link
                            href={`/medicines/${item.id}`}
                            className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,80,203,0.24)] xl:rounded-2xl"
                          >
                            상세 보기
                          </Link>
                        </div>
                      </div>
                    );
                  })()}
                </article>
              ))}
            </div>

            <section className="rounded-[28px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(0,80,203,0.1)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-[var(--color-on-surface)]">
                    부작용 모아보기
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">
                    등록한 복용약에서 겹치는 부작용을 먼저 보고, 상황별 대응
                    가이드를 바로 확인할 수 있습니다.
                  </p>
                </div>
                <div className="rounded-full bg-[var(--color-error-container)] px-4 py-2 text-xs font-semibold text-[var(--color-on-error-container)]">
                  총 {sideEffectGroups.length}개 부작용
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {visibleSideEffectGroups.map((group) => (
                  <article
                    key={group.keyword}
                    className="rounded-[24px] border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-low)] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="rounded-full bg-[var(--color-error-container)] px-3 py-2 text-sm font-semibold text-[var(--color-on-error-container)]">
                        {group.keyword}
                      </div>
                      <div className="text-xs font-semibold text-[var(--color-on-surface-variant)]">
                        관련 약 {group.medicationNames.length}개
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[var(--color-on-surface)]">
                      {group.guidance}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {group.medicationNames.map((name) => (
                        <span
                          key={`${group.keyword}-${name}`}
                          className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[var(--color-on-surface-variant)]"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
                {sideEffectGroups.length === 0 ? (
                  <div className="rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3 text-sm text-[var(--color-on-surface-variant)]">
                    부작용 정보가 제공된 복용약이 아직 없습니다.
                  </div>
                ) : null}
              </div>
              {hasMoreSideEffects ? (
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAllSideEffects((current) => !current)}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--color-outline-variant)] bg-white px-12 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-surface-container-low)]"
                  >
                    {showAllSideEffects
                      ? "부작용 모아보기 접기"
                      : `${sideEffectGroups.length - INITIAL_VISIBLE_COUNT}개 더보기`}
                  </button>
                </div>
              ) : null}
              <div className="text-sm px-3 py-3 font-semibold font-medium text-[#b3261e]">
                {getGenericSideEffectNotice()}
              </div>
            </section>
          </div>
        )}
      </section>
    </AppShell>
  );
}

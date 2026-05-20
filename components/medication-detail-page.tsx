"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MouseEvent, useState } from "react";

import { AppShell } from "@/components/app-shell";
import {
  BackIcon,
  PageButtonActionButton,
} from "@/components/page-action-button";
import { Medication } from "@/components/types";
import { useAuthUser } from "@/lib/auth";
import { hasHealthProfile } from "@/lib/health-profile";
import { extractMedicationGuidance } from "@/lib/medication-guidance";
import { splitMedicationName } from "@/lib/medication-name";
import {
  extractSideEffectKeywords,
  getGenericSideEffectNotice,
} from "@/lib/side-effects";
import { useHealthProfile } from "@/lib/use-health-profile";
import { useUserMedications } from "@/lib/user-medications";

type MedicationDetailPageProps = {
  medication: Medication;
};

export function MedicationDetailPage({
  medication,
}: MedicationDetailPageProps) {
  const router = useRouter();
  const displayName = splitMedicationName(medication.name);
  const user = useAuthUser();
  const [pending, setPending] = useState(false);
  const { profile } = useHealthProfile(user?.id);
  const { medicationIds, addMedication, removeMedication, loading, error } =
    useUserMedications(user?.id);
  const saved = medicationIds.includes(medication.id);
  const loggedIn = Boolean(user);
  const authPending = user === undefined;
  const hasProfile = hasHealthProfile(profile);
  const showProfileGuidance = loggedIn && hasProfile;
  const sectionLinks = [
    { href: "#overview", label: "핵심 정보" },
    { href: "#efficacy", label: "효능" },
    { href: "#usage", label: "사용 방법" },
    { href: "#cautions", label: "주의사항" },
    { href: "#side-effects", label: "부작용" },
  ];
  if (showProfileGuidance) {
    sectionLinks.splice(1, 0, {
      href: "#profile-guidance",
      label: "사용자 맞춤 주의사항",
    });
  }
  const usageItems =
    medication.usage.length > 0
      ? medication.usage
      : ["사용 방법 정보가 제공되지 않았습니다."];
  const cautionItems =
    medication.cautions.length > 0
      ? medication.cautions
      : ["주의사항 정보가 제공되지 않았습니다."];
  const sideEffectItems =
    medication.sideEffects.length > 0
      ? medication.sideEffects
      : ["부작용 정보가 제공되지 않았습니다."];
  const sideEffectKeywords = extractSideEffectKeywords(sideEffectItems);
  const personalizedGuidance = extractMedicationGuidance([medication], profile);
  const highlightedGuidance = personalizedGuidance.filter(
    (guide) => guide.profileMatches.length > 0,
  );

  async function handleMedicationToggle(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    setPending(true);
    if (saved) {
      await removeMedication(medication.id);
    } else {
      await addMedication(medication.id);
    }
    setPending(false);
  }

  return (
    <AppShell>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-[28px] border border-white/60 bg-white/92 p-8 shadow-[0_20px_60px_rgba(0,80,203,0.12)]">
          <div className="mb-5 flex flex-wrap gap-2">
            <PageButtonActionButton
              onClick={() => router.back()}
              icon={<BackIcon />}
              label="뒤로가기"
            />
          </div>
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-[var(--color-surface-container)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                {medication.category}
              </div>
              <h1 className="font-display mt-4 text-3xl font-bold leading-tight text-[var(--color-on-surface)] [word-break:keep-all] md:text-4xl">
                {displayName.primaryName}
              </h1>
              {displayName.secondaryName ? (
                <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">
                  {displayName.secondaryName}
                </p>
              ) : null}
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--color-on-surface-variant)]">
                {medication.summary}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {authPending ? (
                <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-on-surface-variant)]">
                  로그인 상태 확인 중...
                </div>
              ) : loggedIn ? (
                <button
                  type="button"
                  onClick={(event) => void handleMedicationToggle(event)}
                  disabled={loading || pending}
                  className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                    saved
                      ? "border border-[var(--color-outline-variant)] bg-white text-[var(--color-primary)]"
                      : "bg-[var(--color-primary)] text-white shadow-[0_12px_30px_rgba(0,80,203,0.24)]"
                  }`}
                >
                  {loading
                    ? "내 복용약 불러오는 중..."
                    : pending
                      ? "처리 중..."
                      : saved
                        ? "내 복용약에서 제거"
                        : "내 복용약에 등록"}
                </button>
              ) : (
                <Link
                  href="/member/login"
                  className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,80,203,0.24)]"
                >
                  로그인 후 등록
                </Link>
              )}
            </div>
          </div>
          {error ? (
            <div className="mt-4 rounded-2xl bg-[var(--color-error-container)] px-4 py-3 text-sm text-[var(--color-on-error-container)]">
              {error}
            </div>
          ) : null}
          <div
            id="overview"
            className="mt-6 grid gap-3 rounded-[28px] bg-[var(--color-surface-container-low)] p-5 md:grid-cols-2 xl:grid-cols-4"
          >
            <article className="rounded-2xl bg-white/90 p-4">
              <div className="text-xs font-semibold text-[var(--color-primary)]">
                분류
              </div>
              <div className="mt-2 text-sm font-semibold text-[var(--color-on-surface)]">
                {medication.category}
              </div>
            </article>
            <article className="rounded-2xl bg-white/90 p-4">
              <div className="text-xs font-semibold text-[var(--color-primary)]">
                용량
              </div>
              <div className="mt-2 text-sm font-semibold text-[var(--color-on-surface)]">
                {medication.dosage}
              </div>
            </article>
            <article className="rounded-2xl bg-white/90 p-4">
              <div className="text-xs font-semibold text-[var(--color-primary)]">
                주성분
              </div>
              <div className="mt-2 text-sm font-semibold leading-6 text-[var(--color-on-surface)] break-words [overflow-wrap:anywhere]">
                {medication.ingredient}
              </div>
            </article>
            <article className="rounded-2xl bg-white/90 p-4">
              <div className="text-xs font-semibold text-[var(--color-primary)]">
                보관
              </div>
              <div className="mt-2 text-sm font-semibold leading-6 text-[var(--color-on-surface)]">
                {medication.storage}
              </div>
            </article>
          </div>
          {showProfileGuidance ? (
            <div
              id="profile-guidance"
              className="mt-5 rounded-[24px] border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-low)] p-5"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-on-surface)]">
                    이 약에서 먼저 볼 사용자 맞춤 주의
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-on-surface-variant)]">
                    입력한 건강정보와 관련이 있는 주의사항 항목을 먼저
                    보여줍니다.
                  </p>
                </div>
                <div className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[var(--color-primary)]">
                  맞춤 안내 {highlightedGuidance.length}개
                </div>
              </div>

              {highlightedGuidance.length > 0 ? (
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {highlightedGuidance.map((guide) => (
                    <article
                      key={guide.key}
                      className="rounded-2xl bg-white p-4"
                    >
                      <div className="flex flex-wrap gap-2">
                        <div className="rounded-full bg-[var(--color-primary-fixed)] px-3 py-2 text-sm font-semibold text-[var(--color-primary)]">
                          {guide.title}
                        </div>
                        <div className="rounded-full bg-[var(--color-surface-container-low)] px-3 py-2 text-xs font-semibold text-[var(--color-on-surface-variant)]">
                          {guide.profileMatches.join(", ")}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[var(--color-on-surface)]">
                        {guide.message}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-[var(--color-on-surface-variant)]">
                  현재 입력한 건강정보와 직접 맞닿아 우선 표시할 맞춤 주의는
                  없습니다. 아래 사용 방법과 주의사항을 함께 확인해 주세요.
                </div>
              )}
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2">
            {sectionLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full border border-[var(--color-outline-variant)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <article
            id="efficacy"
            className="rounded-[28px] border border-white/60 bg-white/92 p-7 shadow-[0_20px_60px_rgba(0,80,203,0.1)]"
          >
            <h2 className="font-display text-2xl font-bold text-[var(--color-on-surface)]">
              효능
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--color-on-surface-variant)]">
              {medication.efficacy}
            </p>
          </article>
          <article
            id="usage"
            className="rounded-[28px] border border-white/60 bg-white/92 p-7 shadow-[0_20px_60px_rgba(0,80,203,0.1)]"
          >
            <h2 className="font-display text-2xl font-bold text-[var(--color-on-surface)]">
              사용 방법
            </h2>
            <div className="mt-5 space-y-4">
              {usageItems.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex gap-4 rounded-2xl bg-[var(--color-surface-container-low)] p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[var(--color-primary)]">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-[var(--color-on-surface-variant)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
            <div
              id="cautions"
              className="mt-8 border-t border-[var(--color-outline-variant)]/40 pt-6"
            >
              <h3 className="text-lg font-bold text-[var(--color-on-surface)]">
                주요 주의사항
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">
                사용 방법을 확인한 뒤 아래 주의사항을 이어서 확인해 주세요.
              </p>
              <ol className="mt-5 space-y-3">
                {cautionItems.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[var(--color-primary)]">
                        {index + 1}
                      </div>
                      <p className="min-w-0 text-sm leading-6 text-[var(--color-on-surface-variant)]">
                        {item}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </article>
          <div className="rounded-2xl bg-[var(--color-error-container)] px-4 py-3 text-sm leading-6 text-[var(--color-on-error-container)]">
            공통 주의사항: {getGenericSideEffectNotice()}
          </div>
          <article
            id="side-effects"
            className="rounded-[28px] border border-white/60 bg-white/92 p-7 shadow-[0_20px_60px_rgba(0,80,203,0.1)]"
          >
            <h2 className="font-display text-2xl font-bold text-[var(--color-on-surface)]">
              부작용
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {sideEffectKeywords.length > 0 ? (
                sideEffectKeywords.map((item) => (
                  <div
                    key={item}
                    className="flex min-h-12 items-center rounded-2xl bg-[var(--color-error-container)] px-4 py-3 text-sm font-medium text-[var(--color-on-error-container)]"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3 text-sm text-[var(--color-on-surface-variant)]">
                  부작용 정보가 제공되지 않았습니다.
                </div>
              )}
            </div>
          </article>
        </div>
      </section>
    </AppShell>
  );
}

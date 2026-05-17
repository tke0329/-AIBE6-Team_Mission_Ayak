"use client";

import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Medication } from "@/components/types";
import { getUserDisplayName, useAuthUser } from "@/lib/auth";
import { splitMedicationName } from "@/lib/medication-name";
import { useUserMedications } from "@/lib/user-medications";
import { useSavedMedications } from "@/lib/use-saved-medications";

const featureCards = [
  {
    title: "효과 확인",
    description: "약이 어떤 증상 완화에 쓰이는지 요약과 효능 기준으로 빠르게 확인합니다.",
  },
  {
    title: "부작용 비교",
    description: "복용 중인 약의 부작용을 한곳에서 모아 보고 필요한 내용을 비교할 수 있습니다.",
  },
  {
    title: "내 복용약 관리",
    description: "자주 확인하는 약을 저장하고 내 복용약 페이지에서 다시 꺼내 볼 수 있습니다.",
  },
];

type HomePageProps = {
  medications: Medication[];
};

export function HomePage({ medications }: HomePageProps) {
  const user = useAuthUser();
  const { medicationIds, loading } = useUserMedications(user?.id);
  const { medications: savedMedications } = useSavedMedications(medicationIds);
  const recentMedications = savedMedications.slice(0, 2);
  const featuredMedications = medications.slice(0, 3);

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/60 bg-white/88 p-8 shadow-[0_20px_60px_rgba(0,80,203,0.12)] backdrop-blur">
          <div className="inline-flex rounded-full bg-[var(--color-primary-fixed)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
            생활형 의약품 안내 서비스
          </div>
          <h1 className="font-display mt-5 max-w-2xl text-4xl font-bold leading-tight text-[var(--color-on-surface)] md:text-5xl">
            약의 효과와 복용 정보를
            <br />
            더 쉽고 빠르게 확인하는 홈
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-on-surface-variant)] md:text-lg">
            AYAK은 의약품의 효과, 효능, 복용 시 참고할 정보를 카드 형태로 정리하고 내 복용약까지
            이어서 관리할 수 있게 구성한 시작 화면입니다.
          </p>

          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <Link
              href="/search"
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-6 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,80,203,0.24)] transition hover:bg-[var(--color-primary-container)]"
            >
              의약품 검색하기
            </Link>
            <Link
              href={user ? "/my-medications" : "/member/login?next=/my-medications"}
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-white px-6 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-surface-container-low)]"
            >
              내 복용약 보기
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {featureCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[24px] border border-[var(--color-outline-variant)]/35 bg-[var(--color-surface)] p-5"
              >
                <div className="text-sm font-semibold text-[var(--color-primary)]">{card.title}</div>
                <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <article className="rounded-[28px] bg-[linear-gradient(145deg,#0050cb,#0b7cff)] p-7 text-white shadow-[0_20px_60px_rgba(0,80,203,0.28)]">
            <div className="text-sm font-semibold text-white/75">
              {user ? `${getUserDisplayName(user)}님의 복용약 요약` : "AYAK 시작 가이드"}
            </div>
            <div className="mt-3 text-2xl font-bold">
              {user
                ? `${savedMedications.length}개의 복용약이 저장되어 있습니다`
                : "검색부터 저장까지 한 번에 이어집니다"}
            </div>
            <p className="mt-3 text-sm leading-6 text-white/80">
              {user
                ? loading
                  ? "저장한 약 목록을 불러오는 중입니다."
                  : recentMedications.length > 0
                    ? `${recentMedications.map((item) => item.name).join(", ")}을(를) 바로 다시 확인할 수 있습니다.`
                    : "아직 저장된 복용약이 없습니다. 검색 후 필요한 약을 내 복용약에 담아 보세요."
                : "의약품 검색으로 효과를 확인하고, 로그인 후 내 복용약에 저장해 다시 모아볼 수 있습니다."}
            </p>
            <Link
              href={user ? "/my-medications" : "/member/login"}
              className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[var(--color-primary)]"
            >
              {user ? "내 복용약 열기" : "로그인하고 시작하기"}
            </Link>
          </article>

          <article className="rounded-[28px] border border-white/60 bg-white/88 p-6 shadow-[0_20px_60px_rgba(0,80,203,0.12)] backdrop-blur">
            <div className="text-sm font-semibold text-[var(--color-primary)]">추천 의약품</div>
            <div className="mt-4 space-y-3">
              {featuredMedications.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[var(--color-outline-variant)]/35 bg-[var(--color-surface-container-low)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-lg font-bold leading-tight text-[var(--color-on-surface)] [word-break:keep-all]">
                        {splitMedicationName(item.name).primaryName}
                      </div>
                      {splitMedicationName(item.name).secondaryName ? (
                        <div className="mt-1 text-xs leading-5 text-[var(--color-on-surface-variant)]">
                          {splitMedicationName(item.name).secondaryName}
                        </div>
                      ) : null}
                      <div className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{item.summary}</div>
                    </div>
                    <Link
                      href={`/medicines/${item.id}`}
                      className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--color-primary)]"
                    >
                      보기
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </AppShell>
  );
}

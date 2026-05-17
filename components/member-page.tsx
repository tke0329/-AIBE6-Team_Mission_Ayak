"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getUserDisplayName, useAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { useUserMedications } from "@/lib/user-medications";
import { useSavedMedications } from "@/lib/use-saved-medications";

export function MemberPage() {
  const router = useRouter();
  const user = useAuthUser();
  const { medicationIds } = useUserMedications(user?.id);
  const { medications } = useSavedMedications(medicationIds);
  const resolvedMedicationCount = medications.length;

  useEffect(() => {
    if (user === null) {
      router.replace("/member/login");
    }
  }, [router, user]);

  if (user === undefined) {
    return (
      <AppShell>
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
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
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="rounded-[28px] border border-white/60 bg-white/92 p-12 text-center text-[var(--color-on-surface-variant)] shadow-[0_20px_60px_rgba(0,80,203,0.1)]">
            로그인 페이지로 이동하고 있습니다.
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="rounded-[28px] bg-[linear-gradient(145deg,#0050cb,#0b7cff)] p-8 text-white shadow-[0_20px_60px_rgba(0,80,203,0.28)]">
          <div className="text-sm font-semibold text-white/75">마이페이지</div>
          <h1 className="font-display mt-3 text-3xl font-bold">{getUserDisplayName(user)}</h1>
          <p className="mt-2 text-sm text-white/80">{user.email}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <article className="rounded-[28px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(0,80,203,0.1)]">
            <div className="text-sm font-semibold text-[var(--color-primary)]">기본 정보</div>
            <div className="mt-4 space-y-4 text-sm text-[var(--color-on-surface)]">
              <div>
                <div className="text-[var(--color-on-surface-variant)]">이름</div>
                <div className="mt-1 font-semibold">{getUserDisplayName(user)}</div>
              </div>
              <div>
                <div className="text-[var(--color-on-surface-variant)]">이메일</div>
                <div className="mt-1 font-semibold">{user.email}</div>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(0,80,203,0.1)]">
            <div className="text-sm font-semibold text-[var(--color-primary)]">복용약 현황</div>
            <div className="mt-4 text-4xl font-bold text-[var(--color-on-surface)]">{resolvedMedicationCount}</div>
            <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">
              현재 화면에서 확인 가능한 내 복용약 개수입니다.
            </p>
            <Link
              href="/my-medications"
              className="mt-5 inline-flex rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,80,203,0.24)]"
            >
              내 복용약 보기
            </Link>
          </article>
        </div>

        <button
          type="button"
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/member/login");
            router.refresh();
          }}
          className="w-full rounded-[28px] border border-[var(--color-outline-variant)] bg-white px-6 py-4 text-sm font-semibold text-[var(--color-primary)] shadow-[0_20px_60px_rgba(0,80,203,0.08)]"
        >
          로그아웃
        </button>
      </section>
    </AppShell>
  );
}

"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { getKoreanSignUpErrorMessage } from "@/lib/supabase/auth-error";
import { AyakBrandLogo } from "@/components/ayak-brand-logo";
import { HomeIcon, PageLinkActionButton } from "@/components/page-action-button";

export function JoinPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setError("");
    setPending(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (signUpError) {
      setError(getKoreanSignUpErrorMessage(signUpError.message));
      setPending(false);
      return;
    }

    router.push("/member/login?joined=1");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#dce9ff_0%,#f8f9ff_36%,#f8f9ff_100%)] px-4 py-10">
      <section className="w-full max-w-md rounded-[32px] border border-white/60 bg-white/94 p-8 shadow-[0_30px_80px_rgba(0,80,203,0.14)]">
        <div className="mb-8 text-center">
          <div className="flex justify-start">
            <PageLinkActionButton href="/" icon={<HomeIcon />} label="홈으로" />
          </div>
          <div className="mx-auto mt-4 flex w-fit items-center justify-center rounded-3xl bg-white/80 p-3 shadow-[0_16px_40px_rgba(0,80,203,0.12)]">
            <AyakBrandLogo size={84} />
          </div>
          <h1 className="font-display text-3xl font-bold text-[var(--color-primary)]">AYAK 회원가입</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="displayName" className="mb-2 block text-sm font-semibold text-[var(--color-on-surface)]">
              이름
            </label>
            <input
              id="displayName"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-4 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/15"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[var(--color-on-surface)]">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-4 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/15"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[var(--color-on-surface)]">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-4 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/15"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-[var(--color-on-surface)]">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-4 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/15"
              required
            />
          </div>
          {error ? (
            <div className="rounded-2xl bg-[var(--color-error-container)] px-4 py-3 text-sm text-[var(--color-on-error-container)]">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,80,203,0.24)] transition hover:bg-[var(--color-primary-container)]"
          >
            {pending ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <div className="mt-6 border-t border-[var(--color-outline-variant)]/40 pt-6 text-center text-sm text-[var(--color-on-surface-variant)]">
          이미 계정이 있다면{" "}
          <Link href="/member/login" className="font-semibold text-[var(--color-primary)]">
            로그인
          </Link>
        </div>
      </section>
    </main>
  );
}

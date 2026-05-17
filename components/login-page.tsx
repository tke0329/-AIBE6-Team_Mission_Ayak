"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type LoginPageProps = {
  nextPath?: string;
  joined?: boolean;
};

export function LoginPage({ nextPath = "/", joined = false }: LoginPageProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("로그인에 실패했습니다. 이메일과 비밀번호를 다시 확인해 주세요.");
      setPending(false);
      return;
    }

    router.push(nextPath);
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#dce9ff_0%,#f8f9ff_36%,#f8f9ff_100%)] px-4 py-10">
      <section className="w-full max-w-md rounded-[32px] border border-white/60 bg-white/94 p-8 shadow-[0_30px_80px_rgba(0,80,203,0.14)]">
        <div className="mb-8 text-center">
          <div className="flex justify-start">
            <Link href="/" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--color-primary)] shadow-[0_10px_25px_rgba(0,80,203,0.08)] transition hover:bg-[var(--color-surface-container-low)]">
              홈으로
            </Link>
          </div>
          <div className="mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-bold text-white shadow-[0_16px_40px_rgba(0,80,203,0.28)] md:h-20 md:w-20">
            AY
          </div>
          <h1 className="font-display mt-5 text-3xl font-bold text-[var(--color-primary)]">AYAK 로그인</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">
            회원가입한 이메일과 비밀번호로 로그인합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {joined ? (
            <div className="rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3 text-sm text-[var(--color-on-surface)]">
              회원가입이 완료되었습니다. 로그인해 주세요.
            </div>
          ) : null}
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
            {pending ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-6 border-t border-[var(--color-outline-variant)]/40 pt-6 text-center text-sm text-[var(--color-on-surface-variant)]">
          계정이 없다면{" "}
          <Link href="/member/join" className="font-semibold text-[var(--color-primary)]">
            회원가입
          </Link>
        </div>
      </section>
    </main>
  );
}

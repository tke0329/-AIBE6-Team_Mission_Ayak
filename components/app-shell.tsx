"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren } from "react";

import { getUserDisplayName, useAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { AyakBrandLogo } from "@/components/ayak-brand-logo";

const navigation = [
  { href: "/", label: "홈" },
  { href: "/search", label: "의약품 검색" },
  { href: "/my-medications", label: "내 복용약" },
  { href: "/member", label: "마이페이지" },
];

type AppShellProps = PropsWithChildren<{
  mainClassName?: string;
}>;

export function AppShell({ children, mainClassName }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthUser();

  const isAuthPage = pathname.startsWith("/member/login") || pathname.startsWith("/member/join");
  const isHomePage = pathname === "/";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div
      className={`flex flex-col bg-[radial-gradient(circle_at_top,#dce9ff_0%,#f8f9ff_32%,#f8f9ff_100%)] text-[var(--color-on-background)] ${
        isHomePage ? "h-dvh overflow-hidden" : "min-h-screen"
      }`}
    >
      <header className="sticky top-0 z-40 border-b border-[var(--color-outline-variant)]/60 bg-white/88 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="shrink-0 rounded-2xl bg-white/80 shadow-[0_12px_30px_rgba(0,80,203,0.12)]">
              <AyakBrandLogo />
            </div>
            <div>
              <div className="font-display text-xl font-bold text-[var(--color-primary)]">AYAK</div>
              <div className="text-xs text-[var(--color-on-surface-variant)]">생활형 의약품 안내 서비스</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {navigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-[var(--color-primary)] text-white shadow-[0_10px_25px_rgba(0,80,203,0.18)]"
                      : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            {user === undefined ? (
              <div className="rounded-full border border-[var(--color-outline-variant)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-on-surface-variant)]">
                인증 확인 중...
              </div>
            ) : user ? (
              <>
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-semibold text-[var(--color-on-surface)]">
                    {getUserDisplayName(user)}
                  </div>
                  <div className="text-xs text-[var(--color-on-surface-variant)]">{user.email}</div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    router.push("/member/login");
                    router.refresh();
                  }}
                  className="rounded-full border border-[var(--color-outline-variant)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-surface-container-low)]"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/member/login"
                className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(0,80,203,0.18)] transition hover:bg-[var(--color-primary-container)]"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>
      <main
        className={`mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 ${
          isHomePage ? "overflow-hidden py-5 md:py-6" : "py-8 md:py-10"
        } md:px-8 ${
          mainClassName ?? ""
        }`}
      >
        {children}
      </main>
      <footer className="shrink-0 border-t border-[var(--color-outline-variant)]/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-[var(--color-on-surface-variant)] md:px-8">
          제공되는 의약품 정보는 공공데이터 기반 참고용이며 의료 전문가의 진단을 대체하지 않습니다.
        </div>
      </footer>
    </div>
  );
}

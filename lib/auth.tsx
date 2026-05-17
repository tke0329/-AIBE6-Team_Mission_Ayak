"use client";

import { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

const AuthUserContext = createContext<User | null | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const isAuthPage = pathname.startsWith("/member/login") || pathname.startsWith("/member/join");

  useEffect(() => {
    if (isAuthPage) {
      return;
    }

    const supabase = createClient();
    let active = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) {
        return;
      }

      if (error) {
        setUser(null);
        return;
      }

      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [isAuthPage]);

  const contextUser = isAuthPage ? null : user;

  return <AuthUserContext.Provider value={contextUser}>{children}</AuthUserContext.Provider>;
}

export function useAuthUser() {
  return useContext(AuthUserContext);
}

export function getUserDisplayName(user: User | null) {
  if (!user) {
    return "";
  }

  const metadataName = user.user_metadata.display_name;
  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName;
  }

  return user.email?.split("@")[0] ?? "AYAK 사용자";
}

"use client";

import { useEffect, useState } from "react";

import {
  createEmptyHealthProfile,
  HealthProfile,
  sanitizeHealthProfile,
} from "@/lib/health-profile";

type HealthProfileState = {
  profile: HealthProfile;
  loading: boolean;
  error: string;
  saveProfile: (profile: HealthProfile) => void;
};

const STORAGE_PREFIX = "ayak-health-profile:";

function getStorageKey(userId?: string) {
  return `${STORAGE_PREFIX}${userId ?? "__anonymous__"}`;
}

export function useHealthProfile(userId?: string): HealthProfileState {
  const [profile, setProfile] = useState<HealthProfile>(createEmptyHealthProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) {
        return;
      }

      setLoading(true);

      if (!userId) {
        setProfile(createEmptyHealthProfile());
        setError("");
        setLoading(false);
        return;
      }

      try {
        const raw = window.localStorage.getItem(getStorageKey(userId));

        if (!raw) {
          setProfile(createEmptyHealthProfile());
        } else {
          const parsed = JSON.parse(raw) as Partial<HealthProfile>;
          setProfile(sanitizeHealthProfile(parsed));
        }

        setError("");
      } catch {
        setProfile(createEmptyHealthProfile());
        setError("건강정보를 불러오지 못했습니다. 다시 입력해 주세요.");
      } finally {
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [userId]);

  function saveProfile(nextProfile: HealthProfile) {
    if (!userId) {
      return;
    }

    const sanitizedProfile = sanitizeHealthProfile({
      ...nextProfile,
      updatedAt: new Date().toISOString(),
    });

    try {
      window.localStorage.setItem(
        getStorageKey(userId),
        JSON.stringify(sanitizedProfile),
      );
      setProfile(sanitizedProfile);
      setError("");
    } catch {
      setError("건강정보를 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.");
    }
  }

  return {
    profile,
    loading,
    error,
    saveProfile,
  };
}

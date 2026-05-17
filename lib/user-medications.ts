"use client";

import { PostgrestError } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type UserMedicationRow = {
  medication_id: string;
};

type UserMedicationsState = {
  medicationIds: string[];
  loading: boolean;
  error: string;
  addMedication: (medicationId: string) => Promise<void>;
  removeMedication: (medicationId: string) => Promise<void>;
  clearMedications: () => Promise<void>;
  refresh: () => Promise<void>;
};

type MedicationStoreEntry = {
  error: string;
  listeners: Set<() => void>;
  loading: boolean;
  medicationIds: string[];
};

const medicationStore = new Map<string, MedicationStoreEntry>();

function getStoreKey(userId?: string) {
  return userId ?? "__anonymous__";
}

function getStoreEntry(userId?: string): MedicationStoreEntry {
  const key = getStoreKey(userId);
  const existing = medicationStore.get(key);

  if (existing) {
    return existing;
  }

  const created: MedicationStoreEntry = {
    medicationIds: [],
    loading: Boolean(userId),
    error: "",
    listeners: new Set(),
  };

  medicationStore.set(key, created);
  return created;
}

function notifyStore(userId?: string) {
  const entry = getStoreEntry(userId);

  for (const listener of entry.listeners) {
    listener();
  }
}

function updateStore(
  userId: string | undefined,
  updater: (entry: MedicationStoreEntry) => void,
) {
  const entry = getStoreEntry(userId);
  updater(entry);
  notifyStore(userId);
}

async function fetchUserMedicationIds(
  supabase: ReturnType<typeof createClient>,
  targetUserId: string,
) {
  const { data, error: queryError } = await supabase
    .from("user_medications")
    .select("medication_id")
    .eq("user_id", targetUserId)
    .order("created_at", { ascending: false });

  if (queryError) {
    throw queryError;
  }

  const rows = (data ?? []) as UserMedicationRow[];
  return [...new Set(rows.map((row) => row.medication_id))];
}

function getErrorMessage(error: PostgrestError | Error | null) {
  if (!error) {
    return "";
  }

  if ("code" in error && error.code === "23505") {
    return "이미 내 복용약에 등록된 약입니다.";
  }

  if ("code" in error && error.code === "22P02") {
    return "복용약 식별자 형식이 현재 저장 테이블과 맞지 않습니다. 데이터 구조 점검이 필요합니다.";
  }

  if ("code" in error && error.code === "23503") {
    return "현재 의약품 마스터와 연결되지 않은 약이라 저장할 수 없습니다. 테이블 연결 구조 점검이 필요합니다.";
  }

  return error.message || "복용약 정보를 불러오지 못했습니다.";
}

export function useUserMedications(userId?: string): UserMedicationsState {
  const [snapshot, setSnapshot] = useState(() => {
    const entry = getStoreEntry(userId);
    return {
      medicationIds: entry.medicationIds,
      loading: entry.loading,
      error: entry.error,
    };
  });

  async function refresh() {
    if (!userId) {
      updateStore(userId, (entry) => {
        entry.medicationIds = [];
        entry.loading = false;
        entry.error = "";
      });
      return;
    }

    updateStore(userId, (entry) => {
      entry.loading = true;
    });

    try {
      const supabase = createClient();
      const nextMedicationIds = await fetchUserMedicationIds(supabase, userId);

      updateStore(userId, (entry) => {
        entry.medicationIds = nextMedicationIds;
        entry.error = "";
      });
    } catch (queryError) {
      updateStore(userId, (entry) => {
        entry.error = getErrorMessage(queryError as PostgrestError | Error);
      });
    } finally {
      updateStore(userId, (entry) => {
        entry.loading = false;
      });
    }
  }

  useEffect(() => {
    const entry = getStoreEntry(userId);
    const sync = () => {
      const nextEntry = getStoreEntry(userId);
      setSnapshot({
        medicationIds: nextEntry.medicationIds,
        loading: nextEntry.loading,
        error: nextEntry.error,
      });
    };

    entry.listeners.add(sync);
    sync();

    let active = true;
    const supabase = createClient();

    async function load() {
      if (!userId) {
        if (!active) {
          return;
        }

        updateStore(userId, (storeEntry) => {
          storeEntry.medicationIds = [];
          storeEntry.loading = false;
          storeEntry.error = "";
        });
        return;
      }

      updateStore(userId, (storeEntry) => {
        storeEntry.loading = true;
      });

      try {
        const nextMedicationIds = await fetchUserMedicationIds(supabase, userId);

        if (!active) {
          return;
        }

        updateStore(userId, (storeEntry) => {
          storeEntry.medicationIds = nextMedicationIds;
          storeEntry.error = "";
        });
      } catch (queryError) {
        if (!active) {
          return;
        }

        updateStore(userId, (storeEntry) => {
          storeEntry.error = getErrorMessage(queryError as PostgrestError | Error);
        });
      } finally {
        if (active) {
          updateStore(userId, (storeEntry) => {
            storeEntry.loading = false;
          });
        }
      }
    }

    void load();

    const channel = userId
      ? supabase
          .channel(`user-medications-${userId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "user_medications",
              filter: `user_id=eq.${userId}`,
            },
            () => {
              void load();
            },
          )
          .subscribe()
      : null;

    return () => {
      active = false;
      entry.listeners.delete(sync);
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  async function addMedication(medicationId: string) {
    if (!userId) {
      return;
    }

    const supabase = createClient();
    const { error: insertError } = await supabase.from("user_medications").upsert(
      {
        user_id: userId,
        medication_id: medicationId,
      },
      {
        onConflict: "user_id,medication_id",
        ignoreDuplicates: true,
      },
    );

    if (insertError) {
      if ("code" in insertError && insertError.code === "23505") {
        updateStore(userId, (entry) => {
          entry.medicationIds = entry.medicationIds.includes(medicationId)
            ? entry.medicationIds
            : [medicationId, ...entry.medicationIds];
          entry.error = "";
        });
        void refresh();
        return;
      }

      updateStore(userId, (entry) => {
        entry.error = getErrorMessage(insertError);
      });
      return;
    }

    updateStore(userId, (entry) => {
      entry.medicationIds = entry.medicationIds.includes(medicationId)
        ? entry.medicationIds
        : [medicationId, ...entry.medicationIds];
      entry.error = "";
    });
    void refresh();
  }

  async function removeMedication(medicationId: string) {
    if (!userId) {
      return;
    }

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("user_medications")
      .delete()
      .eq("user_id", userId)
      .eq("medication_id", medicationId);

    if (deleteError) {
      updateStore(userId, (entry) => {
        entry.error = getErrorMessage(deleteError);
      });
      return;
    }

    updateStore(userId, (entry) => {
      entry.medicationIds = entry.medicationIds.filter((item) => item !== medicationId);
      entry.error = "";
    });
    void refresh();
  }

  async function clearMedications() {
    if (!userId) {
      return;
    }

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("user_medications")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      updateStore(userId, (entry) => {
        entry.error = getErrorMessage(deleteError);
      });
      return;
    }

    updateStore(userId, (entry) => {
      entry.medicationIds = [];
      entry.error = "";
    });
    void refresh();
  }

  return {
    medicationIds: snapshot.medicationIds,
    loading: snapshot.loading,
    error: snapshot.error,
    addMedication,
    removeMedication,
    clearMedications,
    refresh,
  };
}

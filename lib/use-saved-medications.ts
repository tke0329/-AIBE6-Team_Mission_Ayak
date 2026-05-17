"use client";

import { useEffect, useState } from "react";

import { Medication } from "@/components/types";
import { MedicationRow, normalizeMedication } from "@/lib/medication-record";
import { createClient } from "@/lib/supabase/client";

type SavedMedicationsState = {
  medications: Medication[];
  loading: boolean;
  error: string;
};

type SavedMedicationsStore = {
  error: string;
  fetchedKey: string;
  medications: Medication[];
};

const medicationColumns =
  "id, slug, name, category, dosage, ingredient, summary, efficacy, usage, cautions, side_effects, storage";

export function useSavedMedications(medicationIds: string[]): SavedMedicationsState {
  const requestKey = medicationIds.join(",");
  const [store, setStore] = useState<SavedMedicationsStore>({
    medications: [],
    fetchedKey: "",
    error: "",
  });

  useEffect(() => {
    if (medicationIds.length === 0) {
      return;
    }

    let active = true;
    const supabase = createClient();

    void supabase
      .from("medications")
      .select(medicationColumns)
      .in("id", medicationIds)
      .eq("is_active", true)
      .then(({ data, error }) => {
        if (!active) {
          return;
        }

        if (error) {
          setStore({
            medications: [],
            fetchedKey: requestKey,
            error: error.message || "복용약 상세 정보를 불러오지 못했습니다.",
          });
          return;
        }

        const rows = ((data ?? []) as MedicationRow[]).map(normalizeMedication);
        const order = new Map(medicationIds.map((id, index) => [id, index]));
        rows.sort(
          (left, right) =>
            (order.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
            (order.get(right.id) ?? Number.MAX_SAFE_INTEGER),
        );

        setStore({
          medications: rows,
          fetchedKey: requestKey,
          error: "",
        });
      });

    return () => {
      active = false;
    };
  }, [medicationIds, requestKey]);

  if (medicationIds.length === 0) {
    return {
      medications: [],
      loading: false,
      error: "",
    };
  }

  return {
    medications: store.fetchedKey === requestKey ? store.medications : [],
    loading: store.fetchedKey !== requestKey,
    error: store.fetchedKey === requestKey ? store.error : "",
  };
}

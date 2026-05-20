"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getUserDisplayName, useAuthUser } from "@/lib/auth";
import {
  createEmptyHealthProfile,
  formatAgeGroup,
  formatAgeSummary,
  formatBooleanChoice,
  formatDrinkingFrequency,
  getAgeGroupFromAge,
  HealthProfile,
  hasHealthProfile,
} from "@/lib/health-profile";
import { createClient } from "@/lib/supabase/client";
import { useHealthProfile } from "@/lib/use-health-profile";
import { useUserMedications } from "@/lib/user-medications";
import { useSavedMedications } from "@/lib/use-saved-medications";

export function MemberPage() {
  const router = useRouter();
  const user = useAuthUser();
  const { medicationIds } = useUserMedications(user?.id);
  const { medications } = useSavedMedications(medicationIds);
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    saveProfile,
  } = useHealthProfile(user?.id);
  const resolvedMedicationCount = medications.length;
  const [editingProfile, setEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState<HealthProfile>(
    createEmptyHealthProfile,
  );
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (user === null) {
      router.replace("/member/login");
    }
  }, [router, user]);

  const profileExists = hasHealthProfile(profile);
  const isEditingProfile = editingProfile || !profileExists;

  function updateDraftProfile<Key extends keyof HealthProfile>(
    key: Key,
    value: HealthProfile[Key],
  ) {
    setDraftProfile((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveProfile(draftProfile);
    setEditingProfile(false);
    setSaveMessage("건강정보를 저장했습니다.");
  }

  function handleStartEditing() {
    setDraftProfile(profile);
    setEditingProfile(true);
    setSaveMessage("");
  }

  function handleCancelEditing() {
    setDraftProfile(profile);
    setEditingProfile(false);
    setSaveMessage("");
  }

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
          <h1 className="font-display mt-3 text-3xl font-bold">
            {getUserDisplayName(user)}
          </h1>
          <p className="mt-2 text-sm text-white/80">{user.email}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <article className="rounded-[28px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(0,80,203,0.1)]">
            <div className="text-sm font-semibold text-[var(--color-primary)]">
              기본 정보
            </div>
            <div className="mt-4 space-y-4 text-sm text-[var(--color-on-surface)]">
              <div>
                <div className="text-[var(--color-on-surface-variant)]">
                  이름
                </div>
                <div className="mt-1 font-semibold">
                  {getUserDisplayName(user)}
                </div>
              </div>
              <div>
                <div className="text-[var(--color-on-surface-variant)]">
                  이메일
                </div>
                <div className="mt-1 font-semibold">{user.email}</div>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(0,80,203,0.1)]">
            <div className="text-sm font-semibold text-[var(--color-primary)]">
              복용약 현황
            </div>
            <div className="mt-4 text-4xl font-bold text-[var(--color-on-surface)]">
              {resolvedMedicationCount}
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">
              복용중인 의약품의 개수입니다.
            </p>
            <Link
              href="/my-medications"
              className="mt-5 inline-flex rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,80,203,0.24)]"
            >
              내 복용약 보기
            </Link>
          </article>
        </div>

        <section className="rounded-[28px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(0,80,203,0.1)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--color-primary)]">
                복약 안전 프로필
              </div>
              <h2 className="font-display mt-3 text-3xl font-bold text-[var(--color-on-surface)]">
                건강정보
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
                나이, 생활 습관, 기저 질환, 알레르기 정보를 입력해두면 이후
                의약품 검색과 복용 안내에서 더 정확한 주의 문구를 붙일 수
                있습니다.
              </p>
            </div>
            {!isEditingProfile ? (
              <button
                type="button"
                onClick={handleStartEditing}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,80,203,0.24)]"
              >
                {profileExists ? "건강정보 수정하기" : "건강정보 입력하기"}
              </button>
            ) : null}
          </div>

          {profileError ? (
            <div className="mt-5 rounded-2xl bg-[var(--color-error-container)] px-4 py-3 text-sm text-[var(--color-on-error-container)]">
              {profileError}
            </div>
          ) : null}

          {saveMessage ? (
            <div className="mt-5 rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3 text-sm text-[var(--color-on-surface)]">
              {saveMessage}
            </div>
          ) : null}

          {profileLoading ? (
            <div className="mt-6 rounded-2xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-low)] px-5 py-4 text-sm text-[var(--color-on-surface-variant)]">
              건강정보를 불러오는 중입니다.
            </div>
          ) : isEditingProfile ? (
            <form onSubmit={handleSubmitProfile} className="mt-6 space-y-6">
              <div className="grid gap-5 lg:grid-cols-2">
                <section className="rounded-[24px] border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-low)] p-5">
                  <h3 className="text-lg font-bold text-[var(--color-on-surface)]">
                    기본 상태
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <FieldLabel htmlFor="age" label="나이" />
                      <input
                        id="age"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={draftProfile.age}
                        onChange={(event) =>
                          updateDraftProfile("age", event.target.value)
                        }
                        placeholder="예: 21"
                        className="h-12 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/15"
                      />
                      <p className="mt-2 text-xs leading-5 text-[var(--color-on-surface-variant)]">
                        입력한 나이를 기준으로 자동 분류됩니다:{" "}
                        {draftProfile.age
                          ? formatAgeGroup(getAgeGroupFromAge(draftProfile.age))
                          : "어린이 / 청소년 / 성인 / 고령자"}
                      </p>
                    </div>

                    <BooleanSelect
                      id="pregnant"
                      label="임신 여부"
                      value={draftProfile.pregnant}
                      onChange={(value) =>
                        updateDraftProfile("pregnant", value)
                      }
                    />
                    <BooleanSelect
                      id="breastfeeding"
                      label="수유 여부"
                      value={draftProfile.breastfeeding}
                      onChange={(value) =>
                        updateDraftProfile("breastfeeding", value)
                      }
                    />
                  </div>
                </section>

                <section className="rounded-[24px] border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-low)] p-5">
                  <h3 className="text-lg font-bold text-[var(--color-on-surface)]">
                    생활 습관
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <FieldLabel htmlFor="drinkingFrequency" label="음주 빈도" />
                      <select
                        id="drinkingFrequency"
                        value={draftProfile.drinkingFrequency}
                        onChange={(event) =>
                          updateDraftProfile(
                            "drinkingFrequency",
                            event.target.value as HealthProfile["drinkingFrequency"],
                          )
                        }
                        className="h-12 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/15"
                      >
                        <option value="">선택 안 함</option>
                        <option value="rare">거의 안 마심</option>
                        <option value="monthly">월 1~3회</option>
                        <option value="weekly">주 1~2회</option>
                        <option value="frequent">주 3회 이상</option>
                      </select>
                    </div>
                    <BooleanSelect
                      id="driving"
                      label="운전 여부"
                      value={draftProfile.driving}
                      onChange={(value) => updateDraftProfile("driving", value)}
                    />
                  </div>
                </section>

                <section className="rounded-[24px] border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-low)] p-5">
                  <h3 className="text-lg font-bold text-[var(--color-on-surface)]">
                    기저 질환
                  </h3>
                  <div className="mt-4 space-y-4">
                    <BooleanSelect
                      id="liverDisease"
                      label="간 질환 여부"
                      value={draftProfile.liverDisease}
                      onChange={(value) =>
                        updateDraftProfile("liverDisease", value)
                      }
                    />
                    <BooleanSelect
                      id="kidneyDisease"
                      label="신장 질환 여부"
                      value={draftProfile.kidneyDisease}
                      onChange={(value) =>
                        updateDraftProfile("kidneyDisease", value)
                      }
                    />
                    <BooleanSelect
                      id="highBloodPressure"
                      label="고혈압 여부"
                      value={draftProfile.highBloodPressure}
                      onChange={(value) =>
                        updateDraftProfile("highBloodPressure", value)
                      }
                    />
                    <BooleanSelect
                      id="asthma"
                      label="천식 여부"
                      value={draftProfile.asthma}
                      onChange={(value) => updateDraftProfile("asthma", value)}
                    />
                    <BooleanSelect
                      id="stomachDisease"
                      label="위장 질환 여부"
                      value={draftProfile.stomachDisease}
                      onChange={(value) =>
                        updateDraftProfile("stomachDisease", value)
                      }
                    />
                  </div>
                </section>

                <section className="rounded-[24px] border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-low)] p-5">
                  <h3 className="text-lg font-bold text-[var(--color-on-surface)]">
                    약물 안전
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <FieldLabel htmlFor="allergies" label="알레르기" />
                      <textarea
                        id="allergies"
                        value={draftProfile.allergies}
                        onChange={(event) =>
                          updateDraftProfile("allergies", event.target.value)
                        }
                        rows={4}
                        placeholder="예: 특정 항생제 알레르기, 아세트아미노펜 계열 주의"
                        className="w-full rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/15"
                      />
                    </div>
                    <div>
                      <FieldLabel
                        htmlFor="currentMedications"
                        label="현재 복용 중인 약"
                      />
                      <textarea
                        id="currentMedications"
                        value={draftProfile.currentMedications}
                        onChange={(event) =>
                          updateDraftProfile(
                            "currentMedications",
                            event.target.value,
                          )
                        }
                        rows={4}
                        placeholder="예: 타이레놀, 혈압약, 알레르기약"
                        className="w-full rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/15"
                      />
                    </div>
                  </div>
                </section>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,80,203,0.24)]"
                >
                  건강정보 저장하기
                </button>
                {profileExists ? (
                  <button
                    type="button"
                    onClick={handleCancelEditing}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-white px-5 text-sm font-semibold text-[var(--color-on-surface)]"
                  >
                    취소
                  </button>
                ) : null}
              </div>
            </form>
          ) : profileExists ? (
            <div className="mt-6 space-y-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <SummaryGroup
                  title="기본 상태"
                  items={[
                    { label: "나이", value: formatAgeSummary(profile.age) },
                    {
                      label: "임신 여부",
                      value: formatBooleanChoice(profile.pregnant),
                    },
                    {
                      label: "수유 여부",
                      value: formatBooleanChoice(profile.breastfeeding),
                    },
                  ]}
                />
                <SummaryGroup
                  title="생활 습관"
                  items={[
                    {
                      label: "음주 빈도",
                      value: formatDrinkingFrequency(profile.drinkingFrequency),
                    },
                    {
                      label: "운전 여부",
                      value: formatBooleanChoice(profile.driving),
                    },
                  ]}
                />
                <SummaryGroup
                  title="기저 질환"
                  items={[
                    {
                      label: "간 질환 여부",
                      value: formatBooleanChoice(profile.liverDisease),
                    },
                    {
                      label: "신장 질환 여부",
                      value: formatBooleanChoice(profile.kidneyDisease),
                    },
                    {
                      label: "고혈압 여부",
                      value: formatBooleanChoice(profile.highBloodPressure),
                    },
                    {
                      label: "천식 여부",
                      value: formatBooleanChoice(profile.asthma),
                    },
                    {
                      label: "위장 질환 여부",
                      value: formatBooleanChoice(profile.stomachDisease),
                    },
                  ]}
                />
                <SummaryGroup
                  title="약물 안전"
                  items={[
                    { label: "알레르기", value: profile.allergies || "미입력" },
                    {
                      label: "현재 복용 중인 약",
                      value: profile.currentMedications || "미입력",
                    },
                  ]}
                />
              </div>
              <div className="rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3 text-sm leading-6 text-[var(--color-on-surface-variant)]">
                입력한 건강정보는 현재 이 브라우저에 저장되며, 이후 의약품
                검색과 복용 주의 안내에서 더 정확한 경고를 보여주기 위한 기초
                정보로 사용됩니다.
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[24px] border border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-6 py-8 text-center">
              <p className="text-sm leading-6 text-[var(--color-on-surface-variant)]">
                아직 입력된 건강정보가 없습니다. 복약 안전 프로필을 입력해두면
                이후 약 검색과 복용 안내에 더 정확한 주의 문구를 붙일 수
                있습니다.
              </p>
            </div>
          )}
        </section>

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

type FieldLabelProps = {
  htmlFor: string;
  label: string;
};

function FieldLabel({ htmlFor, label }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-semibold text-[var(--color-on-surface)]"
    >
      {label}
    </label>
  );
}

type BooleanSelectProps = {
  id: string;
  label: string;
  value: HealthProfile["pregnant"];
  onChange: (value: HealthProfile["pregnant"]) => void;
};

function BooleanSelect({ id, label, value, onChange }: BooleanSelectProps) {
  return (
    <div>
      <FieldLabel htmlFor={id} label={label} />
      <select
        id={id}
        value={value}
        onChange={(event) =>
          onChange(event.target.value as HealthProfile["pregnant"])
        }
        className="h-12 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/15"
      >
        <option value="">선택 안 함</option>
        <option value="yes">예</option>
        <option value="no">아니오</option>
      </select>
    </div>
  );
}

type SummaryGroupProps = {
  title: string;
  items: Array<{ label: string; value: string }>;
};

function SummaryGroup({ title, items }: SummaryGroupProps) {
  return (
    <section className="rounded-[24px] border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-low)] p-5">
      <h3 className="text-lg font-bold text-[var(--color-on-surface)]">
        {title}
      </h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={`${title}-${item.label}`}
            className="rounded-2xl bg-white px-4 py-3 text-sm"
          >
            <div className="text-[var(--color-on-surface-variant)]">
              {item.label}
            </div>
            <div className="mt-1 whitespace-pre-line font-semibold text-[var(--color-on-surface)]">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

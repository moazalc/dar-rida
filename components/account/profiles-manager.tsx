"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addProfile, deleteProfile, editProfile, type ActionResult } from "@/app/(frontend)/account/actions";
import { MeasurementsPanel, type SavedProfile } from "@/components/measure/measurements-panel";
import { useI18n } from "@/components/providers/i18n-provider";
import type { Measurements } from "@/lib/measurements";

const small = "text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground";
const nameInput = "h-10 w-56 max-w-full border border-border bg-card px-3 text-sm outline-none focus:border-foreground";

/** Her saved measurement sets: edit each with the usual panel, rename, delete, or add another. */
export function ProfilesManager({ profiles, max }: { profiles: SavedProfile[]; max: number }) {
  const { dict } = useI18n();
  const t = dict.account.profiles;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(profiles.length === 0);
  const [newName, setNewName] = useState(profiles.length === 0 ? t.defaultName : "");

  function act(run: () => Promise<ActionResult>, after?: () => void) {
    setError(null);
    startTransition(async () => {
      const r = await run();
      if (r.status === "ok") {
        after?.();
        router.refresh();
      } else setError(r.status === "full" ? t.full : t.error);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {profiles.length === 0 && !adding && <p className="text-muted-foreground">{t.empty}</p>}

      {profiles.map((p) => (
        <ProfileCard
          key={p.id}
          profile={p}
          pending={pending}
          onMeasurements={(m) => act(() => editProfile(p.id, { measurements: m }))}
          onRename={(name, done) => act(() => editProfile(p.id, { name }), done)}
          onDelete={() => {
            if (window.confirm(t.confirmDelete.replace("{name}", p.name))) act(() => deleteProfile(p.id));
          }}
        />
      ))}

      {adding ? (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            {t.name}
            <input value={newName} maxLength={40} onChange={(e) => setNewName(e.target.value)} placeholder={t.namePlaceholder} className={nameInput} />
          </label>
          <MeasurementsPanel
            key={profiles.length}
            title={newName.trim() || t.add}
            value={null}
            onChange={(m: Measurements) =>
              act(
                () => addProfile({ name: newName.trim() || t.defaultName, measurements: m }),
                () => (setAdding(false), setNewName("")),
              )
            }
          />
          {profiles.length > 0 && (
            <button type="button" onClick={() => setAdding(false)} className={`${small} self-start`}>
              {t.cancel}
            </button>
          )}
        </div>
      ) : (
        profiles.length < max && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="h-12 self-start border border-foreground px-6 text-xs tracking-[0.16em] uppercase transition-colors hover:bg-foreground hover:text-background"
          >
            {t.add}
          </button>
        )
      )}

      <p aria-live="polite" className="text-sm text-destructive">
        {error}
      </p>
    </div>
  );
}

function ProfileCard({
  profile,
  pending,
  onMeasurements,
  onRename,
  onDelete,
}: {
  profile: SavedProfile;
  pending: boolean;
  onMeasurements: (m: Measurements) => void;
  onRename: (name: string, done: () => void) => void;
  onDelete: () => void;
}) {
  const t = useI18n().dict.account.profiles;
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(profile.name);

  return (
    <div className="flex flex-col gap-2">
      <MeasurementsPanel title={profile.name} value={profile.measurements} onChange={(m) => onMeasurements(m)} />
      <div className="flex flex-wrap items-center gap-4">
        {renaming ? (
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) onRename(name.trim(), () => setRenaming(false));
            }}
          >
            <input value={name} maxLength={40} autoFocus onChange={(e) => setName(e.target.value)} aria-label={t.name} className={nameInput} />
            <button type="submit" disabled={pending} className="h-10 bg-primary px-4 text-xs tracking-[0.12em] text-primary-foreground uppercase disabled:opacity-50">
              {t.save}
            </button>
            <button type="button" onClick={() => (setRenaming(false), setName(profile.name))} className={small}>
              {t.cancel}
            </button>
          </form>
        ) : (
          <>
            <button type="button" onClick={() => setRenaming(true)} className={small}>
              {t.rename}
            </button>
            <button type="button" onClick={onDelete} disabled={pending} className={small}>
              {t.delete}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

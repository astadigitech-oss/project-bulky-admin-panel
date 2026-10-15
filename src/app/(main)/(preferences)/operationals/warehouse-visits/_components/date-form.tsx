"use client";

import { type FormEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useWarehouseVisitMutations } from "../_api";
import { WarehouseVisitDate } from "../_api/types";

type DateForm = {
  visit_date: string;
  is_open: boolean;
  crew_count: number;
  visit_hours_note: string;
};

const emptyForm = (): DateForm => ({
  visit_date: "",
  is_open: true,
  crew_count: 1,
  visit_hours_note: "",
});

const toForm = (date?: WarehouseVisitDate): DateForm =>
  date
    ? {
        visit_date: date.visit_date,
        is_open: date.is_open,
        crew_count: date.crew_count,
        visit_hours_note: date.visit_hours_note ?? "",
      }
    : emptyForm();

export const WarehouseVisitDateDialog = ({
  open,
  onOpenChange,
  onSaved,
  mode,
  visitDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (date: string) => void;
  mode: "create" | "edit";
  visitDate?: WarehouseVisitDate;
}) => {
  const [form, setForm] = useState<DateForm>(() => toForm(visitDate));
  const mutations = useWarehouseVisitMutations();
  const isEdit = mode === "edit";
  const isSaving =
    mutations.createDate.isPending || mutations.updateDate.isPending;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.visit_date || (form.is_open && form.crew_count < 1)) return;

    const body = {
      is_open: form.is_open,
      crew_count: Number(form.crew_count),
      visit_hours_note: form.visit_hours_note.trim() || undefined,
    };
    const finish = () => {
      onSaved(form.visit_date);
      onOpenChange(false);
    };

    if (isEdit && visitDate) {
      mutations.updateDate.mutate(
        { params: { id: visitDate.id }, body },
        { onSuccess: finish },
      );
      return;
    }

    if (!isEdit) {
      mutations.createDate.mutate(
        { body: { ...body, visit_date: form.visit_date } },
        { onSuccess: finish },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Atur Jadwal Kunjungan" : "Tambah Jadwal Kunjungan"}
          </DialogTitle>
          <DialogDescription>
            Kapasitas dihitung dari jumlah crew × 2 buyer. Catatan jam hanya
            menjadi informasi, bukan slot kedatangan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <FieldGroup className="gap-4">
            <Field className="gap-1.5">
              <FieldLabel htmlFor="warehouse-visit-date">
                Tanggal kunjungan
              </FieldLabel>
              <Input
                id="warehouse-visit-date"
                type="date"
                value={form.visit_date}
                disabled={isEdit}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    visit_date: event.target.value,
                  }))
                }
                required
              />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="warehouse-visit-crew">
                Jumlah crew kasir
              </FieldLabel>
              <Input
                id="warehouse-visit-crew"
                type="number"
                min={form.is_open ? 1 : 0}
                max={1000}
                value={form.crew_count}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    crew_count: Number(event.target.value),
                  }))
                }
                required
              />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="warehouse-visit-hours">
                Catatan jam (opsional)
              </FieldLabel>
              <Input
                id="warehouse-visit-hours"
                value={form.visit_hours_note}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    visit_hours_note: event.target.value,
                  }))
                }
                placeholder="Contoh: 09.00–16.00"
              />
            </Field>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={form.is_open}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    is_open: checked === true,
                  }))
                }
              />
              Buka tanggal untuk reservasi
            </label>
          </FieldGroup>
          <DialogFooter className="mt-5">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? "Menyimpan…"
                : isEdit
                  ? "Simpan Perubahan"
                  : "Buat Jadwal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

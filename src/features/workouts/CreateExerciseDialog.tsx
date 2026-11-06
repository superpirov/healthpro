import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from '@/data/exercises'
import { useAppStore } from '@/store/appStore'
import { toast } from '@/components/ui/toast'
import { t, loc } from '@/lib/i18n'
import type { Equipment, Exercise, MuscleGroup } from '@/types'

interface Draft {
  name: string
  muscleGroup: MuscleGroup
  equipment: Equipment
  description: string
}

const emptyDraft = (): Draft => ({
  name: '',
  muscleGroup: 'Chest',
  equipment: 'Barbell',
  description: '',
})

export function CreateExerciseDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (ex: Exercise) => void
}) {
  const addCustomExercise = useAppStore((s) => s.addCustomExercise)
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  useEffect(() => {
    if (open) setDraft(emptyDraft())
  }, [open])

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const valid = draft.name.trim().length > 0

  const save = () => {
    if (!valid) return
    const ex: Exercise = {
      id: `custom-${Date.now().toString(36)}`,
      name: draft.name.trim(),
      muscleGroup: draft.muscleGroup,
      equipment: draft.equipment,
      description: draft.description.trim(),
      custom: true,
    }
    addCustomExercise(ex)
    toast.success(t('toast_ex_created'), t('toast_ex_created_desc', { name: ex.name }))
    onOpenChange(false)
    onCreated?.(ex)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('ce_title')}</DialogTitle>
          <DialogDescription>{t('ce_desc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ce-name">{t('ce_name')}</Label>
            <Input
              id="ce-name"
              placeholder={t('ce_name_placeholder')}
              value={draft.name}
              onChange={(e) => set({ name: e.target.value })}
              aria-invalid={!valid && draft.name.length > 0}
              autoFocus
            />
            {!valid && draft.name.length === 0 && null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('ce_group')}</Label>
              <Select
                value={draft.muscleGroup}
                onValueChange={(v) => set({ muscleGroup: v as MuscleGroup })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MUSCLE_GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {loc('mg', g)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('ce_equipment')}</Label>
              <Select
                value={draft.equipment}
                onValueChange={(v) => set({ equipment: v as Equipment })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_TYPES.map((eq) => (
                    <SelectItem key={eq} value={eq}>
                      {loc('eq', eq)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ce-desc">{t('ce_desc_field')}</Label>
            <Textarea
              id="ce-desc"
              rows={2}
              placeholder={t('ce_desc_placeholder')}
              value={draft.description}
              onChange={(e) => set({ description: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button variant="energy" disabled={!valid} onClick={save}>
            {t('ce_create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

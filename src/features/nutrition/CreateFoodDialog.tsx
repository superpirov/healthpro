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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FOOD_CATEGORIES } from '@/data/foods'
import { useAppStore } from '@/store/appStore'
import { toast } from '@/components/ui/toast'
import type { FoodCategory, FoodItem } from '@/types'

interface Draft {
  name: string
  category: FoodCategory
  calories: string
  protein: string
  fat: string
  carbs: string
}

const emptyDraft = (name: string): Draft => ({
  name,
  category: 'Snacks',
  calories: '',
  protein: '',
  fat: '',
  carbs: '',
})

/** kcal estimated from macros — shown as a hint while typing */
function estimatedKcal(d: Draft): number {
  const p = Number(d.protein) || 0
  const f = Number(d.fat) || 0
  const c = Number(d.carbs) || 0
  return Math.round(p * 4 + f * 9 + c * 4)
}

export function CreateFoodDialog({
  open,
  onOpenChange,
  presetName,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  presetName: string
  /** called with the saved food so the caller can immediately log it */
  onCreated: (food: FoodItem) => void
}) {
  const addCustomFood = useAppStore((s) => s.addCustomFood)
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(presetName))

  useEffect(() => {
    if (open) setDraft(emptyDraft(presetName))
  }, [open, presetName])

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const est = estimatedKcal(draft)
  const kcalManual = Number(draft.calories) || 0
  const valid =
    draft.name.trim().length > 0 && (kcalManual > 0 || est > 0)

  const save = () => {
    if (!valid) return
    const food: FoodItem = {
      id: `custom-${Date.now().toString(36)}`,
      name: draft.name.trim(),
      category: draft.category,
      calories: kcalManual > 0 ? kcalManual : est,
      protein: Number(draft.protein) || 0,
      fat: Number(draft.fat) || 0,
      carbs: Number(draft.carbs) || 0,
      custom: true,
    }
    addCustomFood(food)
    toast.success('Food created', `${food.name} added to your library`)
    onOpenChange(false)
    onCreated(food)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create custom food</DialogTitle>
          <DialogDescription>Nutrition values per 100 g.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cf-name">Name</Label>
            <Input
              id="cf-name"
              placeholder="e.g. Protein Pancakes"
              value={draft.name}
              onChange={(e) => set({ name: e.target.value })}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={draft.category}
              onValueChange={(v) => set({ category: v as FoodCategory })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOOD_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cf-kcal">Calories</Label>
              <Input
                id="cf-kcal"
                type="number"
                min={0}
                inputMode="numeric"
                placeholder={est > 0 ? String(est) : 'kcal'}
                value={draft.calories}
                onChange={(e) => set({ calories: e.target.value })}
              />
              {est > 0 && kcalManual === 0 && (
                <p className="text-[11px] text-muted-foreground tabular">
                  ≈ {est} kcal from macros
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cf-protein">Protein, g</Label>
              <Input
                id="cf-protein"
                type="number"
                min={0}
                inputMode="decimal"
                placeholder="0"
                value={draft.protein}
                onChange={(e) => set({ protein: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cf-fat">Fat, g</Label>
              <Input
                id="cf-fat"
                type="number"
                min={0}
                inputMode="decimal"
                placeholder="0"
                value={draft.fat}
                onChange={(e) => set({ fat: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cf-carbs">Carbs, g</Label>
              <Input
                id="cf-carbs"
                type="number"
                min={0}
                inputMode="decimal"
                placeholder="0"
                value={draft.carbs}
                onChange={(e) => set({ carbs: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="nutri" onClick={save} disabled={!valid}>
            Create food
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

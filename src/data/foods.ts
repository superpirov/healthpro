import type { FoodItem } from '@/types'

/** Values per 100 g — realistic USDA-style averages */
export const FOODS: FoodItem[] = [
  /* ── Protein ───────────────────────────────────────────── */
  { id: 'chicken-breast', name: 'Chicken Breast', category: 'Protein', calories: 165, protein: 31, fat: 3.6, carbs: 0 },
  { id: 'chicken-thigh', name: 'Chicken Thigh', category: 'Protein', calories: 209, protein: 26, fat: 11, carbs: 0 },
  { id: 'salmon', name: 'Salmon', category: 'Protein', calories: 208, protein: 20, fat: 13, carbs: 0 },
  { id: 'tuna', name: 'Tuna (canned)', category: 'Protein', calories: 116, protein: 26, fat: 1, carbs: 0 },
  { id: 'cod', name: 'Cod', category: 'Protein', calories: 82, protein: 18, fat: 0.7, carbs: 0 },
  { id: 'shrimp', name: 'Shrimp', category: 'Protein', calories: 99, protein: 24, fat: 0.3, carbs: 0.2 },
  { id: 'beef-lean', name: 'Beef (lean)', category: 'Protein', calories: 250, protein: 26, fat: 15, carbs: 0 },
  { id: 'ground-turkey', name: 'Ground Turkey', category: 'Protein', calories: 147, protein: 20, fat: 7, carbs: 0 },
  { id: 'pork-tenderloin', name: 'Pork Tenderloin', category: 'Protein', calories: 143, protein: 26, fat: 3.5, carbs: 0 },
  { id: 'eggs', name: 'Eggs', category: 'Protein', calories: 155, protein: 13, fat: 11, carbs: 1.1 },
  { id: 'egg-whites', name: 'Egg Whites', category: 'Protein', calories: 52, protein: 11, fat: 0.2, carbs: 0.7 },
  { id: 'tofu', name: 'Tofu (firm)', category: 'Protein', calories: 144, protein: 17, fat: 9, carbs: 3 },
  { id: 'tempeh', name: 'Tempeh', category: 'Protein', calories: 193, protein: 20, fat: 11, carbs: 7.6 },

  /* ── Grains ────────────────────────────────────────────── */
  { id: 'rice-white', name: 'Rice (white, cooked)', category: 'Grains', calories: 130, protein: 2.7, fat: 0.3, carbs: 28 },
  { id: 'rice-brown', name: 'Rice (brown, cooked)', category: 'Grains', calories: 123, protein: 2.7, fat: 1, carbs: 26 },
  { id: 'oatmeal', name: 'Oatmeal (cooked)', category: 'Grains', calories: 71, protein: 2.5, fat: 1.5, carbs: 12 },
  { id: 'pasta', name: 'Pasta (cooked)', category: 'Grains', calories: 158, protein: 5.8, fat: 0.9, carbs: 31 },
  { id: 'quinoa', name: 'Quinoa (cooked)', category: 'Grains', calories: 120, protein: 4.4, fat: 1.9, carbs: 21 },
  { id: 'buckwheat', name: 'Buckwheat (cooked)', category: 'Grains', calories: 92, protein: 3.4, fat: 0.7, carbs: 19 },
  { id: 'couscous', name: 'Couscous (cooked)', category: 'Grains', calories: 112, protein: 3.8, fat: 0.2, carbs: 23 },
  { id: 'bulgur', name: 'Bulgur (cooked)', category: 'Grains', calories: 83, protein: 3, fat: 0.2, carbs: 19 },

  /* ── Dairy ─────────────────────────────────────────────── */
  { id: 'greek-yogurt', name: 'Greek Yogurt (2%)', category: 'Dairy', calories: 73, protein: 10, fat: 2, carbs: 4 },
  { id: 'cottage-cheese', name: 'Cottage Cheese', category: 'Dairy', calories: 98, protein: 11, fat: 4.3, carbs: 3.4 },
  { id: 'milk', name: 'Milk (2%)', category: 'Dairy', calories: 50, protein: 3.4, fat: 1.6, carbs: 4.8 },
  { id: 'kefir', name: 'Kefir', category: 'Dairy', calories: 59, protein: 3.3, fat: 2, carbs: 4.7 },
  { id: 'cheddar', name: 'Cheddar Cheese', category: 'Dairy', calories: 403, protein: 25, fat: 33, carbs: 1.3 },
  { id: 'mozzarella', name: 'Mozzarella', category: 'Dairy', calories: 280, protein: 28, fat: 17, carbs: 3.1 },
  { id: 'parmesan', name: 'Parmesan', category: 'Dairy', calories: 431, protein: 38, fat: 29, carbs: 4.1 },
  { id: 'butter', name: 'Butter', category: 'Dairy', calories: 717, protein: 0.9, fat: 81, carbs: 0.1 },

  /* ── Fruits ────────────────────────────────────────────── */
  { id: 'banana', name: 'Banana', category: 'Fruits', calories: 89, protein: 1.1, fat: 0.3, carbs: 23 },
  { id: 'apple', name: 'Apple', category: 'Fruits', calories: 52, protein: 0.3, fat: 0.2, carbs: 14 },
  { id: 'orange', name: 'Orange', category: 'Fruits', calories: 47, protein: 0.9, fat: 0.1, carbs: 12 },
  { id: 'grapes', name: 'Grapes', category: 'Fruits', calories: 69, protein: 0.7, fat: 0.2, carbs: 18 },
  { id: 'blueberries', name: 'Blueberries', category: 'Fruits', calories: 57, protein: 0.7, fat: 0.3, carbs: 14 },
  { id: 'strawberries', name: 'Strawberries', category: 'Fruits', calories: 32, protein: 0.7, fat: 0.3, carbs: 7.7 },
  { id: 'mango', name: 'Mango', category: 'Fruits', calories: 60, protein: 0.8, fat: 0.4, carbs: 15 },
  { id: 'pineapple', name: 'Pineapple', category: 'Fruits', calories: 50, protein: 0.5, fat: 0.1, carbs: 13 },
  { id: 'watermelon', name: 'Watermelon', category: 'Fruits', calories: 30, protein: 0.6, fat: 0.2, carbs: 7.6 },
  { id: 'avocado', name: 'Avocado', category: 'Fruits', calories: 160, protein: 2, fat: 15, carbs: 9 },

  /* ── Vegetables ────────────────────────────────────────── */
  { id: 'potato', name: 'Potato (baked)', category: 'Vegetables', calories: 93, protein: 2.5, fat: 0.1, carbs: 21 },
  { id: 'sweet-potato', name: 'Sweet Potato', category: 'Vegetables', calories: 86, protein: 1.6, fat: 0.1, carbs: 20 },
  { id: 'broccoli', name: 'Broccoli', category: 'Vegetables', calories: 34, protein: 2.8, fat: 0.4, carbs: 7 },
  { id: 'spinach', name: 'Spinach', category: 'Vegetables', calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6 },
  { id: 'tomato', name: 'Tomato', category: 'Vegetables', calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9 },
  { id: 'cucumber', name: 'Cucumber', category: 'Vegetables', calories: 15, protein: 0.7, fat: 0.1, carbs: 3.6 },
  { id: 'carrot', name: 'Carrot', category: 'Vegetables', calories: 41, protein: 0.9, fat: 0.2, carbs: 10 },
  { id: 'bell-pepper', name: 'Bell Pepper', category: 'Vegetables', calories: 31, protein: 1, fat: 0.3, carbs: 6 },
  { id: 'zucchini', name: 'Zucchini', category: 'Vegetables', calories: 17, protein: 1.2, fat: 0.3, carbs: 3.1 },
  { id: 'cauliflower', name: 'Cauliflower', category: 'Vegetables', calories: 25, protein: 1.9, fat: 0.3, carbs: 5 },
  { id: 'mushrooms', name: 'Mushrooms', category: 'Vegetables', calories: 22, protein: 3.1, fat: 0.3, carbs: 3.3 },
  { id: 'onion', name: 'Onion', category: 'Vegetables', calories: 40, protein: 1.1, fat: 0.1, carbs: 9 },
  { id: 'green-beans', name: 'Green Beans', category: 'Vegetables', calories: 31, protein: 1.8, fat: 0.2, carbs: 7 },

  /* ── Nuts & Seeds ──────────────────────────────────────── */
  { id: 'almonds', name: 'Almonds', category: 'Nuts & Seeds', calories: 579, protein: 21, fat: 50, carbs: 22 },
  { id: 'walnuts', name: 'Walnuts', category: 'Nuts & Seeds', calories: 654, protein: 15, fat: 65, carbs: 14 },
  { id: 'peanut-butter', name: 'Peanut Butter', category: 'Nuts & Seeds', calories: 588, protein: 25, fat: 50, carbs: 20 },
  { id: 'cashews', name: 'Cashews', category: 'Nuts & Seeds', calories: 553, protein: 18, fat: 44, carbs: 30 },
  { id: 'chia-seeds', name: 'Chia Seeds', category: 'Nuts & Seeds', calories: 486, protein: 17, fat: 31, carbs: 42 },
  { id: 'pumpkin-seeds', name: 'Pumpkin Seeds', category: 'Nuts & Seeds', calories: 559, protein: 30, fat: 49, carbs: 11 },
  { id: 'sunflower-seeds', name: 'Sunflower Seeds', category: 'Nuts & Seeds', calories: 584, protein: 21, fat: 51, carbs: 20 },

  /* ── Fats & Oils ───────────────────────────────────────── */
  { id: 'olive-oil', name: 'Olive Oil', category: 'Fats & Oils', calories: 884, protein: 0, fat: 100, carbs: 0 },
  { id: 'coconut-oil', name: 'Coconut Oil', category: 'Fats & Oils', calories: 862, protein: 0, fat: 100, carbs: 0 },

  /* ── Bakery ────────────────────────────────────────────── */
  { id: 'bread-white', name: 'Bread (white)', category: 'Bakery', calories: 265, protein: 9, fat: 3.2, carbs: 49 },
  { id: 'bread-wholegrain', name: 'Bread (whole grain)', category: 'Bakery', calories: 247, protein: 13, fat: 3.4, carbs: 41 },
  { id: 'bagel', name: 'Bagel', category: 'Bakery', calories: 250, protein: 10, fat: 1.5, carbs: 49 },
  { id: 'tortilla', name: 'Flour Tortilla', category: 'Bakery', calories: 312, protein: 8.2, fat: 7.2, carbs: 52 },
  { id: 'oat-cookies', name: 'Oat Cookies', category: 'Bakery', calories: 450, protein: 6, fat: 18, carbs: 66 },

  /* ── Beverages ─────────────────────────────────────────── */
  { id: 'orange-juice', name: 'Orange Juice', category: 'Beverages', calories: 45, protein: 0.7, fat: 0.2, carbs: 10 },
  { id: 'protein-shake', name: 'Protein Shake (whey)', category: 'Beverages', calories: 120, protein: 24, fat: 1.5, carbs: 3 },
  { id: 'coffee-black', name: 'Coffee (black)', category: 'Beverages', calories: 2, protein: 0.1, fat: 0, carbs: 0 },
  { id: 'latte', name: 'Latte (whole milk)', category: 'Beverages', calories: 56, protein: 3, fat: 2.8, carbs: 5.3 },
  { id: 'coconut-water', name: 'Coconut Water', category: 'Beverages', calories: 19, protein: 0.7, fat: 0.2, carbs: 3.7 },

  /* ── Snacks ────────────────────────────────────────────── */
  { id: 'dark-chocolate', name: 'Dark Chocolate (70%)', category: 'Snacks', calories: 598, protein: 7.8, fat: 43, carbs: 46 },
  { id: 'protein-bar', name: 'Protein Bar', category: 'Snacks', calories: 350, protein: 20, fat: 12, carbs: 40 },
  { id: 'popcorn', name: 'Popcorn (air-popped)', category: 'Snacks', calories: 387, protein: 12, fat: 4.5, carbs: 78 },
  { id: 'rice-cakes', name: 'Rice Cakes', category: 'Snacks', calories: 387, protein: 8.3, fat: 2.9, carbs: 82 },
  { id: 'granola', name: 'Granola', category: 'Snacks', calories: 471, protein: 10, fat: 20, carbs: 64 },
  { id: 'hummus', name: 'Hummus', category: 'Snacks', calories: 166, protein: 7.9, fat: 9.6, carbs: 14 },
  { id: 'apple-sauce', name: 'Apple Sauce', category: 'Snacks', calories: 68, protein: 0.3, fat: 0.1, carbs: 17 },
]

export const FOOD_CATEGORIES = [
  'Protein',
  'Grains',
  'Dairy',
  'Fruits',
  'Vegetables',
  'Nuts & Seeds',
  'Fats & Oils',
  'Bakery',
  'Beverages',
  'Snacks',
] as const

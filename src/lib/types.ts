export interface MealItem {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface MacroTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface MealEntry {
  id: string;
  timestamp: number;
  input_text: string;
  items: MealItem[];
  confidence: "high" | "medium" | "low";
  assumptions: string;
  totals: MacroTotals;
}

export interface AnalyzeResponse {
  items: MealItem[];
  confidence: "high" | "medium" | "low";
  assumptions: string;
  totals: MacroTotals;
}

export interface DailySettings {
  calorie_goal: number;
}

export interface SavedMeal {
  id: string;
  name: string;
  image_base64?: string | null;
  items: MealItem[];
  totals: MacroTotals;
  created_at: number;
}

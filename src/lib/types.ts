export interface MealItem {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  quantity?: string; // e.g. "150g", "1 כף", "2 כוסות"
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
  image_base64?: string | null;
}

export interface AnalyzeResponse {
  items: MealItem[];
  confidence: "high" | "medium" | "low";
  assumptions: string;
  totals: MacroTotals;
}

export type FitnessGoal = "lose_weight" | "tone" | "gain_muscle" | "maintain" | "eat_healthy";

export type AccuracyLevel = "low" | "medium" | "high";

export interface DailySettings {
  calorie_goal: number;
  fitness_goal?: FitnessGoal | null;
  accuracy_level?: AccuracyLevel | null;
}

// ── Clarifying question types ────────────────────────────────────────────────

/** Standard yes/no question */
export interface ClarifyQuestionYesNo {
  type: "yesno";
  id: string;
  text: string;
  impact_kcal: number;
}

/**
 * Quantity question — replaces the yes/no for additive ingredients.
 * The UI shows a slider; sliding to 0 means "none".
 */
export interface ClarifyQuestionQuantity {
  type: "quantity";
  id: string;
  text: string;           // e.g. "כמה שמן זית הוספת לסלט?"
  ingredient: string;     // e.g. "שמן זית"
  unit: string;           // e.g. "כף", "כפית", "מ״ל", "גרם"
  default_amount: number; // the slider default (average portion)
  min_amount: number;     // usually 0
  max_amount: number;
  step: number;
  cal_per_unit: number;
  protein_per_unit: number;
  carbs_per_unit: number;
  fat_per_unit: number;
  impact_kcal: number;
}

/**
 * Choice question — for ingredient-type questions ("which cheese?").
 * First option is always "לא הוספתי / ללא" so the user can decline.
 */
export interface ClarifyQuestionChoice {
  type: "choice";
  id: string;
  text: string;           // e.g. "איזה גבינה הוספת?"
  options: {
    label: string;        // e.g. "גבינה לבנה 5%"
    cal_delta: number;    // calorie impact of choosing this option
  }[];
  impact_kcal: number;
}

export type ClarifyQuestion =
  | ClarifyQuestionYesNo
  | ClarifyQuestionQuantity
  | ClarifyQuestionChoice;

export interface ClarifyAnswer {
  question_id: string;
  question_text: string;
  /**
   * - "yes" / "no" / "skip" for yesno questions
   * - "0" or a number string like "1.5" for quantity questions (unit is implied by the question)
   * - the chosen option label for choice questions
   */
  answer: string;
}

export interface SavedMeal {
  id: string;
  name: string;
  image_base64?: string | null;
  items: MealItem[];
  totals: MacroTotals;
  created_at: number;
}

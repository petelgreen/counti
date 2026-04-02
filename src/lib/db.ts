import { neon } from "@neondatabase/serverless";
import type { MealEntry, DailySettings, SavedMeal } from "./types";

let _sql: ReturnType<typeof neon> | null = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

function getDb() {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL!);
  }
  return _sql;
}

async function doInit() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      input_text TEXT NOT NULL,
      items TEXT NOT NULL,
      confidence TEXT NOT NULL,
      assumptions TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein_g REAL NOT NULL,
      carbs_g REAL NOT NULL,
      fat_g REAL NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `;
  await sql`
    INSERT INTO settings (key, value) VALUES ('calorie_goal', '2000')
    ON CONFLICT (key) DO NOTHING
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS saved_meals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      image_base64 TEXT,
      items TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein_g REAL NOT NULL,
      carbs_g REAL NOT NULL,
      fat_g REAL NOT NULL,
      created_at BIGINT NOT NULL
    )
  `;
}

async function ensureInit() {
  if (initialized) return;
  if (!initPromise) initPromise = doInit();
  await initPromise;
  initialized = true;
}

export async function getMealsForDay(dateMs: number): Promise<MealEntry[]> {
  await ensureInit();
  const sql = getDb();
  const start = new Date(dateMs);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateMs);
  end.setHours(23, 59, 59, 999);
  const rows = await sql`
    SELECT * FROM meals
    WHERE timestamp >= ${start.getTime()} AND timestamp <= ${end.getTime()}
    ORDER BY timestamp ASC
  `;
  return rows.map(rowToEntry);
}

export async function getMealsForDateRange(fromMs: number, toMs: number): Promise<MealEntry[]> {
  await ensureInit();
  const sql = getDb();
  const start = new Date(fromMs);
  start.setHours(0, 0, 0, 0);
  const end = new Date(toMs);
  end.setHours(23, 59, 59, 999);
  const rows = await sql`
    SELECT * FROM meals
    WHERE timestamp >= ${start.getTime()} AND timestamp <= ${end.getTime()}
    ORDER BY timestamp ASC
  `;
  return rows.map(rowToEntry);
}

export async function getAllMeals(): Promise<MealEntry[]> {
  await ensureInit();
  const sql = getDb();
  const rows = await sql`SELECT * FROM meals ORDER BY timestamp DESC`;
  return rows.map(rowToEntry);
}

export async function saveMeal(entry: MealEntry): Promise<void> {
  await ensureInit();
  const sql = getDb();
  await sql`
    INSERT INTO meals (id, timestamp, input_text, items, confidence, assumptions, calories, protein_g, carbs_g, fat_g)
    VALUES (
      ${entry.id}, ${entry.timestamp}, ${entry.input_text},
      ${JSON.stringify(entry.items)}, ${entry.confidence}, ${entry.assumptions},
      ${entry.totals.calories}, ${entry.totals.protein_g}, ${entry.totals.carbs_g}, ${entry.totals.fat_g}
    )
  `;
}

export async function updateMeal(entry: MealEntry): Promise<void> {
  await ensureInit();
  const sql = getDb();
  await sql`
    UPDATE meals SET
      items = ${JSON.stringify(entry.items)},
      confidence = ${entry.confidence},
      assumptions = ${entry.assumptions},
      calories = ${entry.totals.calories},
      protein_g = ${entry.totals.protein_g},
      carbs_g = ${entry.totals.carbs_g},
      fat_g = ${entry.totals.fat_g}
    WHERE id = ${entry.id}
  `;
}

export async function deleteMeal(id: string): Promise<void> {
  await ensureInit();
  const sql = getDb();
  await sql`DELETE FROM meals WHERE id = ${id}`;
}

export async function getSettings(): Promise<DailySettings> {
  await ensureInit();
  const sql = getDb();
  const rows = await sql`SELECT value FROM settings WHERE key = 'calorie_goal'`;
  return { calorie_goal: rows[0] ? parseInt(rows[0].value, 10) : 2000 };
}

export async function saveSettings(settings: DailySettings): Promise<void> {
  await ensureInit();
  const sql = getDb();
  await sql`
    INSERT INTO settings (key, value) VALUES ('calorie_goal', ${String(settings.calorie_goal)})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
}

// ─── Saved Meals ─────────────────────────────────────────────────────────────

export async function getSavedMeals(): Promise<SavedMeal[]> {
  await ensureInit();
  const sql = getDb();
  const rows = await sql`SELECT * FROM saved_meals ORDER BY created_at DESC`;
  return rows.map(rowToSavedMeal);
}

export async function createSavedMeal(meal: SavedMeal): Promise<void> {
  await ensureInit();
  const sql = getDb();
  await sql`
    INSERT INTO saved_meals (id, name, image_base64, items, calories, protein_g, carbs_g, fat_g, created_at)
    VALUES (
      ${meal.id}, ${meal.name}, ${meal.image_base64 ?? null},
      ${JSON.stringify(meal.items)},
      ${meal.totals.calories}, ${meal.totals.protein_g}, ${meal.totals.carbs_g}, ${meal.totals.fat_g},
      ${meal.created_at}
    )
  `;
}

export async function updateSavedMeal(meal: SavedMeal): Promise<void> {
  await ensureInit();
  const sql = getDb();
  await sql`
    UPDATE saved_meals SET
      name = ${meal.name},
      image_base64 = ${meal.image_base64 ?? null},
      items = ${JSON.stringify(meal.items)},
      calories = ${meal.totals.calories},
      protein_g = ${meal.totals.protein_g},
      carbs_g = ${meal.totals.carbs_g},
      fat_g = ${meal.totals.fat_g}
    WHERE id = ${meal.id}
  `;
}

export async function deleteSavedMeal(id: string): Promise<void> {
  await ensureInit();
  const sql = getDb();
  await sql`DELETE FROM saved_meals WHERE id = ${id}`;
}

function rowToSavedMeal(row: any): SavedMeal {
  return {
    id: row.id,
    name: row.name,
    image_base64: row.image_base64 ?? null,
    items: JSON.parse(row.items),
    totals: { calories: row.calories, protein_g: row.protein_g, carbs_g: row.carbs_g, fat_g: row.fat_g },
    created_at: row.created_at,
  };
}

function rowToEntry(row: any): MealEntry {
  return {
    id: row.id,
    timestamp: Number(row.timestamp),
    input_text: row.input_text,
    items: JSON.parse(row.items),
    confidence: row.confidence,
    assumptions: row.assumptions,
    totals: {
      calories: row.calories,
      protein_g: row.protein_g,
      carbs_g: row.carbs_g,
      fat_g: row.fat_g,
    },
  };
}

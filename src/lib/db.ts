import { neon } from "@neondatabase/serverless";
import type { MealEntry, DailySettings, SavedMeal } from "./types";

export interface DbUser {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
}

let _sql: ReturnType<typeof neon> | null = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

function getDb() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql;
}

async function doInit() {
  const sql = getDb();

  // meals
  await sql`
    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'anonymous',
      timestamp BIGINT NOT NULL,
      input_text TEXT NOT NULL,
      items TEXT NOT NULL,
      confidence TEXT NOT NULL,
      assumptions TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein_g REAL NOT NULL,
      carbs_g REAL NOT NULL,
      fat_g REAL NOT NULL,
      image_base64 TEXT
    )
  `;
  await sql`ALTER TABLE meals ADD COLUMN IF NOT EXISTS image_base64 TEXT`;
  await sql`ALTER TABLE meals ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'anonymous'`;

  // user_settings (replaces single-user settings table)
  await sql`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (user_id, key)
    )
  `;

  // saved_meals
  await sql`
    CREATE TABLE IF NOT EXISTS saved_meals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'anonymous',
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
  await sql`ALTER TABLE saved_meals ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'anonymous'`;

  // users
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT,
      created_at BIGINT NOT NULL
    )
  `;

  // legacy settings table kept for backward compat
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `;
}

async function ensureInit() {
  if (initialized) return;
  if (!initPromise) initPromise = doInit();
  await initPromise;
  initialized = true;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  await ensureInit();
  const sql = getDb();
  const rows = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}` as any[];
  return rows[0] ?? null;
}

export async function getUserById(id: string): Promise<DbUser | null> {
  await ensureInit();
  const sql = getDb();
  const rows = await sql`SELECT * FROM users WHERE id = ${id}` as any[];
  return rows[0] ?? null;
}

export async function createUser(user: { id: string; email: string; name: string; password_hash: string | null }): Promise<void> {
  await ensureInit();
  const sql = getDb();
  await sql`
    INSERT INTO users (id, email, name, password_hash, created_at)
    VALUES (${user.id}, ${user.email.toLowerCase()}, ${user.name}, ${user.password_hash}, ${Date.now()})
  `;
}

// ─── Meals ────────────────────────────────────────────────────────────────────

export async function getMealsForDay(userId: string, dateMs: number): Promise<MealEntry[]> {
  await ensureInit();
  const sql = getDb();
  const start = new Date(dateMs); start.setHours(0, 0, 0, 0);
  const end   = new Date(dateMs); end.setHours(23, 59, 59, 999);
  const rows = await sql`
    SELECT * FROM meals
    WHERE user_id = ${userId} AND timestamp >= ${start.getTime()} AND timestamp <= ${end.getTime()}
    ORDER BY timestamp ASC
  `;
  return (rows as any[]).map(rowToEntry);
}

export async function getMealsForDateRange(userId: string, fromMs: number, toMs: number): Promise<MealEntry[]> {
  await ensureInit();
  const sql = getDb();
  const start = new Date(fromMs); start.setHours(0, 0, 0, 0);
  const end   = new Date(toMs);   end.setHours(23, 59, 59, 999);
  const rows = await sql`
    SELECT * FROM meals
    WHERE user_id = ${userId} AND timestamp >= ${start.getTime()} AND timestamp <= ${end.getTime()}
    ORDER BY timestamp ASC
  `;
  return (rows as any[]).map(rowToEntry);
}

export async function saveMeal(entry: MealEntry & { user_id: string }): Promise<void> {
  await ensureInit();
  const sql = getDb();
  await sql`
    INSERT INTO meals (id, user_id, timestamp, input_text, items, confidence, assumptions, calories, protein_g, carbs_g, fat_g, image_base64)
    VALUES (
      ${entry.id}, ${entry.user_id}, ${entry.timestamp}, ${entry.input_text},
      ${JSON.stringify(entry.items)}, ${entry.confidence}, ${entry.assumptions},
      ${entry.totals.calories}, ${entry.totals.protein_g}, ${entry.totals.carbs_g}, ${entry.totals.fat_g},
      ${entry.image_base64 ?? null}
    )
  `;
}

export async function updateMeal(entry: MealEntry): Promise<void> {
  await ensureInit();
  const sql = getDb();
  await sql`
    UPDATE meals SET
      items       = ${JSON.stringify(entry.items)},
      confidence  = ${entry.confidence},
      assumptions = ${entry.assumptions},
      calories    = ${entry.totals.calories},
      protein_g   = ${entry.totals.protein_g},
      carbs_g     = ${entry.totals.carbs_g},
      fat_g       = ${entry.totals.fat_g}
    WHERE id = ${entry.id}
  `;
}

export async function deleteMeal(id: string): Promise<void> {
  await ensureInit();
  const sql = getDb();
  await sql`DELETE FROM meals WHERE id = ${id}`;
}

// ─── User Settings ────────────────────────────────────────────────────────────

export async function getSettings(userId: string): Promise<DailySettings> {
  await ensureInit();
  const sql = getDb();
  const rows = await sql`SELECT value FROM user_settings WHERE user_id = ${userId} AND key = 'calorie_goal'` as any[];
  const goalRow = rows[0];
  const fitnessRows  = await sql`SELECT value FROM user_settings WHERE user_id = ${userId} AND key = 'fitness_goal'` as any[];
  const accuracyRows = await sql`SELECT value FROM user_settings WHERE user_id = ${userId} AND key = 'accuracy_level'` as any[];
  return {
    calorie_goal:   goalRow ? parseInt(goalRow.value, 10) : 2000,
    fitness_goal:   fitnessRows[0]?.value  ?? null,
    accuracy_level: accuracyRows[0]?.value ?? null,
  };
}

export async function saveSettings(userId: string, settings: Partial<DailySettings>): Promise<void> {
  await ensureInit();
  const sql = getDb();
  if (settings.calorie_goal !== undefined) {
    await sql`
      INSERT INTO user_settings (user_id, key, value) VALUES (${userId}, 'calorie_goal', ${String(settings.calorie_goal)})
      ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value
    `;
  }
  if (settings.fitness_goal !== undefined) {
    await sql`
      INSERT INTO user_settings (user_id, key, value) VALUES (${userId}, 'fitness_goal', ${settings.fitness_goal ?? ''})
      ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value
    `;
  }
  if (settings.accuracy_level !== undefined) {
    await sql`
      INSERT INTO user_settings (user_id, key, value) VALUES (${userId}, 'accuracy_level', ${settings.accuracy_level ?? 'medium'})
      ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value
    `;
  }
}

export async function isOnboarded(userId: string): Promise<boolean> {
  await ensureInit();
  const sql = getDb();
  const rows = await sql`SELECT 1 FROM user_settings WHERE user_id = ${userId} AND key = 'calorie_goal'` as any[];
  return rows.length > 0;
}

// ─── Saved Meals ──────────────────────────────────────────────────────────────

export async function getSavedMeals(userId: string): Promise<SavedMeal[]> {
  await ensureInit();
  const sql = getDb();
  const rows = await sql`SELECT * FROM saved_meals WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return (rows as any[]).map(rowToSavedMeal);
}

export async function createSavedMeal(userId: string, meal: SavedMeal): Promise<void> {
  await ensureInit();
  const sql = getDb();
  await sql`
    INSERT INTO saved_meals (id, user_id, name, image_base64, items, calories, protein_g, carbs_g, fat_g, created_at)
    VALUES (
      ${meal.id}, ${userId}, ${meal.name}, ${meal.image_base64 ?? null},
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
      name         = ${meal.name},
      image_base64 = ${meal.image_base64 ?? null},
      items        = ${JSON.stringify(meal.items)},
      calories     = ${meal.totals.calories},
      protein_g    = ${meal.totals.protein_g},
      carbs_g      = ${meal.totals.carbs_g},
      fat_g        = ${meal.totals.fat_g}
    WHERE id = ${meal.id}
  `;
}

export async function deleteSavedMeal(id: string): Promise<void> {
  await ensureInit();
  const sql = getDb();
  await sql`DELETE FROM saved_meals WHERE id = ${id}`;
}

// ─── Row mappers ──────────────────────────────────────────────────────────────

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
    totals: { calories: row.calories, protein_g: row.protein_g, carbs_g: row.carbs_g, fat_g: row.fat_g },
    image_base64: row.image_base64 ?? null,
  };
}

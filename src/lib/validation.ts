import { z } from "zod";

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format");

export const checkinPayloadSchema = z.object({
  weight_kg: z.number().min(20).max(400).nullable().optional(),
  water_ml: z.number().int().min(0).max(10000).nullable().optional(),
  calories: z.number().int().min(0).max(20000).nullable().optional(),
  protein_g: z.number().int().min(0).max(1000).nullable().optional(),
  workout_done: z.boolean().nullable().optional(),
  energy_level: z.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  date: isoDateSchema.optional(),
});

export const foodLogPayloadSchema = z.object({
  checkin_date: isoDateSchema,
  meal_slot: z.enum(["breakfast", "lunch", "dinner", "snack", "supplement"]),
  food_name: z.string().trim().min(1).max(200),
  brand: z.string().trim().max(120).nullable().optional(),
  serving_size: z.number().min(0).max(10000).nullable().optional(),
  serving_unit: z.string().trim().max(20).nullable().optional(),
  calories: z.number().min(0).max(5000).nullable().optional(),
  protein_g: z.number().min(0).max(500).nullable().optional(),
  carbs_g: z.number().min(0).max(1000).nullable().optional(),
  fat_g: z.number().min(0).max(500).nullable().optional(),
  fiber_g: z.number().min(0).max(300).nullable().optional(),
  source: z.enum(["usda", "openfoodfacts", "manual"]).nullable().optional(),
  source_id: z.string().max(120).nullable().optional(),
  barcode: z.string().max(64).nullable().optional(),
});

export const inviteCreatePayloadSchema = z.object({
  coachId: z.string().uuid(),
  clientEmail: z.string().email().max(320),
});

export const programCreatePayloadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().max(2000).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(25).optional(),
  difficulty: z.number().int().min(1).max(3).optional(),
  days_per_week: z.number().int().min(1).max(7).nullable().optional(),
  duration_weeks: z.number().int().min(1).max(52).optional(),
  start_day: z
    .enum([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ])
    .optional(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "Color must be hex format, e.g. #B8F04A")
    .optional(),
});

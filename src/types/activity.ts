export type ActivityCategory = "meals" | "supplements" | "exercises";

export type ActivityStatus = "planned" | "completed" | "modified";

export interface SupplementLogEntry {
  id: string;
  client_id: string;
  date: string;
  supplement_name: string;
  dose: string | null;
  time_slot: string;
  taken: boolean;
  taken_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface ExerciseLogEntry {
  id: string;
  client_id: string;
  date: string;
  exercise_name: string;
  planned_sets: number | null;
  planned_reps: string | null;
  completed: boolean;
  actual_sets: number | null;
  actual_reps: string | null;
  notes: string | null;
  created_at: string;
}

export interface PlannedMeal {
  type: "meal";
  time?: string;
  name: string;
  ingredients?: string[];
  kcal: number;
  protein_g: number;
  prep?: string;
  meal_slot?: string;
}

export interface PlannedSupplement {
  type: "supplement";
  time_slot: string;
  name: string;
  dose: string;
}

export interface PlannedExercise {
  type: "exercise";
  name: string;
  sets: number;
  reps: string;
  notes?: string;
}

export type PlannedActivity =
  | (PlannedMeal & { status?: ActivityStatus })
  | (PlannedSupplement & { status?: ActivityStatus })
  | (PlannedExercise & { status?: ActivityStatus });

export interface UpsertSupplementLogPayload {
  date: string;
  supplement_name: string;
  dose?: string;
  time_slot: string;
  taken: boolean;
  taken_at?: string;
  notes?: string;
}

export interface UpsertExerciseLogPayload {
  date: string;
  exercise_name: string;
  planned_sets?: number;
  planned_reps?: string;
  completed: boolean;
  actual_sets?: number;
  actual_reps?: string;
  notes?: string;
}

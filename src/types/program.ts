export type ProgramItemType = "workout" | "exercise" | "meal" | "video" | "text";

export interface Program {
  id: string;
  coach_id: string;
  name: string;
  description: string | null;
  tags: string[];
  difficulty: 1 | 2 | 3;
  days_per_week: number | null;
  duration_weeks: number;
  start_day: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramDay {
  id: string;
  program_id: string;
  day_number: number;
  label: string | null;
  items: ProgramItem[];
}

export interface ProgramItem {
  id: string;
  program_day_id: string;
  type: ProgramItemType;
  title: string;
  content: Record<string, unknown> | null;
  sort_order: number;
  created_at?: string;
}

export interface ClientProgram {
  id: string;
  client_id: string;
  program_id: string;
  start_date: string;
  is_active: boolean;
  assigned_at: string;
}

// Content payloads per item type
export interface WorkoutContent {
  exercises: { name: string; sets: number; reps: string; rest: string }[];
  notes?: string;
}

export interface ExerciseContent {
  sets?: number;
  reps?: string;
  weight?: string;
  rest_seconds?: number;
  notes?: string;
  video_url?: string;
}

export interface MealContent {
  foods: { name: string; amount: string; unit: string; calories?: number; protein?: number; carbs?: number; fat?: number }[];
  meal_type?: string;
  notes?: string;
}

export interface VideoContent {
  url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  notes?: string;
}

export interface TextContent {
  body: string;
}

export interface LibraryItem {
  id: string;
  coach_id: string | null;
  type: ProgramItemType;
  title: string;
  content: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  is_platform?: boolean;
}

// Per-client override actions
export type OverrideAction = "add" | "replace" | "hide";

export interface ClientProgramItemOverride {
  id: string;
  client_program_id: string;
  program_day_id: string;
  source_item_id: string | null;
  action: OverrideAction;
  type: ProgramItemType | null;
  title: string | null;
  content: Record<string, unknown> | null;
  sort_order: number;
  created_at: string;
}

// Merged item used when rendering a client's program (template + overrides applied)
export interface MergedProgramItem extends ProgramItem {
  overrideId?: string;
  overrideAction?: OverrideAction;
  isClientOnly?: boolean;
  isCustomized?: boolean;
  isHidden?: boolean;
}

export interface ActivityFeedEntry {
  id: string;
  clientName: string;
  clientId: string;
  type: "day_completed" | "item_completed";
  itemTitle?: string;
  itemType?: ProgramItemType;
  dayNumber?: number;
  completedAt: string;
}

export type ClientLibraryItemType =
  | ProgramItemType
  | "note"
  | "bookmark"
  | "recipe"
  | "workout";

export type ClientLibrarySource = "platform" | "coach" | "personal";

export interface ClientLibraryItem {
  id: string;
  coach_id: string | null;
  type: ClientLibraryItemType;
  title: string;
  content: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  source: ClientLibrarySource;
}

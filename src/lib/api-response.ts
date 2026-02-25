import { NextResponse } from "next/server";

export type ApiErrorBody = {
  error: string;
  code?: string;
  details?: unknown;
};

export function apiError(
  status: number,
  error: string,
  code?: string,
  details?: unknown
) {
  const body: ApiErrorBody = { error };
  if (code) body.code = code;
  if (details !== undefined) body.details = details;
  return NextResponse.json(body, { status });
}

export function apiUnexpectedError(logLabel: string, err: unknown, fallback: string) {
  console.error(logLabel, err);
  return apiError(500, fallback, "INTERNAL_ERROR");
}

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError } from "@/lib/api-response";

const DEFAULT_EMAIL = "coach@test.com";
const DEFAULT_PASSWORD = "test123456";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      name?: string;
      brand_name?: string;
      secret?: string;
    };
    const envSecret = process.env.DEV_SEED_SECRET;
    const hasValidSecret = Boolean(
      envSecret &&
        typeof body.secret === "string" &&
        body.secret.length > 0 &&
        body.secret === envSecret
    );
    const inDevelopment = process.env.NODE_ENV === "development";
    if (!inDevelopment && !hasValidSecret) {
      return apiError(
        403,
        "Seed endpoint is restricted to development or valid secret",
        "FORBIDDEN"
      );
    }

    const email = (body.email ?? DEFAULT_EMAIL).trim().toLowerCase();
    const password = body.password ?? DEFAULT_PASSWORD;
    const name = body.name ?? "Test Coach";
    const brandName = body.brand_name ?? "NutriCoach Test";

    if (!email || !password) {
      return apiError(400, "Email and password are required", "VALIDATION_ERROR");
    }

    const admin = createAdminClient();

    const { data: authUser, error: authError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return apiError(400, "Failed to create auth user", "AUTH_CREATE_FAILED");
    }

    if (!authUser.user) {
      return apiError(500, "Failed to create auth user", "AUTH_CREATE_FAILED");
    }

    const { error: coachError } = await admin.from("coaches").insert({
      user_id: authUser.user.id,
      name,
      brand_name: brandName,
      subscription_tier: "starter",
    });

    if (coachError) {
      return apiError(500, "Coach insert failed", "COACH_CREATE_FAILED");
    }

    return NextResponse.json({
      message: "Coach test user created",
      email,
      password,
    });
  } catch (err) {
    return apiError(500, "Seed failed", "INTERNAL_ERROR");
  }
}

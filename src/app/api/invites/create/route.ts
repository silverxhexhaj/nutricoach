import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes } from "crypto";
import { inviteCreatePayloadSchema } from "@/lib/validation";
import { apiError, apiUnexpectedError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return apiError(401, "Unauthorized", "UNAUTHORIZED");
    }

    const parsedBody = inviteCreatePayloadSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return apiError(
        400,
        "Invalid invite payload",
        "VALIDATION_ERROR",
        parsedBody.error.flatten()
      );
    }
    const { coachId, clientEmail } = parsedBody.data;

    const { data: coach } = await supabase
      .from("coaches")
      .select("id, name, brand_name")
      .eq("id", coachId)
      .eq("user_id", user.id)
      .single();

    if (!coach) {
      return apiError(403, "Forbidden", "FORBIDDEN");
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: insertErr } = await supabase.from("invites").insert({
      coach_id: coachId,
      client_email: clientEmail.trim(),
      token,
      expires_at: expiresAt.toISOString(),
    });

    if (insertErr) throw insertErr;

    const baseUrl =
      request.headers.get("origin") ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      "http://localhost:3000";
    const inviteUrl = `${baseUrl}/invite/accept?token=${token}`;
    const completeUrl = `${baseUrl}/invite/complete`;

    let emailSent = false;
    let emailError: string | null = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const admin = createAdminClient();
        const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
          clientEmail.trim(),
          { redirectTo: completeUrl }
        );
        if (!inviteErr) {
          emailSent = true;
        } else {
          emailError = inviteErr.message;
        }
      } catch (inviteErr) {
        emailError =
          inviteErr instanceof Error ? inviteErr.message : "Invite failed";
      }
    } else {
      emailError = "Supabase service role not configured";
    }

    return NextResponse.json({
      inviteUrl,
      emailSent,
      emailError,
    });
  } catch (err) {
    return apiUnexpectedError("Invite create error:", err, "Failed to create invite");
  }
}

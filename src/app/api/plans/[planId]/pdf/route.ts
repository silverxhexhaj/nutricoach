import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { PlanPDFDocument } from "@/lib/plan-pdf";
import type { GeneratedPlan } from "@/types/plan";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await params;

    const { data: coach } = await supabase
      .from("coaches")
      .select("id, name, brand_name")
      .eq("user_id", user.id)
      .single();

    if (!coach) {
      return NextResponse.json({ error: "Coach profile not found" }, { status: 403 });
    }

    const { data: planRow } = await supabase
      .from("meal_plans")
      .select("id, plan_json, client_id, coach_id")
      .eq("id", planId)
      .single();

    if (!planRow || planRow.coach_id !== coach.id) {
      return NextResponse.json({ error: "Plan not found or access denied" }, { status: 404 });
    }

    const { data: client } = await supabase
      .from("clients")
      .select("name")
      .eq("id", planRow.client_id)
      .single();

    const plan = planRow.plan_json as GeneratedPlan;
    const clientName = client?.name ?? plan.user_stats?.name ?? "Client";

    const doc = React.createElement(PlanPDFDocument, {
      plan,
      clientName,
      coachName: coach.name ?? "Your Coach",
      coachBrand: coach.brand_name ?? undefined,
    });
    const buffer = await renderToBuffer(doc as React.ReactElement);

    const filename = `meal-plan-${clientName.replace(/\s+/g, "-")}.pdf`;

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("PDF export error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

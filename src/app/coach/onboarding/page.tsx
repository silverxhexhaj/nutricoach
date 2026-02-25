"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CoachOnboardingPage() {
  const [name, setName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let logoUrl: string | null = null;
      if (logoFile) {
        try {
          const ext = logoFile.name.split(".").pop() ?? "png";
          const path = `${user.id}/logo.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from("coach-logos")
            .upload(path, logoFile, { upsert: true });
          if (!uploadErr) {
            const {
              data: { publicUrl },
            } = supabase.storage.from("coach-logos").getPublicUrl(path);
            logoUrl = publicUrl;
          }
        } catch {
          // Storage bucket may not exist; continue without logo
        }
      }

      const { error: insertErr } = await supabase.from("coaches").insert({
        user_id: user.id,
        name: name.trim() || null,
        brand_name: brandName.trim() || null,
        logo_url: logoUrl,
      });

      if (insertErr) throw insertErr;
      router.push("/coach/onboarding/demo");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onboarding failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-6">
      <a
        href="/"
        className="font-heading font-extrabold text-xl text-green mb-8"
      >
        NutriCoach <span className="text-text">AI</span>
      </a>
      <div className="w-full max-w-[420px]">
        <h1 className="font-heading font-extrabold text-2xl mb-2">
          Coach onboarding
        </h1>
        <p className="text-text-dim text-sm mb-6">
          Set up your coach profile to start adding clients.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input w-full"
              placeholder="e.g. James Smith"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
              Brand name
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="form-input w-full"
              placeholder="e.g. FitLife Coaching"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
              Logo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              className="form-input w-full"
            />
          </div>
          {error && <div className="error-box">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="btn-form-next w-full py-3"
          >
            {loading ? "Saving…" : "Complete setup"}
          </button>
        </form>
      </div>
    </div>
  );
}

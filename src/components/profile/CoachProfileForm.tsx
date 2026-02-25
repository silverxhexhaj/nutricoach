"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateCoachProfile } from "@/app/coach/profile/actions";

interface CoachProfileFormProps {
  initialName: string | null;
  initialBrandName: string | null;
  initialLogoUrl: string | null;
}

export function CoachProfileForm({
  initialName,
  initialBrandName,
  initialLogoUrl,
}: CoachProfileFormProps) {
  const [name, setName] = useState(initialName ?? "");
  const [brandName, setBrandName] = useState(initialBrandName ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialLogoUrl);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    } else {
      setLogoPreview(initialLogoUrl);
    }
  };

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

      let logoUrl: string | null = initialLogoUrl;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop() ?? "png";
        const path = `${user.id}/logo.${ext}`;
        const contentType = logoFile.type || `image/${ext === "jpg" ? "jpeg" : ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("coach-logos")
          .upload(path, logoFile, { upsert: true, contentType });
        if (uploadErr) {
          throw new Error(`Logo upload failed: ${uploadErr.message}`);
        }
        const {
          data: { publicUrl },
        } = supabase.storage.from("coach-logos").getPublicUrl(path);
        logoUrl = publicUrl;
      }

      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("brand_name", brandName.trim());
      formData.set("logo_url", logoUrl ?? "");

      const result = await updateCoachProfile(formData);
      if (result.error) throw new Error(result.error);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
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
        {logoPreview && (
          <div className="mb-2">
            <img
              src={logoPreview}
              alt="Logo preview"
              className="h-16 w-16 rounded-full object-cover border border-[var(--green-08)]"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="form-input w-full"
        />
      </div>
      {error && <div className="error-box">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="btn-form-next w-full py-3"
      >
        {loading ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

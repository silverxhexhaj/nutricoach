"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

const HERBALIFE_OPTIONS = [
  "Formula 1",
  "Formula 1 Chocolate",
  "Herbal Aloe",
  "Herbal Aloe Mango",
  "Herbal Tea",
  "Herbalife24",
  "H24 Hydrate",
  "Vegan Creatine+",
  "Vegan Immune Booster",
  "Rebuild Endurance",
  "Protein Drink Mix",
];

const OTHER_OPTIONS = [
  "whey protein",
  "creatine monohydrate",
  "omega-3",
  "multivitamin",
  "electrolytes",
  "bcaa",
  "pre-workout",
  "collagen",
];

interface SupplementMatcherProps {
  clientId: string;
  initialHerbalife: string[];
  initialOther: string[];
}

export function SupplementMatcher({
  clientId,
  initialHerbalife,
  initialOther,
}: SupplementMatcherProps) {
  const [herbalife, setHerbalife] = useState<string[]>(initialHerbalife);
  const [other, setOther] = useState<string[]>(initialOther);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setHerbalife(initialHerbalife);
    setOther(initialOther);
  }, [initialHerbalife, initialOther]);

  const toggleHerbalife = (item: string) => {
    setHerbalife((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const toggleOther = (item: string) => {
    setOther((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/clients/${clientId}/supplements`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          herbalife_products: herbalife,
          other_supplements: other,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaving(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
      <h3 className="font-heading font-bold text-lg mb-2">Supplement matcher</h3>
      <p className="text-text-dim text-sm mb-4">
        Assign products for this client. These will be used when generating their
        meal plan.
      </p>

      <div className="space-y-4 mb-6">
        <div>
          <p className="text-xs font-medium text-text-dim uppercase tracking-wider mb-2">
            Herbalife products
          </p>
          <div className="flex flex-wrap gap-2">
            {HERBALIFE_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleHerbalife(item)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  herbalife.includes(item)
                    ? "bg-green text-dark"
                    : "bg-[var(--green-08)] text-text-dim hover:text-green"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-text-dim uppercase tracking-wider mb-2">
            Other supplements
          </p>
          <div className="flex flex-wrap gap-2">
            {OTHER_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleOther(item)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  other.includes(item)
                    ? "bg-green text-dark"
                    : "bg-[var(--green-08)] text-text-dim hover:text-green"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        variant="primary"
      >
        {saving ? "Saving…" : saved ? "Saved" : "Save supplements"}
      </Button>
    </div>
  );
}

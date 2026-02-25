"use client";

import type { GeneratedPlan } from "@/types/plan";

interface ShoppingListGridProps {
  plan: GeneratedPlan;
}

export function ShoppingListGrid({ plan }: ShoppingListGridProps) {
  const shop = plan.shopping_list;

  if (!shop) return null;

  // Support both object (category -> items) and array format
  const entries = Array.isArray(shop)
    ? shop.reduce<Record<string, string[]>>((acc, item) => {
        const cat = (item as { category?: string }).category ?? "Other";
        const name = (item as { item?: string; name?: string }).item ?? (item as { name?: string }).name ?? "";
        if (!acc[cat]) acc[cat] = [];
        if (name) acc[cat].push(name);
        return acc;
      }, {})
    : (shop as Record<string, string[]>);

  return (
    <div className="shopping-grid">
      {Object.entries(entries).map(
        ([cat, items]) =>
          items?.length > 0 && (
            <div key={cat} className="shop-cat">
              <div className="font-heading font-bold text-green text-sm mb-2">
                {cat}
              </div>
              {items.map((it, i) => (
                <div key={i} className="shop-item">
                  <span className="w-[5px] h-[5px] rounded-full bg-muted flex-shrink-0 inline-block" />
                  <span>{typeof it === "string" ? it : String(it)}</span>
                </div>
              ))}
            </div>
          )
      )}
    </div>
  );
}

"use client";

import type { GeneratedPlan } from "@/types/plan";

interface ProductRec {
  name?: string;
  description?: string;
  benefit?: string;
  url?: string;
  brand?: string;
}

function buildAffiliateUrl(url: string, productName: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "nutricoach");
    u.searchParams.set("utm_medium", "plan");
    u.searchParams.set("utm_content", productName.replace(/\s+/g, "_"));
    return u.toString();
  } catch {
    return url;
  }
}

// Fallback search URLs for common products (can be replaced with actual affiliate links)
const PRODUCT_SEARCH_URLS: Record<string, string> = {
  "whey protein": "https://www.amazon.com/s?k=whey+protein",
  "creatine monohydrate": "https://www.amazon.com/s?k=creatine+monohydrate",
  "omega-3": "https://www.amazon.com/s?k=omega+3+supplement",
  multivitamin: "https://www.amazon.com/s?k=multivitamin",
  "Formula 1": "https://www.herbalife.com/",
  "Herbal Aloe": "https://www.herbalife.com/",
  Herbalife24: "https://www.herbalife.com/",
};

function getProductUrl(product: ProductRec): string {
  if (product.url) return product.url;
  const name = (product.name ?? "").toLowerCase();
  for (const [key, url] of Object.entries(PRODUCT_SEARCH_URLS)) {
    if (name.includes(key.toLowerCase())) return url;
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(product.name ?? "supplement")}`;
}

interface ProductRecommendationsProps {
  plan: GeneratedPlan;
}

export function ProductRecommendations({ plan }: ProductRecommendationsProps) {
  const products = (plan.recommended_products ?? []) as ProductRec[];

  if (products.length === 0) {
    return (
      <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
        <p className="text-text-dim text-sm">
          No product recommendations in this plan. Your coach can regenerate to
          include supplement suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-text-dim text-sm mb-4">
        Supplement products matched to your goal. Purchases through these links
        may support the platform.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {products.map((product, i) => {
          const url = getProductUrl(product);
          const taggedUrl = buildAffiliateUrl(url, product.name ?? "product");
          return (
            <a
              key={i}
              href={taggedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-card border border-[var(--green-08)] rounded-xl p-5 hover:border-green transition-colors"
            >
              <div className="font-heading font-bold text-green mb-1">
                {product.name ?? "Supplement"}
              </div>
              {product.brand && (
                <div className="text-xs text-text-dim mb-2">{product.brand}</div>
              )}
              {product.description && (
                <p className="text-sm text-text-dim mb-2 line-clamp-2">
                  {product.description}
                </p>
              )}
              {product.benefit && (
                <p className="text-xs text-green font-medium">{product.benefit}</p>
              )}
              <span className="text-xs text-text-dim mt-2 inline-block">
                View product →
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

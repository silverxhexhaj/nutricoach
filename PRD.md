# NutriCoach AI — Product Requirements Document
**Version:** 2.0 — B2B2C Coach Platform  
**Date:** February 2026  
**Status:** Active Build — Core MVP Implemented, UX Refactor in Progress  
**Model:** B2B2C — Coaches pay, clients use free through their coach  
**Platform:** Web App (Next.js) — MVP Phase 1

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision & Goals](#3-product-vision--goals)
4. [User Types & Roles](#4-user-types--roles)
5. [Business Model](#5-business-model)
6. [Platform Features & Requirements](#6-platform-features--requirements)
7. [AI Meal Plan Engine — Technical Spec](#7-ai-meal-plan-engine--technical-spec)
8. [Technical Architecture](#8-technical-architecture)
9. [Build Roadmap](#9-build-roadmap)
10. [Success Metrics](#10-success-metrics)
11. [Risks & Mitigations](#11-risks--mitigations)
12. [Why This Wins](#12-why-this-wins)
- [Appendix — Reference Document](#appendix--reference-document)

---

## 1. Executive Summary

NutriCoach AI is a B2B2C platform that sells to fitness coaches and nutrition consultants, who then use it to manage and serve their clients. Coaches pay a monthly subscription to access AI-powered plan generation, a client management dashboard, supplement scheduling, and branded exports. Their clients get a free login to view plans, track daily check-ins, and monitor progress.

The platform is supplement-agnostic — it works with Herbalife, standard whey protein, or any other brand. This makes it broadly marketable to coaches across the fitness and nutrition industry, not just Herbalife distributors.

The core insight driving this model: acquiring one coach delivers 15–50 clients in a single sale. This reduces customer acquisition cost dramatically compared to a direct-to-consumer approach, while increasing average revenue per account.

> **"Sell to the coach. The coach sells to their clients. The platform grows through the coach's network, not through ad spend."**

---

## 2. Problem Statement

### 2.1 The Coach's Problem

Nutrition and fitness coaches spend 2–4 hours per week per client creating personalised meal plans manually — in Word documents, Google Docs, or spreadsheets. There is no dedicated tool that:
- Generates a personalised plan based on the client's stats and available foods
- Integrates supplement scheduling around training days
- Tracks client progress in one dashboard
- Produces professional branded exports

The result is coaches hitting a ceiling — they can only manage 10–15 clients before the admin work becomes unmanageable. NutriCoach AI removes this ceiling.

### 2.2 The Client's Problem

Clients who work with coaches receive a plan but have no interactive way to follow it. They get a PDF, a WhatsApp message, or a printed sheet. There is no daily accountability system, no progress tracking, and no way for the coach to see if the client is following the plan.

### 2.3 The Market Gap

- No tool combines AI meal plan generation with supplement scheduling in one platform
- Existing coach platforms (Trainerize, MyPTHub) focus on workouts, not nutrition
- Herbalife distributors have zero digital tooling — everything is done manually
- The gap between product (supplements) and plan (how to use them daily) is completely unaddressed

---

## 3. Product Vision & Goals

### 3.1 Vision

> **"Give every coach a superpower: the ability to create a fully personalised nutrition and supplement plan for any client in 60 seconds — and track their progress automatically."**

### 3.2 Strategic Goals — 6 Months Post-Launch

| Goal | Target | Why It Matters |
|------|--------|----------------|
| Paying coaches | 150 | Core revenue unit — each coach represents multiple clients |
| Active clients on platform | 2,000+ | Validates the B2B2C flywheel is working |
| Monthly Recurring Revenue | €6,000+ | Platform is profitable and growing |
| Coach retention | 85%+ at Month 3 | Coaches stay because clients stay |
| Plans generated per month | 1,500+ | AI engine is the daily core value driver |
| Affiliate conversion | 3–5% click-to-buy | Supplement recommendations are trusted |

---

## 4. User Types & Roles

The platform has two primary user types — Coaches and Clients — plus a self-serve Individual tier that stays open for organic growth.

### 4.1 The Coach

| Attribute | Detail |
|-----------|--------|
| Who they are | Personal trainers, nutrition coaches, Herbalife distributors, gym owners |
| Primary job | Build client plans, track client progress, recommend supplements |
| Pain today | Creates plans manually in Word/Google Docs, 2–4 hrs/client/week |
| What they pay | Monthly subscription (see pricing tiers) |
| Key motivation | Save time, serve more clients, look more professional, earn from supplements |
| Platform access | Full coach dashboard, client management, AI plan generator, analytics, branded exports |

### 4.2 The Client

| Attribute | Detail |
|-----------|--------|
| Who they are | The coach's existing clients — any fitness goal, any supplement brand |
| Primary job | Follow the plan, log daily check-ins, track progress |
| What they pay | Free — access is included in their coach's subscription |
| Key motivation | Get results, stay accountable, see progress clearly |
| Platform access | Personal plan view, daily check-in form, progress charts, supplement schedule, water tracker |
| Login type | Own account — email/password or Google OAuth via Supabase |

### 4.3 The Individual (Self-Serve)

| Attribute | Detail |
|-----------|--------|
| Who they are | Users without a coach — find the platform via SEO or word of mouth |
| What they pay | €12/month Pro tier |
| Platform access | Same as client, but self-managed — no coach oversight |
| Strategic purpose | Keeps the organic growth channel open. Low CAC, steady revenue stream |

---

## 5. Business Model

### 5.1 Revenue Streams

| Stream | How It Works | Who Pays | Est. % of Revenue (Month 12) |
|--------|-------------|----------|-------------------------------|
| Coach Subscriptions | Monthly fee per coach account. Tiered by client capacity | Coach | 65% |
| Individual Pro | Self-serve users without a coach. €12/month | Individual | 20% |
| Supplement Affiliates | Platform earns commission on all supplement clicks and purchases. 100% kept by platform | Brands | 15% |
| Future: Coach Annual | Upfront annual payment at a discount. Higher LTV, better cash flow | Coach | TBD Phase 2 |

### 5.2 Pricing Tiers

| | Individual | Coach Starter | Coach Pro | Coach Agency |
|--|-----------|--------------|-----------|--------------|
| **Price** | €12/mo | €39/mo | €69/mo | €119/mo |
| **Clients** | 1 (self) | Up to 15 | Up to 40 | Unlimited |
| AI plan generation | ✓ | ✓ | ✓ | ✓ |
| Daily check-in & tracking | ✓ | ✓ | ✓ | ✓ |
| Progress charts | ✓ | ✓ | ✓ | ✓ |
| Supplement schedule | ✓ | ✓ | ✓ | ✓ |
| PDF export | ✓ | ✓ | ✓ | ✓ |
| Client management dashboard | ✗ | ✓ | ✓ | ✓ |
| Branded PDF exports | ✗ | ✓ | ✓ | ✓ |
| Client check-in visibility | ✗ | ✓ | ✓ | ✓ |
| Advanced analytics | ✗ | ✗ | ✓ | ✓ |
| Client messaging | ✗ | ✗ | Phase 2 | Phase 2 |
| White-label branding | ✗ | ✗ | ✗ | ✓ |
| Custom subdomain | ✗ | ✗ | ✗ | ✓ |
| API access | ✗ | ✗ | ✗ | Phase 3 |
| **Who it's for** | Users without a coach | Coaches just starting | Growing coaches | Gyms & agencies |

### 5.3 Affiliate Commission Model

Every supplement recommendation in a generated plan includes a trackable affiliate link. When a client or coach clicks and purchases, the platform earns a commission. The platform keeps 100% of this revenue.

- **Herbalife products:** linked to the coach's personal distributor page (coach earns their own Herbalife commission separately — this does not flow through the platform)
- **Third-party supplements** (protein, creatine, electrolytes): Amazon Associates or direct brand affiliate programmes
- All links are UTM-tagged and tracked per user, per product, per goal for optimisation
- Phase 2: A/B test product placement and description to improve click-through and conversion

> ⚠️ **Important:** Herbalife coaches earn their own distributor commissions through Herbalife's system. The platform affiliate engine targets non-Herbalife products — this avoids any conflict of interest and keeps the model clean.

### 5.4 Revenue Projections

| Stream | Month 1 | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|---------|----------|
| Coach Starter (€39) | €195 | €780 | €2,340 | €5,460 |
| Coach Pro (€69) | €0 | €138 | €690 | €2,760 |
| Coach Agency (€119) | €0 | €0 | €238 | €714 |
| Individual Pro (€12) | €60 | €240 | €720 | €1,800 |
| Supplement Affiliates | €30 | €180 | €600 | €1,500 |
| **Total MRR** | **€285** | **€1,338** | **€4,588** | **€12,234** |

> **Assumptions:** Coach Starter at 5 new coaches/month. Coach Pro conversion at 25% of Starter after 60 days. Agency tier after Month 5. Individual Pro at 5 new users/month. Affiliate revenue at €10/active client/month at 3% conversion.

---

## 6. Platform Features & Requirements

### 6.1 Coach Dashboard

The coach's command centre. Designed to replace the manual process of creating and tracking client plans entirely.

| Feature | Description | Priority | Build Status |
|---------|-------------|----------|--------------|
| Client roster | List of all clients with status: plan active, check-in done today, last seen, goal, current weight vs target | P0 | Implemented |
| Add/invite client | Coach enters client email → client receives invite → client sets up account and completes onboarding quiz | P0 | Implemented |
| Generate plan | Click one button to generate a full 7-day AI plan for a client based on their profile, ingredients, and products | P0 | Implemented |
| View client progress | See each client's weight trend, check-in streak, calories logged, protein logged, workout completions | P0 | Implemented |
| Supplement matcher | Assign products to a client (Herbalife or other). Platform generates daily supplement schedule matched to training days | P0 | Implemented |
| Program builder | Create structured multi-day programmes (workout, meal, supplement, text/video items) and assign to clients | P0 | Implemented |
| Library manager | Reusable content library for programme items (workouts, meals, supplements, notes) | P1 | Implemented |
| Branded PDF export | Download the client's meal plan as a professionally formatted PDF with coach branding (name, logo, contact) | P1 | Implemented |
| Plan history | Archive of all generated plans per client. Coach can reactivate or regenerate at any time | P1 | Partial |
| Coach analytics | Aggregate view: total clients, active check-in rate, avg weight change across client base, most recommended products | P2 | Partial |

### 6.2 Client Experience

The client's daily companion. Simple, focused, mobile-friendly web app (PWA) that makes following the plan effortless.

| Feature | Description | Priority | Build Status |
|---------|-------------|----------|--------------|
| My Plan view | Full 7-day meal plan with day-by-day navigation. Each meal shows ingredients, macros, prep instructions | P0 | Implemented |
| Daily check-in | 2-minute daily log: weight, water intake, calories eaten, protein eaten, workout done (yes/no), energy level (1–5) | P0 | Implemented |
| Progress dashboard | Weight chart, calorie/protein target vs actual bar chart, streak counter, weekly summary card | P0 | Implemented |
| Morning routine | Step-by-step morning ritual (Aloe, Herbal Tea, shake) shown every day with timers and instructions | P0 | Implemented |
| Supplement schedule | Daily supplement view by time of day. Training day vs rest day automatically adjusts what products appear | P0 | Implemented |
| My Program view | Assigned programme timeline with day/item completion tracking | P0 | Implemented |
| Activities tracker | Daily supplements + exercise logs in a dedicated activity timeline | P1 | Implemented |
| Food logging | Daily food logging with search + barcode support | P1 | Implemented |
| Shopping list | Auto-generated weekly shopping list from the active plan. Quantities calculated for the week | P1 | Implemented |
| Meal prep guide | Sunday prep guide: what to batch cook, storage times, quantities | P1 | Implemented |
| Exercise guide | Training day breakdown: push-up progression, kettlebell exercises, sets and reps matched to fitness level | P1 | Implemented |
| Product recommendations | Supplement product cards with description, benefit, and affiliate buy link. Matched to client's goal | P1 | Implemented |

### 6.3 Current Product Modules (Live in Codebase)

The current implementation includes the following modules beyond the original MVP draft:

- Coach programmes module (`programs`, `program_days`, `program_items`, `client_programs`)
- Programme completion tracking (`program_day_completions`, `program_item_completions`)
- Coach content library (`library_items`)
- Food intake tracking (`food_log_entries`)
- Supplement adherence logs (`supplement_logs`)
- Exercise adherence logs (`exercise_logs`)

This means the product has already moved from a "plan generator MVP" into a broader coaching operations platform.

---

## 7. AI Meal Plan Engine — Technical Spec

This is the platform's core differentiator. The AI engine generates plans of the same quality as the manually-crafted 7-day muscle building plan (85kg | 188cm) that inspired this product — but in seconds, for any user profile.

### 7.1 Input Schema

```typescript
interface PlanGenerationInput {
  weight_kg: number;              // Used for TDEE + protein range
  height_cm: number;              // Used in Mifflin-St Jeor formula
  age: number;
  goal: 'build_muscle' | 'lose_weight' | 'maintain' | 'recomposition';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  training_days: string[];        // ['monday','wednesday','friday','saturday']
  training_type: string[];        // ['push-ups','kettlebells','gym','running']
  available_foods: string[];      // Drives ALL meal construction — fridge/pantry items
  herbalife_products: string[];   // ['Formula 1 Chocolate','Herbal Aloe Mango','Vegan Creatine+']
  other_supplements: string[];    // ['whey protein','creatine monohydrate']
  dietary_restrictions: string[]; // ['none'] or ['vegetarian','gluten-free']
  meals_per_day: number;          // Default: 5
  plan_duration_days: number;     // Default: 7, expandable to 14 or 28
}
```

### 7.2 Output Schema (JSON)

```typescript
interface GeneratedPlan {
  user_stats: object;
  calorie_target: number;
  protein_target: number;
  water_target_ml: number;
  morning_ritual: Array<{
    step: number;
    instruction: string;
    wait_minutes?: number;
  }>;
  supplement_schedule: {
    training_day: SupplementEntry[];
    rest_day: SupplementEntry[];
  };
  weekly_plan: Array<{
    day: string;
    is_training_day: boolean;
    meals: Array<{
      name: string;
      time: string;
      ingredients: string[];
      kcal: number;
      protein_g: number;
      prep: string;
    }>;
  }>; // 7 days
  shopping_list: ShoppingItem[];
  meal_prep_guide: PrepStep[];
  exercise_guide: ExerciseGuide;
  recommended_products: ProductRecommendation[];
}
```

### 7.3 Prompt Engineering Strategy

- System prompt includes the complete reference meal plan (85kg | 188cm | muscle building) as a quality benchmark the AI must match
- User input schema injected as structured variables — no free text, no ambiguity
- Model instructed to return **only valid JSON** — no prose, no markdown wrappers, no commentary
- Server validates macros against a nutrition database (Edamam API) before saving — flags plans deviating >15% from target
- Meal variety algorithm: AI prompted to avoid repeating the same meal more than twice in 7 days
- Plan is cached in Supabase after generation — only regenerated on explicit coach/client request
- **Model:** Claude API (`claude-sonnet-4-6`) — best-in-class structured JSON output for this use case

---

## 8. Technical Architecture

### 8.1 Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14 + Tailwind CSS | SSR for SEO. You already know it. Fast to build with Cursor. |
| Backend / API | Next.js API Routes | No separate server needed for MVP. Clean monorepo. |
| Auth | Supabase Auth | Email + Google OAuth. Row-level security for coach/client data isolation. |
| Database | Supabase (PostgreSQL + JSONB) | Stores plans as JSONB. Realtime for coach progress feed. Free tier for MVP. |
| AI Engine | Claude API (`claude-sonnet-4-6`) | Best structured JSON output. Fallback: OpenAI GPT-4o. |
| Payments | Stripe | Subscription management, webhooks, tier upgrades/downgrades. |
| PDF Export | React-PDF or Puppeteer | Branded plan exports for coaches. React-PDF preferred for speed. |
| Email | Resend | Onboarding, weekly summaries, client check-in reminders, coach alerts. |
| Analytics | PostHog | Feature usage, funnel conversion, retention cohorts. Free tier. |
| Deployment | Vercel | Zero-config Next.js. Global CDN. Auto-preview deployments. |
| Dev Tooling | Cursor + Claude | 10x development speed. |

### 8.2 Data Model — Core Tables

```sql
-- coaches
id, user_id, name, brand_name, logo_url, subscription_tier, stripe_customer_id, client_limit

-- clients
id, user_id, coach_id, name, onboarding_complete, current_plan_id
-- Note: coach_id = NULL for self-serve individual users

-- profiles
id, user_id, weight_kg, height_cm, age, goal, activity_level, 
training_days, dietary_restrictions, available_foods, supplements
-- Updated at onboarding and on any stat change

-- meal_plans
id, client_id, coach_id, generated_at, plan_json JSONB, week_start_date, is_active
-- is_active = only one plan active per client at a time

-- checkins
id, client_id, date, weight_kg, water_ml, calories, protein_g, 
workout_done BOOLEAN, energy_level INT, notes TEXT
-- One row per client per day

-- supplements
id, client_id, products JSONB, schedule_json
-- Generated alongside meal plan

-- affiliate_clicks
id, user_id, product_id, product_name, brand, clicked_at, converted BOOLEAN, commission_earned

-- invites
id, coach_id, client_email, token, accepted_at, expires_at
```

### 8.3 Multi-Tenancy & Data Isolation

Supabase Row Level Security (RLS) policies enforce data isolation at the database level:
- Coaches can only read/write their own clients' data
- Clients can only read their own plan and check-in history
- No client can access another client's data
- This is enforced at the **database level**, not just application level

```sql
-- Example RLS policy for meal_plans
CREATE POLICY "Coaches see own clients plans"
ON meal_plans FOR SELECT
USING (coach_id = auth.uid());

CREATE POLICY "Clients see own plan"
ON meal_plans FOR SELECT
USING (client_id IN (
  SELECT id FROM clients WHERE user_id = auth.uid()
));
```

---

## 9. Build Roadmap

### Phase 1 — MVP (6 Weeks to Launch)

| Sprint | Weeks | Key Deliverables |
|--------|-------|-----------------|
| Sprint 1 | Week 1–2 | Project setup, Supabase schema + RLS policies, Auth (email + Google), Coach onboarding flow, Client invite system |
| Sprint 2 | Week 3 | Client onboarding quiz, AI plan generation API + prompt, JSON parsing + macro validation, Plan display UI (coach and client views) |
| Sprint 3 | Week 4 | Supplement matcher, daily check-in form, progress dashboard (charts + streak), coach client roster view |
| Sprint 4 | Week 5 | Stripe integration (all tiers), free trial logic, PDF export, affiliate link tracking |
| Sprint 5 | Week 6 | Landing page + SEO, onboarding email flow (Resend), bug fixing, performance audit, mobile-responsive polish |
| Launch | Week 7 | Soft launch: reach out personally to 5–10 coaches and Herbalife distributors. Gather feedback. Iterate weekly. |

### 9.1 Build Status Snapshot (February 2026)

| Track | Status | Notes |
|-------|--------|-------|
| Core auth + roles | Done | Coach/client separation, protected route groups |
| AI plan generation | Done | Claude-backed generation, saved to Supabase |
| Check-ins + progress | Done | Daily logs, streak logic, trend charts |
| Program management | Done | Coach creates/assigns programmes, client completion tracking |
| Library + reusable items | Done | Reusable content blocks for faster programme authoring |
| Food/supplement/exercise logs | Done | Tracking endpoints and UI are in place |
| UX navigation architecture | Done | Shared sidebar, focused client pages, simplified headers |
| Security: RLS policies + API hardening | Done | Scoped RLS policies, centralized validation, rate limiting, and standardized API errors are implemented |
| UI component library | Done | Reusable form/feedback primitives are in use across core flows |
| Programs & Check-ins polish | In progress | Hardening assignment safety and improving coach/client daily UX across programs and check-ins |
| Billing + lifecycle messaging | Not started | Stripe + deeper notification workflows still pending |

### Phase 2 — Growth (Months 2–5)

- Client-coach messaging within the platform (remove WhatsApp dependency)
- Plan re-generation based on plateau detection (weight unchanged for 14 days)
- Meal swap: client taps any meal to get an AI alternative using the same ingredients
- Coach annual billing (2 months free, higher LTV, better cashflow)
- Push notifications and weekly email digests for clients
- Aggregate coach analytics: client success rates, most effective supplement combos

### Phase 3 — Scale (Months 6–12)

- Native mobile app (React Native — reuse existing component logic)
- White-label: Agency tier coaches get a custom subdomain and branded UI
- Marketplace: coaches can offer their services to self-serve users on the platform
- API access for gym management software integrations

---

## 10. Success Metrics

### 10.1 North Star Metric

> **Number of clients with an active plan who complete a check-in at least 4 times per week.**  
> This proves both the coach and the client are getting value — and the platform is working.

### 10.2 Key KPIs

| Metric | Target (Month 6) | Target (Month 12) | Why It Matters |
|--------|-----------------|-------------------|----------------|
| Active paying coaches | 80 | 200 | Primary revenue unit |
| Active clients on platform | 1,000 | 3,000+ | B2B2C flywheel validation |
| Coach retention (Month 3) | 85%+ | 85%+ | Coaches stay because clients stay engaged |
| Client check-in rate | 4+/week | 4+/week | Daily habit = core product value |
| Plans generated | 800/mo | 2,500/mo | AI engine is core to daily usage |
| MRR | €4,500+ | €12,000+ | Business health and growth trajectory |
| Affiliate conversion | 3%+ | 5%+ | Supplement recommendations are trusted |
| Coach → Pro upgrade rate | 20%+ | 30%+ | Product grows with the coach's business |

---

## 11. Risks & Mitigations

| Risk | Level | Mitigation |
|------|-------|------------|
| Coach adoption is slow — hard to reach them | 🔴 High | Personal outreach first: LinkedIn, Herbalife communities, gym networks. Offer 30-day free trial. ROI pitch: "2 hours saved per client per week". |
| Coaches generate plans but clients don't engage | 🔴 High | Daily check-in reminder emails. Streak gamification. Coach gets notified if a client misses 3 check-ins — triggers coach-side intervention. |
| AI generates nutritionally inaccurate plans | 🔴 High | Server-side macro validation against Edamam API. Plans deviating >15% from target are flagged before showing to user. |
| Coaches churn when clients leave them | 🟡 Medium | Clients can transition to Individual Pro if they stop working with a coach. Clean offboarding story for coaches. |
| Herbalife compliance / affiliate regulations | 🟡 Medium | Platform does not sell Herbalife products. Coaches link to their own distributor pages. Platform affiliate targets third-party products only. Medical disclaimer on all nutrition content. |
| AI API cost at scale | 🟢 Low | Plans cached after generation. At 200 coaches × 15 clients = 3,000 plans/month. Estimated AI cost: under €120/month at this scale. |

---

## 12. Why This Wins

| Advantage | Detail |
|-----------|--------|
| You are the user | The reference meal plan was built for you. You understand the product from the inside. This is a massive advantage. |
| B2B2C means lower CAC | Every coach you sign brings their entire client base. One sales conversation can unlock 30 clients. No paid ads needed to grow. |
| Coaches are underserved | Trainerize, MyPTHub, TrueCoach all focus on workout programming. Zero of them do personalised nutrition with supplement integration. This gap is wide open. |
| Supplement-agnostic | Working with any brand makes the TAM 10x bigger than a Herbalife-only tool. |
| You can ship in 6 weeks | Next.js + Supabase + Claude API + Cursor. The stack is decided. The reference doc shows exactly what the AI needs to produce. No ambiguity. |
| Affiliate is passive | You earn commission on supplement purchases with zero extra work. Compounds as the client base grows. |

---

## Appendix — Reference Document

This PRD was built around a real, manually-crafted 7-day muscle building plan. Every AI-generated plan must match this level of personalisation and detail. **This is the quality bar.**

| | |
|--|--|
| **User** | 85 kg \| 188 cm \| Goal: Build Muscle & Get in Shape |
| **Calorie target** | 2,400–2,600 kcal/day (lean muscle surplus) |
| **Protein target** | 140–170g/day (1.6–2.0g per kg bodyweight) |
| **Training days** | Mon, Wed, Fri, Sat — Rest: Tue, Thu, Sun |
| **Products used** | Formula 1 Shake, Herbal Aloe, Herbal Tea, Vegan Creatine+, H24 Hydrate, Vegan Immune Booster |
| **Ingredients** | Chicken, ground meat, eggs, Greek yoghurt, rice, avocado, peanut butter, broccoli, cauliflower, banana |
| **Plan includes** | 7-day meal plan, morning ritual, supplement schedule, exercise guide, shopping list, Sunday meal prep guide |

---

*NutriCoach AI — PRD v2.0 | B2B2C Coach Platform | Ship in 6 weeks*

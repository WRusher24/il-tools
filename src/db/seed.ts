import "dotenv/config";
import { eq, sql } from "drizzle-orm";
import { db } from "./index";
import {
  tools,
  guides,
  comparisons,
  users,
  activityEvents,
} from "./schema";
import {
  TOOL_SEEDS,
  GUIDE_SEEDS,
  COMPARISON_PAIRS,
  DEMO_USERS,
  ACTIVITY_SEEDS,
} from "./seed-data";
import { hashPassword } from "@/lib/passwords";

/**
 * Idempotent seed: content rows are upserted by slug so re-runs refresh
 * catalog data without duplicating; demo users are create-if-missing.
 *
 * Run after `npx drizzle-kit push`:
 *   npx tsx src/db/seed.ts
 */
async function main() {
  console.log("⏳ Seeding catalog: tools…");
  for (const t of TOOL_SEEDS) {
    await db
      .insert(tools)
      .values(t)
      .onConflictDoUpdate({ target: tools.slug, set: t });
  }
  console.log(`   ✔ ${TOOL_SEEDS.length} tools upserted`);

  console.log("⏳ Seeding catalog: guides…");
  for (const g of GUIDE_SEEDS) {
    await db
      .insert(guides)
      .values(g)
      .onConflictDoUpdate({ target: guides.slug, set: g });
  }
  console.log(`   ✔ ${GUIDE_SEEDS.length} guides upserted`);

  console.log("⏳ Seeding comparisons…");
  for (const [aSlug, bSlug] of COMPARISON_PAIRS) {
    const [a] = await db.select().from(tools).where(eq(tools.slug, aSlug));
    const [b] = await db.select().from(tools).where(eq(tools.slug, bSlug));
    if (!a || !b) continue;
    const slug = `${aSlug}-vs-${bSlug}`;
    await db
      .insert(comparisons)
      .values({ slug, toolAId: a.id, toolBId: b.id })
      .onConflictDoUpdate({
        target: comparisons.slug,
        set: { toolAId: a.id, toolBId: b.id },
      });
  }
  console.log(`   ✔ ${COMPARISON_PAIRS.length} comparisons upserted`);

  console.log("⏳ Ensuring RBAC demo accounts…");
  for (const demo of DEMO_USERS) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, demo.email));
    if (existing.length > 0) continue;
    const password = process.env[demo.envKey] ?? demo.fallbackPassword;
    await db.insert(users).values({
      email: demo.email,
      name: demo.name,
      role: demo.role,
      passwordHash: await hashPassword(password),
    });
    console.log(`   ✔ created ${demo.role}: ${demo.email}`);
  }

  console.log("⏳ Seeding activity feed (only if empty)…");
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(activityEvents);
  if (count === 0) {
    await db.insert(activityEvents).values(ACTIVITY_SEEDS);
    console.log(`   ✔ ${ACTIVITY_SEEDS.length} activity events inserted`);
  } else {
    console.log(`   • skipped — ${count} events already present`);
  }

  console.log("🚀 Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });

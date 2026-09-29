import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import {
  activityEvents,
  comparisons,
  favorites,
  guides,
  notifications,
  tools,
  uploads,
  users,
  type ActivityEvent,
  type Comparison,
  type Guide,
  type Notification,
  type Tool,
  type Upload,
  type User,
} from "@/db/schema";

/**
 * Data-access layer — every DB read in the app funnels through here.
 * Queries are parameterized by Drizzle (no SQL-injection surface), and public
 * catalog reads degrade gracefully (empty results) before the seed has run so
 * SSR never hard-crashes during migrations.
 */

export interface ComparisonJoin {
  comparison: Comparison;
  a: Tool;
  b: Tool;
}

export async function getAllTools(): Promise<Tool[]> {
  try {
    return await db.select().from(tools).orderBy(tools.startingPriceIls);
  } catch {
    return [];
  }
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  try {
    const rows = await db.select().from(tools).where(eq(tools.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getAllGuides(): Promise<Guide[]> {
  try {
    return await db.select().from(guides).orderBy(guides.createdAt);
  } catch {
    return [];
  }
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  try {
    const rows = await db.select().from(guides).where(eq(guides.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

const toolA = alias(tools, "tool_a");
const toolB = alias(tools, "tool_b");

export async function getComparisons(): Promise<ComparisonJoin[]> {
  try {
    const rows = await db
      .select({ comparison: comparisons, a: toolA, b: toolB })
      .from(comparisons)
      .innerJoin(toolA, eq(comparisons.toolAId, toolA.id))
      .innerJoin(toolB, eq(comparisons.toolBId, toolB.id))
      .orderBy(comparisons.createdAt);
    return rows;
  } catch {
    return [];
  }
}

export async function getComparisonBySlug(
  slug: string,
): Promise<ComparisonJoin | null> {
  try {
    const rows = await db
      .select({ comparison: comparisons, a: toolA, b: toolB })
      .from(comparisons)
      .innerJoin(toolA, eq(comparisons.toolAId, toolA.id))
      .innerJoin(toolB, eq(comparisons.toolBId, toolB.id))
      .where(eq(comparisons.slug, slug))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getComparisonsForTool(
  toolId: string,
): Promise<ComparisonJoin[]> {
  try {
    const rows = await db
      .select({ comparison: comparisons, a: toolA, b: toolB })
      .from(comparisons)
      .innerJoin(toolA, eq(comparisons.toolAId, toolA.id))
      .innerJoin(toolB, eq(comparisons.toolBId, toolB.id))
      .where(
        sql`${comparisons.toolAId} = ${toolId} OR ${comparisons.toolBId} = ${toolId}`,
      );
    return rows;
  } catch {
    return [];
  }
}

export async function getRecentActivity(limit = 20): Promise<ActivityEvent[]> {
  try {
    return await db
      .select()
      .from(activityEvents)
      .orderBy(desc(activityEvents.createdAt))
      .limit(limit);
  } catch {
    return [];
  }
}

/* ------------------------------- dashboard ------------------------------- */

export async function getUserFavoriteTools(userId: string): Promise<Tool[]> {
  try {
    const rows = await db
      .select({ tool: tools })
      .from(favorites)
      .innerJoin(tools, eq(favorites.toolId, tools.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
    return rows.map((r) => r.tool);
  } catch {
    return [];
  }
}

export async function getUserFavoriteSlugs(userId: string): Promise<string[]> {
  try {
    const rows = await db
      .select({ slug: tools.slug })
      .from(favorites)
      .innerJoin(tools, eq(favorites.toolId, tools.id))
      .where(eq(favorites.userId, userId));
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
}

export async function getUserNotifications(
  userId: string,
  limit = 30,
): Promise<Notification[]> {
  try {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  } catch {
    return [];
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
    return count;
  } catch {
    return 0;
  }
}

export async function getUserUploads(userId: string): Promise<Upload[]> {
  try {
    return await db
      .select()
      .from(uploads)
      .where(eq(uploads.userId, userId))
      .orderBy(desc(uploads.createdAt))
      .limit(100);
  } catch {
    return [];
  }
}

export async function countActiveUploads(userId: string): Promise<number> {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(uploads)
      .where(and(eq(uploads.userId, userId), eq(uploads.status, "pending")));
    return count;
  } catch {
    return 0;
  }
}

/* --------------------------------- admin --------------------------------- */

export async function getAllUsers(): Promise<User[]> {
  try {
    return await db.select().from(users).orderBy(users.createdAt);
  } catch {
    return [];
  }
}

export async function countUsers(): Promise<number> {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);
    return count;
  } catch {
    return 0;
  }
}

import type { MetadataRoute } from "next";
import { AUDIENCES, SITE_URL } from "@/lib/content";
import { getAllGuides, getAllTools, getComparisons } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Database-driven sitemap — every catalog row becomes a canonical URL. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tools, guides, comparisons] = await Promise.all([
    getAllTools(),
    getAllGuides(),
    getComparisons(),
  ]);

  const entry = (
    path: string,
    priority: number,
  ): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
  });

  return [
    entry("/", 1),
    ...AUDIENCES.map((a) => entry(`/audiences/${a.slug}`, 0.9)),
    ...tools.map((t) => entry(`/tools/${t.slug}`, 0.8)),
    ...comparisons.map((c) => entry(`/compare/${c.comparison.slug}`, 0.7)),
    ...guides.map((g) => entry(`/guides/${g.slug}`, 0.7)),
    entry("/login", 0.3),
    entry("/register", 0.3),
  ];
}
